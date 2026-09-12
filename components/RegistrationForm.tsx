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

      <table className="w-full border-separate border-spacing-y-2 text-left text-sm">
        <tbody>
          <tr>
            <td className="w-2/5 py-1 pr-3 align-middle font-medium text-foreground">
              <label htmlFor={`${eventId}-name`}>Name(s)</label>
            </td>
            <td className="py-1">
              <input
                id={`${eventId}-name`}
                name="name"
                type="text"
                required
                autoComplete="name"
                placeholder="e.g. Raj Patel & family"
                className="min-h-11 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
              />
            </td>
          </tr>
          <tr>
            <td className="w-2/5 py-1 pr-3 align-middle font-medium text-foreground">
              <label htmlFor={`${eventId}-phone`}>Phone number</label>
            </td>
            <td className="py-1">
              <input
                id={`${eventId}-phone`}
                name="phone"
                type="tel"
                required
                autoComplete="tel"
                className="min-h-11 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
              />
            </td>
          </tr>
          <tr>
            <td className="w-2/5 py-1 pr-3 align-middle font-medium text-foreground">
              <label htmlFor={`${eventId}-attendee_count`}>People attending</label>
            </td>
            <td className="py-1">
              <input
                id={`${eventId}-attendee_count`}
                name="attendee_count"
                type="number"
                min={1}
                step={1}
                defaultValue={1}
                required
                className="min-h-11 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
              />
            </td>
          </tr>
        </tbody>
      </table>

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
