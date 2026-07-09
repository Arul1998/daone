import { Environment } from './environment.model';

/**
 * Local development config — this file is gitignored.
 *
 * Setup:
 * 1. Copy this file to environment.ts and environment.prod.ts
 * 2. Replace placeholders with your Supabase project settings
 *
 * Supabase Dashboard → Project Settings → API:
 * - Project URL  → supabaseUrl
 * - anon public    → supabaseAnonKey
 *
 * Use only the anon (public) key here. Never put the service_role key in the app.
 */
export const environment: Environment = {
  production: false,
  supabaseUrl: 'YOUR_SUPABASE_URL',
  supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY',
};
