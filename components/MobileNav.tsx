"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { NAV_LINKS } from "@/lib/config";

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="mobile-nav-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-11 w-11 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-surface-muted"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? (
            <path d="M6 6 18 18 M18 6 6 18" />
          ) : (
            <path d="M4 7h16 M4 12h16 M4 17h16" />
          )}
        </svg>
      </button>

      {open && (
        <>
          {/* Backdrop closes the menu on outside tap; sits below the panel
              (z-10) but above the rest of the page. */}
          <button
            type="button"
            aria-label="Close menu"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-10 cursor-default"
          />
          <nav
            id="mobile-nav-menu"
            className="absolute right-0 top-full z-20 mt-2 w-56 rounded-2xl bg-surface p-2 shadow-lg ring-1 ring-border"
          >
            {NAV_LINKS.slice(1).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block min-h-11 rounded-lg px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </>
      )}
    </div>
  );
}
