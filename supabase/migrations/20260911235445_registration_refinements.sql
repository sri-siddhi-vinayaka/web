-- 0004_registration_refinements.sql
-- Two refinements based on early feedback on the /admin view:
--
-- 1. Pooja registration: drop `gotra` (informed in person instead, not
--    worth collecting here) and replace one-row-per-person with an explicit
--    `attendee_count` headcount per registration. registration_count() and
--    its broadcast trigger switch from counting rows to summing the count.
--
-- 2. Food registration: tie each sign-up to a specific festival day
--    (`event_id`, same `events` table Pooja registration uses). Without
--    this, claimed_dishes() would treat the whole 10-day festival as one
--    pool of dishes, when the actual goal (per the original ask) is
--    avoiding duplicate dishes on the same day. claimed_dishes() and its
--    broadcast now take/scope by event_id, mirroring registration_count().

-- registrations: drop gotra, add attendee_count ------------------------

alter table registrations drop column gotra;
alter table registrations add column attendee_count int not null default 1 check (attendee_count > 0);

create or replace function public.registration_count(p_event_id uuid)
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(sum(attendee_count), 0)::integer
  from public.registrations
  where event_id = p_event_id;
$$;

create or replace function public.broadcast_registration_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  select coalesce(sum(attendee_count), 0) into v_count
  from public.registrations
  where event_id = new.event_id;

  perform realtime.send(
    jsonb_build_object('event_id', new.event_id, 'count', v_count),
    'count',
    'registrations:' || new.event_id::text,
    false
  );

  return new;
end;
$$;

-- food_registrations: tie to a specific event/day -----------------------

alter table food_registrations add column event_id uuid not null references events (id) on delete cascade;

drop function if exists public.claimed_dishes();

create or replace function public.claimed_dishes(p_event_id uuid)
returns table (dish_name text)
language sql
security definer
set search_path = public
stable
as $$
  select f.dish_name
  from public.food_registrations f
  where f.event_id = p_event_id
  order by f.created_at asc;
$$;

revoke all on function public.claimed_dishes(uuid) from public;
grant execute on function public.claimed_dishes(uuid) to anon;

create or replace function public.broadcast_claimed_dish()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform realtime.send(
    jsonb_build_object('dish_name', new.dish_name),
    'dish_claimed',
    'food_registrations:' || new.event_id::text,
    false
  );

  return new;
end;
$$;
