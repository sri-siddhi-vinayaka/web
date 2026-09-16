-- 20260916200700_day6_restore_childrens_pooja_description.sql
-- Restores Day 6's "performed by our children" description, now under its
-- new Vidya Ganapathi Pooja name — 20260916190100_day6_vidya_ganapathi_pooja.sql
-- cleared it on the assumption the flyer alone was enough, but per
-- committee request it should sit alongside the flyer, same as Day 5's
-- Nivedana description sits alongside its own flyer. Matched by day_number,
-- not id, same reasoning as every other single-day content migration in
-- this directory.
update events
set description = 'Performed entirely by our children, guided by the priest. Bring your kids along to take part and be a part of this special celebration.'
where day_number = 6;
