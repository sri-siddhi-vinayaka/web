-- pooja-capacity-scenarios.sql
--
-- Manual-only test data for the pooja registration capacity display added
-- in feature/pooja-registration-capacity-status (schedule page +
-- /register/pooja — see getPoojaCapacity() in lib/events.ts).
--
-- NOT a migration. Deliberately lives outside supabase/migrations/ so
-- deploy-migrations.yml never picks it up and it can never run against
-- production by accident. Paste it into the STAGING project's SQL Editor
-- by hand whenever you want to re-test this feature; never run it against
-- production. Every name/phone below is fake.
--
-- Reseeds the three regular pooja days (day_number 2/3/4 — Tue/Wed/Thu in
-- the seeded 2026 schedule, see 20260913040000_seed_festival_schedule.sql)
-- to exercise all three capacity branches from getPoojaCapacity():
--   Day 2 -> 2 confirmed registrations, combined adults (4+3=7) > 6
--            -> closed via the slot-count branch
--   Day 3 -> 1 confirmed registration (2 adults)
--            -> open, "1 more registration spot available"
--   Day 4 -> 1 confirmed registration alone with 7 adults
--            -> closed via the adult-cap branch, even though only 1 of 2
--               slots is used — the edge case the slot-count check alone
--               would miss
-- Day 5 onward is left untouched (0 confirmed) as the "normal, open, no
-- badge" control case.

begin;

delete from registrations
where event_id in (select id from events where day_number in (2, 3, 4))
  and phone like '555-01%';

insert into registrations (event_id, name, phone, adult_count, child_count, status)
select id, 'Test Family A', '555-0100', 4, 1, 'confirmed' from events where day_number = 2
union all
select id, 'Test Family B', '555-0101', 3, 0, 'confirmed' from events where day_number = 2
union all
select id, 'Test Family C', '555-0102', 2, 2, 'confirmed' from events where day_number = 3
union all
select id, 'Test Family D', '555-0103', 7, 0, 'confirmed' from events where day_number = 4;

commit;

-- To clear this test data afterward (e.g. before handing staging back to
-- normal use), run:
--
--   delete from registrations where phone like '555-01%';
