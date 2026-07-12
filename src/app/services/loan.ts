import { inject, Injectable } from '@angular/core';

import { Loan, LoanInput, LoanSummary } from '../models/loan';
import { getSupabaseErrorMessage } from '../shared/utils/supabase-error';
import { AuthService } from './auth';
import { SupabaseService } from './supabase';

const LOAN_COLUMNS =
  'id, user_id, name, loan_type, lender, principal_amount, outstanding_amount, currency, interest_rate, start_date, end_date, account_reference, notes, status, created_at, updated_at';

@Injectable({
  providedIn: 'root',
})
export class LoanService {
  private readonly supabase = inject(SupabaseService);
  private readonly auth = inject(AuthService);

  async listActive(): Promise<Loan[]> {
    return this.listByStatus(1);
  }

  async listArchived(): Promise<Loan[]> {
    return this.listByStatus(0);
  }

  async getById(id: string): Promise<Loan | null> {
    const userId = await this.requireUserId();
    const client = this.supabase.getClient();

    const { data, error } = await client
      .from('loans')
      .select(LOAN_COLUMNS)
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(getSupabaseErrorMessage(error, 'Could not load this loan.'));
    }

    return data;
  }

  async create(input: LoanInput): Promise<Loan> {
    const userId = await this.requireUserId();
    const client = this.supabase.getClient();

    const { data, error } = await client
      .from('loans')
      .insert({
        ...input,
        user_id: userId,
        status: 1,
      })
      .select(LOAN_COLUMNS)
      .single();

    if (error) {
      throw new Error(getSupabaseErrorMessage(error, 'Could not create this loan.'));
    }

    return data;
  }

  async update(id: string, input: LoanInput): Promise<Loan> {
    const userId = await this.requireUserId();
    const client = this.supabase.getClient();

    const { data, error } = await client
      .from('loans')
      .update(input)
      .eq('id', id)
      .eq('user_id', userId)
      .select(LOAN_COLUMNS)
      .single();

    if (error) {
      throw new Error(getSupabaseErrorMessage(error, 'Could not update this loan.'));
    }

    return data;
  }

  async archive(id: string): Promise<void> {
    const userId = await this.requireUserId();
    const client = this.supabase.getClient();

    const { error } = await client
      .from('loans')
      .update({ status: 0 })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(getSupabaseErrorMessage(error, 'Could not archive this loan.'));
    }
  }

  async restore(id: string): Promise<Loan> {
    const userId = await this.requireUserId();
    const client = this.supabase.getClient();

    const { data, error } = await client
      .from('loans')
      .update({ status: 1 })
      .eq('id', id)
      .eq('user_id', userId)
      .select(LOAN_COLUMNS)
      .single();

    if (error) {
      throw new Error(getSupabaseErrorMessage(error, 'Could not restore this loan.'));
    }

    return data;
  }

  async getActiveSummary(): Promise<LoanSummary> {
    const loans = await this.listActive();
    const outstandingByCurrency: Record<string, number> = {};

    for (const loan of loans) {
      if (loan.outstanding_amount === null) {
        continue;
      }

      outstandingByCurrency[loan.currency] =
        (outstandingByCurrency[loan.currency] ?? 0) + loan.outstanding_amount;
    }

    return {
      count: loans.length,
      outstandingByCurrency,
    };
  }

  private async listByStatus(status: 0 | 1): Promise<Loan[]> {
    const userId = await this.requireUserId();
    const client = this.supabase.getClient();

    const { data, error } = await client
      .from('loans')
      .select(LOAN_COLUMNS)
      .eq('user_id', userId)
      .eq('status', status)
      .order('updated_at', { ascending: false });

    if (error) {
      const fallback =
        status === 1 ? 'Could not load your loans.' : 'Could not load archived loans.';
      throw new Error(getSupabaseErrorMessage(error, fallback));
    }

    return data ?? [];
  }

  private async requireUserId(): Promise<string> {
    await this.auth.init();
    const userId = this.auth.user()?.id;

    if (!userId) {
      throw new Error('You must be signed in to manage loans.');
    }

    return userId;
  }
}
