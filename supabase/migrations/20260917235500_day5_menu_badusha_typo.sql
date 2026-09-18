-- 20260917235500_day5_menu_badusha_typo.sql
-- Fixes a spelling typo in Day 5's menu: "Badhushah" -> "Badusha", the
-- correct name for the sweet.
update events
set menu = 'Sweets: Badusha, Burelu
Pickles & Chutneys + Ghee: Mango Pickle, Tomato Mirchi Roti Pachadi, Coconut Podi, Ghee
Snacks: Garelu, Fryums
Bread: Chapati
Curries: Dum Aloo Curry, Cashew Curry, Dondakaya/Tindora Fry
Rice Varieties: Veg Biryani, Veg Pulav, Pulihora (Tamarind Rice), White Rice
Dal: Pappu Dosakaya, Sambar
Yogurt & Raita: Yogurt, Raita
Beverages: Mango Lassi, Rose Milk'
where day_number = 5;
