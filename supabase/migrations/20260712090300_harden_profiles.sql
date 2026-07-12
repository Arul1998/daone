-- Harden profiles validation for DAOne profile editing.
--
-- If existing rows violate the new constraint, PostgreSQL will reject this migration.
-- Inspect invalid rows, correct them manually, then re-run the migration.

alter table public.profiles drop constraint if exists profiles_full_name_max_length;
alter table public.profiles
  add constraint profiles_full_name_max_length
  check (full_name is null or char_length(full_name) <= 120);
