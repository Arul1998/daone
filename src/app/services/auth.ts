import { computed, inject, Injectable, signal } from '@angular/core';
import { Session, User } from '@supabase/supabase-js';

import { SupabaseService } from './supabase';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly supabase = inject(SupabaseService);

  private readonly sessionState = signal<Session | null>(null);
  private initPromise: Promise<void> | null = null;

  readonly session = this.sessionState.asReadonly();
  readonly user = computed<User | null>(() => this.sessionState()?.user ?? null);
  readonly isLoggedIn = computed(() => this.sessionState() !== null);

  init(): Promise<void> {
    this.initPromise ??= this.initialize();
    return this.initPromise;
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

  async requestPasswordReset(email: string) {
    await this.init();
    return this.supabase.getClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
  }

  async updatePassword(password: string) {
    await this.init();
    return this.supabase.getClient().auth.updateUser({ password });
  }

  private async initialize(): Promise<void> {
    const client = this.supabase.getClient();
    const { data } = await client.auth.getSession();
    this.sessionState.set(data.session);

    client.auth.onAuthStateChange((_event, session) => {
      this.sessionState.set(session);
    });
  }
}
