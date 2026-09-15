import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";
import DayAccordionItem from "@/components/DayAccordionItem";
import DayCalendarStrip from "@/components/DayCalendarStrip";
import DayStatLine from "@/components/DayStatLine";
import FreeRegistrationNotice from "@/components/FreeRegistrationNotice";
import PrivacyNotice from "@/components/PrivacyNotice";
import RegisteredDetailsTable from "@/components/RegisteredDetailsTable";
import RegistrationForm from "@/components/RegistrationForm";
import {
  dedupeByDay,
  getEvents,
  getPoojaCapacity,
  getRegisteredDetails,
  getPoojaRegistrableDays,
  isPastDay,
  isToday,
  orderByRelevance,
  POOJA_SLOTS_PER_DAY,
} from "@/lib/events";
import { getClaimedDishes } from "@/lib/food";

export const metadata: Metadata = { title: "Pooja Registration" };

// Same reasoning as the schedule page and Food registration: no admin
// action to hang a revalidation off, so static prerendering would freeze
// both the day list and the live counts/details to whatever was true at
// the last deploy.
export const dynamic = "force-dynamic";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export default async function PoojaRegistrationPage() {
  const events = await getEvents();
  // Every pooja-registrable day, past included — a day that's already
  // happened still shows who registered for it, it just no longer offers
  // the form (see isPastDay below). Today and what's still ahead lead;
  // past days are pushed behind a "Past days" divider (firstPastDayIndex).
  const days = orderByRelevance(getPoojaRegistrableDays(dedupeByDay(events)));
  const firstPastDayIndex = days.findIndex((day) => isPastDay(day));
  // Fetches claimed-dish counts too, not just registration counts — the
  // accordion header shows both signals for every day (see DayStatLine)
  // so picking a day here means weighing Food registration's numbers too,
  // not just this page's own.
  const [detailsByDay, dishCountsByDay] = await Promise.all([
    Promise.all(days.map(async (day) => [day.id, await getRegisteredDetails(day.id)] as const)).then(
      (entries) => new Map(entries)
    ),
    Promise.all(days.map(async (day) => [day.id, (await getClaimedDishes(day.id)).length] as const)).then(
      (entries) => new Map(entries)
    ),
  ]);

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand">Pooja Registration</h1>
      <p className="mt-1 text-sm text-muted">
        Pick the day you&apos;d like to attend and register below. The
        admin team reviews each sign-up before confirming — see who&apos;s
        already secured that day.
      </p>

      <div className="mt-4">
        <FreeRegistrationNotice />
      </div>
      <div className="mt-2">
        <PrivacyNotice>
          Your name is shown here publicly once confirmed, so others can
          see who&apos;s secured each day. Your phone number stays
          private — it&apos;s visible only to the event admin, and only to
          contact you if needed.
        </PrivacyNotice>
      </div>

      {days.length === 0 ? (
        <p className="mt-6 text-sm text-muted">
          The day-by-day schedule is being finalized and will appear here
          before the festival begins.
        </p>
      ) : (
        <>
          <div className="mt-6">
            <DayCalendarStrip days={days} />
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {days.map((day, index) => {
              const capacity = getPoojaCapacity(detailsByDay.get(day.id) ?? []);
              const isPast = isPastDay(day);
              const today = !isPast && isToday(day);

              return (
                <Fragment key={day.id}>
                  {index === firstPastDayIndex && (
                    <h2 className="mt-2 border-t border-border pt-6 text-xs font-semibold uppercase tracking-wide text-muted">
                      Past days
                    </h2>
                  )}
                <DayAccordionItem
                  dayNumber={day.day_number}
                  header={
                    <div>
                      <h2 className="text-sm font-semibold uppercase tracking-wide text-accent">
                        Day {day.day_number} — {formatDate(day.start_time)}
                        {today && (
                          <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs font-medium normal-case tracking-normal text-primary-contrast">
                            Today
                          </span>
                        )}
                        {(isPast || capacity.closed) && (
                          <span className="ml-2 rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium normal-case tracking-normal text-muted ring-1 ring-border">
                            {isPast ? "Event passed" : "Bookings closed"}
                          </span>
                        )}
                      </h2>
                      <DayStatLine
                        eventId={day.id}
                        initialDetails={detailsByDay.get(day.id) ?? []}
                        initialDishCount={dishCountsByDay.get(day.id) ?? 0}
                      />
                    </div>
                  }
                >
                  <div>
                    <h3 className="text-sm font-medium text-foreground">Already secured by</h3>
                    <div className="mt-2">
                      <RegisteredDetailsTable eventId={day.id} initialDetails={detailsByDay.get(day.id) ?? []} />
                    </div>
                  </div>

                  <div className="mt-4">
                    {isPast ? (
                      <p className="rounded-xl bg-surface-muted p-4 text-sm font-medium text-foreground ring-1 ring-border">
                        This day has already passed — registration is closed. The
                        list above shows who joined.
                      </p>
                    ) : capacity.closed ? (
                      <p className="rounded-xl bg-surface-muted p-4 text-sm font-medium text-foreground ring-1 ring-border">
                        Pooja registration for this day is full — bookings are closed.
                        Contact the admin team directly if you&apos;d still like to be
                        added to the waitlist.
                      </p>
                    ) : (
                      <>
                        {capacity.spotsRemaining < POOJA_SLOTS_PER_DAY && (
                          <p className="mb-2 text-sm text-muted">
                            {capacity.spotsRemaining} more registration{" "}
                            {capacity.spotsRemaining === 1 ? "spot" : "spots"} available.
                          </p>
                        )}
                        <RegistrationForm eventId={day.id} eventTitle={`Day ${day.day_number}`} />
                      </>
                    )}
                  </div>

                  {!isPast && (
                    <Link
                      href={`/register/food#day-${day.day_number}`}
                      className="mt-4 inline-block text-sm font-medium text-primary underline underline-offset-2"
                    >
                      Bringing food too? Switch to Food Registration for this day →
                    </Link>
                  )}
                </DayAccordionItem>
                </Fragment>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
