"use client";

import { useActionState } from "react";
import { submitSuggestion, type SuggestionState } from "@/app/actions/suggestions";

const initialState: SuggestionState = { status: "idle" };

export default function SuggestionForm() {
  const [state, formAction, pending] = useActionState(submitSuggestion, initialState);

  if (state.status === "success") {
    return (
      <p
        role="status"
        className="rounded-xl bg-surface-muted p-4 text-sm font-medium text-foreground ring-1 ring-border"
      >
        Thank you! Your suggestion has been sent to the committee.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label htmlFor="message" className="text-sm font-medium text-foreground">
          Your suggestion
        </label>
        <textarea
          id="message"
          name="message"
          required
          maxLength={2000}
          rows={4}
          placeholder="What would make this year's celebration even better?"
          className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
        />
      </div>

      <div>
        <label htmlFor="name" className="text-sm font-medium text-foreground">
          Name <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          className="mt-1 min-h-11 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
        />
      </div>

      <div>
        <label htmlFor="contact" className="text-sm font-medium text-foreground">
          Phone or email <span className="font-normal text-muted">(optional, only if you&apos;d like a reply)</span>
        </label>
        <input
          id="contact"
          name="contact"
          type="text"
          autoComplete="tel"
          className="mt-1 min-h-11 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
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
        {pending ? "Sending…" : "Send suggestion"}
      </button>
    </form>
  );
}
