# DAOne

A secure personal continuity platform for organizing life's most important information — assets, loans, insurance, properties, and trusted contacts — in one place.

## Tech stack

- Angular 22 (standalone components, signals, reactive forms)
- Tailwind CSS 4
- Supabase Auth & PostgreSQL

## Prerequisites

- Node.js 22+
- npm 11+
- A Supabase project ([supabase.com](https://supabase.com))

## Environment setup

Environment files with real credentials are **not committed**. Copy the example templates and add your Supabase **anon public key** and project URL only.

```bash
npm install

cp src/environments/environment.example.ts src/environments/environment.ts
cp src/environments/environment.production.example.ts src/environments/environment.prod.ts
```

Optional — local config with login prefill for faster manual testing:

```bash
cp src/environments/environment.local.example.ts src/environments/environment.local.ts
```

Get credentials from **Supabase Dashboard → Project Settings → API**:

- Project URL → `supabase.url`
- `anon` `public` key → `supabase.anonKey`

Never commit the **service-role** key. The app only uses the anon key on the client.

If Supabase is not configured, the app throws a clear runtime error when auth or data services are used. Builds still compile with placeholder values in the example files.

### Build configurations

| Configuration | Environment file used | Command |
|---------------|----------------------|---------|
| Development | `environment.ts` | `npm start`, `npm run build:dev` |
| Local | `environment.local.ts` | `npm run start:local` |
| Production | `environment.prod.ts` | `npm run build`, `npm run start:prod` |

## Supabase migrations

SQL migrations live in `supabase/migrations/`. Apply them **in order**:

1. `20260710120000_create_profiles.sql` — profiles table, RLS, signup trigger, `updated_at` trigger
2. `20260710120100_create_assets.sql` — assets table, indexes, RLS, archive-friendly update policies
3. `20260710120200_harden_assets_constraints.sql` — approved categories/currencies, text length limits, monetary bounds
4. `20260712090000_create_loans.sql` — loans table, indexes, RLS, validation constraints
5. `20260712090100_create_insurance_policies.sql` — insurance policies table, indexes, RLS, validation constraints
6. `20260712090200_create_trusted_contacts.sql` — trusted contacts table, indexes, RLS, validation constraints
7. `20260712090300_harden_profiles.sql` — full name length limit for profile editing

If existing rows violate a new hardening constraint, PostgreSQL will reject that migration. Fix the invalid rows manually, then re-run the migration.

Apply them using one of:

**Supabase CLI** (recommended):

```bash
supabase db push
```

**Supabase Dashboard**:

1. Open **SQL Editor**
2. Run each migration file in order

## Development commands

| Command | Description |
|---------|-------------|
| `npm start` | Dev server (development config) |
| `npm run start:local` | Dev server with login prefill |
| `npm run start:prod` | Serve production build locally |
| `npm run watch` | Rebuild on file changes |

## Build and test commands

| Command | Description |
|---------|-------------|
| `npm run build:dev` | Development build |
| `npm run build` | Production build |
| `npm test` | Unit tests (watch mode) |
| `npm run test:ci` | Unit tests (single run, for CI) |

### Verification commands

Run these before opening a pull request:

```bash
npm install
npm run build:dev
npm run build
npm run test:ci
```

## Validation rules

The Angular forms and database enforce the same limits.

**Assets**

| Field | Rules |
|-------|-------|
| Name | Required, trimmed, max 120 characters |
| Category | Required, must be an approved category |
| Purchase value / Current value | Optional, 0 to 999,999,999,999.99 |
| Currency | Required, one of `GBP`, `INR`, `USD`, `EUR` |
| Purchase date | Optional, cannot be in the future |
| Description / Ownership details | Max 1,000 characters |
| Nominee name | Max 120 characters |
| Nominee contact | Max 200 characters |
| Notes | Max 5,000 characters |

**Loans**

| Field | Rules |
|-------|-------|
| Name | Required, trimmed, max 120 characters |
| Loan type | Required, must be an approved loan type |
| Lender | Max 200 characters |
| Principal / Outstanding amount | Optional, 0 to 999,999,999,999.99 |
| Currency | Required, one of `GBP`, `INR`, `USD`, `EUR` |
| Interest rate | Optional, 0 to 100, up to two decimals |
| Start date | Optional, cannot be in the future |
| End date | Optional, cannot be before the start date |
| Account reference | Max 200 characters |
| Notes | Max 5,000 characters |

**Insurance policies**

| Field | Rules |
|-------|-------|
| Name | Required, trimmed, max 120 characters |
| Policy type | Required, must be an approved policy type |
| Provider | Max 200 characters |
| Policy number | Max 100 characters |
| Sum assured / Premium amount | Optional, 0 to 999,999,999,999.99 |
| Currency | Required, one of `GBP`, `INR`, `USD`, `EUR` |
| Premium frequency | Optional, must be an approved frequency |
| Start date | Optional, cannot be in the future |
| Renewal date | Optional, cannot be before the start date |
| Nominee name | Max 120 characters |
| Nominee contact | Max 200 characters |
| Notes | Max 5,000 characters |

**Trusted contacts**

| Field | Rules |
|-------|-------|
| Full name | Required, trimmed, max 120 characters |
| Relationship | Required, must be an approved relationship |
| Email | Optional, valid email, max 200 characters |
| Phone | Max 50 characters |
| Address | Max 500 characters |
| Notes | Max 5,000 characters |

Invalid monetary values block submission. They are never silently converted to `null`.

## Currency support

DAOne supports UK and Indian assets with these currencies:

- `GBP`
- `INR`
- `USD`
- `EUR`

Dashboard and asset views format each amount in its own currency. Different currencies are shown separately and are **not** automatically converted or combined into one total.

## Current features

- Landing page with product overview
- User registration and login (Supabase Auth)
- Password reset flow (`/forgot-password` → email link → `/reset-password`)
- Protected dashboard and navigation
- Automatic profile creation on signup
- Profile editing (`/profile`) — update your display name
- Lazy-loaded routes — each page ships as its own bundle
- **Assets** (`/assets`), **Loans** (`/loans`), **Insurance** (`/insurance`), and
  **Trusted contacts** (`/contacts`), each with the same record lifecycle:
  - List active records
  - Add record (`/<section>/new`)
  - View record details (`/<section>/:id`)
  - Edit record (`/<section>/:id/edit`)
  - Archive record (soft delete via `status = 0`)
  - View archived records (`/<section>/archived`) and details (`/<section>/archived/:id`)
  - Restore archived records back to active status
  - Accessible archive/restore confirmation dialogs
- Dashboard summary cards: active asset count with per-currency totals, loan count
  with per-currency outstanding totals, policy count with per-currency sum assured,
  and trusted contact count

## Archive and restore flow

The same flow applies to assets, loans, insurance policies, and trusted contacts:

1. Open an active record and choose **Archive**
2. Confirm in the dialog — the record is hidden from the active list but not deleted
3. Open **View archived …** from the active list page
4. Open an archived record and choose **Restore**
5. Confirm in the dialog — the record returns to the active list

Archived records are never exposed in the normal active lists. There is no
hard-delete path: the database has no `delete` policy on any record table.

## Password reset flow

1. Open **Forgot password?** from the login page
2. Enter your account email — Supabase sends a reset link
3. The link opens `/reset-password` with a recovery session
4. Choose a new password and you are signed in again

For the email link to work, add your app URL (e.g. `http://localhost:4200`) to
**Supabase Dashboard → Authentication → URL Configuration → Redirect URLs**,
including `/reset-password`.

## Upcoming features

- Continuity access (sharing records with trusted contacts)
- Reminders for loan end dates and policy renewals

## CI

GitHub Actions runs on pushes and pull requests to `main` / `master`.

Workflow file: `.github/workflows/ci.yml`

It runs:

- `npm ci`
- `npm run build:dev`
- `npm run build`
- `npm run test:ci`

Environment files are created from safe example templates during CI. No Supabase secrets are stored in the workflow.

### How to check GitHub Actions

1. Open your repository on GitHub
2. Go to the **Actions** tab
3. Select the latest **CI** workflow run
4. Confirm all build and test jobs passed

Outdated runs on the same branch are cancelled automatically via workflow concurrency.
