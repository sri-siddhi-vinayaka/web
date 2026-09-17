"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const STORAGE_KEY = "acknowledged-announcements";

// No accounts in this app (see AGENTS.md), so "who's acknowledged what" can
// only ever be per-device, not per-person — a plain localStorage set of
// announcement ids this browser has already tapped, so the button can't be
// re-tapped for the same one and inflate the public count from this device.
function readAcknowledgedIds(): Set<string> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function rememberAcknowledged(id: string): void {
  try {
    const ids = readAcknowledgedIds();
    ids.add(id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // Private browsing / blocked storage — the tap itself still counted
    // server-side via acknowledge_announcement(); this device just won't
    // remember it locally, so the button could be tapped again later.
  }
}

export default function AcknowledgeAnnouncement({
  announcementId,
  initialCount,
}: {
  announcementId: string;
  initialCount: number;
}) {
  const [count, setCount] = useState(initialCount);
  const [acknowledged, setAcknowledged] = useState(false);

  // Read localStorage only after mount — this render has to match the
  // server's (which knows nothing about this browser's history) to avoid a
  // hydration mismatch. Deferred via setTimeout, same trick
  // PwaInstallPrompt uses for its own first tick — reading localStorage
  // synchronously in the effect body itself (rather than from a callback)
  // trips the set-state-in-effect lint rule.
  useEffect(() => {
    const kickoff = setTimeout(() => {
      setAcknowledged(readAcknowledgedIds().has(announcementId));
    }, 0);
    return () => clearTimeout(kickoff);
  }, [announcementId]);

  async function handleClick() {
    if (acknowledged) return;

    // Optimistic: this visitor's own tap always feels instant, even if the
    // RPC is slow or fails outright — fail-soft, same posture as the rest
    // of this app. Worst case, the shared count is briefly (or, on
    // failure, permanently for this one tap) behind what this visitor sees.
    setAcknowledged(true);
    setCount((current) => current + 1);
    rememberAcknowledged(announcementId);

    const { data, error } = await supabase.rpc("acknowledge_announcement", {
      p_announcement_id: announcementId,
    });

    if (error) {
      console.warn("[AcknowledgeAnnouncement] failed:", error.message);
      return;
    }
    if (typeof data === "number") setCount(data);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={acknowledged}
      aria-pressed={acknowledged}
      aria-label={acknowledged ? "Acknowledged" : "Acknowledge this announcement"}
      className={`mt-2 flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium ring-1 transition-colors ${
        acknowledged
          ? "bg-primary/10 text-primary ring-primary/30"
          : "bg-surface-muted text-foreground ring-border hover:bg-border"
      }`}
    >
      <span aria-hidden="true">👍</span>
      {count > 0 && <span className="text-muted">{count}</span>}
    </button>
  );
}
