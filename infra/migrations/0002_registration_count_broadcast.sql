-- 0002_registration_count_broadcast.sql
-- Lets anon clients see a live registration count per event without ever
-- granting SELECT on `registrations` (which holds name + phone number).
--
-- A naive `postgres_changes` Realtime subscription won't work here: Realtime
-- filters delivered row events through the subscribing role's SELECT RLS
-- policy, and there deliberately is none for anon on `registrations`. So:
--
--   1. registration_count(): a SECURITY DEFINER function that returns only
--      the aggregate count for one event — used for the initial page-load
--      value, and as a fallback if a broadcast below is ever missed.
--   2. an AFTER INSERT trigger that pushes the fresh count over Supabase
--      Realtime's Broadcast-from-Database (`realtime.send`) to a per-event
--      topic, so a client-side Broadcast channel subscription (NOT
--      postgres_changes) gets live updates. The payload is just an event id
--      and a count — no PII ever leaves the database this way.

create or replace function public.registration_count(p_event_id uuid)
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::integer
  from public.registrations
  where event_id = p_event_id;
$$;

revoke all on function public.registration_count(uuid) from public;
grant execute on function public.registration_count(uuid) to anon;

create or replace function public.broadcast_registration_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  select count(*) into v_count
  from public.registrations
  where event_id = new.event_id;

  perform realtime.send(
    jsonb_build_object('event_id', new.event_id, 'count', v_count),
    'count',                                  -- broadcast event name
    'registrations:' || new.event_id::text,   -- topic, one per event
    false                                      -- public topic; payload has no PII
  );

  return new;
end;
$$;

create trigger registrations_broadcast_count
  after insert on public.registrations
  for each row
  execute function public.broadcast_registration_count();
