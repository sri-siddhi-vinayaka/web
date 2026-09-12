import type { Metadata } from "next";
import { getCharityMedia } from "@/lib/charity";

export const metadata: Metadata = { title: "Charity" };

// The media grid is built from short-lived signed URLs (see lib/charity.ts)
// — static prerendering would freeze the page to whatever URLs existed at
// the last deploy/revalidation and they'd start expiring within the hour.
// force-dynamic mints fresh ones on every request instead.
export const dynamic = "force-dynamic";

export default async function CharityPage() {
  const media = await getCharityMedia();

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

      {media.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {media.map((item) => (
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
                // A signed URL is a fresh, one-time query string per render;
                // next/image's optimizer cache would keep serving a copy
                // past the URL's own expiry, and re-signing on every
                // optimizer fetch defeats the point of using it.
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
        <p className="mt-6 text-sm text-muted">
          Photos and videos from past years are being added here soon.
        </p>
      )}
    </div>
  );
}
