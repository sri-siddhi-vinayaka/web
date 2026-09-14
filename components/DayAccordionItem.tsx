"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import ChevronIcon from "@/components/icons/ChevronIcon";

// One day's collapsible section on the registration pages. Deliberately
// local, independent open state — not coordinated with sibling days — so
// more than one day can stay expanded at once: comparing Day 3 against
// Day 5 in detail just means tapping both open, no "only one at a time"
// restriction like a typical FAQ accordion.
//
// `children` is a slot for already-server-rendered content (the
// registered-details table / claimed-dishes list, the registration form,
// the cross-link) rather than something this component imports itself —
// keeps this client island limited to the open/close toggle, without
// pulling those heavier pieces into its own module.
export default function DayAccordionItem({
  dayNumber,
  header,
  children,
}: {
  dayNumber: number;
  header: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Preserves the existing deep-link behavior (Schedule page links to
  // /register/pooja#day-3, etc., and DayCalendarStrip's own jump links work
  // the same way) — the browser already scrolls here natively since the id
  // is always present; this also expands the content, both on first load
  // and if the hash changes while already on the page (a same-page jump
  // link doesn't remount this component, so the effect alone wouldn't
  // otherwise notice), then re-settles the scroll position now that the
  // section's height has grown.
  useEffect(() => {
    function syncFromHash() {
      if (window.location.hash === `#day-${dayNumber}`) {
        setOpen(true);
        requestAnimationFrame(() => {
          sectionRef.current?.scrollIntoView({ block: "start" });
        });
      }
    }

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [dayNumber]);

  return (
    <section
      ref={sectionRef}
      id={`day-${dayNumber}`}
      className="overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border"
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex min-h-11 w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-surface-muted"
      >
        <div>{header}</div>
        <ChevronIcon
          className={`h-5 w-5 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && <div className="border-t border-border p-4">{children}</div>}
    </section>
  );
}
