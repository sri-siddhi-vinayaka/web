"use client";

import { useActionState } from "react";
import { createEventAction, type CreateEventState } from "@/app/actions/admin";

const initialState: CreateEventState = { status: "idle" };

export default function AddEventForm() {
  const [state, formAction, pending] = useActionState(createEventAction, initialState);

  return (
    <form
      action={formAction}
      className="mt-3 flex flex-col gap-2 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border"
    >
      <input
        name="title"
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
          placeholder="Day #"
          required
          className="min-h-11 w-24 rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
        />
        <input
          name="start_time"
          type="datetime-local"
          required
          className="min-h-11 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
        />
      </div>
      <input
        name="description"
        placeholder="Description (optional)"
        className="min-h-11 rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
      />

      <div aria-live="polite">
        {state.status === "error" && (
          <p className="text-sm font-medium text-danger">{state.message}</p>
        )}
        {state.status === "success" && (
          <p className="text-sm font-medium text-foreground">Event added.</p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="min-h-11 self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-contrast hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Adding…" : "Add event"}
      </button>
    </form>
  );
}
