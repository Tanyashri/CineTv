import crypto from 'crypto';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { cacheService } from '../cache/cache.service.js';

export interface GeminiResponse {
  text: string;
  cached: boolean;
}

export class GeminiService {
  private get apiKey(): string | undefined {
    return env.GEMINI_API_KEY;
  }

  constructor() {}

  /**
   * Health check verifying if Gemini API key is configured.
   */
  async isHealthy(): Promise<boolean> {
    return Boolean(this.apiKey && this.apiKey !== 'your-gemini-api-key');
  }

  /**
   * Execute generic prompt against Gemini API (with caching & timeout fallback).
   */
  async executePrompt(prompt: string, cacheTtlSeconds = 3600): Promise<GeminiResponse> {
    if (!this.apiKey || this.apiKey === 'your-gemini-api-key') {
      logger.warn('Gemini API key missing or unconfigured. Returning unconfigured fallback.');
      return {
        text: 'Gemini API is not configured.',
        cached: false,
      };
    }

    const cacheKey = `gemini:prompt:${crypto.createHash('sha256').update(prompt).digest('hex')}`;

    const text = await cacheService.wrap(
      cacheKey,
      async () => {
        let attempts = 0;
        const maxAttempts = 3;
        let delay = 300;

        while (attempts < maxAttempts) {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15_000);
          try {
            attempts++;
            // Execute HTTP request to Gemini REST API endpoint with 15s timeout
            const response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${this.apiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: prompt }] }],
                }),
                signal: controller.signal,
              },
            );

            if (!response.ok) {
              throw new Error(`Gemini API HTTP error status: ${response.status}`);
            }

            const data = (await response.json()) as {
              candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
            };
            const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
            return textResponse || 'No response generated.';
          } catch (error: unknown) {
            const errMessage = error instanceof Error ? error.message : String(error);
            logger.warn({ attempt: attempts, error: errMessage }, 'Gemini prompt execution failed');
            if (attempts >= maxAttempts) {
              throw error;
            }
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay *= 2;
          } finally {
            clearTimeout(timeoutId);
          }
        }

        return 'Gemini request failed.';
      },
      cacheTtlSeconds,
    );

    return { text, cached: true };
  }
}

export const geminiService = new GeminiService();
