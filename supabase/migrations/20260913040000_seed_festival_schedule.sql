-- 20260913040000_seed_festival_schedule.sql
--
-- Content unchanged below — this comment only exists to touch the file so
-- the deploy-migrations.yml path filter (supabase/migrations/**) fires
-- again and re-applies this migration now that PR #24 lets CI push an
-- out-of-order file. Its first attempt failed with "Found local migration
-- files to be inserted before the last migration on remote database"
-- because the suggestion box migration (a later timestamp) had already
-- been applied first.
--
-- Seeds the 12-day festival schedule (Sept 14 - Sept 25, matching
-- FESTIVAL_START/FESTIVAL_END in lib/config.ts) so the schedule and both
-- registration pages have real data in time for launch, instead of relying
-- on admin to hand-enter every day through the /admin "Add Event" form
-- before go-live.
--
-- Four days carry the festival's named rituals; the rest are a regular
-- evening Ganapati Pooja at 6:30 PM. "Ganapati Pooja" is a generic
-- placeholder title for those regular days — the committee may run
-- different styles of pooja on different days, but no per-day naming was
-- specified, so this seed doesn't guess at ritual names. Admin can rename
-- any of these afterward via the existing Edit Event form; no code change
-- needed for that.
--
-- Day 1 (Sept 14) and Day 12 (Sept 25) are intentionally not open for
-- public registration — see the app-side change in the same PR that
-- excludes the structurally-first and -last day_number from both
-- registration pages and from the schedule page's registration buttons.
-- That's enforced in application code, not here: this migration only seeds
-- the event rows themselves.
insert into events (title, day_number, start_time, description) values
  ('Ganesh Sthapana, Vrata Kalpana & Katha', 1, '2026-09-14T19:30:00-04:00', '7:30 PM - 10:00 PM'),
  ('Ganapati Pooja', 2, '2026-09-15T18:30:00-04:00', ''),
  ('Ganapati Pooja', 3, '2026-09-16T18:30:00-04:00', ''),
  ('Ganapati Pooja', 4, '2026-09-17T18:30:00-04:00', ''),
  ('Anna Danam (Food Festival)', 5, '2026-09-18T19:30:00-04:00', '7:30 PM - 10:00 PM'),
  ('Ganapati Pooja', 6, '2026-09-19T18:30:00-04:00', ''),
  ('Ganapati Homam', 7, '2026-09-20T09:00:00-04:00', '9:00 AM - 12:00 PM'),
  ('Ganapati Pooja', 8, '2026-09-21T18:30:00-04:00', ''),
  ('Ganapati Pooja', 9, '2026-09-22T18:30:00-04:00', ''),
  ('Ganapati Pooja', 10, '2026-09-23T18:30:00-04:00', ''),
  ('Ganapati Pooja', 11, '2026-09-24T18:30:00-04:00', ''),
  ('Last Ganapati Pooja & Ladoo Celebration', 12, '2026-09-25T18:00:00-04:00', '6:00 PM - 9:00 PM');
