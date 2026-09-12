"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { ClaimedDish } from "@/lib/food";

const SIZE_LABELS: Record<string, string> = {
  quarter_pack: "Quarter pack",
  half_tray: "Half tray",
  full_tray: "Full tray",
  family_pack: "Family pack",
};

// Starts from `initialDishes` (server-fetched via claimed_dishes(event_id),
// safe to render immediately), then listens for Realtime Broadcast messages
// pushed by the food_registrations_broadcast_dish trigger (see
// supabase/migrations/20260913020000_adult_child_optional_phone_food_size.sql)
// so a dish someone else claims for this day shows up without a refresh.
// Deliberately NOT a `postgres_changes` subscription — anon has no SELECT
// grant on food_registrations, so that would silently receive nothing.
export default function ClaimedDishesList({
  eventId,
  initialDishes,
}: {
  eventId: string;
  initialDishes: ClaimedDish[];
}) {
  const [dishes, setDishes] = useState(initialDishes);

  useEffect(() => {
    const channel = supabase
      .channel(`food_registrations:${eventId}`, { config: { private: false } })
      .on("broadcast", { event: "dish_claimed" }, ({ payload }) => {
        if (typeof payload?.dish_name === "string" && typeof payload?.quantity_size === "string") {
          setDishes((current) => [...current, { dish_name: payload.dish_name, quantity_size: payload.quantity_size }]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  if (dishes.length === 0) {
    return <p className="text-sm text-muted">No dishes claimed yet for this day — yours could be the first!</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl ring-1 ring-border">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-muted">
            <th className="px-3 py-2 font-medium">Dish</th>
            <th className="px-3 py-2 font-medium">Roughly how much</th>
          </tr>
        </thead>
        <tbody>
          {dishes.map((dish, index) => (
            <tr key={`${dish.dish_name}-${index}`} className="border-b border-border last:border-0">
              <td className="px-3 py-2 text-foreground">{dish.dish_name}</td>
              <td className="px-3 py-2 text-muted">{SIZE_LABELS[dish.quantity_size] ?? dish.quantity_size}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
