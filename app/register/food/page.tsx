import type { Metadata } from "next";
import FoodRegistrationFlow from "@/components/FoodRegistrationFlow";
import FreeRegistrationNotice from "@/components/FreeRegistrationNotice";
import { getEvents } from "@/lib/events";
import type { EventItem } from "@/types";

export const metadata: Metadata = { title: "Food Registration" };

// The event list has no admin action to hang a revalidation off — same
// reasoning as the schedule page — so static prerendering would freeze the
// day picker to whatever events existed at the last deploy.
export const dynamic = "force-dynamic";

// getEvents() orders by day_number then start_time, so the first event seen
// for a given day_number is that day's earliest — a reasonable stand-in for
// "the day" itself, since there's no separate festival-days table.
function dedupeByDay(events: EventItem[]): EventItem[] {
  const seenDays = new Set<number>();
  return events.filter((event) => {
    if (seenDays.has(event.day_number)) return false;
    seenDays.add(event.day_number);
    return true;
  });
}

export default async function FoodRegistrationPage() {
  const events = await getEvents();
  const dayOptions = dedupeByDay(events);

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand">Food Registration</h1>
      <p className="mt-1 text-sm text-muted">
        Bringing a dish to share? Sign up below so we can plan, and see
        what&apos;s already spoken for on that day.
      </p>

      <div className="mt-4">
        <FreeRegistrationNotice />
      </div>

      <div className="mt-6">
        <FoodRegistrationFlow dayOptions={dayOptions} />
      </div>
    </div>
  );
}
