import type { Metadata } from "next";
import Link from "next/link";
import RegistrationCount from "@/components/RegistrationCount";
import { getEvents, getRegistrationCount } from "@/lib/events";
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

            {/* One registration link pair per day, not per event — a day
                can carry more than one event (the pooja itself, plus e.g. a
                fun-event entry), and every event here shares the same
                day-level registration flow. Days 1 and 12 (Sthapana and the
                final pooja/Ladoo celebration) are admin-run with no public
                sign-up, so neither link is shown for the structurally first
                or last day. */}
            {dayNumber !== firstDay && dayNumber !== lastDay && (
              <div className="mt-3 flex gap-2">
                <Link
                  href={`/register/pooja#day-${dayNumber}`}
                  className="min-h-11 flex-1 rounded-lg bg-primary px-3 py-2 text-center text-sm font-medium text-primary-contrast transition-colors hover:opacity-90"
                >
                  Pooja Registration
                </Link>
                <Link
                  href={`/register/food#day-${dayNumber}`}
                  className="min-h-11 flex-1 rounded-lg bg-surface-muted px-3 py-2 text-center text-sm font-medium text-foreground ring-1 ring-border transition-colors hover:bg-border"
                >
                  Food Registration
                </Link>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
