import type { Metadata } from "next";
import Link from "next/link";
import ClaimedDishesList from "@/components/ClaimedDishesList";
import DayAccordionItem from "@/components/DayAccordionItem";
import DayCalendarStrip from "@/components/DayCalendarStrip";
import DayStatLine from "@/components/DayStatLine";
import FoodRegistrationForm from "@/components/FoodRegistrationForm";
import FreeRegistrationNotice from "@/components/FreeRegistrationNotice";
import PrivacyNotice from "@/components/PrivacyNotice";
import {
  dedupeByDay,
  getEvents,
  getPoojaRegistrableDays,
  getRegisteredDetails,
  isPastDay,
} from "@/lib/events";
import { getClaimedDishes } from "@/lib/food";

export const metadata: Metadata = { title: "Food Registration" };

// The event list (and which days count as "upcoming") has no admin action
// to hang a revalidation off — same reasoning as the schedule page — so
// static prerendering would freeze both to whatever was true at the last
// deploy.
export const dynamic = "force-dynamic";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export default async function FoodRegistrationPage() {
  const events = await getEvents();
  const dedupedDays = dedupeByDay(events);
  // Unlike Pooja registration, Food registration has no first/last-day
  // exclusion — every day, including the opening and closing ceremonies,
  // can take a food sign-up. Still need to know which days *do* have Pooja
  // registration open, to decide whether the cross-link below makes sense
  // for a given day. Every day shows, past included — see isPastDay below
  // for why registering is closed there while the claimed-dish list stays.
  const days = dedupedDays;
  const poojaRegistrableDayNumbers = new Set(
    getPoojaRegistrableDays(dedupedDays).map((day) => day.day_number)
  );
  // Fetches Pooja registration details too, not just claimed dishes — the
  // accordion header shows both signals for every day (see DayStatLine) so
  // picking a day here means weighing Pooja registration's numbers too,
  // not just this page's own.
  const [dishesByDay, poojaDetailsByDay] = await Promise.all([
    Promise.all(days.map(async (day) => [day.id, await getClaimedDishes(day.id)] as const)).then(
      (entries) => new Map(entries)
    ),
    Promise.all(days.map(async (day) => [day.id, await getRegisteredDetails(day.id)] as const)).then(
      (entries) => new Map(entries)
    ),
  ]);

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand">Food Registration</h1>
      <p className="mt-1 text-sm text-muted">
        Bringing a dish to share? Sign up below for the day you&apos;ll bring
        it, and see what&apos;s already spoken for that day.
      </p>

      <div className="mt-4">
        <FreeRegistrationNotice />
      </div>
      <div className="mt-2">
        <PrivacyNotice>
          Only the dish name is shown here publicly — bringing the same
          dish as someone else is totally fine, no need to check first.
          Your name and phone number stay private — visible
          only to the event admin, and only to contact you if needed.
        </PrivacyNotice>
      </div>

      {days.length === 0 ? (
        <p className="mt-6 text-sm text-muted">
          The day-by-day schedule is being finalized — check back soon to sign up.
        </p>
      ) : (
        <>
          <div className="mt-6">
            <DayCalendarStrip days={days} />
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {days.map((day) => {
              const isPast = isPastDay(day);

              return (
                <DayAccordionItem
                  key={day.id}
                  dayNumber={day.day_number}
                  header={
                    <div>
                      <h2 className="text-sm font-semibold uppercase tracking-wide text-accent">
                        Day {day.day_number} — {formatDate(day.start_time)}
                        {isPast && (
                          <span className="ml-2 rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium normal-case tracking-normal text-muted ring-1 ring-border">
                            Event passed
                          </span>
                        )}
                      </h2>
                      <DayStatLine
                        eventId={day.id}
                        initialDetails={poojaDetailsByDay.get(day.id) ?? []}
                        initialDishCount={dishesByDay.get(day.id)?.length ?? 0}
                      />
                    </div>
                  }
                >
                  <div>
                    <h3 className="text-sm font-medium text-foreground">Dishes already claimed</h3>
                    <div className="mt-2">
                      <ClaimedDishesList eventId={day.id} initialDishes={dishesByDay.get(day.id) ?? []} />
                    </div>
                  </div>

                  <div className="mt-4">
                    {isPast ? (
                      <p className="rounded-xl bg-surface-muted p-4 text-sm font-medium text-foreground ring-1 ring-border">
                        This day has already passed — sign-ups are closed. The
                        list above shows what was claimed.
                      </p>
                    ) : (
                      <FoodRegistrationForm eventId={day.id} />
                    )}
                  </div>

                  {!isPast && poojaRegistrableDayNumbers.has(day.day_number) && (
                    <Link
                      href={`/register/pooja#day-${day.day_number}`}
                      className="mt-4 inline-block text-sm font-medium text-primary underline underline-offset-2"
                    >
                      Want to attend Pooja too? Switch to Pooja Registration for this day →
                    </Link>
                  )}
                </DayAccordionItem>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
