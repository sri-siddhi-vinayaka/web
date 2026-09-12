"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Same pattern as ClaimedDishesList: starts from `initialNames`
// (server-fetched via registered_names(event_id), see
// supabase/migrations/20260912000000_public_registered_names.sql), then
// listens for the 'registered' broadcast the registrations count trigger
// also sends, so a new sign-up shows up live. Names only, never phone
// numbers — registrations still has no public SELECT policy.
export default function RegisteredNamesList({
  eventId,
  initialNames,
}: {
  eventId: string;
  initialNames: string[];
}) {
  const [names, setNames] = useState(initialNames);

  useEffect(() => {
    const channel = supabase
      .channel(`registrations:${eventId}`, { config: { private: false } })
      .on("broadcast", { event: "registered" }, ({ payload }) => {
        if (typeof payload?.name === "string") {
          setNames((current) => [...current, payload.name]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  if (names.length === 0) {
    return <p className="text-sm text-muted">Nobody has secured this day yet — be the first!</p>;
  }

  return (
    <ul className="flex flex-wrap gap-2">
      {names.map((name, index) => (
        <li
          key={`${name}-${index}`}
          className="rounded-full bg-surface-muted px-3 py-1 text-sm text-foreground ring-1 ring-border"
        >
          {name}
        </li>
      ))}
    </ul>
  );
}
