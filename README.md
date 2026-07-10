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

## Asset validation rules

The Angular form and database enforce the same limits:

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
- Protected dashboard and navigation
- Automatic profile creation on signup
- **Assets**
  - List active assets (`/assets`)
  - Add asset (`/assets/new`)
  - View asset details (`/assets/:id`)
  - Edit asset (`/assets/:id/edit`)
  - Archive asset (soft delete via `status = 0`)
  - View archived assets (`/assets/archived`)
  - View archived asset details (`/assets/archived/:id`)
  - Restore archived assets back to active status
  - Accessible archive/restore confirmation dialogs
  - Dashboard summary with active count and per-currency totals

## Archived assets and restore flow

1. Open an active asset and choose **Archive asset**
2. Confirm in the dialog — the asset is hidden from `/assets` but not deleted
3. Open **View archived assets** from the active assets page
4. Open an archived asset and choose **Restore asset**
5. Confirm in the dialog — the asset returns to the active list

Archived assets are never exposed in the normal active assets list.

## Upcoming features

- Loans
- Insurance policies
- Trusted contacts and continuity access
- Profile editing
- Password reset flow

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
