"use client";

import { useEffect, useState } from "react";
import type { CharityMediaItem } from "@/lib/charity";

// Soft deterrents against casual copying only — not real security. No
// website can see or block a screenshot (that's an OS-level function
// outside any browser's reach), and a determined person can always get
// around this via dev tools or screen recording, same as on any site. This
// just removes the easy, accidental paths: right-click "Save Image As",
// dragging an image out to the desktop, and iOS's long-press "Save to
// Photos" menu (the -webkit-touch-callout style below). The video's
// controlsList="nodownload" is the same idea for its own download button.
function preventContextMenu(event: React.MouseEvent) {
  event.preventDefault();
}
function preventDrag(event: React.DragEvent) {
  event.preventDefault();
}

export default function CharityMediaGrid({ items }: { items: CharityMediaItem[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeIndex === null) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowRight") {
        setActiveIndex((current) => (current === null ? current : Math.min(current + 1, items.length - 1)));
      }
      if (event.key === "ArrowLeft") {
        setActiveIndex((current) => (current === null ? current : Math.max(current - 1, 0)));
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, items.length]);

  return (
    <>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={item.media_type === "video" ? "Play video" : "View photo"}
            className="relative aspect-square overflow-hidden rounded-xl bg-surface-muted ring-1 ring-border"
          >
            {item.media_type === "video" ? (
              <video
                src={item.url}
                preload="metadata"
                muted
                playsInline
                onContextMenu={preventContextMenu}
                className="h-full w-full object-cover"
              />
            ) : (
              // A signed URL is a fresh, one-time query string per render;
              // next/image's optimizer cache would keep serving a copy past
              // the URL's own expiry, and re-signing on every optimizer
              // fetch defeats the point of using one.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.url}
                alt={item.caption ?? "Photo from the association's charitable work"}
                draggable={false}
                onContextMenu={preventContextMenu}
                onDragStart={preventDrag}
                style={{ WebkitTouchCallout: "none" }}
                className="h-full w-full object-cover"
              />
            )}
            {item.media_type === "video" && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-foreground">
                  ▶
                </span>
              </span>
            )}
            {item.caption && (
              <span className="absolute inset-x-0 bottom-0 truncate bg-black/50 px-2 py-1 text-left text-xs text-white">
                {item.caption}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeIndex !== null && (
        <CharityLightbox
          items={items}
          index={activeIndex}
          onClose={() => setActiveIndex(null)}
          onNavigate={setActiveIndex}
        />
      )}
    </>
  );
}

function CharityLightbox({
  items,
  index,
  onClose,
  onNavigate,
}: {
  items: CharityMediaItem[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const active = items[index];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={active.caption ?? "Media viewer"}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-surface text-lg text-foreground shadow-sm"
      >
        ✕
      </button>

      {index > 0 && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onNavigate(index - 1);
          }}
          aria-label="Previous"
          className="absolute left-2 flex h-11 w-11 items-center justify-center rounded-full bg-surface/80 text-lg text-foreground shadow-sm sm:left-4"
        >
          ‹
        </button>
      )}
      {index < items.length - 1 && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onNavigate(index + 1);
          }}
          aria-label="Next"
          className="absolute right-2 flex h-11 w-11 items-center justify-center rounded-full bg-surface/80 text-lg text-foreground shadow-sm sm:right-4"
        >
          ›
        </button>
      )}

      {active.media_type === "video" ? (
        <video
          key={active.id}
          src={active.url}
          controls
          controlsList="nodownload"
          autoPlay
          playsInline
          onClick={(event) => event.stopPropagation()}
          onContextMenu={preventContextMenu}
          className="max-h-[80vh] max-w-full rounded-xl"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={active.url}
          alt={active.caption ?? "Photo from the association's charitable work"}
          draggable={false}
          onClick={(event) => event.stopPropagation()}
          onContextMenu={preventContextMenu}
          onDragStart={preventDrag}
          style={{ WebkitTouchCallout: "none" }}
          className="max-h-[80vh] max-w-full rounded-xl object-contain"
        />
      )}

      {active.caption && (
        <p
          onClick={(event) => event.stopPropagation()}
          className="absolute bottom-4 left-1/2 max-w-[90%] -translate-x-1/2 rounded-lg bg-black/60 px-3 py-1 text-center text-sm text-white"
        >
          {active.caption}
        </p>
      )}
    </div>
  );
}
