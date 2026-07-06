import { Environment } from './environment.model';

/**
 * Copy this file to environment.ts and environment.prod.ts,
 * then replace the placeholder values with your Supabase project settings.
 *
 * Supabase Dashboard → Project Settings → API:
 * - Project URL  → supabaseUrl
 * - anon public  → supabaseAnonKey
 *
 * Never commit real keys to a public repository.
 */
export const environment: Environment = {
  production: false,
  supabaseUrl: 'YOUR_SUPABASE_URL',
  supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY',
};
