-- 20260916190100_day6_vidya_ganapathi_pooja.sql
-- Renames Day 6 (Sat, Sept 19) from Bala Saraswati Puja to Vidya Ganapathi
-- Pooja, per committee request, and attaches its flyer. The flyer image
-- already carries the event's details, so unlike
-- 20260915215028_day6_bala_saraswati_puja.sql (which this supersedes) this
-- doesn't add its own description text — see the schedule page and home
-- page "Today's highlights" rendering, which show the flyer in place of a
-- written description whenever flyer_url is set. Matched by day_number, not
-- id, same reasoning as every other single-day content migration in this
-- directory — no separate festival-days table to reference instead, and
-- day_number still maps to exactly one event row today.
update events
set title = 'Vidya Ganapathi Pooja',
    description = '',
    flyer_url = '/flyers/vidya-ganapathi-pooja.jpeg'
where day_number = 6;
