-- 0001_init.sql
-- Core schema for the Ganesh Chaturthi MVP: events, registrations,
-- announcements, gallery_items.
--
-- Security model: the browser talks to Supabase directly with the public
-- anon key, so RLS is the entire security boundary (see AGENTS.md). Every
-- table below enables RLS and grants only the public policy it actually
-- needs. There are no public write policies for events/announcements/
-- gallery_items and no public read/update/delete policy for registrations
-- — those operations are admin-only, performed server-side (Next.js Route
-- Handler) with the service role key, which bypasses RLS entirely. Never
-- widen these policies to make an admin feature easier to build client-side.

create extension if not exists "pgcrypto";

-- events ---------------------------------------------------------------

create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  day_number int not null,
  start_time timestamptz not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

alter table events enable row level security;

create policy "events are publicly readable"
  on events for select
  to anon
  using (true);

-- registrations ----------------------------------------------------------

create table registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events (id) on delete cascade,
  name text not null,
  phone text not null,
  gotra text,
  created_at timestamptz not null default now()
);

alter table registrations enable row level security;

-- Anyone can register; nobody (besides the service role) can read the
-- list back — it contains every registrant's name and phone number.
create policy "anyone can register for an event"
  on registrations for insert
  to anon
  with check (true);

-- announcements ----------------------------------------------------------

create table announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

alter table announcements enable row level security;

create policy "announcements are publicly readable"
  on announcements for select
  to anon
  using (true);

-- gallery_items ------------------------------------------------------------

create table gallery_items (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  year int not null default extract(year from now())::int,
  created_at timestamptz not null default now()
);

alter table gallery_items enable row level security;

create policy "gallery items are publicly readable"
  on gallery_items for select
  to anon
  using (true);

-- realtime -----------------------------------------------------------------

-- "X people registered" subscribes to inserts on this table client-side.
alter publication supabase_realtime add table registrations;
