"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Fetches claimed_dishes(event_id) client-side (see
// infra/migrations/0004_registration_refinements.sql) rather than via a
// server-fetched initial prop — which day is selected lives in the parent
// client component's state, so there's no server-rendered value to seed
// from. From there it listens for Realtime Broadcast messages pushed by the
// `food_registrations_broadcast_dish` trigger so a dish someone else claims
// for this day shows up without a refresh. Deliberately NOT a
// `postgres_changes` subscription — anon has no SELECT grant on
// food_registrations, so that would silently receive nothing.
//
// The parent (FoodRegistrationFlow) remounts this component on eventId
// change via `key`, so state naturally starts fresh per day — no manual
// reset needed here.
export default function ClaimedDishesList({ eventId }: { eventId: string }) {
  const [dishes, setDishes] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    supabase
      .rpc("claimed_dishes", { p_event_id: eventId })
      .then(({ data, error }: { data: { dish_name: string }[] | null; error: { message: string } | null }) => {
        if (cancelled) return;
        if (error) {
          console.warn("[ClaimedDishesList]", error.message);
          return;
        }
        setDishes((data ?? []).map((row) => row.dish_name));
      });

    const channel = supabase
      .channel(`food_registrations:${eventId}`, { config: { private: false } })
      .on("broadcast", { event: "dish_claimed" }, ({ payload }) => {
        if (typeof payload?.dish_name === "string") {
          setDishes((current) => [...current, payload.dish_name]);
        }
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  if (dishes.length === 0) {
    return <p className="text-sm text-muted">No dishes claimed yet for this day — yours could be the first!</p>;
  }

  return (
    <ul className="flex flex-wrap gap-2">
      {dishes.map((dish, index) => (
        <li
          key={`${dish}-${index}`}
          className="rounded-full bg-surface-muted px-3 py-1 text-sm text-foreground ring-1 ring-border"
        >
          {dish}
        </li>
      ))}
    </ul>
  );
}
