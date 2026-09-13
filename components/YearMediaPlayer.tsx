"use client";

import { useState } from "react";
import InstagramIcon from "@/components/icons/InstagramIcon";
import YouTubeIcon from "@/components/icons/YouTubeIcon";

type Platform = "youtube" | "instagram";

const PLATFORM_ICON = { youtube: YouTubeIcon, instagram: InstagramIcon } as const;
const PLATFORM_LABEL = { youtube: "YouTube", instagram: "Instagram" } as const;

// Nothing plays until a tile is tapped — up to five years' worth of these
// (one youtube + one instagram embed each) sitting on one page would be a
// lot of third-party weight to force onto the venue's slow mobile data if
// they all auto-loaded at once.
export default function YearMediaPlayer({
  year,
  youtubeEmbedUrl,
  instagramEmbedUrl,
}: {
  year: number;
  youtubeEmbedUrl?: string;
  instagramEmbedUrl?: string;
}) {
  const [active, setActive] = useState<Platform | null>(null);

  const available: Platform[] = [
    ...(youtubeEmbedUrl ? (["youtube"] as const) : []),
    ...(instagramEmbedUrl ? (["instagram"] as const) : []),
  ];

  if (available.length === 0) return null;

  const embedUrl =
    active === "youtube" ? youtubeEmbedUrl : active === "instagram" ? instagramEmbedUrl : undefined;

  return (
    <div className="mt-2">
      {/* Doubles as a tab row once something is playing, so switching
          between platforms for the same year never needs a scroll back up. */}
      <div className="flex gap-3">
        {available.map((platform) => {
          const Icon = PLATFORM_ICON[platform];
          const isActive = active === platform;
          return (
            <button
              key={platform}
              type="button"
              onClick={() => setActive(platform)}
              aria-pressed={isActive}
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

      {embedUrl && active === "youtube" && (
        <div className="mt-3 aspect-video w-full overflow-hidden rounded-2xl bg-black ring-1 ring-border">
          <iframe
            src={embedUrl}
            title={`${year} pooja celebration recording`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      )}

      {/* 9:16 — Instagram reels are portrait video, unlike YouTube's 16:9
          recording, so this gets its own natural shape rather than being
          forced into the same wide frame. Instagram's plain iframe embed has
          no parent-page JS to auto-resize itself (that's the embed.js script
          this app deliberately doesn't load), so this aspect ratio is a
          fixed approximation of their compact embed's real height, not a
          value Instagram reports — worth a visual check after this ships. */}
      {embedUrl && active === "instagram" && (
        <div className="mx-auto mt-3 aspect-[9/16] w-full max-w-[320px] overflow-hidden rounded-2xl bg-black ring-1 ring-border">
          <iframe
            src={embedUrl}
            title={`${year} highlight reel`}
            allow="clipboard-write; encrypted-media"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      )}
    </div>
  );
}
