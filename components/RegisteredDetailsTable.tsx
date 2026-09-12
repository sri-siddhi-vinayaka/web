"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { RegisteredDetail } from "@/lib/events";

// Starts from `initialDetails` (server-fetched via
// registered_details(event_id), see
// supabase/migrations/20260913020000_adult_child_optional_phone_food_size.sql),
// then listens for the 'registered' broadcast the registrations count
// trigger also sends, so a new confirmed sign-up shows up live. Name +
// adult/child counts only, never phone numbers — registrations still has
// no public SELECT policy. Waitlisted sign-ups never appear here, only
// confirmed ones (they haven't secured anything yet).
export default function RegisteredDetailsTable({
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

  if (details.length === 0) {
    return <p className="text-sm text-muted">Nobody has secured this day yet — be the first!</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl ring-1 ring-border">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-muted">
            <th className="px-3 py-2 font-medium">Name</th>
            <th className="px-3 py-2 font-medium">Adults</th>
            <th className="px-3 py-2 font-medium">Children</th>
          </tr>
        </thead>
        <tbody>
          {details.map((detail, index) => (
            <tr key={`${detail.name}-${index}`} className="border-b border-border last:border-0">
              <td className="px-3 py-2 text-foreground">{detail.name}</td>
              <td className="px-3 py-2 text-muted">{detail.adult_count}</td>
              <td className="px-3 py-2 text-muted">{detail.child_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
