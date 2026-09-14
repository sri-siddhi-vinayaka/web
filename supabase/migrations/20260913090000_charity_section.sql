-- 20260913090000_charity_section.sql
-- Storage + schema for the Charity section: year-by-year storytelling about
-- the association's charitable work (what help was provided, to whom),
-- alongside private photos/videos of it. Requested to be "privately
-- stored, visible only for viewing" — unlike gallery_items (public bucket,
-- plain public URL), this bucket is private and every read goes through a
-- short-lived signed URL minted server-side with the service role key (see
-- lib/charity.ts). Uploads are also never public: the admin panel gets a
-- one-time signed *upload* URL from a Server Action and the browser PUTs
-- bytes straight to Supabase Storage, bypassing our own server (and its
-- request-size limits) too.
--
-- No anon policy at all, on either table or the bucket — every access path
-- (read, upload, delete) goes through the service role, which bypasses
-- RLS/storage policies entirely, so none are needed for that access to
-- work. This is the most locked-down section of the schema: deliberately
-- not even a claimed_dishes()-style SECURITY DEFINER RPC, since unlike a
-- dish name, nothing about this table is meant to be public — the
-- *rendered* story text and signed media URLs the /charity page returns
-- are the only things that ever reach the browser.

insert into storage.buckets (id, name, public)
values ('charity', 'charity', false);

-- One row per year's narrative — what kind of help was provided, to whom.
-- `year` is the primary key rather than a separate `id`: there's only ever
-- one story per year, an upsert-by-year is exactly what the admin form
-- does, and it's the natural join key for charity_media below.
create table charity_years (
  year integer primary key,
  story text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- `year` is a plain column, not a foreign key into charity_years — the
-- admin should be free to upload this year's photos before finishing that
-- year's write-up, or vice versa, without an insert-order dependency
-- between the two forms. app/charity/page.tsx unions whichever years exist
-- in either table.
create table charity_media (
  id uuid primary key default gen_random_uuid(),
  year integer not null,
  storage_path text not null unique,
  media_type text not null check (media_type in ('image', 'video')),
  caption text,
  created_at timestamptz not null default now()
);

alter table charity_years enable row level security;
alter table charity_media enable row level security;

-- Explicit grants per this project's convention (see supabase/README.md) —
-- "Automatically expose new tables" is off, so even service_role needs a
-- grant here despite RLS having no policies for it to bypass.
grant select, insert, update, delete on public.charity_years to service_role;
grant select, insert, update, delete on public.charity_media to service_role;
