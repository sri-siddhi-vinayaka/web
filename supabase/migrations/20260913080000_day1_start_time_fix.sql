-- 20260913080000_day1_start_time_fix.sql
-- Correction: Day 1 (Ganesh Sthapana) starts at 7:45 PM, not the 8:00 PM
-- set in 20260913070000_adjust_key_day_schedule.sql. Matched by
-- day_number, same reasoning as that migration.
update events
set start_time = '2026-09-14T19:45:00-04:00',
    description = '7:45 PM - 10:00 PM. People are welcome to join together and enjoy the inaugural event — let''s celebrate the opening ceremony together.'
where day_number = 1;
