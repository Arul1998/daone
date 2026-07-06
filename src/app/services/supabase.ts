import { Service } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { environment } from '../../environments/environment';

const PLACEHOLDER_URL = 'YOUR_SUPABASE_URL';
const PLACEHOLDER_KEY = 'YOUR_SUPABASE_ANON_KEY';

@Service()
export class SupabaseService {
  private client: SupabaseClient | null = null;

  /** True when real Supabase values are set in the environment file. */
  get isConfigured(): boolean {
    const { supabaseUrl, supabaseAnonKey } = environment;

    return (
      supabaseUrl.length > 0 &&
      supabaseAnonKey.length > 0 &&
      supabaseUrl !== PLACEHOLDER_URL &&
      supabaseAnonKey !== PLACEHOLDER_KEY
    );
  }

  /**
   * Returns the shared Supabase client.
   * Throws a clear error if environment values are still placeholders.
   */
  getClient(): SupabaseClient {
    if (!this.isConfigured) {
      throw new Error(
        'Supabase is not configured. Add your project URL and anon key to src/environments/environment.ts',
      );
    }

    if (!this.client) {
      this.client = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
    }

    return this.client;
  }
}
