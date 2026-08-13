import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { prisma } from '../database/prisma.js';
import { HttpStatus } from '../constants/http-status.js';
import { env } from '../config/index.js';
import { cacheService } from '../modules/cache/cache.service.js';
import { logger } from '../utils/logger.js';

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

const maskKey = (key: string | undefined, defaultVal: string): string | undefined => {
  if (!key || key === defaultVal) return undefined;
  if (key.length <= 8) return '••••';
  return `${key.slice(0, 4)}••••${key.slice(-4)}`;
};

/**
 * Health check controller.
 * Reports status of all required and optional services.
 * Only PostgreSQL failure makes the backend unhealthy.
 */
export async function healthCheck(_req: Request, res: Response): Promise<void> {
  const startTime = Date.now();

  // ─── Required: PostgreSQL / Prisma / Supabase ──────
  let postgresStatus: 'connected' | 'disconnected' = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    postgresStatus = 'connected';
  } catch {
    postgresStatus = 'disconnected';
  }

  // ─── Cache (PostgresCacheAdapter — always ready) ────
  const cacheStatus = 'connected'; // Using in-memory + PostgreSQL adapter

  // ─── Optional: TMDb key configured ──────────────────
  const tmdbConfigured = Boolean(
    env.TMDB_API_KEY && env.TMDB_API_KEY !== 'your-tmdb-api-key',
  );

  // ─── Optional: Gemini key configured ────────────────
  const geminiConfigured = Boolean(
    env.GEMINI_API_KEY && env.GEMINI_API_KEY !== 'your-gemini-api-key',
  );

  // ─── Optional: Wikipedia base URL configured ────────
  const wikipediaConfigured = Boolean(
    env.WIKIPEDIA_API_BASE && env.WIKIPEDIA_API_BASE.length > 0,
  );

  const tmdbKeyMasked = maskKey(env.TMDB_API_KEY, 'your-tmdb-api-key');
  const geminiKeyMasked = maskKey(env.GEMINI_API_KEY, 'your-gemini-api-key');

  const latencyMs = Date.now() - startTime;
  const isHealthy = postgresStatus === 'connected';
  const statusCode = isHealthy ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;

  res.status(statusCode).json({
    backend: isHealthy ? 'healthy' : 'unhealthy',
    supabase: postgresStatus,
    prisma: postgresStatus,
    postgres: postgresStatus,
    cache: cacheStatus,
    redis: cacheStatus, // For frontend compatibility
    tmdb: tmdbConfigured ? 'configured' : 'not_configured',
    gemini: geminiConfigured ? 'configured' : 'not_configured',
    wikipedia: wikipediaConfigured ? 'configured' : 'not_configured',
    tmdbKeyMasked,
    geminiKeyMasked,
    uptime: formatUptime(process.uptime()),
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    latency: `${latencyMs}ms`,
  });
}

/**
 * Dynamically update and validate TMDB / Gemini API Keys.
 */
export async function updateApiKeys(req: Request, res: Response): Promise<void> {
  const { tmdbApiKey, geminiApiKey } = req.body as { tmdbApiKey?: string; geminiApiKey?: string };

  // 1. Live Validation: TMDB Key
  if (tmdbApiKey) {
    try {
      const response = await fetch(`https://api.themoviedb.org/3/configuration?api_key=${tmdbApiKey}`);
      if (response.status === 401) {
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: 'Invalid TMDb API Key. Check the key and try again.' });
        return;
      }
      if (!response.ok) {
        throw new Error(`TMDb configuration check returned HTTP status ${response.status}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: `Failed to validate TMDb API key: ${msg}` });
      return;
    }
  }

  // 2. Live Validation: Gemini Key
  if (geminiApiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Hello' }] }],
          }),
        }
      );
      if (response.status === 400 || response.status === 401) {
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: 'Invalid Gemini API Key. Check the key and try again.' });
        return;
      }
      if (!response.ok) {
        throw new Error(`Gemini generateContent check returned HTTP status ${response.status}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: `Failed to validate Gemini API key: ${msg}` });
      return;
    }
  }

  // 3. Save updates to .env file and process memory
  const updates: Record<string, string> = {};
  if (tmdbApiKey) updates['TMDB_API_KEY'] = tmdbApiKey;
  if (geminiApiKey) updates['GEMINI_API_KEY'] = geminiApiKey;

  if (Object.keys(updates).length > 0) {
    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const candidates = [
        path.resolve(process.cwd(), 'backend/.env'),
        path.resolve(process.cwd(), '.env'),
        path.resolve(__dirname, '../../../.env'),
        path.resolve(__dirname, '../../.env'),
      ];

      let envPath: string | null = null;
      for (const candidate of candidates) {
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
          envPath = candidate;
          break;
        }
      }

      if (!envPath) {
        envPath = path.resolve(process.cwd(), 'backend/.env');
      }

      let content = '';
      if (fs.existsSync(envPath)) {
        content = fs.readFileSync(envPath, 'utf8');
      }

      let lines = content.split(/\r?\n/);
      for (const [key, value] of Object.entries(updates)) {
        let found = false;
        lines = lines.map(line => {
          if (line.trim().startsWith(`${key}=`)) {
            found = true;
            return `${key}=${value}`;
          }
          return line;
        });
        if (!found) {
          lines.push(`${key}=${value}`);
        }
      }

      fs.writeFileSync(envPath, lines.join('\n'), 'utf8');
      logger.info({ envPath }, '📝 Persisted API keys to .env');

      // Update in-memory configuration values
      if (tmdbApiKey) env.TMDB_API_KEY = tmdbApiKey;
      if (geminiApiKey) env.GEMINI_API_KEY = geminiApiKey;

      // Invalidate the cache entirely
      await cacheService.clear();

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'API Keys updated successfully, cache cleared.',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: `Failed to persist API keys: ${msg}`,
      });
    }
  } else {
    res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      message: 'No API keys provided for update.',
    });
  }
}
