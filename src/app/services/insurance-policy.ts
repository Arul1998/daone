import { inject, Injectable } from '@angular/core';

import {
  InsurancePolicy,
  InsurancePolicyInput,
  InsurancePolicySummary,
} from '../models/insurance-policy';
import { getSupabaseErrorMessage } from '../shared/utils/supabase-error';
import { AuthService } from './auth';
import { SupabaseService } from './supabase';

const POLICY_COLUMNS =
  'id, user_id, name, policy_type, provider, policy_number, sum_assured, premium_amount, currency, premium_frequency, start_date, renewal_date, nominee_name, nominee_contact, notes, status, created_at, updated_at';

@Injectable({
  providedIn: 'root',
})
export class InsurancePolicyService {
  private readonly supabase = inject(SupabaseService);
  private readonly auth = inject(AuthService);

  async listActive(): Promise<InsurancePolicy[]> {
    return this.listByStatus(1);
  }

  async listArchived(): Promise<InsurancePolicy[]> {
    return this.listByStatus(0);
  }

  async getById(id: string): Promise<InsurancePolicy | null> {
    const userId = await this.requireUserId();
    const client = this.supabase.getClient();

    const { data, error } = await client
      .from('insurance_policies')
      .select(POLICY_COLUMNS)
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(getSupabaseErrorMessage(error, 'Could not load this policy.'));
    }

    return data;
  }

  async create(input: InsurancePolicyInput): Promise<InsurancePolicy> {
    const userId = await this.requireUserId();
    const client = this.supabase.getClient();

    const { data, error } = await client
      .from('insurance_policies')
      .insert({
        ...input,
        user_id: userId,
        status: 1,
      })
      .select(POLICY_COLUMNS)
      .single();

    if (error) {
      throw new Error(getSupabaseErrorMessage(error, 'Could not create this policy.'));
    }

    return data;
  }

  async update(id: string, input: InsurancePolicyInput): Promise<InsurancePolicy> {
    const userId = await this.requireUserId();
    const client = this.supabase.getClient();

    const { data, error } = await client
      .from('insurance_policies')
      .update(input)
      .eq('id', id)
      .eq('user_id', userId)
      .select(POLICY_COLUMNS)
      .single();

    if (error) {
      throw new Error(getSupabaseErrorMessage(error, 'Could not update this policy.'));
    }

    return data;
  }

  async archive(id: string): Promise<void> {
    const userId = await this.requireUserId();
    const client = this.supabase.getClient();

    const { error } = await client
      .from('insurance_policies')
      .update({ status: 0 })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(getSupabaseErrorMessage(error, 'Could not archive this policy.'));
    }
  }

  async restore(id: string): Promise<InsurancePolicy> {
    const userId = await this.requireUserId();
    const client = this.supabase.getClient();

    const { data, error } = await client
      .from('insurance_policies')
      .update({ status: 1 })
      .eq('id', id)
      .eq('user_id', userId)
      .select(POLICY_COLUMNS)
      .single();

    if (error) {
      throw new Error(getSupabaseErrorMessage(error, 'Could not restore this policy.'));
    }

    return data;
  }

  async getActiveSummary(): Promise<InsurancePolicySummary> {
    const policies = await this.listActive();
    const sumAssuredByCurrency: Record<string, number> = {};

    for (const policy of policies) {
      if (policy.sum_assured === null) {
        continue;
      }

      sumAssuredByCurrency[policy.currency] =
        (sumAssuredByCurrency[policy.currency] ?? 0) + policy.sum_assured;
    }

    return {
      count: policies.length,
      sumAssuredByCurrency,
    };
  }

  private async listByStatus(status: 0 | 1): Promise<InsurancePolicy[]> {
    const userId = await this.requireUserId();
    const client = this.supabase.getClient();

    const { data, error } = await client
      .from('insurance_policies')
      .select(POLICY_COLUMNS)
      .eq('user_id', userId)
      .eq('status', status)
      .order('updated_at', { ascending: false });

    if (error) {
      const fallback =
        status === 1
          ? 'Could not load your insurance policies.'
          : 'Could not load archived insurance policies.';
      throw new Error(getSupabaseErrorMessage(error, fallback));
    }

    return data ?? [];
  }

  private async requireUserId(): Promise<string> {
    await this.auth.init();
    const userId = this.auth.user()?.id;

    if (!userId) {
      throw new Error('You must be signed in to manage insurance policies.');
    }

    return userId;
  }
}
