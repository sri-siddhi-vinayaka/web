import type { Metadata } from "next";
import { getCharityMedia, getCharityYears } from "@/lib/charity";

export const metadata: Metadata = { title: "Charity" };

// The media grid is built from short-lived signed URLs (see lib/charity.ts)
// — static prerendering would freeze the page to whatever URLs existed at
// the last deploy/revalidation and they'd start expiring within the hour.
// force-dynamic mints fresh ones on every request instead.
export const dynamic = "force-dynamic";

type YearSection = {
  year: number;
  story: string | null;
  media: Awaited<ReturnType<typeof getCharityMedia>>;
};

export default async function CharityPage() {
  const [years, media] = await Promise.all([getCharityYears(), getCharityMedia()]);

  // One section per year, newest first — a year shows up here whether it
  // has a story, media, or both, so an admin can add either one first
  // without the other silently hiding it (see the migration's comment on
  // why charity_media.year isn't a foreign key into charity_years).
  const mediaByYear = new Map<number, typeof media>();
  for (const item of media) {
    mediaByYear.set(item.year, [...(mediaByYear.get(item.year) ?? []), item]);
  }
  const storyByYear = new Map(years.map((y) => [y.year, y.story]));
  const allYears = [...new Set([...years.map((y) => y.year), ...mediaByYear.keys()])].sort(
    (a, b) => b - a
  );
  const yearSections: YearSection[] = allYears.map((year) => ({
    year,
    story: storyByYear.get(year) ?? null,
    media: mediaByYear.get(year) ?? [],
  }));

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand">Charity</h1>
      <p className="mt-3 text-muted">
        Every year, alongside the celebration, Sri Siddhi Vinayaka Youth
        Association carries out charitable work in the community —
        identifying families and individuals in need, including orphans, and
        stepping in with essentials, educational support for children, and
        whatever else genuinely helps. It&apos;s a small part of the same
        spirit that brings everyone together for Ganesh Chaturthi: together,
        we all rise.
      </p>

      {yearSections.length === 0 ? (
        <p className="mt-6 text-sm text-muted">
          This year&apos;s charitable work is being documented — check back soon.
        </p>
      ) : (
        <div className="mt-8 flex flex-col gap-10">
          {yearSections.map((section) => (
            <section key={section.year}>
              <h2 className="text-lg font-semibold text-foreground">{section.year}</h2>

              <p className="mt-2 text-sm text-muted">
                {section.story ?? "This year's write-up is being put together — check back soon."}
              </p>

              {section.media.length > 0 ? (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {section.media.map((item) => (
                    <figure
                      key={item.id}
                      className="relative aspect-square overflow-hidden rounded-xl bg-surface-muted ring-1 ring-border"
                    >
                      {item.media_type === "video" ? (
                        <video
                          src={item.url}
                          controls
                          controlsList="nodownload"
                          preload="none"
                          playsInline
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        // A signed URL is a fresh, one-time query string per
                        // render; next/image's optimizer cache would keep
                        // serving a copy past the URL's own expiry, and
                        // re-signing on every optimizer fetch defeats the
                        // point of using one.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.url}
                          alt={item.caption ?? "Photo from the association's charitable work"}
                          className="h-full w-full object-cover"
                        />
                      )}
                      {item.caption && (
                        <figcaption className="absolute inset-x-0 bottom-0 bg-black/50 px-2 py-1 text-xs text-white">
                          {item.caption}
                        </figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted">
                  Photos and videos from this year are being added here soon.
                </p>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
