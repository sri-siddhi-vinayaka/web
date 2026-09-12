-- 20260913030000_push_subscriptions.sql
-- Stores browser Web Push subscriptions so admin can notify visitors when
-- something new ships (currently: a new announcement) without needing any
-- paid notification service — Web Push is a free browser-native protocol,
-- authenticated with a self-generated VAPID keypair rather than a
-- third-party account.
--
-- Public insert only, same posture as this project's other public-facing
-- tables — a subscription endpoint isn't quite PII, but there's no reason
-- to expose it either, and only the server (via the service role, sending
-- pushes) ever needs to read these rows.
--
-- Explicit grants included per this project's convention (documented in
-- supabase/README.md): "Automatically expose new tables" is disabled for
-- this project, so a table with RLS policies but no explicit grant fails
-- every direct query with "permission denied", not an RLS-policy error.

-- `endpoint` is attacker-reachable (public insert, arbitrary value) and
-- later used server-side to make an HTTP request to it when sending a
-- push — an unvalidated URL there is an SSRF vector (an internal address,
-- a cloud metadata endpoint, etc.). The https:// check here is defense in
-- depth; the real guard is the hostname allowlist in lib/webpush.ts,
-- checked again immediately before every send, since a DB check
-- constraint can't reasonably enumerate the exact set of push-service
-- hostnames.
create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique check (endpoint like 'https://%'),
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table push_subscriptions enable row level security;

create policy "anyone can subscribe to push notifications"
  on push_subscriptions for insert
  to anon
  with check (true);

grant insert on public.push_subscriptions to anon;
grant select, insert, update, delete on public.push_subscriptions to service_role;
