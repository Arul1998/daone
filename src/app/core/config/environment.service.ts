import { inject, Injectable } from '@angular/core';

import { Environment, EnvironmentName, LoginPrefill } from '../../../environments/environment.model';
import { ENVIRONMENT_PLACEHOLDERS } from '../../../environments/environment.placeholders';
import { APP_ENVIRONMENT } from './app-environment.token';

@Injectable({
  providedIn: 'root',
})
export class EnvironmentService {
  private readonly config = inject(APP_ENVIRONMENT);

  get name(): EnvironmentName {
    return this.config.name;
  }

  get production(): boolean {
    return this.config.production;
  }

  get supabase(): Environment['supabase'] {
    return this.config.supabase;
  }

  get loginPrefill(): LoginPrefill | null {
    return this.config.features?.prefillLogin ?? null;
  }

  get isSupabaseConfigured(): boolean {
    const { url, anonKey } = this.config.supabase;

    return (
      url.length > 0 &&
      anonKey.length > 0 &&
      url !== ENVIRONMENT_PLACEHOLDERS.supabaseUrl &&
      anonKey !== ENVIRONMENT_PLACEHOLDERS.supabaseAnonKey
    );
  }
}
