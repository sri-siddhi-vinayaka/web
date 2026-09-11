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
  return new Date(iso).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
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
        <h1 className="text-2xl font-bold text-brand">10-Day Schedule</h1>
        <p className="mt-3 text-muted">
          The day-by-day pooja schedule is being finalized and will appear here
          before the festival begins.
        </p>
      </div>
    );
  }

  const days = groupByDay(events);
  const counts = new Map(
    await Promise.all(
      events.map(async (event) => [event.id, await getRegistrationCount(event.id)] as const)
    )
  );

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand">10-Day Schedule</h1>
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
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{event.title}</p>
                      <p className="text-sm text-muted">{formatTime(event.start_time)}</p>
                      {event.description && (
                        <p className="mt-1 text-sm text-muted">{event.description}</p>
                      )}
                      <RegistrationCount
                        eventId={event.id}
                        initialCount={counts.get(event.id) ?? 0}
                      />
                    </div>
                    <Link
                      href={`/register/${event.id}`}
                      className="shrink-0 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-contrast transition-colors hover:opacity-90"
                    >
                      Register
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
