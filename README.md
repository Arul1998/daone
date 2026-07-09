# DAOne

A secure personal continuity platform for organizing life's most important information.

## Setup

```bash
npm install
```

Copy environment templates and add your Supabase credentials:

```bash
cp src/environments/environment.example.ts src/environments/environment.ts
cp src/environments/environment.production.example.ts src/environments/environment.prod.ts
```

Optional — local config with login prefill for manual testing:

```bash
cp src/environments/environment.local.example.ts src/environments/environment.local.ts
```

Supabase credentials: **Dashboard → Project Settings → API** (Project URL + anon public key).

## Run

| Command | Use case |
|---------|----------|
| `npm start` | Development |
| `npm run start:local` | Development with login prefill |
| `npm run start:prod` | Production build served locally |
| `npm run build` | Production build |

## Tech stack

- Angular
- Tailwind CSS
- Supabase Auth & PostgreSQL
