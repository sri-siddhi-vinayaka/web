import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import ClaimedDishesList from "@/components/ClaimedDishesList";
import RegisteredDetailsTable from "@/components/RegisteredDetailsTable";
import RegistrationCount from "@/components/RegistrationCount";
import YouTubeIcon from "@/components/icons/YouTubeIcon";
import {
  dedupeByDay,
  getEvents,
  getPoojaCapacity,
  getPoojaRegistrableDays,
  getRegisteredDetails,
  isLiveDarshanActive,
  isPastDay,
  isToday,
  orderByRelevance,
  POOJA_SLOTS_PER_DAY,
} from "@/lib/events";
import { getClaimedDishes } from "@/lib/food";
import { FESTIVAL_END, FESTIVAL_START, LIVE_STREAM_WATCH_URL } from "@/lib/config";
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

// Shared look for a registration link that isn't clickable right now
// (either the day's already past, or Pooja hit capacity) — a plain notice
// instead of a disabled-looking link.
function ClosedNotice({ label }: { label: string }) {
  return (
    <span className="flex min-h-11 flex-1 items-center justify-center rounded-lg bg-surface-muted px-3 py-2 text-center text-sm font-medium text-muted ring-1 ring-border">
      {label}
    </span>
  );
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

  // Both registration flows register per day, not per event row —
  // dedupeByDay picks the same representative event per day_number that
  // /register/pooja#day-N and /register/food#day-N actually register
  // against (see getPoojaRegistrableDays / FoodRegistrationPage), so
  // capacity, "who's registered", and claimed dishes are all checked
  // against that one event's data rather than summed across every event on
  // the day.
  const dedupedDays = dedupeByDay(events);
  const dayRepresentativeEvent = new Map(dedupedDays.map((event) => [event.day_number, event]));
  // Days with no public Pooja sign-up at all — the structural first/last
  // day plus whatever ADMIN_RUN_POOJA_DAY_NUMBERS adds (e.g. Day 7's
  // Ganapati Homam) — see getPoojaRegistrableDays for the full rule. Food
  // registration has no such restriction and isn't filtered by this.
  const poojaRegistrableDayNumbers = new Set(
    getPoojaRegistrableDays(dedupedDays).map((event) => event.day_number)
  );

  // What's relevant right now (today, then what's still ahead) leads;
  // days that already happened are pushed to the end, behind a "Past
  // days" divider — see firstPastDayIndex below.
  const orderedDayNumbers = orderByRelevance([...dayRepresentativeEvent.values()]).map(
    (event) => event.day_number
  );
  const firstPastDayIndex = orderedDayNumbers.findIndex((dayNumber) => isPastDay(days.get(dayNumber)![0]));

  const detailsByEvent = new Map(
    await Promise.all(
      events.map(async (event) => [event.id, await getRegisteredDetails(event.id)] as const)
    )
  );

  const poojaCapacityByDay = new Map(
    [...dayRepresentativeEvent.entries()]
      .filter(([dayNumber]) => poojaRegistrableDayNumbers.has(dayNumber))
      .map(([dayNumber, event]) => [dayNumber, getPoojaCapacity(detailsByEvent.get(event.id) ?? [])] as const)
  );
  // Food registration takes sign-ups every day, including day 1/12 (unlike
  // Pooja) — see getPoojaRegistrableDays' comment — so this isn't filtered
  // the way poojaCapacityByDay is.
  const dishesByDay = new Map(
    await Promise.all(
      [...dayRepresentativeEvent.entries()].map(
        async ([dayNumber, event]) => [dayNumber, await getClaimedDishes(event.id)] as const
      )
    )
  );

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand">Festival Schedule</h1>
      <p className="mt-1 text-sm text-muted">{FESTIVAL_DATE_RANGE}</p>
      <div className="mt-6 flex flex-col gap-8">
        {orderedDayNumbers.map((dayNumber, index) => {
          const dayEvents = days.get(dayNumber)!;
          const dayIsPast = isPastDay(dayEvents[0]);
          const dayIsToday = !dayIsPast && isToday(dayEvents[0]);

          return (
          <Fragment key={dayNumber}>
            {index === firstPastDayIndex && (
              <h2 className="mt-2 border-t border-border pt-6 text-xs font-semibold uppercase tracking-wide text-muted">
                Past days
              </h2>
            )}
          {/* scroll-mt accounts for SiteHeader's sticky h-14 bar so a jump
              to #day-N doesn't land the heading underneath it. Same anchor
              id scheme as the #day-N hashes /register/pooja and
              /register/food already use, just applied to this page too, so
              e.g. an announcement can deep-link straight to a specific
              day. */}
          <section id={`day-${dayNumber}`} className="scroll-mt-20">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-accent">
              Day {dayNumber} — {formatDay(new Date(dayEvents[0].start_time))}
              {dayIsToday && (
                <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs font-medium normal-case tracking-normal text-primary-contrast">
                  Today
                </span>
              )}
            </h2>
            <ul className="mt-3 flex flex-col gap-3">
              {dayEvents.map((event) => (
                <li
                  key={event.id}
                  className="rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border"
                >
                  <p className="flex items-center gap-1.5 font-semibold text-foreground">
                    {event.title}
                    {/* Day 1 only — unlike the "Watch Live Darshan" button
                        further down this same card (isLiveDarshanActive-
                        gated, internal /live link), this is a permanent
                        outbound link to the recording itself, so it's still
                        here once Day 1 — and Live Darshan with it — is over. */}
                    {dayNumber === firstDay && (
                      <a
                        href={LIVE_STREAM_WATCH_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Watch on YouTube"
                        className="text-muted transition-colors hover:text-foreground"
                      >
                        <YouTubeIcon className="h-4 w-4 shrink-0" />
                      </a>
                    )}
                  </p>
                  <p className="text-sm text-muted">{formatTime(event.start_time)}</p>
                  {event.description && (
                    <p className="mt-1 text-sm text-muted">{event.description}</p>
                  )}
                  {event.flyer_url && (
                    <Image
                      src={event.flyer_url}
                      alt={`${event.title} flyer`}
                      width={900}
                      height={1600}
                      sizes="(min-width: 640px) 640px, 100vw"
                      className="mt-2 h-auto w-full rounded-xl ring-1 ring-border"
                    />
                  )}
                  <RegistrationCount
                    eventId={event.id}
                    initialDetails={detailsByEvent.get(event.id) ?? []}
                  />
                </li>
              ))}
            </ul>

            {/* Names are public once confirmed specifically so people can
                see who else is going and coordinate with friends — see the
                privacy notice on /register/pooja. Shown once per day (not
                per event, same reasoning as the registration links below)
                and only for days that actually take Pooja sign-ups. This is
                an overview page, not the registration flow itself, so an
                empty day says nothing here rather than nudging with
                RegisteredDetailsTable's "be the first!" default — that
                encouragement belongs next to the form on /register/pooja,
                not repeated down a list of mostly-empty future days. */}
            {poojaRegistrableDayNumbers.has(dayNumber) && (() => {
              const details = detailsByEvent.get(dayRepresentativeEvent.get(dayNumber)!.id) ?? [];
              if (details.length === 0) return null;

              return (
                <div className="mt-3">
                  <h3 className="text-xs font-medium text-foreground">Already registered</h3>
                  <div className="mt-1">
                    <RegisteredDetailsTable
                      eventId={dayRepresentativeEvent.get(dayNumber)!.id}
                      initialDetails={details}
                    />
                  </div>
                </div>
              );
            })()}

            {/* Same reasoning as above, for claimed dishes — dish names are
                public the same way registrant names are (see
                food_registrations' claimed_dishes() RPC). Every day takes
                Food sign-ups, including day 1/12, so unlike the block above
                this isn't gated to pooja-registrable days. */}
            {(() => {
              const dishes = dishesByDay.get(dayNumber) ?? [];
              if (dishes.length === 0) return null;

              return (
                <div className="mt-3">
                  <h3 className="text-xs font-medium text-foreground">Dishes already claimed</h3>
                  <div className="mt-1">
                    <ClaimedDishesList
                      eventId={dayRepresentativeEvent.get(dayNumber)!.id}
                      initialDishes={dishes}
                    />
                  </div>
                </div>
              );
            })()}

            {/* One registration link set per day, not per event — a day can
                carry more than one event (the pooja itself, plus e.g. a
                fun-event entry), and every event here shares the same
                day-level registration flow. The Pooja Registration link is
                skipped for any day in poojaRegistrableDayNumbers' complement
                (structurally first/last day, plus Day 7's Ganapati Homam —
                see ADMIN_RUN_POOJA_DAY_NUMBERS) — Food registration has no
                such restriction and shows every day regardless. */}
            <div className="mt-3 flex flex-wrap gap-2">
              {poojaRegistrableDayNumbers.has(dayNumber) && (() => {
                // A day that's already happened no longer takes
                // registrations, full or not — check that before capacity.
                if (dayIsPast) {
                  return <ClosedNotice label="Pooja Registration — This day has passed" />;
                }

                const capacity = poojaCapacityByDay.get(dayNumber);

                // Bookings closed: no point showing a link into a form that
                // won't get a confirmed spot.
                if (capacity?.closed) {
                  return <ClosedNotice label="Pooja Registration — Bookings closed" />;
                }

                return (
                  <div className="flex-1">
                    <Link
                      href={`/register/pooja#day-${dayNumber}`}
                      className="flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-3 py-2 text-center text-sm font-medium text-primary-contrast transition-colors hover:opacity-90"
                    >
                      Pooja Registration
                    </Link>
                    {capacity && capacity.spotsRemaining < POOJA_SLOTS_PER_DAY && (
                      <p className="mt-1 text-center text-xs text-muted">
                        {capacity.spotsRemaining} more registration{" "}
                        {capacity.spotsRemaining === 1 ? "spot" : "spots"} available
                      </p>
                    )}
                  </div>
                );
              })()}
              {dayIsPast ? (
                <ClosedNotice label="Food Registration — This day has passed" />
              ) : (
                <Link
                  href={`/register/food#day-${dayNumber}`}
                  className="min-h-11 flex-1 rounded-lg bg-surface-muted px-3 py-2 text-center text-sm font-medium text-foreground ring-1 ring-border transition-colors hover:bg-border"
                >
                  Food Registration
                </Link>
              )}
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
          </Fragment>
          );
        })}
      </div>
    </div>
  );
}
