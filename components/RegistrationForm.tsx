"use client";

import { useActionState } from "react";
import { registerForEvent, type RegisterState } from "@/app/actions/register";

const initialState: RegisterState = { status: "idle" };

export default function RegistrationForm({
  eventId,
  eventTitle,
}: {
  eventId: string;
  eventTitle: string;
}) {
  const [state, formAction, pending] = useActionState(registerForEvent, initialState);

  if (state.status === "success") {
    return (
      <p
        role="status"
        className="rounded-xl bg-surface-muted p-4 text-sm font-medium text-foreground ring-1 ring-border"
      >
        You&apos;re registered for {eventTitle}. See you there!
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="event_id" value={eventId} />

      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium text-foreground">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className="min-h-11 rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="phone" className="text-sm font-medium text-foreground">
          Phone number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          className="min-h-11 rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="gotra" className="text-sm font-medium text-foreground">
          Gotra <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          id="gotra"
          name="gotra"
          type="text"
          className="min-h-11 rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
        />
      </div>

      <div aria-live="polite">
        {state.status === "error" && (
          <p className="text-sm font-medium text-danger">{state.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="min-h-11 rounded-lg bg-primary px-4 py-2 font-medium text-primary-contrast transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Registering…" : "Register"}
      </button>
    </form>
  );
}
