import Image from "next/image";
import Link from "next/link";
import type { ComponentType } from "react";
import CountdownTimer from "@/components/CountdownTimer";
import GaneshaPhoto from "@/components/GaneshaPhoto";
import InstagramReelHighlight from "@/components/InstagramReelHighlight";
import LiveDarshanHighlight from "@/components/LiveDarshanHighlight";
import NotificationOptIn from "@/components/NotificationOptIn";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";
import ScrollIcon from "@/components/icons/ScrollIcon";
import CalendarIcon from "@/components/icons/CalendarIcon";
import { getEvents, getTodayHighlights, isLiveDarshanActive } from "@/lib/events";
import { FESTIVAL_END, FESTIVAL_START, VENUE_ADDRESS, VENUE_MAPS_URL } from "@/lib/config";

// "Today's highlights" must roll over with the calendar date on its own, with
// no admin action to hang a revalidation off — static prerendering would
// freeze it to whatever day the last deploy happened to run on.
export const dynamic = "force-dynamic";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDay(date: Date): string {
  return date.toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
  });
}

// FESTIVAL_END is an exclusive upper bound (see its comment in lib/config.ts)
// — the festival's actual last day is one day before it.
const FESTIVAL_LAST_DAY = new Date(FESTIVAL_END.getTime() - 24 * 60 * 60 * 1000);

// "Mythology" (and its /mythology route) removed for now — out of scope,
// revisit later. 32 forms + mantras still live on /about-ganesha. ScrollIcon
// (not VinayakaIcon, already the header logo just above) keeps this tile
// visually distinct from the brand mark sitting right on top of it.
//
// One "Schedule" tile, not separate Pooja/Food Registration tiles — the
// schedule page is where visitors pick a day and register for either from
// there (see app/schedule/page.tsx), so this only needs to get them to
// that one entry point.
//
// No Contact Us tile here (yet) — there's no dedicated email/Instagram
// account to point it at yet either; revisit once that exists.
const QUICK_LINKS: { href: string; label: string; Icon: ComponentType<{ className?: string }> }[] = [
  { href: "/about-ganesha", label: "About Ganesha", Icon: ScrollIcon },
  { href: "/schedule", label: "Schedule", Icon: CalendarIcon },
];

export default async function Home() {
  const events = await getEvents();
  const highlights = getTodayHighlights(events);
  // Count down to Live Darshan actually starting (Day 1's event, currently
  // 7:45 PM ET — see supabase/migrations/20260913080000_day1_start_time_fix.sql),
  // not FESTIVAL_START's midnight boundary — nothing visibly happens at
  // midnight, so a countdown to it reads as broken once that hour passes
  // with no celebration in sight. Falls back to FESTIVAL_START only if the
  // schedule hasn't been seeded yet.
  const liveDarshanStart =
    events.find((event) => event.day_number === 1)?.start_time ?? FESTIVAL_START.toISOString();

  return (
    <div className="flex flex-col gap-10 px-4 py-10 sm:px-6">
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 text-center">
        <h1 className="text-lg font-semibold tracking-tight text-brand sm:text-xl">
          Sri Siddhi Vinayaka Youth Association
        </h1>
        <p className="font-display text-3xl text-accent sm:text-4xl">
          Ganesh Chaturthi 2026
        </p>

        <GaneshaPhoto />

        <p className="max-w-md text-left text-base text-muted">
          Welcome! Every year we bring the community together to celebrate
          Ganesh Chaturthi with pooja, fun events, and community
          spirit. This site is your guide to the celebration — browse the
          schedule, register for events, watch live darshan, and stay
          updated, all in one place.
        </p>
        <CountdownTimer
          start={liveDarshanStart}
          end={FESTIVAL_END.toISOString()}
        />
      </section>

      {/* Right after the hero — first-fold real estate on mobile — but just
          one button's worth of space, same footprint as LiveDarshanHighlight
          below: a popup, not an inline embed, so it doesn't push the rest
          of the page down for visitors who don't tap it. */}
      <section className="mx-auto w-full max-w-sm">
        <InstagramReelHighlight />
      </section>

      <section className="mx-auto grid w-full max-w-sm grid-cols-2 gap-2">
        {QUICK_LINKS.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl bg-surface p-2 text-center shadow-sm ring-1 ring-border transition-colors hover:bg-surface-muted"
          >
            <Icon className="h-6 w-6 text-brand" />
            <span className="text-xs font-medium text-foreground">{label}</span>
          </Link>
        ))}
      </section>

      <section className="mx-auto w-full max-w-3xl rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-border">
        <h2 className="text-lg font-semibold text-foreground">
          Today&apos;s highlights
        </h2>
        {isLiveDarshanActive() && (
          <div className="mt-3">
            <LiveDarshanHighlight />
          </div>
        )}
        {highlights.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            The full day-by-day schedule is being finalized — check back soon.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {highlights.map((event) =>
              // The flyer already has the event's details written out —
              // skip the title/time line for these and just show it,
              // rather than repeating what it already says.
              event.flyer_url ? (
                <li key={event.id}>
                  <Image
                    src={event.flyer_url}
                    alt={`${event.title} flyer`}
                    width={900}
                    height={1600}
                    sizes="(min-width: 640px) 640px, 100vw"
                    className="h-auto w-full rounded-xl ring-1 ring-border"
                  />
                </li>
              ) : (
                <li key={event.id} className="text-sm text-muted">
                  <span className="font-medium text-foreground">{event.title}</span>
                  {" — "}
                  {formatTime(event.start_time)}
                </li>
              )
            )}
          </ul>
        )}
        {/* Whoever's checking this section is plausibly on their way, so the
            venue belongs right here rather than only in the closing section
            further down the page — the most useful place for it. After the
            highlights themselves, not before: what's happening today is
            what someone opens this section to see first. */}
        <p className="mt-3 text-sm text-muted">
          📍 {VENUE_ADDRESS} —{" "}
          <a
            href={VENUE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline underline-offset-2"
          >
            Get Directions
          </a>
        </p>
      </section>

      <PwaInstallPrompt />
      <NotificationOptIn />

      <section className="mx-auto w-full max-w-3xl rounded-2xl bg-surface p-6 text-center shadow-sm ring-1 ring-border">
        <h2 className="text-lg font-semibold text-foreground">We&apos;d Love to See You</h2>
        {/* Left-aligned, width-constrained like the hero welcome paragraph
            above (max-w-md text-left) — centered text.muted ragged-wraps
            unevenly across two stacked sentences; this keeps a straight
            left edge instead, while the heading/buttons around it stay
            centered with the rest of this section. */}
        <div className="mx-auto mt-2 flex max-w-md flex-col gap-2 text-left">
          <p className="text-sm text-muted">
            A question, a helping hand, or just a moment for Ganpati&apos;s
            blessings — whatever brings you here, there&apos;s a place for you.
            Swing by the venue, or send us a note.
          </p>
          <p className="text-sm text-muted">
            Darshan is walk-in, any time — no registration, no headcount —
            from Ganesh Sthapana ({formatDay(FESTIVAL_START)}) through the
            Ladoo celebration ({formatDay(FESTIVAL_LAST_DAY)}).
          </p>
        </div>
      </section>
    </div>
  );
}
