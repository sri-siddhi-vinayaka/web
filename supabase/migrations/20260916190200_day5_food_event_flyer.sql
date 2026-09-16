-- 20260916190200_day5_food_event_flyer.sql
-- Attaches the food event flyer to Day 5 (Anna Prasadam / Food Event). The
-- flyer already carries the event's details, so this leaves the existing
-- description (set by 20260916041947_day5_nivedana_description.sql) as-is
-- rather than clearing it — that text is about the Nivedana preceding the
-- food festival, not a restatement of what the flyer shows, so both are
-- still worth showing together. Matched by day_number, not id, same
-- reasoning as every other single-day content migration in this directory.
update events
set flyer_url = '/flyers/food-event.jpeg'
where day_number = 5;
