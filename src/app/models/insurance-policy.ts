export type InsurancePolicyStatus = 0 | 1;

export interface InsurancePolicy {
  id: string;
  user_id: string;
  name: string;
  policy_type: string;
  provider: string | null;
  policy_number: string | null;
  sum_assured: number | null;
  premium_amount: number | null;
  currency: string;
  premium_frequency: string | null;
  start_date: string | null;
  renewal_date: string | null;
  nominee_name: string | null;
  nominee_contact: string | null;
  notes: string | null;
  status: InsurancePolicyStatus;
  created_at: string;
  updated_at: string;
}

export interface InsurancePolicyInput {
  name: string;
  policy_type: string;
  provider: string | null;
  policy_number: string | null;
  sum_assured: number | null;
  premium_amount: number | null;
  currency: string;
  premium_frequency: string | null;
  start_date: string | null;
  renewal_date: string | null;
  nominee_name: string | null;
  nominee_contact: string | null;
  notes: string | null;
}

export interface InsurancePolicySummary {
  count: number;
  sumAssuredByCurrency: Record<string, number>;
}

export const INSURANCE_POLICY_TYPES = [
  'Life',
  'Term Life',
  'Health',
  'Vehicle',
  'Home',
  'Travel',
  'Other',
] as const;

export const INSURANCE_PREMIUM_FREQUENCIES = [
  'Monthly',
  'Quarterly',
  'Half-Yearly',
  'Yearly',
  'One-time',
] as const;

export const INSURANCE_FIELD_LIMITS = {
  name: 120,
  provider: 200,
  policy_number: 100,
  nominee_name: 120,
  nominee_contact: 200,
  notes: 5000,
  monetaryMax: 999999999999.99,
} as const;

export type InsurancePolicyType = (typeof INSURANCE_POLICY_TYPES)[number];
export type InsurancePremiumFrequency = (typeof INSURANCE_PREMIUM_FREQUENCIES)[number];
