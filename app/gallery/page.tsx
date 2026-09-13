import type { Metadata } from "next";
import Image from "next/image";
import YearMediaPlayer from "@/components/YearMediaPlayer";
import { getGalleryItems, isLiveDarshanActive } from "@/lib/events";
import { FESTIVAL_START, PREVIOUS_YEARS, toInstagramEmbedUrl } from "@/lib/config";

export const metadata: Metadata = { title: "Gallery" };

// Whether this year's entry in PREVIOUS_YEARS shows up here rolls over with
// the calendar date (see isLiveDarshanActive) — static prerendering would
// freeze that decision to whatever it was at the last deploy.
export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const items = await getGalleryItems();

  // While Live Darshan is still airing, its /live page is the current year's
  // home, not Gallery — hide that entry here until the stream hands off.
  const currentYear = FESTIVAL_START.getFullYear();
  const previousYears = isLiveDarshanActive()
    ? PREVIOUS_YEARS.filter((py) => py.year !== currentYear)
    : PREVIOUS_YEARS;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand">Gallery</h1>

      {/* Same h3/year-number heading the Previous Years blocks below use for
          each past year — so this year's photos already read as "the 2026
          section" today, and once its video moves down into Previous Years
          (see isLiveDarshanActive), that's a relocation, not a redesign. */}
      {items.length > 0 && (
        <section className="mt-6">
          <h3 className="text-base font-semibold text-foreground">
            {currentYear}
          </h3>
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
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
        </section>
      )}

      {previousYears.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-semibold text-foreground">
            Previous Years
          </h2>

          {/* One block per year (newest first, see PREVIOUS_YEARS) — a
              year's own video and reel sit together under its own year
              heading, so it's clear which clip belongs to which year. Both
              platforms embed inline (YearMediaPlayer) rather than sending
              anyone to youtube.com or instagram.com. */}
          <div className="mt-4 flex flex-col gap-8">
            {previousYears.map((py) => (
              <div key={py.year}>
                <h3 className="text-base font-semibold text-foreground">
                  {py.year}
                </h3>
                <YearMediaPlayer
                  year={py.year}
                  youtubeEmbedUrl={py.youtubeEmbedUrl}
                  instagramEmbedUrl={
                    py.instagramUrl ? (toInstagramEmbedUrl(py.instagramUrl) ?? undefined) : undefined
                  }
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
