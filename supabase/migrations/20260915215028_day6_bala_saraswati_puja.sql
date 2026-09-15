-- 20260915215028_day6_bala_saraswati_puja.sql
-- Names Day 6 (Sat, Sept 19) as Bala Saraswati Puja — a puja performed
-- entirely by the children themselves, guided by the priest — and adds a
-- short invitation encouraging families to bring their kids to take part.
-- Matched by day_number, not id, same reasoning as
-- 20260913070000_adjust_key_day_schedule.sql and
-- 20260915191845_rename_anna_danam_to_anna_prasadam.sql — this repo has no
-- separate festival-days table to reference instead, and day_number still
-- maps to exactly one event row today.
update events
set title = 'Bala Saraswati Puja',
    description = 'Performed entirely by our children, guided by the priest. Bring your kids along to take part and be a part of this special celebration.'
where day_number = 6;
