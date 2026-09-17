"use client";

import { useEffect, useState } from "react";
import UtensilsIcon from "@/components/icons/UtensilsIcon";

// "Course name: item, item, item" per line — see
// supabase/migrations/20260917234100_day5_anna_prasadam_menu.sql for the
// convention and Day 5's actual content.
function parseMenu(menu: string): { course: string; items: string[] }[] {
  return menu
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separatorIndex = line.indexOf(":");
      if (separatorIndex === -1) return { course: line, items: [] };

      return {
        course: line.slice(0, separatorIndex).trim(),
        items: line
          .slice(separatorIndex + 1)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };
    });
}

export default function EventMenuButton({
  eventTitle,
  menu,
  className,
}: {
  eventTitle: string;
  menu: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const courses = parseMenu(menu);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`View the menu for ${eventTitle}`}
        className={className}
      >
        <UtensilsIcon className="h-4 w-4 shrink-0" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${eventTitle} menu`}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-[80vh] w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border"
          >
            <div className="flex items-center justify-between gap-2 bg-brand px-5 py-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-brand-contrast/80">
                  On the menu
                </p>
                <h3 className="font-display text-lg text-brand-contrast">{eventTitle}</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-brand-contrast/80 transition-colors hover:text-brand-contrast"
              >
                ✕
              </button>
            </div>
            <ul className="flex flex-col divide-y divide-border overflow-y-auto px-5 py-3">
              {courses.map(({ course, items }) => (
                <li key={course} className="py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">{course}</p>
                  <p className="mt-1 text-sm text-foreground">{items.join(" · ")}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
