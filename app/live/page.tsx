import type { Metadata } from "next";
import LiveEmbed from "@/components/LiveEmbed";
import { LIVE_STREAM_URL } from "@/lib/config";

export const metadata: Metadata = { title: "Live Darshan" };

export default function LivePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand">Live Darshan</h1>
      <p className="mt-2 text-sm text-muted">
        Watch the celebration live, right here — no separate app or login
        needed.
      </p>
      <p className="mt-2 text-sm text-muted">
        Live from Day 1 — Ganesh Sthapana &amp; Pooja, the opening ceremony
        installing Ganesha&apos;s murti.
      </p>
      <div className="mt-6">
        <LiveEmbed url={LIVE_STREAM_URL} />
      </div>
    </div>
  );
}
