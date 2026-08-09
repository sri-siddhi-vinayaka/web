import type { Metadata } from "next";

export const metadata: Metadata = { title: "Schedule" };

export default function SchedulePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand">10-Day Schedule</h1>
      <p className="mt-3 text-muted">
        The day-by-day pooja schedule is being finalized and will appear here
        before the festival begins.
      </p>
    </div>
  );
}
