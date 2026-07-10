import { inject, Injectable } from '@angular/core';

import { Profile } from '../models/profile';
import { getSupabaseErrorMessage } from '../shared/utils/supabase-error';
import { SupabaseService } from './supabase';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly supabase = inject(SupabaseService);

  async getMyProfile(): Promise<Profile | null> {
    const client = this.supabase.getClient();
    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      return null;
    }

    const { data, error } = await client
      .from('profiles')
      .select('id, email, full_name, created_at, updated_at')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      throw new Error(getSupabaseErrorMessage(error, 'Could not load your profile.'));
    }

    return data;
  }
}
