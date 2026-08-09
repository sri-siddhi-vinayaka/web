import type { Metadata } from "next";

export const metadata: Metadata = { title: "Gallery" };

export default function GalleryPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand">Gallery</h1>
      <p className="mt-3 text-muted">
        Photos from this year&apos;s celebration will be posted here once the
        festival is underway.
      </p>
    </div>
  );
}
