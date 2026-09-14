-- 20260913050000_suggestions.sql
-- A lightweight suggestion box: anyone can leave feedback or an idea, admin
-- reviews it from /admin and can turn it into an announcement or a change
-- to the festival plan. Same security model as food_registrations/
-- registrations — public insert only, no public select, since a name or
-- contact volunteered here is still PII even though it's optional.
--
-- Explicit grants included per this project's convention (see
-- supabase/README.md): "Automatically expose new tables" is disabled, so a
-- table with RLS policies but no explicit grant fails every direct query
-- with "permission denied", not an RLS-policy error.

create table suggestions (
  id uuid primary key default gen_random_uuid(),
  message text not null check (char_length(message) between 1 and 2000),
  name text,
  contact text,
  created_at timestamptz not null default now()
);

alter table suggestions enable row level security;

-- Anyone can leave a suggestion; nobody (besides the service role) can
-- read the list back — name/contact, when given, are PII.
create policy "anyone can leave a suggestion"
  on suggestions for insert
  to anon
  with check (true);

grant insert on public.suggestions to anon;
grant select, insert, update, delete on public.suggestions to service_role;
