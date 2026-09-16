-- 20260916041947_day5_nivedana_description.sql
-- Rewrites Day 5's description to reflect that its Pooja is a brief
-- Nivedana offering to Lord Ganesha ahead of Anna Prasadam (the food
-- festival), not a standalone ritual — companion to the app-side change in
-- the same PR that adds day_number 5 to ADMIN_RUN_POOJA_DAY_NUMBERS
-- (lib/config.ts), removing its public Pooja Registration option the same
-- way Day 7's Ganapati Homam was removed in
-- 7afabb3c71c4c433c672ad32559f8b61e2fa7c2e. Matched by day_number, not id,
-- same reasoning as 20260915191845_rename_anna_danam_to_anna_prasadam.sql
-- (which last touched this same row).
update events
set description = '6:00 PM - 10:00 PM. A brief Nivedana is offered to Lord Ganesha before Anna Prasadam — our food festival, celebrated together by everyone — begins.'
where day_number = 5;
