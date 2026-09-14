# Sri Siddhi Vinayaka

Mobile-first web app for the Sri Siddhi Vinayaka Youth Association's Ganesh
Chaturthi celebration: schedule, pooja registration, live darshan, gallery,
announcements. Volunteer-maintained, $0 infrastructure budget.

See [AGENTS.md](./AGENTS.md) for the full stack, conventions, and
non-negotiables (RLS, secrets, server/client component boundaries) — read it
before making changes.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in your Supabase project's URL + anon key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Supabase setup

1. Create a free Supabase project (staging first if you're setting up a new environment).
2. Settings → API: copy the Project URL and `anon public` key into `.env.local`.
3. Migrations in [`supabase/migrations/`](./supabase/migrations) auto-apply to staging on push to `develop`, and to production on push to `main` — see [`supabase/README.md`](./supabase/README.md), including the one-time steps for standing up the production project itself.
4. Never put the **service role** key in a `NEXT_PUBLIC_*` var — it belongs only in server-side env vars for admin routes, never committed.

## Scripts

- `npm run dev` — start the dev server
- `npm run lint` — ESLint
- `npm run typecheck` — `tsc --noEmit`
- `npm run build` — production build

Both lint and typecheck must pass before opening a PR.

## Workflow

Branch from `develop`. `develop` auto-deploys to staging, `main` to
production — never commit straight to `main`. Every PR gets a Vercel preview;
that's the review surface, and it gets reviewed on a phone.
