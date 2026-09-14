-- 0003_food_registrations.sql
-- Adds food-potluck sign-ups: a contact person volunteers to bring a dish so
-- the committee has a headcount and other volunteers can see what's already
-- spoken for before picking their own.
--
-- Pooja registration needs no new schema — it's already the existing
-- `events` + `registrations` table from 0001_init.sql (name, phone, count),
-- just used per-event. This migration is scoped to the one genuinely new
-- need: showing which dishes are claimed without exposing who's bringing
-- them. Same security model as 0001/0002 (see their comments): the browser
-- talks to Supabase directly, so RLS is the entire boundary, and
-- contact_name + phone are PII that must never be publicly selectable.

create table food_registrations (
  id uuid primary key default gen_random_uuid(),
  contact_name text not null,
  phone text not null,
  dish_name text not null,
  created_at timestamptz not null default now()
);

alter table food_registrations enable row level security;

-- Anyone can sign up to bring a dish; nobody (besides the service role) can
-- read the list back — it contains the contact's name and phone number.
create policy "anyone can sign up to bring a dish"
  on food_registrations for insert
  to anon
  with check (true);

-- claimed_dishes(): lets anon clients see what's already been claimed
-- (dish_name only, no contact info) without a public SELECT policy on the
-- table. Same SECURITY DEFINER pattern as registration_count() in
-- 0002_registration_count_broadcast.sql.
create or replace function public.claimed_dishes()
returns table (dish_name text)
language sql
security definer
set search_path = public
stable
as $$
  select f.dish_name
  from public.food_registrations f
  order by f.created_at asc;
$$;

revoke all on function public.claimed_dishes() from public;
grant execute on function public.claimed_dishes() to anon;

-- Broadcast-from-Database (not postgres_changes, for the same reason as
-- 0002 — anon has no SELECT grant to filter through) so the claimed-dishes
-- list updates live for anyone already on the food registration page when
-- someone else signs up. Payload is just the new dish name — no PII.
create or replace function public.broadcast_claimed_dish()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform realtime.send(
    jsonb_build_object('dish_name', new.dish_name),
    'dish_claimed',                 -- broadcast event name
    'food_registrations:dishes',    -- single shared topic; payload has no PII
    false                            -- public topic
  );

  return new;
end;
$$;

create trigger food_registrations_broadcast_dish
  after insert on public.food_registrations
  for each row
  execute function public.broadcast_claimed_dish();
