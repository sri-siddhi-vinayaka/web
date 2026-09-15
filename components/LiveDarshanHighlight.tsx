"use client";

import { useEffect, useState } from "react";
import LiveEmbed from "@/components/LiveEmbed";
import YouTubeIcon from "@/components/icons/YouTubeIcon";
import { LIVE_STREAM_URL } from "@/lib/config";

// Today's-highlights tile for Live Darshan (Day 1 only — see
// isLiveDarshanActive in lib/events.ts, which gates whether this renders at
// all). A popup rather than InlineYouTubeToggle/YearMediaPlayer's
// expand-in-place pattern, since this sits in a compact highlights list
// where an inline iframe would push everything else below it around.
export default function LiveDarshanHighlight() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-11 w-full items-center gap-2 rounded-xl bg-primary px-3 py-2 text-left text-sm font-medium text-primary-contrast shadow-sm ring-1 ring-primary transition-opacity hover:opacity-90"
      >
        <YouTubeIcon className="h-5 w-5 shrink-0" />
        Watch Live Darshan
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Live darshan"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-2 flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close live darshan"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-lg text-foreground shadow-sm"
              >
                ✕
              </button>
            </div>
            <LiveEmbed url={LIVE_STREAM_URL} />
          </div>
        </div>
      )}
    </>
  );
}
