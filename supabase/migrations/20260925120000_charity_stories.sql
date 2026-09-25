-- 20260925120000_charity_stories.sql
-- Charity section previously only had one free-text blurb per year
-- (charity_years.story). This adds room for several distinct, titled
-- stories under the same year — e.g. "Girls' Shelter in Kachiguda" and
-- "College Fees for 44 Students" as separate entries rather than one
-- paragraph mashing them together. charity_years.story is untouched and
-- still renders as the year's short intro line above these.
--
-- Same lockdown posture as the rest of the Charity section (see
-- 20260913090000_charity_section.sql's comment): no anon policies at all —
-- every read on /charity and /admin goes through supabaseAdmin
-- (service role) in lib/charity.ts, so RLS has nothing to allow.

create table charity_stories (
  id uuid primary key default gen_random_uuid(),
  year integer not null,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

alter table charity_stories enable row level security;

-- Explicit grant per this project's convention (see supabase/README.md) —
-- "Automatically expose new tables" is off, so even service_role needs
-- this despite RLS having no policies for it to bypass.
grant select, insert, update, delete on public.charity_stories to service_role;
