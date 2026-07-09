import { inject, Service } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { EnvironmentService } from '../core/config/environment.service';
import { ENVIRONMENT_PLACEHOLDERS } from '../../environments/environment.placeholders';

@Service()
export class SupabaseService {
  private readonly environment = inject(EnvironmentService);
  private client: SupabaseClient | null = null;

  get isConfigured(): boolean {
    const { url, anonKey } = this.environment.supabase;

    return (
      url.length > 0 &&
      anonKey.length > 0 &&
      url !== ENVIRONMENT_PLACEHOLDERS.supabaseUrl &&
      anonKey !== ENVIRONMENT_PLACEHOLDERS.supabaseAnonKey
    );
  }

  getClient(): SupabaseClient {
    if (!this.isConfigured) {
      throw new Error(
        'Supabase is not configured. Copy environment.example.ts to environment.ts and add your project credentials.',
      );
    }

    if (!this.client) {
      const { url, anonKey } = this.environment.supabase;
      this.client = createClient(url, anonKey);
    }

    return this.client;
  }
}
