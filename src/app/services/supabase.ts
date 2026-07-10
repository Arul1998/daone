import { inject, Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { EnvironmentService } from '../core/config/environment.service';

export const SUPABASE_NOT_CONFIGURED_MESSAGE =
  'Supabase is not configured. Copy environment.example.ts to environment.ts (and environment.production.example.ts to environment.prod.ts for production builds), then add your project URL and anon key from the Supabase Dashboard.';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private readonly environment = inject(EnvironmentService);
  private client: SupabaseClient | null = null;

  get isConfigured(): boolean {
    return this.environment.isSupabaseConfigured;
  }

  getClient(): SupabaseClient {
    if (!this.isConfigured) {
      throw new Error(SUPABASE_NOT_CONFIGURED_MESSAGE);
    }

    if (!this.client) {
      const { url, anonKey } = this.environment.supabase;
      this.client = createClient(url, anonKey);
    }

    return this.client;
  }
}
