import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function initDotenv(): void {
  const candidates = [
    path.resolve(process.cwd(), 'backend/.env'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(__dirname, '../../../.env'),
    path.resolve(__dirname, '../../.env'),
  ];

  for (const candidatePath of candidates) {
    if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
      dotenv.config({ path: candidatePath });
      return;
    }
  }

  dotenv.config();
}

initDotenv();

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),

  // Database (Supabase PostgreSQL)
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().optional().or(z.literal('')),

  // Supabase Credentials (Strictly required — fail fast if missing)
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().optional().or(z.literal('')),
  GOOGLE_CLIENT_SECRET: z.string().optional().or(z.literal('')),
  GOOGLE_CALLBACK_URL: z.string().optional().or(z.literal('')),

  // External APIs
  TMDB_API_KEY: z.string().optional().or(z.literal('')),
  GEMINI_API_KEY: z.string().optional().or(z.literal('')),
  WIKIPEDIA_API_BASE: z.string().optional().or(z.literal('')),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const formatted = parsed.error.format();
    console.error('❌ Invalid backend environment variables:', JSON.stringify(formatted, null, 2));
    process.exit(1);
  }

  return parsed.data;
}

export const env = loadEnv();
