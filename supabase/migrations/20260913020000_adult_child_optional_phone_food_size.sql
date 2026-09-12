-- 20260913020000_adult_child_optional_phone_food_size.sql
-- Feedback round after the first real end-to-end test:
-- - Phone becomes optional on both registration tables (still admin-only
--   either way — just no longer required to sign up).
-- - Pooja headcount splits into adult_count / child_count instead of one
--   attendee_count, and the public "who's secured this day" table now
--   shows that breakdown (registered_details replaces registered_names).
-- - A new waitlisted_count(event_id) lets the public UI show "+N
--   waitlisted" without exposing who — aggregate only, same pattern as
--   registration_count/claimed_dishes.
-- - Food sign-ups add a rough quantity_size (no longer discouraging
--   duplicate dishes — multiple people bringing the same dish is fine,
--   this is just for headcount planning).

-- registrations: adult/child split, optional phone --------------------------

alter table registrations alter column phone drop not null;

alter table registrations add column adult_count int not null default 1 check (adult_count >= 0);
alter table registrations add column child_count int not null default 0 check (child_count >= 0);

update registrations set adult_count = attendee_count where attendee_count is not null;

alter table registrations drop column attendee_count;

alter table registrations add constraint registrations_at_least_one_person
  check (adult_count + child_count >= 1);

-- register_for_event()'s signature changes (adult/child instead of one
-- count) — not just a body edit, so the old signature must be dropped
-- explicitly first.
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
declare
  v_confirmed_count integer;
  v_status text;
begin
  perform pg_advisory_xact_lock(hashtext(p_event_id::text));

  select count(*) into v_confirmed_count
  from registrations
  where event_id = p_event_id and status = 'confirmed';

  v_status := case when v_confirmed_count < 2 then 'confirmed' else 'waitlisted' end;

  insert into registrations (event_id, name, phone, adult_count, child_count, status)
  values (p_event_id, p_name, p_phone, p_adult_count, p_child_count, v_status);

  return v_status;
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
-- the adult/child breakdown for the public results table.
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

create or replace function public.waitlisted_count(p_event_id uuid)
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::integer
  from public.registrations
  where event_id = p_event_id and status = 'waitlisted';
$$;

revoke all on function public.waitlisted_count(uuid) from public;
grant execute on function public.waitlisted_count(uuid) to anon;

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

  if new.status = 'confirmed' then
    perform realtime.send(
      jsonb_build_object('name', new.name, 'adult_count', new.adult_count, 'child_count', new.child_count),
      'registered',
      'registrations:' || new.event_id::text,
      false
    );
  end if;

  return new;
end;
$$;

-- food_registrations: quantity size, optional phone --------------------------

alter table food_registrations alter column phone drop not null;

-- Default only exists to satisfy NOT NULL for the table's current rows (if
-- any); dropped immediately after so every new sign-up must choose a size
-- explicitly via the form.
alter table food_registrations add column quantity_size text not null default 'half_tray'
  check (quantity_size in ('family_pack', 'quarter_pack', 'half_tray', 'full_tray'));
alter table food_registrations alter column quantity_size drop default;

drop function if exists public.claimed_dishes(uuid);

create or replace function public.claimed_dishes(p_event_id uuid)
returns table (dish_name text, quantity_size text)
language sql
security definer
set search_path = public
stable
as $$
  select f.dish_name, f.quantity_size
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
    jsonb_build_object('dish_name', new.dish_name, 'quantity_size', new.quantity_size),
    'dish_claimed',
    'food_registrations:' || new.event_id::text,
    false
  );

  return new;
end;
$$;
