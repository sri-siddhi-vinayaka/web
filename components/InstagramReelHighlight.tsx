"use client";

import { useEffect, useState } from "react";
import InstagramIcon from "@/components/icons/InstagramIcon";
import { loadInstagramEmbedScript } from "@/lib/instagramEmbed";
import { INSTAGRAM_REEL_URL } from "@/lib/config";

// Home page tile for the year's Instagram Reel — a popup rather than
// YearMediaPlayer's expand-in-place pattern, same reasoning as
// LiveDarshanHighlight: one button-height of space on the home page,
// nothing pushed around when it opens. Renders Instagram's real preview
// card via their own embed.js + <blockquote> handshake (see lib/config.ts's
// comment on PREVIOUS_YEARS for why there's no plain <iframe> alternative);
// tapping the card itself still opens Instagram in a new tab — that's
// Instagram's ceiling for a free, public embed, not ours.
export default function InstagramReelHighlight() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // The <blockquote> below is a fresh, unprocessed DOM node each time it
  // mounts (it unmounts when the popup closes), so embed.js needs telling
  // again on every open, not just once ever.
  useEffect(() => {
    if (!open) return;
    loadInstagramEmbedScript().then(() => window.instgrm?.Embeds.process());
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-11 w-full items-center gap-2 rounded-xl bg-primary px-3 py-2 text-left text-sm font-medium text-primary-contrast shadow-sm ring-1 ring-primary transition-opacity hover:opacity-90"
      >
        <InstagramIcon className="h-5 w-5 shrink-0" />
        Watch Our 2026 Reel
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Instagram reel"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-[400px]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-2 flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close Instagram reel"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-lg text-foreground shadow-sm"
              >
                ✕
              </button>
            </div>
            <blockquote
              className="instagram-media"
              data-instgrm-permalink={INSTAGRAM_REEL_URL}
              data-instgrm-version="14"
              style={{ margin: 0, width: "100%" }}
            />
          </div>
        </div>
      )}
    </>
  );
}
