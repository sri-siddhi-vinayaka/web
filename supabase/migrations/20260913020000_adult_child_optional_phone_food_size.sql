-- 20260913020000_adult_child_optional_phone_food_size.sql
-- Feedback after the first real end-to-end test, in two rounds (this file
-- was rewritten in place before ever being applied anywhere, so it reflects
-- the final intent rather than the round-1 draft):
--
-- - Phone becomes optional on Food registration (still admin-only either
--   way — just no longer required to sign up). Pooja registration keeps
--   phone required — the committee wants it mandatory there specifically.
-- - Pooja headcount splits into adult_count / child_count instead of one
--   attendee_count, and the public "who's secured this day" table now
--   shows that breakdown (registered_details replaces registered_names).
-- - Pooja registration no longer auto-confirms anyone. Every sign-up lands
--   as 'pending'; admin reviews and manually moves each one to 'confirmed'
--   or 'waitlisted' (see 20260913000000_pooja_slot_waitlist.sql for where
--   those two statuses first came from — the auto-assigned 2-per-day cap
--   introduced there is what this migration removes). Removes the
--   now-unused advisory-lock/count-then-decide logic and
--   waitlisted_count() along with it.
-- - Food sign-ups no longer ask for a rough quantity/size — the committee
--   felt it read as a requirement rather than a rough estimate, and didn't
--   want to add that pressure. Duplicate dishes are still fine on purpose.

-- registrations: adult/child split, pending by default ---------------------
-- Phone stays required here (unlike food_registrations below) — the
-- committee wants it mandatory for Pooja sign-ups specifically.

alter table registrations add column adult_count int not null default 1 check (adult_count >= 0);
alter table registrations add column child_count int not null default 0 check (child_count >= 0);

update registrations set adult_count = attendee_count where attendee_count is not null;

alter table registrations drop column attendee_count;

alter table registrations add constraint registrations_at_least_one_person
  check (adult_count + child_count >= 1);

alter table registrations alter column status set default 'pending';
alter table registrations drop constraint if exists registrations_status_check;
alter table registrations add constraint registrations_status_check
  check (status in ('pending', 'confirmed', 'waitlisted'));

-- register_for_event()'s signature changes (adult/child instead of one
-- count) — not just a body edit, so the old signature must be dropped
-- explicitly first. No longer decides confirmed vs. waitlisted itself (no
-- advisory lock needed either, with nothing left to race over) — every
-- sign-up is 'pending' until admin reviews it.
drop function if exists public.register_for_event(uuid, text, text, int);

create or replace function public.register_for_event(
  p_event_id uuid,
  p_name text,
  p_phone text,
  p_adult_count int,
  p_child_count int
)
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into registrations (event_id, name, phone, adult_count, child_count, status)
  values (p_event_id, p_name, p_phone, p_adult_count, p_child_count, 'pending');

  return 'pending';
end;
$$;

revoke all on function public.register_for_event(uuid, text, text, int, int) from public;
grant execute on function public.register_for_event(uuid, text, text, int, int) to anon;

create or replace function public.registration_count(p_event_id uuid)
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(sum(adult_count + child_count), 0)::integer
  from public.registrations
  where event_id = p_event_id and status = 'confirmed';
$$;

-- registered_names() replaced by registered_details(), which also returns
-- the adult/child breakdown for the public results table. Still confirmed
-- rows only — pending and waitlisted haven't secured anything.
drop function if exists public.registered_names(uuid);

create or replace function public.registered_details(p_event_id uuid)
returns table (name text, adult_count int, child_count int)
language sql
security definer
set search_path = public
stable
as $$
  select r.name, r.adult_count, r.child_count
  from public.registrations r
  where r.event_id = p_event_id and r.status = 'confirmed'
  order by r.created_at asc;
$$;

revoke all on function public.registered_details(uuid) from public;
grant execute on function public.registered_details(uuid) to anon;

-- No more waitlisted_count() — it existed to show "+N waitlisted" next to
-- an enforced 2-per-day cap, which no longer exists now that admin decides
-- capacity manually rather than the system auto-assigning it.

-- The INSERT broadcast is mostly a no-op now (a fresh sign-up is always
-- 'pending', so the confirmed sum it recomputes hasn't changed) but stays
-- harmless and simple. The real live-update path is now the UPDATE
-- trigger below, for when admin actually confirms someone — that's the
-- moment the public "already secured by" table and count should update.
create or replace function public.broadcast_registration_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  select coalesce(sum(adult_count + child_count), 0) into v_count
  from public.registrations
  where event_id = new.event_id and status = 'confirmed';

  perform realtime.send(
    jsonb_build_object('event_id', new.event_id, 'count', v_count),
    'count',
    'registrations:' || new.event_id::text,
    false
  );

  return new;
end;
$$;

create or replace function public.broadcast_registration_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  if new.status is distinct from old.status then
    select coalesce(sum(adult_count + child_count), 0) into v_count
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
        jsonb_build_object('name', new.name, 'adult_count', new.adult_count, 'child_count', new.child_count),
        'registered',
        'registrations:' || new.event_id::text,
        false
      );
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists registrations_broadcast_status_change on registrations;
create trigger registrations_broadcast_status_change
  after update on registrations
  for each row
  execute function public.broadcast_registration_status_change();

-- food_registrations: optional phone, no size field --------------------------

alter table food_registrations alter column phone drop not null;
