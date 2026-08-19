import { z } from 'zod';

const frontendEnvSchema = z.object({
  VITE_API_BASE_URL: z.string().min(1, 'VITE_API_BASE_URL is required').default('http://localhost:4000/api/v1'),
  VITE_SUPABASE_URL: z.string().url('VITE_SUPABASE_URL must be a valid URL').default('https://placeholder.supabase.co'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, 'VITE_SUPABASE_ANON_KEY is required').default('placeholder-anon-key'),
});

export type FrontendEnv = z.infer<typeof frontendEnvSchema>;

function loadFrontendEnv(): FrontendEnv {
  const envData = {
    VITE_API_BASE_URL: import.meta.env['VITE_API_BASE_URL'] || 'http://localhost:4000/api/v1',
    VITE_SUPABASE_URL: import.meta.env['VITE_SUPABASE_URL'] || 'https://placeholder.supabase.co',
    VITE_SUPABASE_ANON_KEY: import.meta.env['VITE_SUPABASE_ANON_KEY'] || 'placeholder-anon-key',
  };

  const parsed = frontendEnvSchema.safeParse(envData);

  if (!parsed.success) {
    const formatted = parsed.error.format();
    console.warn('⚠️ Frontend environment variable warning:', JSON.stringify(formatted, null, 2));
    return {
      VITE_API_BASE_URL: envData.VITE_API_BASE_URL,
      VITE_SUPABASE_URL: envData.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: envData.VITE_SUPABASE_ANON_KEY,
    };
  }

  return parsed.data;
}

export const env = loadFrontendEnv();
