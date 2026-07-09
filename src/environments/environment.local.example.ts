import { Environment } from './environment.model';
import { ENVIRONMENT_PLACEHOLDERS } from './environment.placeholders';

/**
 * Copy to environment.local.ts (gitignored).
 * Run with: npm run start:local
 *
 * Same Supabase project as development, plus optional login prefill for faster manual testing.
 */
export const environment: Environment = {
  name: 'local',
  production: false,
  supabase: {
    url: ENVIRONMENT_PLACEHOLDERS.supabaseUrl,
    anonKey: ENVIRONMENT_PLACEHOLDERS.supabaseAnonKey,
  },
  features: {
    prefillLogin: {
      email: 'YOUR_TEST_EMAIL',
      password: 'YOUR_TEST_PASSWORD',
    },
  },
};
