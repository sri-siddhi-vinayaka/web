import type { Metadata } from "next";
import ClaimedDishesList from "@/components/ClaimedDishesList";
import DayCalendarStrip from "@/components/DayCalendarStrip";
import FoodRegistrationForm from "@/components/FoodRegistrationForm";
import FreeRegistrationNotice from "@/components/FreeRegistrationNotice";
import PrivacyNotice from "@/components/PrivacyNotice";
import { dedupeByDay, getEvents, getRegistrableDays, getUpcomingDays } from "@/lib/events";
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
  const days = getUpcomingDays(getRegistrableDays(dedupeByDay(events)));
  const dishesByDay = new Map(
    await Promise.all(days.map(async (day) => [day.id, await getClaimedDishes(day.id)] as const))
  );

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

          <div className="mt-8 flex flex-col gap-8">
            {days.map((day) => (
              <section key={day.id} id={`day-${day.day_number}`}>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-accent">
                  Day {day.day_number} — {formatDate(day.start_time)}
                </h2>

                <div className="mt-3">
                  <h3 className="text-sm font-medium text-foreground">Dishes already claimed</h3>
                  <div className="mt-2">
                    <ClaimedDishesList eventId={day.id} initialDishes={dishesByDay.get(day.id) ?? []} />
                  </div>
                </div>

                <div className="mt-4">
                  <FoodRegistrationForm eventId={day.id} />
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
