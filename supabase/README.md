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
