-- 20260915191845_rename_anna_danam_to_anna_prasadam.sql
-- Renames "Anna Danam" to "Anna Prasadam" throughout Day 5's event row, per
-- committee request, and adds a "(Food Event)" suffix to the title so it
-- reads clearly as the food festival alongside the pooja. Matched by
-- day_number, not id, same reasoning as
-- 20260913070000_adjust_key_day_schedule.sql (which last touched this same
-- row) — this repo has no separate festival-days table to reference
-- instead, and day_number still maps to exactly one event row today.
update events
set title = 'Ganapati Pooja & Anna Prasadam (Food Event)',
    description = '6:00 PM - 10:00 PM. Ganapati Pooja opens the evening, followed by Anna Prasadam — our food festival, celebrated together by everyone.'
where day_number = 5;
