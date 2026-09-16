-- 20260916205900_announcement_acknowledgements.sql
-- Adds a public "Got it" acknowledge count per announcement — a lightweight,
-- anonymous engagement signal for a $0-budget app with no user accounts
-- (see AGENTS.md's "Do not build" section on accounts/OTP login), not a
-- real per-person "who's read this" tally. One tap increments the shared
-- counter by 1; the client (components/AcknowledgeAnnouncement.tsx) dedupes
-- per-device via localStorage so a normal visitor can't inflate it by
-- re-tapping, though nothing stops someone from calling the RPC directly
-- outside the UI — same trust posture as every other public RPC in this
-- app (register_for_event, claimed_dishes, etc.), acceptable for a
-- volunteer community app, not a security boundary.
alter table announcements add column ack_count integer not null default 0;

create or replace function public.acknowledge_announcement(p_announcement_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  update announcements
  set ack_count = ack_count + 1
  where id = p_announcement_id
  returning ack_count into v_count;

  return v_count;
end;
$$;

revoke all on function public.acknowledge_announcement(uuid) from public;
grant execute on function public.acknowledge_announcement(uuid) to anon;
