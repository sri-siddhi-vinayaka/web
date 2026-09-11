# Sri Siddhi Vinayaka App
## Product & Business Requirements Document (PRD/BRD)
**Version 1.0 — For MVP Handoff**

---

## 1. Purpose of This Document

This document defines **what** to build and **why**, independent of implementation detail. It is intended to be read alongside the companion **Technical Implementation Document**, which defines **how** to build it. Together they form a complete handoff package for development (human or AI-assisted).

---

## 2. Background

The Sri Siddhi Vinayaka Youth Association runs an annual Ganesh Chaturthi festival with a 10-day event schedule, poojas, cultural programs, and community activities. Today this is coordinated manually/offline. The goal is a mobile-first web application that lets the community view the schedule, register for events, watch live darshan, and stay informed — without requiring the association to manage any paid infrastructure or complex user accounts.

---

## 3. Goals

1. Let community members register for events digitally, replacing manual/paper sign-up.
2. Provide real-time visibility into event status, live darshan, and registration activity.
3. Keep the experience frictionless — no login/account required for a visitor to participate.
4. Operate at **zero recurring infrastructure cost**.
5. Be maintainable long-term as an open-source project, not dependent on one person.

## 4. Non-Goals (explicitly out of scope for MVP and beyond, unless revisited)

- No online payment processing of any kind. Donations are coordinated off-app via a named contact person.
- No user accounts, login, or OTP-based authentication, for MVP and current roadmap.
- No native mobile app — the web app must work well in mobile browsers instead.
- No multi-language support in MVP.
- No custom video hosting — all video content is embedded from YouTube/Facebook.

---

## 5. Target Users

| User type | Description | Primary device |
|---|---|---|
| Community visitor | Browses schedule, registers for events, watches live darshan | Mobile (primary), desktop (secondary) |
| Committee/Admin | Views registrations, manages announcements and gallery content | Mobile or desktop |

---

## 6. MVP Feature Requirements

Each feature includes acceptance criteria — the definition of "done" for that feature.

### 6.1 Home Page
- Displays association name/branding, a hero banner, and a live countdown to the festival start date.
- Displays "Today's Highlights" — a short list of the current day's events.
- **Acceptance criteria**: Countdown updates every second without a page refresh; highlights reflect the current date automatically (no manual daily update needed).

### 6.2 Event Schedule
- Displays all 10 days of events with event name, time, and short description.
- **Acceptance criteria**: A visitor can find any event's date/time within 2 taps from the home page.

### 6.3 Event Registration
- A visitor can register for an event by submitting: name, phone number, and optionally gotra.
- No login or account creation required.
- On submission, the visitor sees a clear confirmation.
- **Acceptance criteria**: Submitting a duplicate registration (same phone, same event) is handled gracefully — either blocked with a friendly message, or allowed with a note, per association's preference (default: allow, since families may register together under one phone).

### 6.4 Live Darshan
- Embeds a live video stream (YouTube Live or Facebook Live) directly on the page.
- **Acceptance criteria**: Visitor can view the stream without leaving the app or needing a separate account/login on the streaming platform.

### 6.5 Real-Time Registration Count
- Displays a live count of how many people have registered for a given event.
- **Acceptance criteria**: Count updates for a visitor currently viewing the page within a few seconds of a new registration, without them refreshing.

### 6.6 Basic Gallery
- Displays current-year event photos in a simple grid.
- **Acceptance criteria**: Loads acceptably on a mobile data connection (avoid unoptimized full-resolution images).

### 6.7 Contact & Announcements
- Displays association contact info and a simple list of announcements (e.g. "Pooja registrations are now open").
- **Acceptance criteria**: Announcements are manageable by an admin without needing a code change per announcement.

### 6.8 Donation Information
- Displays the name and phone number of a designated contact person for anyone wishing to donate.
- **No payment gateway, no QR code processing, no financial transaction of any kind happens inside the app.**
- **Acceptance criteria**: This is purely informational display content.

### 6.9 Admin View
- A simple, password-protected page where a committee member can view the list of event registrations and manage announcements/gallery uploads.
- **Acceptance criteria**: Not a full multi-user login system — one shared admin credential is acceptable for MVP.

---

## 7. Post-MVP (Phase 2) — Not Required for Initial Handoff

- Multi-year gallery archive with tabs
- Event highlight video sections
- Ganesha mythology deep content (32 forms, mantras/slokas)
- Committee members directory page
- Social activities/outreach showcase
- Optional lightweight "find my registration by phone number" lookup (still no login)

---

## 8. Success Criteria

- App loads in under 3 seconds on typical mobile data at the event venue.
- Zero data loss on the registration form under concurrent use during peak festival hours.
- Live Darshan has no downtime during scheduled live events.
- Total infrastructure cost remains $0 through the full festival period.
- Codebase is structured well enough that an outside open-source contributor could understand and contribute to it without extensive onboarding.

---

## 9. Constraints

- **Budget**: $0 for infrastructure, indefinitely.
- **Timeline**: MVP targeted for a 1-week build window.
- **Team**: Primarily one person coordinating, using AI-assisted/agentic coding tools to accelerate implementation.
- **Content dependency**: Real event schedule details, contact information, and initial gallery photos must be supplied by the association in parallel with development — this is a likely bottleneck independent of coding speed.

---

## 10. Open Decisions (association/product owner to confirm before or during build)

| Decision | Status |
|---|---|
| Domain: free `*.vercel.app` vs. owned domain | Open |
| Admin credential: who holds/rotates it | Open |
| Gallery content: who supplies photos for launch | Open |
| Live stream platform: YouTube vs. Facebook Live | Open |
| Donation contact person: confirm name/number | Open |
| Duplicate registration handling (6.3) | Open — default to "allow" unless specified otherwise |
| Long-term repo/content maintenance ownership | Open |
