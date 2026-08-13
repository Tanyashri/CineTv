import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import { env } from './env.js';

if (typeof globalThis.WebSocket === 'undefined') {
  (globalThis as unknown as { WebSocket: typeof WebSocket }).WebSocket = WebSocket;
}

/**
 * Supabase Admin Client using Service Role Key.
 * Bypasses RLS for administrative user synchronization & auth management.
 */
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

/**
 * Supabase Client using Anon Key for standard auth operations.
 */
export const supabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  },
);
