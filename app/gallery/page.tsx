import type { Metadata } from "next";
import Image from "next/image";
import { getGalleryItems, isLiveDarshanActive } from "@/lib/events";
import { FESTIVAL_START, PREVIOUS_YEARS } from "@/lib/config";

export const metadata: Metadata = { title: "Gallery" };

// Whether this year's entry in PREVIOUS_YEARS shows up here rolls over with
// the calendar date (see isLiveDarshanActive) — static prerendering would
// freeze that decision to whatever it was at the last deploy.
export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const items = await getGalleryItems();

  // While Live Darshan is still airing, its /live page is the current year's
  // home, not Gallery — hide that entry here until the stream hands off.
  const previousYears = isLiveDarshanActive()
    ? PREVIOUS_YEARS.filter((py) => py.year !== FESTIVAL_START.getFullYear())
    : PREVIOUS_YEARS;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand">Gallery</h1>

      {items.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <figure
              key={item.id}
              className="relative aspect-square overflow-hidden rounded-xl bg-surface-muted ring-1 ring-border"
            >
              <Image
                src={item.image_url}
                alt={item.caption ?? "Ganesh Chaturthi celebration photo"}
                fill
                sizes="(min-width: 640px) 33vw, 50vw"
                className="object-cover"
              />
            </figure>
          ))}
        </div>
      )}

      {previousYears.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-semibold text-foreground">
            Previous Years
          </h2>

          {/* One block per year (newest first, see PREVIOUS_YEARS) rather
              than every YouTube embed stacked above every Instagram link —
              a year's own video and reel sit together under its own year
              heading, so it's clear which clip belongs to which year. */}
          <div className="mt-4 flex flex-col gap-8">
            {previousYears.map((py) => (
              <div key={py.year}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-foreground">
                    {py.year}
                  </h3>
                  {py.instagramUrl && (
                    <a
                      href={py.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-foreground ring-1 ring-border transition-colors hover:bg-surface-muted"
                    >
                      Watch on Instagram
                    </a>
                  )}
                </div>

                {py.youtubeEmbedUrl && (
                  <div className="mt-2 aspect-video w-full overflow-hidden rounded-2xl bg-black ring-1 ring-border">
                    <iframe
                      src={py.youtubeEmbedUrl}
                      title={`${py.year} pooja celebration recording`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
