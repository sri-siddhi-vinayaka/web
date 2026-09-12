-- 20260913010000_grant_table_privileges.sql
-- Fixes "permission denied for table X" on every direct table operation.
--
-- Root cause: this project's Data API setting "Automatically expose new
-- tables" is deliberately disabled (chosen when the project was created,
-- to control access manually) — but that same setting is what runs
-- Supabase's default GRANT statements for anon/service_role on every new
-- table. With it off, every table created since (every table in every
-- migration so far) never actually got those baseline grants. RLS
-- policies were correctly restricting access to a privilege that was
-- never granted in the first place — RLS filters what a grant allows, it
-- doesn't substitute for one.
--
-- SECURITY DEFINER functions (registration_count, claimed_dishes,
-- registered_names, register_for_event) were never affected by this —
-- they execute as their owner, not the caller. Only direct table access
-- (every public SELECT on events/announcements/gallery_items, Food
-- registration's direct insert, and everything /admin does via the
-- service role) was broken.
--
-- Convention going forward: since auto-expose stays off, any future
-- migration that creates a table must include its own explicit grants
-- here-style — see supabase/README.md.

grant select on public.events, public.announcements, public.gallery_items to anon;
grant insert on public.food_registrations to anon;

grant select, insert, update, delete on
  public.events,
  public.announcements,
  public.gallery_items,
  public.registrations,
  public.food_registrations
to service_role;
