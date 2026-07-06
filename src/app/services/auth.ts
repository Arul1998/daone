import { computed, inject, Service, signal } from '@angular/core';
import { Session, User } from '@supabase/supabase-js';

import { SupabaseService } from './supabase';

@Service()
export class AuthService {
  private readonly supabase = inject(SupabaseService);

  private readonly sessionState = signal<Session | null>(null);
  private initialized = false;

  readonly session = this.sessionState.asReadonly();
  readonly user = computed<User | null>(() => this.sessionState()?.user ?? null);
  readonly isLoggedIn = computed(() => this.sessionState() !== null);

  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const client = this.supabase.getClient();
    const { data } = await client.auth.getSession();
    this.sessionState.set(data.session);
    this.initialized = true;

    client.auth.onAuthStateChange((_event, session) => {
      this.sessionState.set(session);
    });
  }

  async getSession(): Promise<Session | null> {
    await this.init();
    return this.sessionState();
  }

  async signUp(email: string, password: string) {
    await this.init();
    return this.supabase.getClient().auth.signUp({ email, password });
  }

  async signIn(email: string, password: string) {
    await this.init();
    return this.supabase.getClient().auth.signInWithPassword({ email, password });
  }

  async signOut() {
    await this.init();
    return this.supabase.getClient().auth.signOut();
  }
}
