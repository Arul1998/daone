import { inject, Service } from '@angular/core';

import { Environment, EnvironmentName, LoginPrefill } from '../../../environments/environment.model';
import { APP_ENVIRONMENT } from './app-environment.token';

@Service()
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
}
