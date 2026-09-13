import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LiveEmbed from "@/components/LiveEmbed";
import { LIVE_STREAM_URL } from "@/lib/config";
import { isLiveDarshanActive } from "@/lib/events";

export const metadata: Metadata = { title: "Live Darshan" };

// Whether this page is live at all rolls over with the calendar date (see
// isLiveDarshanActive) — static prerendering would freeze that decision to
// whatever it was at the last deploy.
export const dynamic = "force-dynamic";

export default function LivePage() {
  // Day 1 is over — the recording lives in Gallery now, not on its own page.
  if (!isLiveDarshanActive()) redirect("/gallery");

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
