# infra

Versioned SQL migrations for the Supabase Postgres schema. No ORM — plain
`.sql` files applied in order.

## Applying a migration

1. Open the target Supabase project's SQL Editor (staging first, always).
2. Paste the contents of the next unapplied `migrations/000N_*.sql` file and run it.
3. Confirm on staging before applying the same file to the production project.

Staging and production are separate Supabase projects (see AGENTS.md /
workflow docs) — a migration only "counts" as applied once it has run
against both.

## Conventions

- One file per change, numbered sequentially: `0001_init.sql`, `0002_*.sql`, ...
- Every new table enables RLS and adds its policies in the *same* file that
  creates it — never a follow-up migration. A table without RLS is a data
  breach, not a TODO.
- Public tables (`events`, `announcements`, `gallery_items`) get a public
  `select` policy and nothing else; writes go through a server-side Route
  Handler using the service role key.
- `registrations` gets a public `insert` policy only — no public `select`,
  since that table holds every registrant's name and phone number.
