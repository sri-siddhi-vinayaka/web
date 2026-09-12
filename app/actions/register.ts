"use server";

import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export type RegisterState =
  | { status: "idle" }
  | { status: "success"; registrationStatus: "confirmed" | "waitlisted" }
  | { status: "error"; message: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Goes through the register_for_event() RPC (see
// supabase/migrations/20260913020000_adult_child_optional_phone_food_size.sql)
// rather than a direct insert — only 2 confirmed sign-ups per day are
// guaranteed, the rest are waitlisted, and that count-then-decide-then-insert
// sequence has to be one atomic database operation to avoid a race between
// concurrent sign-ups. The RPC returns which one this sign-up became.
//
// Duplicate registrations (same phone, same event) are still allowed on
// purpose — families often register together under one phone number.
// Phone itself is optional — not every registrant wants to be reachable,
// and the app doesn't need it to function, only admin might for follow-up.
export async function registerForEvent(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const eventId = String(formData.get("event_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const adultCount = Number(formData.get("adult_count"));
  const childCount = Number(formData.get("child_count"));

  if (!UUID_RE.test(eventId)) {
    return {
      status: "error",
      message: "Something went wrong — please go back to the schedule and try again.",
    };
  }
  if (!name) {
    return { status: "error", message: "Name(s) are required." };
  }
  if (!Number.isInteger(adultCount) || adultCount < 0 || !Number.isInteger(childCount) || childCount < 0) {
    return { status: "error", message: "Adults and children must be 0 or more." };
  }
  if (adultCount + childCount < 1) {
    return { status: "error", message: "At least one person must be attending." };
  }
  if (!isSupabaseConfigured) {
    return { status: "error", message: "Registration isn't available yet — please try again later." };
  }

  const { data, error } = await supabase.rpc("register_for_event", {
    p_event_id: eventId,
    p_name: name,
    p_phone: phone || null,
    p_adult_count: adultCount,
    p_child_count: childCount,
  });

  if (error) {
    console.warn("[registerForEvent]", error.message);
    return { status: "error", message: "Registration failed — please try again." };
  }

  return {
    status: "success",
    registrationStatus: data === "waitlisted" ? "waitlisted" : "confirmed",
  };
}
