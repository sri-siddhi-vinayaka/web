# supabase

Versioned SQL migrations for the Supabase Postgres schema. No ORM — plain
`.sql` files, applied in order by the Supabase CLI.

## Applying a migration

Pushing to `develop` or `main` with new files under `supabase/migrations/`
triggers `.github/workflows/deploy-migrations.yml`, which runs
`supabase db push` against the staging or production project
automatically — no manual SQL Editor step, for either environment.

Requires a `staging` GitHub Environment (Settings → Environments) holding
`SUPABASE_ACCESS_TOKEN` + `SUPABASE_STAGING_DB_PASSWORD` as secrets and
`SUPABASE_STAGING_PROJECT_REF` as a variable, and a `production` one holding
`SUPABASE_PRODUCTION_DB_PASSWORD` as a secret and
`SUPABASE_PRODUCTION_PROJECT_REF` + `SUPABASE_PRODUCTION_POOLER_HOST` as
variables — see the workflow file's comment for exactly where each value
comes from in the Supabase dashboard. If an Environment isn't set up yet,
fall back to pasting each unapplied file into that project's Supabase SQL
Editor by hand, in filename order.

### Setting up the production Supabase project for the first time

1. Create a new Supabase project (free tier) for production — separate from
   the staging one. Its schema starts empty; don't run anything by hand yet
   — step 6 applies every migration to it via the same `db push` the
   workflow uses for staging, so it's tracked in the CLI's migration
   history table from the very first migration onward (no
   `migration repair` step needed, unlike staging — see the workflow
   file's comment on `push-production`).
2. Project Settings → Database → Connection pooling: copy the pooler host
   (e.g. `aws-0-us-east-1.pooler.supabase.com`) and the database password
   you set when creating the project.
3. Project Settings → API: copy the Project URL, `anon public` key, and
   `service_role` key. In the same Data API settings, turn off
   "Automatically expose new tables" — staging has this off deliberately
   (see the Conventions section below); leaving it on for production would
   make the two environments behave differently for every future table.
4. GitHub → repo Settings → Environments → New environment, named
   `production`, restricted to deploys from `main`. Add
   `SUPABASE_PRODUCTION_DB_PASSWORD` as a secret, and
   `SUPABASE_PRODUCTION_PROJECT_REF` + `SUPABASE_PRODUCTION_POOLER_HOST` as
   variables.
5. Vercel → the production deployment's environment variables (Production
   environment only, not Preview): set `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to this
   new project's values — never the staging project's.
6. Merge this repo's `develop → main` (or re-run
   "Deploy database migrations" via Actions → workflow_dispatch once the
   Environment above exists) to apply every migration to the new project
   in one go.

Steps 1-5 need this project's own dashboard/account access, so they're not
something this repo's automation can do on its own.

## Conventions

- One file per change, timestamp-prefixed by the CLI:
  `<YYYYMMDDHHMMSS>_name.sql` (`supabase migration new <name>` generates
  this for you).
- Every new table enables RLS and adds its policies in the *same* file that
  creates it — never a follow-up migration. A table without RLS is a data
  breach, not a TODO.
- **Every new table also needs explicit `grant` statements in that same
  file** — `select`/`insert`/etc to `anon` for whatever the RLS policies
  allow, and full CRUD to `service_role` for `/admin`. This project has
  "Automatically expose new tables" disabled in Data API settings (a
  deliberate choice, for manual control), which is also what runs
  Supabase's default grants for a new table — with it off, a table with
  RLS policies but no explicit grant fails every direct query with
  "permission denied for table X", not an RLS-policy error. See
  `20260913010000_grant_table_privileges.sql` for the fix this needed
  after the fact, and use it as the template going forward. SECURITY
  DEFINER functions (`registration_count`, `claimed_dishes`, etc.) are
  unaffected — they run as their owner, not the caller.
- Public tables (`events`, `announcements`, `gallery_items`) get a public
  `select` policy and nothing else; writes go through `/admin` using the
  service role key.
- `food_registrations` gets a public `insert` policy — no public `select`,
  since it holds PII (name + phone). `registrations` (Pooja) has no public
  insert policy at all; writes go exclusively through the
  `register_for_event()` RPC (see
  `20260913000000_pooja_slot_waitlist.sql`).
