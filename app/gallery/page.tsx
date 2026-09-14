import type { Metadata } from "next";
import Image from "next/image";
import YearMediaPlayer from "@/components/YearMediaPlayer";
import { getGalleryItems, isLiveDarshanActive } from "@/lib/events";
import { FESTIVAL_START, PREVIOUS_YEARS } from "@/lib/config";
import type { GalleryItem } from "@/types";

export const metadata: Metadata = { title: "Gallery" };

// Whether this year's entry in PREVIOUS_YEARS shows up here rolls over with
// the calendar date (see isLiveDarshanActive) — static prerendering would
// freeze that decision to whatever it was at the last deploy.
export const dynamic = "force-dynamic";

type YearSection = {
  year: number;
  photos?: GalleryItem[];
  youtubeEmbedUrl?: string;
  instagramUrl?: string;
};

export default async function GalleryPage() {
  const items = await getGalleryItems();
  const currentYear = FESTIVAL_START.getFullYear();

  // While Live Darshan is still airing, its /live page is the current year's
  // home for the recording, not Gallery — hide that entry here until the
  // stream hands off.
  const mediaYears = isLiveDarshanActive()
    ? PREVIOUS_YEARS.filter((py) => py.year !== currentYear)
    : PREVIOUS_YEARS;

  // One flat list of year sections, newest first — no separate "this
  // year's photos" vs. "previous years" split, just years. The current
  // year's photo grid and its video/reel (once Live Darshan hands off)
  // merge into the same section instead of two.
  const currentYearMedia = mediaYears.find((py) => py.year === currentYear);
  const yearSections: YearSection[] = [];
  if (items.length > 0 || currentYearMedia) {
    yearSections.push({
      year: currentYear,
      photos: items,
      youtubeEmbedUrl: currentYearMedia?.youtubeEmbedUrl,
      instagramUrl: currentYearMedia?.instagramUrl,
    });
  }
  for (const py of mediaYears) {
    if (py.year !== currentYear) yearSections.push(py);
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand">Gallery</h1>

      <div className="mt-6 flex flex-col gap-10">
        {yearSections.map((section) => (
          <section key={section.year}>
            <h2 className="text-base font-semibold text-foreground">
              {section.year}
            </h2>

            {section.photos && section.photos.length > 0 && (
              <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {section.photos.map((item) => (
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

            <YearMediaPlayer
              year={section.year}
              youtubeEmbedUrl={section.youtubeEmbedUrl}
              instagramUrl={section.instagramUrl}
            />
          </section>
        ))}
      </div>
    </div>
  );
}
