import type { EventItem } from "@/types";

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
  });
}

// A calendar-style day strip that jumps to that day's section further down
// the page, rather than gating which day's content is visible — every
// upcoming day's registration form is already on the page (see
// app/register/pooja/page.tsx and app/register/food/page.tsx), this is just
// a quick way to get to one without scrolling through all of them.
export default function DayCalendarStrip({ days }: { days: EventItem[] }) {
  return (
    <nav aria-label="Jump to a day" className="flex flex-wrap gap-2">
      {days.map((day) => (
        <a
          key={day.id}
          href={`#day-${day.day_number}`}
          className="flex min-h-11 min-w-16 flex-col items-center justify-center rounded-xl bg-surface-muted px-3 py-1 text-center ring-1 ring-border transition-colors hover:bg-border"
        >
          <span className="text-xs font-semibold text-brand">Day {day.day_number}</span>
          <span className="text-xs text-muted">{formatShortDate(day.start_time)}</span>
        </a>
      ))}
    </nav>
  );
}
