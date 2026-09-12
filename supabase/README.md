# supabase

Versioned SQL migrations for the Supabase Postgres schema. No ORM — plain
`.sql` files, applied in order by the Supabase CLI.

## Applying a migration

Pushing to `develop` with new files under `supabase/migrations/` triggers
`.github/workflows/deploy-migrations.yml`, which runs `supabase db push`
against the staging project automatically — no manual SQL Editor step.

Production isn't wired up yet (see the workflow file's comment for how to
add it once a production Supabase project exists) — until then, apply a
migration to production manually via its SQL Editor when promoting a
`develop → main` release, the same way this repo did before automation
existed.

Requires a `staging` GitHub Environment (Settings → Environments) holding
`SUPABASE_ACCESS_TOKEN` + `SUPABASE_STAGING_DB_PASSWORD` as secrets and
`SUPABASE_STAGING_PROJECT_REF` as a variable — see the workflow file's
comment. If that isn't set up yet, fall back to pasting each unapplied file
into the Supabase SQL Editor by hand, in filename order.

## Conventions

- One file per change, timestamp-prefixed by the CLI:
  `<YYYYMMDDHHMMSS>_name.sql` (`supabase migration new <name>` generates
  this for you).
- Every new table enables RLS and adds its policies in the *same* file that
  creates it — never a follow-up migration. A table without RLS is a data
  breach, not a TODO.
- Public tables (`events`, `announcements`, `gallery_items`) get a public
  `select` policy and nothing else; writes go through a server-side Route
  Handler using the service role key.
- `registrations` and `food_registrations` get a public `insert` policy
  only — no public `select`, since those tables hold PII (name + phone).
