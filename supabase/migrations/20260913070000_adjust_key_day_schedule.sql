-- 20260913070000_adjust_key_day_schedule.sql
-- Refinements to three of the four key days seeded in
-- 20260913040000_seed_festival_schedule.sql, requested after reviewing the
-- schedule on staging:
--
-- Day 1 (Ganesh Sthapana) moves to 8:00 PM (from 7:30 PM) and gets an
-- opening-ceremony note. Day 5 (Anna Danam) is retitled to reflect that the
-- pooja comes first, moves its start to 6:00 PM (from 7:30 PM), and gets a
-- note explaining the order of the evening. Day 12 (the final pooja) keeps
-- its time but gets a closing-ceremony note.
--
-- Matched by day_number, not id, since these rows already exist from the
-- previous migration and this repo has no separate festival-days table to
-- reference instead. Safe while each day_number still maps to exactly one
-- event row — true today, and worth re-checking if a second event (e.g. a
-- fun-event entry) is ever added to one of these same three days.
update events
set start_time = '2026-09-14T20:00:00-04:00',
    description = '8:00 PM - 10:00 PM. People are welcome to join together and enjoy the inaugural event — let''s celebrate the opening ceremony together.'
where day_number = 1;

update events
set title = 'Ganapati Pooja & Anna Danam',
    start_time = '2026-09-18T18:00:00-04:00',
    description = '6:00 PM - 10:00 PM. Ganapati Pooja opens the evening, followed by Anna Danam — our food festival, celebrated together by everyone.'
where day_number = 5;

update events
set description = '6:00 PM - 9:00 PM. Come together to enjoy the last festival day and the closing ceremony of the festival.'
where day_number = 12;
