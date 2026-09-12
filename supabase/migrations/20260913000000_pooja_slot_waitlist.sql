-- 20260913000000_pooja_slot_waitlist.sql
-- Caps Pooja registration at 2 confirmed sign-ups per day; the 3rd sign-up
-- onward is automatically waitlisted. Admin can manually move someone
-- between confirmed/waitlisted (e.g. when a confirmed group drops) — no
-- auto-promotion, since there's no cancellation flow to trigger it from.
--
-- Food registration is untouched — there's no capacity limit on how many
-- dishes people can bring, only the existing duplicate-dish visibility.
--
-- Why this can't be decided in application code: the anon key has no
-- SELECT on registrations, so the app can't count "how many are already
-- confirmed" before deciding. Even if it could, two people submitting at
-- the same instant would both see "1 confirmed so far" and both get
-- waved through — a classic check-then-act race. So the whole
-- count-then-decide-then-insert sequence has to be one atomic operation
-- in the database, guarded by a per-event advisory lock that serializes
-- concurrent sign-ups for the same day.

alter table registrations add column status text not null default 'confirmed'
  check (status in ('confirmed', 'waitlisted'));

-- Replaces the direct "anyone can register for an event" INSERT policy —
-- writes now go exclusively through register_for_event() below, which
-- decides and returns the assigned status atomically. A raw INSERT policy
-- would let a caller bypass the cap entirely by writing status='confirmed'
-- straight into the table.
drop policy "anyone can register for an event" on registrations;

create or replace function public.register_for_event(
  p_event_id uuid,
  p_name text,
  p_phone text,
  p_attendee_count int
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_confirmed_count integer;
  v_status text;
begin
  -- Serializes concurrent sign-ups for this one event_id so the count-then-
  -- decide-then-insert below is effectively atomic; released automatically
  -- at transaction end.
  perform pg_advisory_xact_lock(hashtext(p_event_id::text));

  select count(*) into v_confirmed_count
  from registrations
  where event_id = p_event_id and status = 'confirmed';

  v_status := case when v_confirmed_count < 2 then 'confirmed' else 'waitlisted' end;

  insert into registrations (event_id, name, phone, attendee_count, status)
  values (p_event_id, p_name, p_phone, p_attendee_count, v_status);

  return v_status;
end;
$$;

revoke all on function public.register_for_event(uuid, text, text, int) from public;
grant execute on function public.register_for_event(uuid, text, text, int) to anon;

-- registration_count() and registered_names() now only reflect confirmed
-- sign-ups — a waitlisted registration hasn't secured anything, so it
-- shouldn't count toward the public headcount or appear as "already
-- secured."

create or replace function public.registration_count(p_event_id uuid)
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(sum(attendee_count), 0)::integer
  from public.registrations
  where event_id = p_event_id and status = 'confirmed';
$$;

create or replace function public.registered_names(p_event_id uuid)
returns table (name text)
language sql
security definer
set search_path = public
stable
as $$
  select r.name
  from public.registrations r
  where r.event_id = p_event_id and r.status = 'confirmed'
  order by r.created_at asc;
$$;

-- The broadcast trigger fires on every insert regardless of how the row
-- got there (via register_for_event() or, for admin tooling, a direct
-- insert with the service role) — update it to match the confirmed-only
-- filter above, and only broadcast the "registered" name event when the
-- new row is actually confirmed.
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
  where event_id = new.event_id and status = 'confirmed';

  perform realtime.send(
    jsonb_build_object('event_id', new.event_id, 'count', v_count),
    'count',
    'registrations:' || new.event_id::text,
    false
  );

  if new.status = 'confirmed' then
    perform realtime.send(
      jsonb_build_object('name', new.name),
      'registered',
      'registrations:' || new.event_id::text,
      false
    );
  end if;

  return new;
end;
$$;
