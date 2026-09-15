"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatRegistrationSummary, type RegisteredDetail } from "@/lib/events";

// Starts from `initialDetails` (server-fetched via registered_details(),
// safe to render immediately — unlike CountdownTimer, there's no
// Date.now()/browser-only value here, so no hydration mismatch risk). From
// there it listens for the 'registered' broadcast — sent when admin
// actually confirms someone (registrations_broadcast_status_change, see
// supabase/migrations/20260913020000_adult_child_optional_phone_food_size.sql)
// — and appends that registration, same pattern as RegisteredDetailsTable.
// Deliberately NOT a `postgres_changes` subscription — anon has no SELECT
// grant on `registrations`, so that would silently receive nothing.
export default function RegistrationCount({
  eventId,
  initialDetails,
}: {
  eventId: string;
  initialDetails: RegisteredDetail[];
}) {
  const [details, setDetails] = useState(initialDetails);

  useEffect(() => {
    const channel = supabase
      .channel(`registrations:${eventId}`, { config: { private: false } })
      .on("broadcast", { event: "registered" }, ({ payload }) => {
        if (
          typeof payload?.name === "string" &&
          typeof payload?.adult_count === "number" &&
          typeof payload?.child_count === "number"
        ) {
          setDetails((current) => [
            ...current,
            { name: payload.name, adult_count: payload.adult_count, child_count: payload.child_count },
          ]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  return <p className="text-xs text-muted">{formatRegistrationSummary(details)}</p>;
}
