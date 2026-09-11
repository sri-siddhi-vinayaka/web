# Sri Siddhi Vinayaka App
## Technical Implementation Document
**Version 1.0 — For MVP Handoff to Dev/Agentic Tooling**

This document is the technical companion to the Product & Business Requirements Document. It defines exact stack, architecture, schema, and an ordered implementation task list. Written to be directly actionable by an AI coding assistant or developer picking up this repo cold.

---

## 1. Stack

| Layer | Choice |
|---|---|
| Frontend framework | Next.js 14, App Router, TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (Postgres) |
| Realtime | Supabase Realtime subscriptions |
| Media storage (photos) | Cloudflare R2 (Phase 2) — MVP can use Supabase Storage or static bundled images |
| Media (video) | YouTube/Facebook Live embeds (iframe) — never self-hosted |
| Hosting | Vercel (free tier) |
| CI/CD | GitHub Actions (free, unlimited on public repos) |

No custom backend server. The Next.js app talks to Supabase directly from client components using the Supabase JS client. Security is enforced entirely through Postgres Row Level Security (RLS) policies — see Section 4.

---

## 2. Repository Structure

```
web/
├── app/
│   ├── page.tsx                  # Home page
│   ├── schedule/page.tsx         # Event schedule
│   ├── register/page.tsx         # Registration form
│   ├── live/page.tsx             # Live darshan
│   ├── gallery/page.tsx          # Gallery
│   ├── contact/page.tsx          # Contact + announcements
│   ├── donate/page.tsx           # Donation contact info (static)
│   └── admin/page.tsx            # Password-gated admin view
├── components/
│   ├── Countdown.tsx             # Client component
│   ├── RegistrationForm.tsx      # Client component
│   ├── RegistrationCount.tsx     # Client component (Realtime)
│   ├── LiveEmbed.tsx
│   ├── EventCard.tsx
│   └── GalleryGrid.tsx
├── lib/
│   ├── supabaseClient.ts         # Supabase client init
│   ├── events.ts                 # Data-fetching functions (mock first, real later)
│   └── mockData.ts               # Placeholder data for pre-Supabase phase
├── types/
│   └── index.ts                  # Shared TS types (Event, Registration, etc.)
├── tailwind.config.ts
└── CLAUDE.md
```

---

## 3. Design Tokens (Tailwind)

```ts
// tailwind.config.ts theme.extend.colors
colors: {
  primary: '#D2691E',  // orange — buttons, highlights
  accent:  '#8B0000',  // maroon — headers, emphasis
  cream:   '#FDF6E3',  // background/card base
  gold:    '#DAA520',  // decorative accents
}
```

All components must reference these token names, never raw hex values.

---

## 4. Database Schema

Run this in the Supabase SQL editor for both staging and production projects.

```sql
-- Events
create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  day_number int not null,
  start_time timestamptz not null,
  description text,
  created_at timestamptz default now()
);

alter table events enable row level security;
create policy "Public read access" on events for select using (true);
-- No public insert/update/delete policy — only accessible via Supabase dashboard or service role for MVP.

-- Registrations
create table registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) not null,
  name text not null,
  phone text not null,
  gotra text,
  created_at timestamptz default now()
);

alter table registrations enable row level security;
create policy "Public insert access" on registrations for insert with check (true);
-- Deliberately NO public select/update/delete policy — only admin/service role can read registrations.

-- Announcements
create table announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  created_at timestamptz default now()
);

alter table announcements enable row level security;
create policy "Public read access" on announcements for select using (true);

-- Gallery items
create table gallery_items (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  year int default extract(year from now()),
  created_at timestamptz default now()
);

alter table gallery_items enable row level security;
create policy "Public read access" on gallery_items for select using (true);
```

**Enable Realtime**: In Supabase dashboard → Database → Replication, enable Realtime for the `registrations` table specifically (used to power live registration counts).

**Admin access note**: For MVP, admin reads (viewing registrations, writing announcements/gallery) happen via the Supabase dashboard directly, or through a password-gated `/admin` route that uses the Supabase **service role key** server-side (in a Next.js Server Action or Route Handler — never expose the service role key to the client). Do not build a public RLS policy allowing registration reads.

---

## 5. Data Contracts (TypeScript types)

```ts
// types/index.ts
export type EventItem = {
  id: string;
  title: string;
  day_number: number;
  start_time: string; // ISO timestamp
  description: string | null;
};

export type Registration = {
  id: string;
  event_id: string;
  name: string;
  phone: string;
  gotra: string | null;
  created_at: string;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  created_at: string;
};

export type GalleryItem = {
  id: string;
  image_url: string;
  caption: string | null;
  year: number;
};
```

---

## 6. Build Phasing (for the implementing LLM/developer)

### Phase A — Scaffold + Static UI (no Supabase connection yet)
1. `npx create-next-app@latest` with TypeScript, Tailwind, App Router.
2. Add `CLAUDE.md` (provided separately) and design tokens to `tailwind.config.ts`.
3. Create `lib/mockData.ts` with sample events, announcements, gallery items matching the types above.
4. Build all pages listed in Section 2 using mock data — no live data yet, no Supabase client calls.
5. Ensure full mobile responsiveness at this stage before moving on.
6. Commit and push to `develop`.

### Phase B — Connect Supabase (real data)
1. Create Supabase staging + prod projects; run the schema in Section 4 on both.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as env vars (Vercel + GitHub Actions secrets).
3. Implement `lib/supabaseClient.ts` and `lib/events.ts` — replace mock data calls with real Supabase queries, one page at a time (schedule page first, since it's simplest read-only case).
4. Implement `RegistrationForm.tsx` to insert into `registrations` via the public insert policy.
5. Implement `RegistrationCount.tsx` using a Supabase Realtime subscription on `registrations`, filtered by `event_id`.

### Phase C — Live Darshan, Gallery, Admin
1. `LiveEmbed.tsx` — simple iframe embed, URL configurable (env var or Supabase-stored value, association's choice).
2. `GalleryGrid.tsx` — pull from `gallery_items`, use Next.js `<Image>` for optimization.
3. `/admin` route — gate behind a shared password (env var `ADMIN_PASSWORD`, checked server-side in a Route Handler; do not do this check client-side only). Use the Supabase service role key server-side to fetch registrations for display.

### Phase D — Deployment & Ops
1. Connect Vercel to the repo; confirm preview deployments work on PRs against `develop`.
2. Add `.github/workflows/ci.yml` — lint + typecheck on every PR.
3. Add a scheduled GitHub Actions workflow (e.g. every 3 days) that makes a lightweight authenticated request to Supabase to prevent free-tier auto-pause.
4. Merge `develop` → `main` once verified; confirm production Vercel deployment picks up prod Supabase env vars.

---

## 7. Non-Negotiable Rules (carry into every implementation session)

- Every Supabase table must have RLS enabled at creation — no exceptions.
- No public read policy on `registrations` — only public insert.
- No authentication/login system, OTP, or session management of any kind.
- No payment gateway integration of any kind — donation info is static display only.
- No custom video file storage or transcoding — embeds only.
- Service role key must never be exposed to client-side code.

---

## 8. Environment Variables Reference

| Variable | Where used | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + server | Safe to expose publicly |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + server | Safe to expose publicly (RLS enforces access) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only (admin route) | Never expose to client bundle |
| `ADMIN_PASSWORD` | Server-only (admin route auth check) | Rotate periodically |

---

## 9. Definition of Done for MVP Handoff

- All pages in Section 2 implemented and connected to real Supabase data (Phase B/C complete).
- Mobile responsiveness verified on at least one real device, not just browser dev tools.
- CI passes on every PR; `main` only receives merges from `develop`.
- Supabase keep-alive workflow active and confirmed running.
- No item from Section 7's non-negotiable list has been violated anywhere in the codebase.
