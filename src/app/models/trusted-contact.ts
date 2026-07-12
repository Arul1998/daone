export type TrustedContactStatus = 0 | 1;

export interface TrustedContact {
  id: string;
  user_id: string;
  full_name: string;
  relationship: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  status: TrustedContactStatus;
  created_at: string;
  updated_at: string;
}

export interface TrustedContactInput {
  full_name: string;
  relationship: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
}

export interface TrustedContactSummary {
  count: number;
}

export const CONTACT_RELATIONSHIPS = [
  'Spouse / Partner',
  'Parent',
  'Child',
  'Sibling',
  'Relative',
  'Friend',
  'Solicitor',
  'Financial Advisor',
  'Executor',
  'Other',
] as const;

export const CONTACT_FIELD_LIMITS = {
  full_name: 120,
  email: 200,
  phone: 50,
  address: 500,
  notes: 5000,
} as const;

export type ContactRelationship = (typeof CONTACT_RELATIONSHIPS)[number];
