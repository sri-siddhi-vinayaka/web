-- 20260917234100_day5_anna_prasadam_menu.sql
-- Adds an optional per-event menu, and sets Day 5's (Anna Prasadam) actual
-- course lineup. Stored as plain text, one course per line in
-- "Course name: item, item, item" form — parsed client-side by
-- components/EventMenuButton.tsx — rather than a separate menu_items table,
-- since this is committee-entered content edited rarely (same "plain text,
-- admin pastes it" posture as description/flyer_url), not something that
-- needs per-dish querying elsewhere.
--
-- Course names here are the plain category only — the parenthetical serving
-- notes from the committee's own list ("served first", "savored with white
-- rice", "final savory course", "served finally") describe serving order,
-- not the dish category itself, so they're left out of what's actually
-- displayed. The list order below preserves that same serving sequence.
alter table events add column menu text;

update events
set menu = 'Sweets: Badhushah, Burelu
Pickles & Chutneys + Ghee: Mango Pickle, Tomato Mirchi Roti Pachadi, Coconut Podi, Ghee, White Rice
Snacks: Garelu, Fryums
Bread: Chapati
Curries: Dum Aloo Curry, Cashew Curry, Dondakaya/Tindora Fry
Rice Varieties: Veg Biryani, Veg Pulav, Pulihora
Dal: Pappu Dosakaya, Sambar
Yogurt & Raita: Yogurt, Raita
Beverages: Mango Lassi, Rose Milk'
where day_number = 5;
