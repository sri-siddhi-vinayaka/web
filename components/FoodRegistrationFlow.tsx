"use client";

import { useState } from "react";
import ClaimedDishesList from "@/components/ClaimedDishesList";
import FoodRegistrationForm from "@/components/FoodRegistrationForm";
import type { EventItem } from "@/types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// One option per festival day (see dedupeByDay in app/register/food/page.tsx)
// rather than per pooja event — food sign-up is a per-day thing, not tied to
// a specific pooja's timing.
export default function FoodRegistrationFlow({ dayOptions }: { dayOptions: EventItem[] }) {
  const [eventId, setEventId] = useState(dayOptions[0]?.id ?? "");

  if (dayOptions.length === 0) {
    return (
      <p className="text-sm text-muted">
        The day-by-day schedule is being finalized — check back soon to sign up.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <label htmlFor="food_day" className="text-sm font-medium text-foreground">
          Which day are you bringing food?
        </label>
        <select
          id="food_day"
          value={eventId}
          onChange={(event) => setEventId(event.target.value)}
          className="min-h-11 rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
        >
          {dayOptions.map((day) => (
            <option key={day.id} value={day.id}>
              Day {day.day_number} — {formatDate(day.start_time)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-foreground">Dishes already claimed for this day</h2>
        <div className="mt-2">
          <ClaimedDishesList key={eventId} eventId={eventId} />
        </div>
      </div>

      <FoodRegistrationForm key={eventId} eventId={eventId} />
    </div>
  );
}
