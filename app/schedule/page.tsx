import type { Metadata } from "next";
import Link from "next/link";
import RegistrationCount from "@/components/RegistrationCount";
import { getEvents, getRegistrationCount, isLiveDarshanActive } from "@/lib/events";
import { FESTIVAL_END, FESTIVAL_START } from "@/lib/config";
import type { EventItem } from "@/types";

export const metadata: Metadata = { title: "Schedule" };

// Registration counts and the event list itself have no admin action to hang
// a revalidation off (registering isn't an admin write) — static prerendering
// would freeze both to whatever they were at the last deploy.
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

// The schedule spans 12 calendar days (Sept 14 - Sept 25), which reads as
// 11 *nights* — the traditional way this festival's length is counted (an
// odd number of days the murti stays installed). Both are correct at once,
// but only showing "Day 1" through "Day 12" below could read as "12 days"
// to a visitor unfamiliar with that convention, so this spells out the
// night count explicitly rather than just the day range alone. Derived
// from FESTIVAL_START/END (lib/config.ts), not hardcoded, so this can't
// drift from the schedule below if those dates ever change. FESTIVAL_END
// is an exclusive upper bound (see its comment) — day count is the span in
// days, night count is one less.
const FESTIVAL_LAST_DAY = new Date(FESTIVAL_END.getTime() - 24 * 60 * 60 * 1000);
const FESTIVAL_DAY_COUNT = Math.round((FESTIVAL_END.getTime() - FESTIVAL_START.getTime()) / 86_400_000);
const FESTIVAL_NIGHT_COUNT = FESTIVAL_DAY_COUNT - 1;
const FESTIVAL_DATE_RANGE = `${formatDay(FESTIVAL_START)} – ${formatDay(FESTIVAL_LAST_DAY)} · ${FESTIVAL_NIGHT_COUNT} nights of celebration`;

function groupByDay(events: EventItem[]): Map<number, EventItem[]> {
  const days = new Map<number, EventItem[]>();
  for (const event of events) {
    const dayEvents = days.get(event.day_number) ?? [];
    dayEvents.push(event);
    days.set(event.day_number, dayEvents);
  }
  return days;
}

export default async function SchedulePage() {
  const events = await getEvents();

  if (events.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold text-brand">Festival Schedule</h1>
        <p className="mt-1 text-sm text-muted">{FESTIVAL_DATE_RANGE}</p>
        <p className="mt-3 text-muted">
          The day-by-day pooja schedule is being finalized and will appear here
          before the festival begins.
        </p>
      </div>
    );
  }

  const days = groupByDay(events);
  const dayNumbers = [...days.keys()];
  const firstDay = Math.min(...dayNumbers);
  const lastDay = Math.max(...dayNumbers);
  const counts = new Map(
    await Promise.all(
      events.map(async (event) => [event.id, await getRegistrationCount(event.id)] as const)
    )
  );

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand">Festival Schedule</h1>
      <p className="mt-1 text-sm text-muted">{FESTIVAL_DATE_RANGE}</p>
      <div className="mt-6 flex flex-col gap-8">
        {[...days.entries()].map(([dayNumber, dayEvents]) => (
          <section key={dayNumber}>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-accent">
              Day {dayNumber}
            </h2>
            <ul className="mt-3 flex flex-col gap-3">
              {dayEvents.map((event) => (
                <li
                  key={event.id}
                  className="rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border"
                >
                  <p className="font-semibold text-foreground">{event.title}</p>
                  <p className="text-sm text-muted">{formatTime(event.start_time)}</p>
                  {event.description && (
                    <p className="mt-1 text-sm text-muted">{event.description}</p>
                  )}
                  <RegistrationCount
                    eventId={event.id}
                    initialCount={counts.get(event.id) ?? 0}
                  />
                </li>
              ))}
            </ul>

            {/* One registration link set per day, not per event — a day can
                carry more than one event (the pooja itself, plus e.g. a
                fun-event entry), and every event here shares the same
                day-level registration flow. The Pooja ritual on days 1 and
                12 (Sthapana and the final pooja/Ladoo celebration) is
                admin-run with no public sign-up, so that link alone is
                skipped for the structurally first/last day — Food
                registration has no such restriction and shows every day. */}
            <div className="mt-3 flex flex-wrap gap-2">
              {dayNumber !== firstDay && dayNumber !== lastDay && (
                <Link
                  href={`/register/pooja#day-${dayNumber}`}
                  className="min-h-11 flex-1 rounded-lg bg-primary px-3 py-2 text-center text-sm font-medium text-primary-contrast transition-colors hover:opacity-90"
                >
                  Pooja Registration
                </Link>
              )}
              <Link
                href={`/register/food#day-${dayNumber}`}
                className="min-h-11 flex-1 rounded-lg bg-surface-muted px-3 py-2 text-center text-sm font-medium text-foreground ring-1 ring-border transition-colors hover:bg-border"
              >
                Food Registration
              </Link>
              {/* Day 1 only — that's where the live stream starts (see
                  LIVE_STREAM_URL in lib/config.ts). Points at our own /live
                  page rather than the raw YouTube URL directly, same as
                  every other internal link on this page. Disappears once
                  Day 1 (ET) is over — isLiveDarshanActive — since the
                  recording has moved to Gallery by then instead. */}
              {dayNumber === firstDay && isLiveDarshanActive() && (
                <Link
                  href="/live"
                  className="min-h-11 flex-1 rounded-lg bg-surface-muted px-3 py-2 text-center text-sm font-medium text-foreground ring-1 ring-border transition-colors hover:bg-border"
                >
                  Watch Live Darshan
                </Link>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
