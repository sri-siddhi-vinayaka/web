"use client";

import { useState } from "react";
import YouTubeIcon from "@/components/icons/YouTubeIcon";

// Same click-to-play, click-again-to-collapse pattern as Gallery's
// YearMediaPlayer, just for a single YouTube video rather than a
// youtube/instagram pair — a tournament's several matches are independent
// tiles, each toggling its own embed rather than sharing one active slot,
// since more than one might reasonably be open at once.
export default function InlineYouTubeToggle({
  label,
  embedUrl,
}: {
  label: string;
  embedUrl: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-pressed={open}
        aria-label={`${open ? "Hide" : "Play"} ${label}`}
        className={
          open
            ? "flex min-h-11 w-full items-center gap-2 rounded-xl bg-primary p-3 text-left text-sm font-medium text-primary-contrast shadow-sm ring-1 ring-primary transition-colors"
            : "flex min-h-11 w-full items-center gap-2 rounded-xl bg-surface p-3 text-left text-sm font-medium text-foreground shadow-sm ring-1 ring-border transition-colors hover:bg-surface-muted"
        }
      >
        <YouTubeIcon className="h-5 w-5 shrink-0" />
        {label}
      </button>

      {open && (
        <div className="mt-2 aspect-video w-full overflow-hidden rounded-2xl bg-black ring-1 ring-border">
          <iframe
            src={embedUrl}
            title={label}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      )}
    </div>
  );
}
