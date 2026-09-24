-- 20260924203606_day12_grand_finale_flyer.sql
-- Attaches the Grand Finale flyer to Day 12 (Sept 25, the last festival
-- day) and updates its title/time/description to match. The flyer itemizes
-- Laddu Velam Pata (the ladoo auction, 5:30 PM), a second lucky draw,
-- Final Pooja, and Ganesh Nimarjan, so start_time moves from 6:00 PM to
-- 5:30 PM to match the flyer rather than leaving it inconsistent with the
-- image shown right below it. Unlike day6's flyer
-- (20260916190100_day6_vidya_ganapathi_pooja.sql), the description isn't
-- cleared — the flyer doesn't mention the charity video that plays before
-- the auction, so both are worth showing together, same reasoning as
-- day5's flyer (20260916190200_day5_food_event_flyer.sql). Matched by
-- day_number, not id, same reasoning as every other single-day content
-- migration in this directory.
update events
set title = 'Grand Finale & Ladoo Celebration',
    start_time = '2026-09-25T17:30:00-04:00',
    description = '5:30 PM - 8:00 PM. Grand Finale of our Ganesh Chaturthi celebration! Before the Laddu Velam Pata (ladoo auction) begins, we''ll share a look back at the charity work done this past year — all families are warmly invited to join in celebrating the service done for those who genuinely need it.',
    flyer_url = '/flyers/grand-finale-ladoo-auction.jpeg'
where day_number = 12;
