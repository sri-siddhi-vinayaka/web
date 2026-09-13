"use client";

import { useEffect, useState } from "react";
import InstagramIcon from "@/components/icons/InstagramIcon";
import YouTubeIcon from "@/components/icons/YouTubeIcon";

type Platform = "youtube" | "instagram";

const PLATFORM_ICON = { youtube: YouTubeIcon, instagram: InstagramIcon } as const;
const PLATFORM_LABEL = { youtube: "YouTube", instagram: "Instagram" } as const;

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

let instagramScriptPromise: Promise<void> | null = null;

// Instagram only plays inline through their own embed.js + <blockquote>
// handshake (see lib/config.ts's comment on PREVIOUS_YEARS for why the
// simpler <iframe> approach doesn't work) — loaded on first tap, not on
// page load, so visitors who never tap the Instagram tile never pay for it.
function loadInstagramEmbedScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.instgrm) return Promise.resolve();
  if (instagramScriptPromise) return instagramScriptPromise;

  instagramScriptPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    script.onload = () => resolve();
    document.body.appendChild(script);
  });
  return instagramScriptPromise;
}

export default function YearMediaPlayer({
  year,
  youtubeEmbedUrl,
  instagramUrl,
}: {
  year: number;
  youtubeEmbedUrl?: string;
  instagramUrl?: string;
}) {
  const [active, setActive] = useState<Platform | null>(null);

  // Re-runs every time the Instagram tile is (re)opened — the <blockquote>
  // below is a fresh, unprocessed DOM node each time (it unmounts when
  // collapsed), so embed.js needs telling again, not just once ever.
  useEffect(() => {
    if (active !== "instagram" || !instagramUrl) return;
    loadInstagramEmbedScript().then(() => window.instgrm?.Embeds.process());
  }, [active, instagramUrl]);

  const available: Platform[] = [
    ...(youtubeEmbedUrl ? (["youtube"] as const) : []),
    ...(instagramUrl ? (["instagram"] as const) : []),
  ];

  if (available.length === 0) return null;

  return (
    <div className="mt-2">
      {/* Doubles as a tab row once something is playing — tapping the
          already-active tile again collapses it instead of switching. */}
      <div className="flex gap-3">
        {available.map((platform) => {
          const Icon = PLATFORM_ICON[platform];
          const isActive = active === platform;
          return (
            <button
              key={platform}
              type="button"
              onClick={() => setActive(isActive ? null : platform)}
              aria-pressed={isActive}
              aria-label={`${isActive ? "Hide" : "Play"} ${year} ${PLATFORM_LABEL[platform]} video`}
              className={
                isActive
                  ? "flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl bg-primary p-2 text-center text-primary-contrast shadow-sm ring-1 ring-primary transition-colors"
                  : "flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl bg-surface p-2 text-center text-foreground shadow-sm ring-1 ring-border transition-colors hover:bg-surface-muted"
              }
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{PLATFORM_LABEL[platform]}</span>
            </button>
          );
        })}
      </div>

      {active === "youtube" && youtubeEmbedUrl && (
        <div className="mt-3 aspect-video w-full overflow-hidden rounded-2xl bg-black ring-1 ring-border">
          <iframe
            src={youtubeEmbedUrl}
            title={`${year} pooja celebration recording`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      )}

      {active === "instagram" && instagramUrl && (
        <div className="mx-auto mt-3 w-full max-w-[400px]">
          {/* embed.js (loaded above) replaces this blockquote with its own
              properly-negotiated iframe once it processes the page — that's
              why there's no src here, unlike the YouTube iframe above. */}
          <blockquote
            className="instagram-media"
            data-instgrm-permalink={instagramUrl}
            data-instgrm-version="14"
            style={{ margin: 0, width: "100%" }}
          />
        </div>
      )}
    </div>
  );
}
