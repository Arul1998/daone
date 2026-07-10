export type AssetStatus = 0 | 1;

export interface Asset {
  id: string;
  user_id: string;
  name: string;
  category: string;
  description: string | null;
  purchase_value: number | null;
  current_value: number | null;
  currency: string;
  purchase_date: string | null;
  ownership_details: string | null;
  nominee_name: string | null;
  nominee_contact: string | null;
  notes: string | null;
  status: AssetStatus;
  created_at: string;
  updated_at: string;
}

export interface AssetInput {
  name: string;
  category: string;
  description: string | null;
  purchase_value: number | null;
  current_value: number | null;
  currency: string;
  purchase_date: string | null;
  ownership_details: string | null;
  nominee_name: string | null;
  nominee_contact: string | null;
  notes: string | null;
}

export interface AssetSummary {
  count: number;
  totalsByCurrency: Record<string, number>;
}

export const ASSET_CATEGORIES = [
  'Property',
  'Vehicle',
  'Investment',
  'Bank Account',
  'Jewelry',
  'Other',
] as const;

export const ASSET_CURRENCIES = ['GBP', 'USD', 'EUR'] as const;
