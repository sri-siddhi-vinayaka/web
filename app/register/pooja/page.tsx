import type { Metadata } from "next";
import DayCalendarStrip from "@/components/DayCalendarStrip";
import FreeRegistrationNotice from "@/components/FreeRegistrationNotice";
import PrivacyNotice from "@/components/PrivacyNotice";
import RegisteredDetailsTable from "@/components/RegisteredDetailsTable";
import RegistrationCount from "@/components/RegistrationCount";
import RegistrationForm from "@/components/RegistrationForm";
import {
  dedupeByDay,
  getEvents,
  getRegisteredDetails,
  getRegistrationCount,
  getRegistrableDays,
  getUpcomingDays,
} from "@/lib/events";

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
  const days = getUpcomingDays(getRegistrableDays(dedupeByDay(events)));
  const [detailsByDay, countsByDay] = await Promise.all([
    Promise.all(days.map(async (day) => [day.id, await getRegisteredDetails(day.id)] as const)).then(
      (entries) => new Map(entries)
    ),
    Promise.all(days.map(async (day) => [day.id, await getRegistrationCount(day.id)] as const)).then(
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

          <div className="mt-8 flex flex-col gap-8">
            {days.map((day) => (
              <section key={day.id} id={`day-${day.day_number}`}>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-accent">
                  Day {day.day_number} — {formatDate(day.start_time)}
                </h2>
                <RegistrationCount eventId={day.id} initialCount={countsByDay.get(day.id) ?? 0} />

                <div className="mt-3">
                  <h3 className="text-sm font-medium text-foreground">Already secured by</h3>
                  <div className="mt-2">
                    <RegisteredDetailsTable eventId={day.id} initialDetails={detailsByDay.get(day.id) ?? []} />
                  </div>
                </div>

                <div className="mt-4">
                  <RegistrationForm eventId={day.id} eventTitle={`Day ${day.day_number}`} />
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
