-- Assets table for DAOne personal continuity records
create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  category text not null,
  description text,
  purchase_value numeric(14, 2),
  current_value numeric(14, 2),
  currency text not null default 'GBP',
  purchase_date date,
  ownership_details text,
  nominee_name text,
  nominee_contact text,
  notes text,
  status smallint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint assets_name_not_blank check (char_length(trim(name)) > 0),
  constraint assets_category_not_blank check (char_length(trim(category)) > 0),
  constraint assets_status_valid check (status in (0, 1)),
  constraint assets_purchase_value_non_negative check (
    purchase_value is null or purchase_value >= 0
  ),
  constraint assets_current_value_non_negative check (
    current_value is null or current_value >= 0
  )
);

create index if not exists assets_user_id_idx on public.assets (user_id);
create index if not exists assets_user_id_status_idx on public.assets (user_id, status);

alter table public.assets enable row level security;

create policy "Users can view own assets"
  on public.assets
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own assets"
  on public.assets
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own assets"
  on public.assets
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists assets_set_updated_at on public.assets;

create trigger assets_set_updated_at
  before update on public.assets
  for each row
  execute function public.set_updated_at();
