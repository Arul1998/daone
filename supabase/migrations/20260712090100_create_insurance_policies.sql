-- Insurance policies table for DAOne personal continuity records
create table if not exists public.insurance_policies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  policy_type text not null,
  provider text,
  policy_number text,
  sum_assured numeric(14, 2),
  premium_amount numeric(14, 2),
  currency text not null default 'GBP',
  premium_frequency text,
  start_date date,
  renewal_date date,
  nominee_name text,
  nominee_contact text,
  notes text,
  status smallint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint insurance_policies_name_not_blank check (char_length(trim(name)) > 0),
  constraint insurance_policies_name_max_length check (char_length(name) <= 120),
  constraint insurance_policies_type_approved check (
    policy_type in (
      'Life',
      'Term Life',
      'Health',
      'Vehicle',
      'Home',
      'Travel',
      'Other'
    )
  ),
  constraint insurance_policies_provider_max_length check (
    provider is null or char_length(provider) <= 200
  ),
  constraint insurance_policies_policy_number_max_length check (
    policy_number is null or char_length(policy_number) <= 100
  ),
  constraint insurance_policies_sum_assured_bounds check (
    sum_assured is null or (sum_assured >= 0 and sum_assured <= 999999999999.99)
  ),
  constraint insurance_policies_premium_amount_bounds check (
    premium_amount is null or (premium_amount >= 0 and premium_amount <= 999999999999.99)
  ),
  constraint insurance_policies_currency_approved check (
    currency in ('GBP', 'INR', 'USD', 'EUR')
  ),
  constraint insurance_policies_premium_frequency_approved check (
    premium_frequency is null
    or premium_frequency in ('Monthly', 'Quarterly', 'Half-Yearly', 'Yearly', 'One-time')
  ),
  constraint insurance_policies_nominee_name_max_length check (
    nominee_name is null or char_length(nominee_name) <= 120
  ),
  constraint insurance_policies_nominee_contact_max_length check (
    nominee_contact is null or char_length(nominee_contact) <= 200
  ),
  constraint insurance_policies_notes_max_length check (
    notes is null or char_length(notes) <= 5000
  ),
  constraint insurance_policies_status_valid check (status in (0, 1))
);

create index if not exists insurance_policies_user_id_idx on public.insurance_policies (user_id);
create index if not exists insurance_policies_user_id_status_idx
  on public.insurance_policies (user_id, status);

alter table public.insurance_policies enable row level security;

create policy "Users can view own insurance policies"
  on public.insurance_policies
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own insurance policies"
  on public.insurance_policies
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own insurance policies"
  on public.insurance_policies
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists insurance_policies_set_updated_at on public.insurance_policies;

create trigger insurance_policies_set_updated_at
  before update on public.insurance_policies
  for each row
  execute function public.set_updated_at();
