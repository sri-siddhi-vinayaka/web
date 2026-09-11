"use client";

export default function LiveEmbed({ url }: { url: string }) {
  if (!url) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-surface-muted p-6 text-center ring-1 ring-border">
        <p className="text-sm text-muted">
          Live darshan will begin once the stream starts — check back closer to
          the event.
        </p>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black ring-1 ring-border">
      <iframe
        src={url}
        title="Live darshan"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
      />
    </div>
  );
}
