"use client";

import { useActionState } from "react";
import { registerFood, type FoodRegisterState } from "@/app/actions/food";

const initialState: FoodRegisterState = { status: "idle" };

export default function FoodRegistrationForm() {
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
      <div className="flex flex-col gap-1">
        <label htmlFor="contact_name" className="text-sm font-medium text-foreground">
          Contact name
        </label>
        <input
          id="contact_name"
          name="contact_name"
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
        <label htmlFor="dish_name" className="text-sm font-medium text-foreground">
          Dish you&apos;ll bring
        </label>
        <input
          id="dish_name"
          name="dish_name"
          type="text"
          required
          placeholder="e.g. Modak, Puliyodarai, Kheer"
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
        {pending ? "Signing up…" : "Sign up to bring a dish"}
      </button>
    </form>
  );
}
