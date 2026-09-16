-- 20260916190000_add_event_flyer_url.sql
-- Adds an optional flyer image per event row. Flyers are static files
-- shipped in public/flyers/ (same pattern as GaneshaPhoto's /ganesh-2025.jpeg
-- — a committee-provided image, not a visitor upload, so it belongs in the
-- app bundle rather than Supabase Storage, keeping this $0-budget), so this
-- column is just a root-relative path (e.g. "/flyers/food-event.jpeg"), not
-- a Supabase Storage URL like gallery_items.image_url. No RLS change needed:
-- events already has a public select / admin-only write policy that covers
-- this new column the same as every other one on the table.
alter table events
  add column flyer_url text;
