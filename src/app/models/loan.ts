export type LoanStatus = 0 | 1;

export interface Loan {
  id: string;
  user_id: string;
  name: string;
  loan_type: string;
  lender: string | null;
  principal_amount: number | null;
  outstanding_amount: number | null;
  currency: string;
  interest_rate: number | null;
  start_date: string | null;
  end_date: string | null;
  account_reference: string | null;
  notes: string | null;
  status: LoanStatus;
  created_at: string;
  updated_at: string;
}

export interface LoanInput {
  name: string;
  loan_type: string;
  lender: string | null;
  principal_amount: number | null;
  outstanding_amount: number | null;
  currency: string;
  interest_rate: number | null;
  start_date: string | null;
  end_date: string | null;
  account_reference: string | null;
  notes: string | null;
}

export interface LoanSummary {
  count: number;
  outstandingByCurrency: Record<string, number>;
}

export const LOAN_TYPES = [
  'Home Loan',
  'Vehicle Loan',
  'Personal Loan',
  'Education Loan',
  'Gold Loan',
  'Credit Card',
  'Business Loan',
  'Other',
] as const;

export const LOAN_FIELD_LIMITS = {
  name: 120,
  lender: 200,
  account_reference: 200,
  notes: 5000,
  monetaryMax: 999999999999.99,
} as const;

export type LoanType = (typeof LOAN_TYPES)[number];
