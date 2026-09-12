"use client";

import { useActionState } from "react";
import { registerFood, type FoodRegisterState } from "@/app/actions/food";

const initialState: FoodRegisterState = { status: "idle" };

export default function FoodRegistrationForm({ eventId }: { eventId: string }) {
  const [state, formAction, pending] = useActionState(registerFood, initialState);

  if (state.status === "success") {
    return (
      <p
        role="status"
        className="rounded-xl bg-surface-muted p-4 text-sm font-medium text-foreground ring-1 ring-border"
      >
        Thank you! You&apos;re signed up to bring a dish — see you there.
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
              <label htmlFor={`${eventId}-contact_name`}>Contact name</label>
            </td>
            <td className="py-1">
              <input
                id={`${eventId}-contact_name`}
                name="contact_name"
                type="text"
                required
                autoComplete="name"
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
              <label htmlFor={`${eventId}-dish_name`}>Dish you&apos;ll bring</label>
            </td>
            <td className="py-1">
              <input
                id={`${eventId}-dish_name`}
                name="dish_name"
                type="text"
                required
                placeholder="e.g. Modak, Puliyodarai, Kheer"
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
        disabled={pending || !eventId}
        className="min-h-11 rounded-lg bg-primary px-4 py-2 font-medium text-primary-contrast transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Signing up…" : "Sign up to bring a dish"}
      </button>
    </form>
  );
}
