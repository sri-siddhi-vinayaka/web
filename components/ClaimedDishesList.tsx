"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Starts from `initialDishes` (server-fetched, safe to render immediately),
// then listens for Realtime Broadcast messages pushed by the
// `food_registrations_broadcast_dish` trigger (see
// infra/migrations/0003_food_registrations.sql) so a dish someone else claims
// while this page is open shows up without a refresh. Deliberately NOT a
// `postgres_changes` subscription — anon has no SELECT grant on
// food_registrations, so that would silently receive nothing.
export default function ClaimedDishesList({ initialDishes }: { initialDishes: string[] }) {
  const [dishes, setDishes] = useState(initialDishes);

  useEffect(() => {
    const channel = supabase
      .channel("food_registrations:dishes", { config: { private: false } })
      .on("broadcast", { event: "dish_claimed" }, ({ payload }) => {
        if (typeof payload?.dish_name === "string") {
          setDishes((current) => [...current, payload.dish_name]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (dishes.length === 0) {
    return <p className="text-sm text-muted">No dishes claimed yet — yours could be the first!</p>;
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
