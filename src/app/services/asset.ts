import { inject, Injectable } from '@angular/core';

import { Asset, AssetInput, AssetSummary } from '../models/asset';
import { getSupabaseErrorMessage } from '../shared/utils/supabase-error';
import { AuthService } from './auth';
import { SupabaseService } from './supabase';

const ASSET_COLUMNS =
  'id, user_id, name, category, description, purchase_value, current_value, currency, purchase_date, ownership_details, nominee_name, nominee_contact, notes, status, created_at, updated_at';

@Injectable({
  providedIn: 'root',
})
export class AssetService {
  private readonly supabase = inject(SupabaseService);
  private readonly auth = inject(AuthService);

  async listActive(): Promise<Asset[]> {
    const userId = await this.requireUserId();
    const client = this.supabase.getClient();

    const { data, error } = await client
      .from('assets')
      .select(ASSET_COLUMNS)
      .eq('user_id', userId)
      .eq('status', 1)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(getSupabaseErrorMessage(error, 'Could not load your assets.'));
    }

    return data ?? [];
  }

  async getById(id: string): Promise<Asset | null> {
    const userId = await this.requireUserId();
    const client = this.supabase.getClient();

    const { data, error } = await client
      .from('assets')
      .select(ASSET_COLUMNS)
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(getSupabaseErrorMessage(error, 'Could not load this asset.'));
    }

    return data;
  }

  async create(input: AssetInput): Promise<Asset> {
    const userId = await this.requireUserId();
    const client = this.supabase.getClient();

    const { data, error } = await client
      .from('assets')
      .insert({
        ...input,
        user_id: userId,
        status: 1,
      })
      .select(ASSET_COLUMNS)
      .single();

    if (error) {
      throw new Error(getSupabaseErrorMessage(error, 'Could not create this asset.'));
    }

    return data;
  }

  async update(id: string, input: AssetInput): Promise<Asset> {
    const userId = await this.requireUserId();
    const client = this.supabase.getClient();

    const { data, error } = await client
      .from('assets')
      .update(input)
      .eq('id', id)
      .eq('user_id', userId)
      .select(ASSET_COLUMNS)
      .single();

    if (error) {
      throw new Error(getSupabaseErrorMessage(error, 'Could not update this asset.'));
    }

    return data;
  }

  async archive(id: string): Promise<void> {
    const userId = await this.requireUserId();
    const client = this.supabase.getClient();

    const { error } = await client
      .from('assets')
      .update({ status: 0 })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(getSupabaseErrorMessage(error, 'Could not archive this asset.'));
    }
  }

  async getActiveSummary(): Promise<AssetSummary> {
    const assets = await this.listActive();
    const totalsByCurrency: Record<string, number> = {};

    for (const asset of assets) {
      if (asset.current_value === null) {
        continue;
      }

      totalsByCurrency[asset.currency] =
        (totalsByCurrency[asset.currency] ?? 0) + asset.current_value;
    }

    return {
      count: assets.length,
      totalsByCurrency,
    };
  }

  private async requireUserId(): Promise<string> {
    await this.auth.init();
    const userId = this.auth.user()?.id;

    if (!userId) {
      throw new Error('You must be signed in to manage assets.');
    }

    return userId;
  }
}
