-- Loans table for DAOne personal continuity records
create table if not exists public.loans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  loan_type text not null,
  lender text,
  principal_amount numeric(14, 2),
  outstanding_amount numeric(14, 2),
  currency text not null default 'GBP',
  interest_rate numeric(5, 2),
  start_date date,
  end_date date,
  account_reference text,
  notes text,
  status smallint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint loans_name_not_blank check (char_length(trim(name)) > 0),
  constraint loans_name_max_length check (char_length(name) <= 120),
  constraint loans_type_approved check (
    loan_type in (
      'Home Loan',
      'Vehicle Loan',
      'Personal Loan',
      'Education Loan',
      'Gold Loan',
      'Credit Card',
      'Business Loan',
      'Other'
    )
  ),
  constraint loans_lender_max_length check (lender is null or char_length(lender) <= 200),
  constraint loans_currency_approved check (currency in ('GBP', 'INR', 'USD', 'EUR')),
  constraint loans_principal_amount_bounds check (
    principal_amount is null or (principal_amount >= 0 and principal_amount <= 999999999999.99)
  ),
  constraint loans_outstanding_amount_bounds check (
    outstanding_amount is null or (outstanding_amount >= 0 and outstanding_amount <= 999999999999.99)
  ),
  constraint loans_interest_rate_bounds check (
    interest_rate is null or (interest_rate >= 0 and interest_rate <= 100)
  ),
  constraint loans_end_date_after_start check (
    start_date is null or end_date is null or end_date >= start_date
  ),
  constraint loans_account_reference_max_length check (
    account_reference is null or char_length(account_reference) <= 200
  ),
  constraint loans_notes_max_length check (notes is null or char_length(notes) <= 5000),
  constraint loans_status_valid check (status in (0, 1))
);

create index if not exists loans_user_id_idx on public.loans (user_id);
create index if not exists loans_user_id_status_idx on public.loans (user_id, status);

alter table public.loans enable row level security;

create policy "Users can view own loans"
  on public.loans
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own loans"
  on public.loans
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own loans"
  on public.loans
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists loans_set_updated_at on public.loans;

create trigger loans_set_updated_at
  before update on public.loans
  for each row
  execute function public.set_updated_at();
