"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Shown on every day's accordion header — on both Pooja and Food
// registration pages — so picking a day means weighing both signals at
// once ("12 registered · 5 dishes claimed"), not just the one this
// particular page's form is for. Two independent Realtime Broadcast
// subscriptions, the same channels/events RegistrationCount and
// ClaimedDishesList already use elsewhere, just combined into one line and
// kept visible whether the day is collapsed or expanded (unlike those two,
// which only ever showed up inside the expanded content).
export default function DayStatLine({
  eventId,
  initialRegisteredCount,
  initialDishCount,
}: {
  eventId: string;
  initialRegisteredCount: number;
  initialDishCount: number;
}) {
  const [registeredCount, setRegisteredCount] = useState(initialRegisteredCount);
  const [dishCount, setDishCount] = useState(initialDishCount);

  useEffect(() => {
    const registrationsChannel = supabase
      .channel(`registrations:${eventId}`, { config: { private: false } })
      .on("broadcast", { event: "count" }, ({ payload }) => {
        if (typeof payload?.count === "number") setRegisteredCount(payload.count);
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
      {registeredCount} {registeredCount === 1 ? "person" : "people"} registered
      {" · "}
      {dishCount} {dishCount === 1 ? "dish" : "dishes"} claimed
    </p>
  );
}
