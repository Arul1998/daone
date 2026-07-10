import { PostgrestError } from '@supabase/supabase-js';

export function getSupabaseErrorMessage(
  error: PostgrestError | Error | { message?: string },
  fallback = 'Something went wrong. Please try again.',
): string {
  if ('message' in error && typeof error.message === 'string' && error.message.length > 0) {
    return error.message;
  }

  return fallback;
}
