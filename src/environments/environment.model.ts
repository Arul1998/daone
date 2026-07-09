export type EnvironmentName = 'development' | 'production' | 'local';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export interface LoginPrefill {
  email: string;
  password: string;
}

export interface EnvironmentFeatures {
  prefillLogin?: LoginPrefill;
}

export interface Environment {
  name: EnvironmentName;
  production: boolean;
  supabase: SupabaseConfig;
  features?: EnvironmentFeatures;
}
