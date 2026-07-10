-- Harden assets validation constraints for DAOne.
--
-- Purpose:
-- - Align database checks with Angular form validation
-- - Restrict categories and currencies to approved values
-- - Enforce maximum text lengths and monetary bounds
--
-- If existing rows violate a new constraint, PostgreSQL will reject this migration.
-- Inspect invalid rows, correct them manually, then re-run this migration.
-- Row-Level Security remains enabled; users can still only access their own assets.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

alter table public.assets enable row level security;

alter table public.assets drop constraint if exists assets_category_approved;
alter table public.assets
  add constraint assets_category_approved
  check (
    category in (
      'Property',
      'Vehicle',
      'Investment',
      'Bank Account',
      'Jewelry',
      'Other'
    )
  );

alter table public.assets drop constraint if exists assets_currency_approved;
alter table public.assets
  add constraint assets_currency_approved
  check (currency in ('GBP', 'INR', 'USD', 'EUR'));

alter table public.assets drop constraint if exists assets_name_max_length;
alter table public.assets
  add constraint assets_name_max_length
  check (char_length(name) <= 120);

alter table public.assets drop constraint if exists assets_description_max_length;
alter table public.assets
  add constraint assets_description_max_length
  check (description is null or char_length(description) <= 1000);

alter table public.assets drop constraint if exists assets_ownership_details_max_length;
alter table public.assets
  add constraint assets_ownership_details_max_length
  check (ownership_details is null or char_length(ownership_details) <= 1000);

alter table public.assets drop constraint if exists assets_nominee_name_max_length;
alter table public.assets
  add constraint assets_nominee_name_max_length
  check (nominee_name is null or char_length(nominee_name) <= 120);

alter table public.assets drop constraint if exists assets_nominee_contact_max_length;
alter table public.assets
  add constraint assets_nominee_contact_max_length
  check (nominee_contact is null or char_length(nominee_contact) <= 200);

alter table public.assets drop constraint if exists assets_notes_max_length;
alter table public.assets
  add constraint assets_notes_max_length
  check (notes is null or char_length(notes) <= 5000);

alter table public.assets drop constraint if exists assets_purchase_value_max;
alter table public.assets
  add constraint assets_purchase_value_max
  check (purchase_value is null or purchase_value <= 999999999999.99);

alter table public.assets drop constraint if exists assets_current_value_max;
alter table public.assets
  add constraint assets_current_value_max
  check (current_value is null or current_value <= 999999999999.99);

alter table public.assets drop constraint if exists assets_status_valid;
alter table public.assets
  add constraint assets_status_valid
  check (status in (0, 1));

alter table public.assets drop constraint if exists assets_purchase_value_non_negative;
alter table public.assets
  add constraint assets_purchase_value_non_negative
  check (purchase_value is null or purchase_value >= 0);

alter table public.assets drop constraint if exists assets_current_value_non_negative;
alter table public.assets
  add constraint assets_current_value_non_negative
  check (current_value is null or current_value >= 0);

drop trigger if exists assets_set_updated_at on public.assets;

create trigger assets_set_updated_at
  before update on public.assets
  for each row
  execute function public.set_updated_at();
