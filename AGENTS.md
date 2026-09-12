<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Sri Siddhi Vinayaka App

Mobile-first web app for the Ganesh Chaturthi celebration: schedule, pooja
registration, live darshan, gallery, announcements. Volunteer-maintained,
public repo, **$0 infrastructure budget** — that budget is a hard constraint,
not an aspiration. Never introduce a paid service, a always-on server, or a
dependency that needs one.

## Stack (verify before trusting the PRD)

The product doc specifies Next.js 14 + Tailwind v3. **The repo is not that.**
Installed today:

| | Version | Consequence |
|---|---|---|
| next | 16.3.0 | App Router; `params`/`searchParams` are Promises and must be awaited |
| react / react-dom | 19.2.8 | |
| tailwindcss | 4.x | **No `tailwind.config.js`.** Tokens live in `app/globals.css` under `@theme` |
| typescript | 5.x | `strict: true`; `@/*` maps to the repo root |

When the PRD and the installed version disagree, the installed version wins —
and say so in the PR rather than silently downgrading.

## Read before you write

Framework knowledge comes from the bundled docs, not from memory. Paths are
relative to `node_modules/next/dist/docs/`:

| Task | Read |
|---|---|
| Server vs Client boundary | `01-app/01-getting-started/05-server-and-client-components.md` |
| Registration form / writes | `01-app/01-getting-started/07-mutating-data.md`, `01-app/02-guides/forms.md` |
| Styling, Tailwind v4 | `01-app/01-getting-started/11-css.md` |
| Gallery images | `01-app/01-getting-started/12-images.md` |
| Page titles, OG images | `01-app/01-getting-started/14-metadata-and-og-images.md` |
| Route handlers (keep-alive ping) | `01-app/01-getting-started/15-route-handlers.md` |
| Env vars | `01-app/02-guides/environment-variables.md` |
| Not leaking secrets to the client | `01-app/02-guides/data-security.md` |
| Pre-launch check | `01-app/02-guides/production-checklist.md` |

## Server vs Client components

Default to Server Components. Add `"use client"` only for the leaf that
actually needs state, an event handler, or a browser API — then keep it small,
because everything it imports ships to the browser.

Client islands in this app, and nothing more:

- countdown timer (ticks locally against `events.start_time`)
- registration form (form state + submit)
- live registration count (Supabase Realtime subscription)
- live darshan embed (iframe wrapper)

Everything else — home shell, schedule, contact, announcements, gallery grid —
stays a Server Component so it prerenders to the CDN and costs no compute.
Pass server-fetched data down as props; don't refetch on the client.

## Supabase and RLS — non-negotiable

The browser talks to Supabase directly. There is no backend server, so **RLS
policies are the entire security boundary.**

- Every new table ships with `alter table ... enable row level security;` and
  its policies **in the same migration**. A table without RLS is a data breach,
  not a TODO.
- `events`, `announcements`, `gallery_items`: public `select`, admin-only write.
- `food_registrations`: public `insert` only. `registrations` (Pooja) has
  **no public insert policy at all** — writes go exclusively through the
  `register_for_event(event_id, name, phone, adult_count, child_count)`
  SECURITY DEFINER RPC. Every sign-up lands as `status = 'pending'` —
  nothing auto-confirms a spot; admin reviews each one from `/admin` and
  manually moves it to `confirmed` or `waitlisted`. A raw insert policy
  would let a caller bypass that by writing `status='confirmed'` directly.
  Neither table has a public `select` on the table itself — reading either
  would expose every registrant's/volunteer's phone number (required for
  Pooja, optional for Food, but never public either way) to anyone with the
  anon key.
  Read/update/delete are admin-only. Two narrow, deliberate exceptions
  expose non-PII columns via a SECURITY DEFINER RPC, never a raw select
  policy: `claimed_dishes(event_id)` (dish name only — duplicate dishes are
  fine on purpose, no need to check first) and `registered_details(event_id)`
  (name + adult/child counts, confirmed ones only, publicly visible by
  design — "who's secured this day" — but never phone numbers). Follow
  this same pattern for future public-but-scoped reads or writes; never
  widen the table's own
  select policy instead.
- Migrations are versioned files under `supabase/migrations/` (CLI
  timestamp-prefixed naming). Pushing to `develop` auto-applies new ones to
  staging via `.github/workflows/deploy-migrations.yml` — see
  `supabase/README.md`. Production isn't wired up yet; apply manually via
  its SQL Editor when promoting a release until it is.

Admin auth for MVP is a single shared password gating `/admin`. Treat it as
what it is: a speed bump, not authentication. Never put anything behind it that
would be damaging to leak, and never let the admin path widen an RLS policy.

## Secrets

Only `NEXT_PUBLIC_*` vars reach the browser. The Supabase **anon** key is
public by design and belongs in `NEXT_PUBLIC_SUPABASE_ANON_KEY`. The
**service role** key bypasses RLS entirely — it must never appear in a
`NEXT_PUBLIC_*` var, a Client Component, or a committed file. `.env*` is
gitignored; keep it that way.

`RESEND_API_KEY` / `ADMIN_ALERT_EMAIL` (see `lib/notify.ts`) are optional
and server-only — a new Pooja registration still works with neither set,
it just doesn't email admin (fail-soft, same posture as everything else
here). Resend specifically, not an SMS provider: its free tier is
genuinely free indefinitely; every SMS API charges per message with no
real free tier, a hard no under this project's $0 budget.

## Design tokens

Defined in [app/globals.css](app/globals.css). Use the semantic tokens —
`bg-surface`, `text-foreground`, `text-muted`, `border-border`, `bg-primary`,
`text-primary-contrast`, `bg-brand` — rather than raw hexes or the numbered
ramps. The ramps (`saffron-50..900`, `maroon-50..900`) exist for the cases a
semantic token doesn't cover.

Saffron is the primary/action hue, maroon is the grounding/brand hue. Both
light and dark values are defined; if you add a token, add it to both or it
will break one theme.

Mobile-first: write the base styles for a phone, then layer `sm:`/`md:` up.
Tap targets ≥44px. The venue has slow mobile data — no heavy client bundles,
no blocking fonts, no carousel libraries.

## Do not build

These are deliberate product decisions, not gaps to helpfully fill:

- **User accounts / OTP login / "my registrations".** Excluded from the roadmap
  entirely to keep registration frictionless. If lookup is ever needed, it's a
  query by phone number — not a session.
- **Payments / donations.** Removed from the app entirely (no `/donate`
  page, no contact-info section, no `NAV_LINKS` entry) — donations are
  coordinated fully outside it. If ever revisited: still off-app by phone
  only, no gateway, no UPI intent, no PCI surface.
- **Native app, multi-language.** Out of scope for now. Multi-language was
  explored for `/about-ganesha` (English/Telugu/Hindi/Kannada/Marathi/
  Gujarati/Tamil, page-wide selector so the whole page switches consistently
  rather than one section at a time) and deliberately deferred back to
  English-only — revisit if/when there's bandwidth for it, and for translation
  review: AI-assisted translations need a native speaker's proofread before
  they'd be trustworthy to ship.

## Workflow

- Branch from `develop`. `develop` auto-deploys to staging, `main` to prod.
  Never commit straight to `main`.
- Every PR gets a Vercel preview — that link is the review surface, and it gets
  reviewed on a phone. Say what changed visually.
- Before opening a PR: `npm run lint` and `npx tsc --noEmit` must both pass.
  `npm run build` if you touched rendering strategy.
- The `next dev` server forwards browser console errors to the terminal, and
  writes its port to `.next/dev/lock` — connect to the running one instead of
  starting a second.
- `next dev` rewrites the managed block at the top of this file. Keep project
  conventions below the `END:nextjs-agent-rules` marker, and commit the block
  if it reappears in your diff.
