import type { Metadata } from "next";
import CharityMediaGrid from "@/components/CharityMediaGrid";
import { getCharityMedia, getCharityStories, getCharityYears } from "@/lib/charity";

export const metadata: Metadata = { title: "Charity" };

// The media grid is built from short-lived signed URLs (see lib/charity.ts)
// — static prerendering would freeze the page to whatever URLs existed at
// the last deploy/revalidation and they'd start expiring within the hour.
// force-dynamic mints fresh ones on every request instead.
export const dynamic = "force-dynamic";

type YearSection = {
  year: number;
  story: string | null;
  stories: Awaited<ReturnType<typeof getCharityStories>>;
  media: Awaited<ReturnType<typeof getCharityMedia>>;
};

export default async function CharityPage() {
  const [years, stories, media] = await Promise.all([
    getCharityYears(),
    getCharityStories(),
    getCharityMedia(),
  ]);

  // One section per year, newest first — a year shows up here whether it
  // has a write-up, stories, media, or any combination, so an admin can add
  // one before the others without it silently hiding the rest (see the
  // migration's comment on why charity_media.year isn't a foreign key into
  // charity_years).
  const mediaByYear = new Map<number, typeof media>();
  for (const item of media) {
    mediaByYear.set(item.year, [...(mediaByYear.get(item.year) ?? []), item]);
  }
  const storiesByYear = new Map<number, typeof stories>();
  for (const item of stories) {
    storiesByYear.set(item.year, [...(storiesByYear.get(item.year) ?? []), item]);
  }
  const storyByYear = new Map(years.map((y) => [y.year, y.story]));
  const allYears = [
    ...new Set([...years.map((y) => y.year), ...storiesByYear.keys(), ...mediaByYear.keys()]),
  ].sort((a, b) => b - a);
  const yearSections: YearSection[] = allYears.map((year) => ({
    year,
    story: storyByYear.get(year) ?? null,
    stories: storiesByYear.get(year) ?? [],
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

              {section.story && (
                <p className="mt-2 text-sm text-muted">{section.story}</p>
              )}

              {section.stories.length > 0 ? (
                <div className="mt-4 flex flex-col gap-4">
                  {section.stories.map((story) => (
                    <article
                      key={story.id}
                      className="rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border"
                    >
                      <h3 className="font-semibold text-brand">{story.title}</h3>
                      <p className="mt-2 whitespace-pre-line text-sm text-muted">{story.body}</p>
                    </article>
                  ))}
                </div>
              ) : (
                !section.story && (
                  <p className="mt-2 text-sm text-muted">
                    This year&apos;s write-up is being put together — check back soon.
                  </p>
                )
              )}

              {section.media.length > 0 ? (
                <CharityMediaGrid items={section.media} />
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
