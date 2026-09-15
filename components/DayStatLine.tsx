"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatRegistrationSummary, type RegisteredDetail } from "@/lib/events";

// Shown on every day's accordion header — on both Pooja and Food
// registration pages — so picking a day means weighing both signals at
// once ("2 families registered: 7 adults, 3 children · 5 dishes claimed"),
// not just the one this particular page's form is for. Two independent
// Realtime Broadcast subscriptions, the same channels/events
// RegistrationCount and ClaimedDishesList already use elsewhere, just
// combined into one line and kept visible whether the day is collapsed or
// expanded (unlike those two, which only ever showed up inside the
// expanded content).
export default function DayStatLine({
  eventId,
  initialDetails,
  initialDishCount,
}: {
  eventId: string;
  initialDetails: RegisteredDetail[];
  initialDishCount: number;
}) {
  const [details, setDetails] = useState(initialDetails);
  const [dishCount, setDishCount] = useState(initialDishCount);

  useEffect(() => {
    const registrationsChannel = supabase
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

    const foodChannel = supabase
      .channel(`food_registrations:${eventId}`, { config: { private: false } })
      .on("broadcast", { event: "dish_claimed" }, () => {
        setDishCount((current) => current + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(registrationsChannel);
      supabase.removeChannel(foodChannel);
    };
  }, [eventId]);

  return (
    <p className="text-xs text-muted">
      {formatRegistrationSummary(details)}
      {" · "}
      {dishCount} {dishCount === 1 ? "dish" : "dishes"} claimed
    </p>
  );
}
