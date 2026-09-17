-- 20260917235300_day5_menu_rice_fixes.sql
-- Two content fixes to Day 5's menu (see
-- 20260917234100_day5_anna_prasadam_menu.sql): moves White Rice out of
-- Pickles & Chutneys + Ghee and into Rice Varieties, where it actually
-- belongs, and adds "Tamarind Rice" as a parenthetical alias on Pulihora so
-- visitors unfamiliar with the Telugu name still recognize the dish.
update events
set menu = 'Sweets: Badhushah, Burelu
Pickles & Chutneys + Ghee: Mango Pickle, Tomato Mirchi Roti Pachadi, Coconut Podi, Ghee
Snacks: Garelu, Fryums
Bread: Chapati
Curries: Dum Aloo Curry, Cashew Curry, Dondakaya/Tindora Fry
Rice Varieties: Veg Biryani, Veg Pulav, Pulihora (Tamarind Rice), White Rice
Dal: Pappu Dosakaya, Sambar
Yogurt & Raita: Yogurt, Raita
Beverages: Mango Lassi, Rose Milk'
where day_number = 5;
