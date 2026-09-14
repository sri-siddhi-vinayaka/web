"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// The count starts from `initialCount` (a server-fetched value, safe to
// render immediately — unlike CountdownTimer, there's no Date.now()/browser-
// only value here, so no hydration mismatch risk). From there it listens for
// Realtime Broadcast messages pushed by the `registrations_broadcast_count`
// trigger (see supabase/migrations/20260911022120_registration_count_broadcast.sql).
// Deliberately NOT a `postgres_changes` subscription — anon has no SELECT
// grant on `registrations`, so that would silently receive nothing.
export default function RegistrationCount({
  eventId,
  initialCount,
}: {
  eventId: string;
  initialCount: number;
}) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    const channel = supabase
      .channel(`registrations:${eventId}`, { config: { private: false } })
      .on("broadcast", { event: "count" }, ({ payload }) => {
        if (typeof payload?.count === "number") {
          setCount(payload.count);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  return (
    <p className="text-xs text-muted">
      {count} {count === 1 ? "person" : "people"} registered
    </p>
  );
}
