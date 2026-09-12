-- 20260913060000_charity_media.sql
-- Storage + schema for the Charity section: yearly photos/videos of the
-- association's charitable work, uploaded from the volunteer's personal
-- storage. Requested to be "privately stored, visible only for viewing" —
-- unlike gallery_items (public bucket, plain public URL), this bucket is
-- private and every read goes through a short-lived signed URL minted
-- server-side with the service role key (see lib/charity.ts). Uploads are
-- also never public: the admin panel gets a one-time signed *upload* URL
-- from a Server Action and the browser PUTs bytes straight to Supabase
-- Storage, bypassing our own server (and its request-size limits) too.
--
-- No anon policy at all, on either the bucket or the table — every access
-- path (read, upload, delete) goes through the service role, which
-- bypasses RLS/storage policies entirely, so none are needed for that
-- access to work. This is the most locked-down table in the schema:
-- deliberately not even a claimed_dishes()-style SECURITY DEFINER RPC,
-- since unlike a dish name, nothing about this table is meant to be
-- public — the *rendered* signed URLs the /charity page returns are the
-- only thing that ever reaches the browser.

insert into storage.buckets (id, name, public)
values ('charity', 'charity', false);

create table charity_media (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  media_type text not null check (media_type in ('image', 'video')),
  caption text,
  created_at timestamptz not null default now()
);

alter table charity_media enable row level security;

-- Explicit grant per this project's convention (see supabase/README.md) —
-- "Automatically expose new tables" is off, so even service_role needs a
-- grant here despite RLS having no policies for it to bypass.
grant select, insert, update, delete on public.charity_media to service_role;
