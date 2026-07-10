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

SQL migrations live in `supabase/migrations/`:

1. `20260710120000_create_profiles.sql` — profiles table, RLS, signup trigger, `updated_at` trigger
2. `20260710120100_create_assets.sql` — assets table, indexes, RLS, archive-friendly update policies

Apply them using one of:

**Supabase CLI** (recommended):

```bash
supabase db push
```

**Supabase Dashboard**:

1. Open **SQL Editor**
2. Run each migration file in order (profiles first, then assets)

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

## Current features

- Landing page with product overview
- User registration and login (Supabase Auth)
- Protected dashboard and navigation
- Automatic profile creation on signup
- **Assets MVP**
  - List active assets (`/assets`)
  - Add asset (`/assets/new`)
  - View asset details (`/assets/:id`)
  - Edit asset (`/assets/:id/edit`)
  - Archive asset (soft delete via `status = 0`)
  - Dashboard summary with active count and total current value

## Upcoming features

- Loans
- Insurance policies
- Trusted contacts and continuity access
- Profile editing
- Password reset flow

## CI

GitHub Actions runs on pushes and pull requests:

- `npm ci`
- Development and production builds (using example environment files)
- Non-watch unit tests

No Supabase secrets are stored in the workflow.
