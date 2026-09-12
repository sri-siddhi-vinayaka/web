"use client";

import { useActionState } from "react";
import { updateEventAction, type CreateEventState } from "@/app/actions/admin";
import type { EventItem } from "@/types";

const initialState: CreateEventState = { status: "idle" };

// Inverse of createEventAction's "-04:00" assumption: reformats the stored
// UTC instant back into the "YYYY-MM-DDTHH:mm" a <input type="datetime-local">
// expects, in America/New_York — so re-saving without touching the date
// field round-trips to the same instant. Same known EDT/EST limitation as
// the rest of this app's date handling.
function toDatetimeLocalValue(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

export default function EditEventForm({ event }: { event: EventItem }) {
  const updateThisEvent = updateEventAction.bind(null, event.id);
  const [state, formAction, pending] = useActionState(updateThisEvent, initialState);

  return (
    <form action={formAction} className="flex flex-1 flex-col gap-2">
      <input
        name="title"
        defaultValue={event.title}
        placeholder="Title (e.g. Ganesh Sthapana)"
        required
        className="min-h-11 rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
      />
      <div className="flex gap-2">
        <input
          name="day_number"
          type="number"
          min={1}
          step={1}
          defaultValue={event.day_number}
          placeholder="Day #"
          required
          className="min-h-11 w-24 rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
        />
        <input
          name="start_time"
          type="datetime-local"
          defaultValue={toDatetimeLocalValue(event.start_time)}
          required
          className="min-h-11 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
        />
      </div>
      <input
        name="description"
        defaultValue={event.description}
        placeholder="Description (optional)"
        className="min-h-11 rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
      />

      <div aria-live="polite">
        {state.status === "error" && (
          <p className="text-sm font-medium text-danger">{state.message}</p>
        )}
        {state.status === "success" && (
          <p className="text-sm font-medium text-foreground">Saved.</p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="min-h-11 self-start rounded-lg bg-surface-muted px-4 py-2 text-sm font-medium text-foreground ring-1 ring-border hover:bg-border disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
