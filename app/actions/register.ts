"use server";

import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { getEventById } from "@/lib/events";
import { notifyAdmin } from "@/lib/notify";

export type RegisterState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Goes through the register_for_event() RPC (see
// supabase/migrations/20260913020000_adult_child_optional_phone_food_size.sql)
// rather than a direct insert — registrations has no public insert policy
// at all, only this SECURITY DEFINER function can write to it.
//
// Every sign-up lands as 'pending' — nothing auto-confirms a spot. Admin
// reviews and manually moves each one to confirmed or waitlisted from
// /admin, so notifyAdmin() below is what actually gets their attention;
// the RPC itself doesn't need to decide anything, unlike the short-lived
// auto-cap version this replaced.
//
// Duplicate registrations (same phone, same event) are still allowed on
// purpose — families often register together under one phone number.
// Phone is required here specifically (unlike Food registration) — the
// committee wants Pooja sign-ups reachable, given admin now has to review
// and confirm each one rather than it being automatic.
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
  if (!name || !phone) {
    return { status: "error", message: "Name(s) and phone number are required." };
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

  const { error } = await supabase.rpc("register_for_event", {
    p_event_id: eventId,
    p_name: name,
    p_phone: phone,
    p_adult_count: adultCount,
    p_child_count: childCount,
  });

  if (error) {
    console.warn("[registerForEvent]", error.message);
    return { status: "error", message: "Registration failed — please try again." };
  }

  const event = await getEventById(eventId);
  await notifyAdmin(
    "New Pooja registration to review",
    `${name} signed up for ${event ? `Day ${event.day_number} (${event.title})` : "an event"} — ${adultCount} adult(s), ${childCount} child(ren). Review it in /admin.`
  );

  return { status: "success" };
}
