-- Trusted contacts table for DAOne continuity access
create table if not exists public.trusted_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  full_name text not null,
  relationship text not null,
  email text,
  phone text,
  address text,
  notes text,
  status smallint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trusted_contacts_full_name_not_blank check (char_length(trim(full_name)) > 0),
  constraint trusted_contacts_full_name_max_length check (char_length(full_name) <= 120),
  constraint trusted_contacts_relationship_approved check (
    relationship in (
      'Spouse / Partner',
      'Parent',
      'Child',
      'Sibling',
      'Relative',
      'Friend',
      'Solicitor',
      'Financial Advisor',
      'Executor',
      'Other'
    )
  ),
  constraint trusted_contacts_email_max_length check (email is null or char_length(email) <= 200),
  constraint trusted_contacts_phone_max_length check (phone is null or char_length(phone) <= 50),
  constraint trusted_contacts_address_max_length check (
    address is null or char_length(address) <= 500
  ),
  constraint trusted_contacts_notes_max_length check (notes is null or char_length(notes) <= 5000),
  constraint trusted_contacts_status_valid check (status in (0, 1))
);

create index if not exists trusted_contacts_user_id_idx on public.trusted_contacts (user_id);
create index if not exists trusted_contacts_user_id_status_idx
  on public.trusted_contacts (user_id, status);

alter table public.trusted_contacts enable row level security;

create policy "Users can view own trusted contacts"
  on public.trusted_contacts
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own trusted contacts"
  on public.trusted_contacts
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own trusted contacts"
  on public.trusted_contacts
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists trusted_contacts_set_updated_at on public.trusted_contacts;

create trigger trusted_contacts_set_updated_at
  before update on public.trusted_contacts
  for each row
  execute function public.set_updated_at();
