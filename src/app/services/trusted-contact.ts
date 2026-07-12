import { inject, Injectable } from '@angular/core';

import {
  TrustedContact,
  TrustedContactInput,
  TrustedContactSummary,
} from '../models/trusted-contact';
import { getSupabaseErrorMessage } from '../shared/utils/supabase-error';
import { AuthService } from './auth';
import { SupabaseService } from './supabase';

const CONTACT_COLUMNS =
  'id, user_id, full_name, relationship, email, phone, address, notes, status, created_at, updated_at';

@Injectable({
  providedIn: 'root',
})
export class TrustedContactService {
  private readonly supabase = inject(SupabaseService);
  private readonly auth = inject(AuthService);

  async listActive(): Promise<TrustedContact[]> {
    return this.listByStatus(1);
  }

  async listArchived(): Promise<TrustedContact[]> {
    return this.listByStatus(0);
  }

  async getById(id: string): Promise<TrustedContact | null> {
    const userId = await this.requireUserId();
    const client = this.supabase.getClient();

    const { data, error } = await client
      .from('trusted_contacts')
      .select(CONTACT_COLUMNS)
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(getSupabaseErrorMessage(error, 'Could not load this contact.'));
    }

    return data;
  }

  async create(input: TrustedContactInput): Promise<TrustedContact> {
    const userId = await this.requireUserId();
    const client = this.supabase.getClient();

    const { data, error } = await client
      .from('trusted_contacts')
      .insert({
        ...input,
        user_id: userId,
        status: 1,
      })
      .select(CONTACT_COLUMNS)
      .single();

    if (error) {
      throw new Error(getSupabaseErrorMessage(error, 'Could not create this contact.'));
    }

    return data;
  }

  async update(id: string, input: TrustedContactInput): Promise<TrustedContact> {
    const userId = await this.requireUserId();
    const client = this.supabase.getClient();

    const { data, error } = await client
      .from('trusted_contacts')
      .update(input)
      .eq('id', id)
      .eq('user_id', userId)
      .select(CONTACT_COLUMNS)
      .single();

    if (error) {
      throw new Error(getSupabaseErrorMessage(error, 'Could not update this contact.'));
    }

    return data;
  }

  async archive(id: string): Promise<void> {
    const userId = await this.requireUserId();
    const client = this.supabase.getClient();

    const { error } = await client
      .from('trusted_contacts')
      .update({ status: 0 })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(getSupabaseErrorMessage(error, 'Could not archive this contact.'));
    }
  }

  async restore(id: string): Promise<TrustedContact> {
    const userId = await this.requireUserId();
    const client = this.supabase.getClient();

    const { data, error } = await client
      .from('trusted_contacts')
      .update({ status: 1 })
      .eq('id', id)
      .eq('user_id', userId)
      .select(CONTACT_COLUMNS)
      .single();

    if (error) {
      throw new Error(getSupabaseErrorMessage(error, 'Could not restore this contact.'));
    }

    return data;
  }

  async getActiveSummary(): Promise<TrustedContactSummary> {
    const contacts = await this.listActive();

    return {
      count: contacts.length,
    };
  }

  private async listByStatus(status: 0 | 1): Promise<TrustedContact[]> {
    const userId = await this.requireUserId();
    const client = this.supabase.getClient();

    const { data, error } = await client
      .from('trusted_contacts')
      .select(CONTACT_COLUMNS)
      .eq('user_id', userId)
      .eq('status', status)
      .order('updated_at', { ascending: false });

    if (error) {
      const fallback =
        status === 1 ? 'Could not load your contacts.' : 'Could not load archived contacts.';
      throw new Error(getSupabaseErrorMessage(error, fallback));
    }

    return data ?? [];
  }

  private async requireUserId(): Promise<string> {
    await this.auth.init();
    const userId = this.auth.user()?.id;

    if (!userId) {
      throw new Error('You must be signed in to manage trusted contacts.');
    }

    return userId;
  }
}
