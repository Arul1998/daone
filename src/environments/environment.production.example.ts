import { Environment } from './environment.model';
import { ENVIRONMENT_PLACEHOLDERS } from './environment.placeholders';

/**
 * Copy to environment.prod.ts (gitignored) for production builds.
 */
export const environment: Environment = {
  name: 'production',
  production: true,
  supabase: {
    url: ENVIRONMENT_PLACEHOLDERS.supabaseUrl,
    anonKey: ENVIRONMENT_PLACEHOLDERS.supabaseAnonKey,
  },
};
