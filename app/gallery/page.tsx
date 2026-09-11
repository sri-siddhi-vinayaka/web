import type { Metadata } from "next";
import Image from "next/image";
import { getGalleryItems } from "@/lib/events";

export const metadata: Metadata = { title: "Gallery" };

export default async function GalleryPage() {
  const items = await getGalleryItems();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand">Gallery</h1>

      {items.length === 0 ? (
        <p className="mt-3 text-muted">
          Photos from this year&apos;s celebration will be posted here once the
          festival is underway.
        </p>
      ) : (
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
    </div>
  );
}
