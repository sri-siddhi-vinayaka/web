-- 20260912000000_public_registered_names.sql
-- Makes the registrant's name (never phone) publicly visible per event, so
-- visitors can see who's already registered for a day — same idea as
-- claimed_dishes() for Food registration, and a deliberate, scoped
-- exception to registrations' "no public select" rule: the table itself
-- still has no public SELECT policy (phone numbers stay unreachable), this
-- just adds a SECURITY DEFINER function exposing the name column only.

create or replace function public.registered_names(p_event_id uuid)
returns table (name text)
language sql
security definer
set search_path = public
stable
as $$
  select r.name
  from public.registrations r
  where r.event_id = p_event_id
  order by r.created_at asc;
$$;

revoke all on function public.registered_names(uuid) from public;
grant execute on function public.registered_names(uuid) to anon;

-- Extends the existing count broadcast (see
-- 20260911022120_registration_count_broadcast.sql) with a second, separate
-- broadcast event carrying just the new registrant's name, so a page
-- showing the name list can update live too, the same way
-- food_registrations_broadcast_dish does for claimed dishes. Same topic as
-- the count broadcast ('registrations:<event_id>') — a different event name
-- ('registered' vs 'count') on one topic is fine, each listener filters by
-- event name.
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

  perform realtime.send(
    jsonb_build_object('name', new.name),
    'registered',
    'registrations:' || new.event_id::text,
    false
  );

  return new;
end;
$$;
