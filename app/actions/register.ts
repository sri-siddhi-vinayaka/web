"use server";

import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export type RegisterState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Duplicate registrations (same phone, same event) are allowed on purpose —
// families often register together under one phone number. No pre-check
// query, which would need its own security-definer RPC (registrations has
// no public SELECT policy) for no real product benefit.
export async function registerForEvent(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const eventId = String(formData.get("event_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const attendeeCount = Number(formData.get("attendee_count"));

  if (!UUID_RE.test(eventId)) {
    return {
      status: "error",
      message: "Something went wrong — please go back to the schedule and try again.",
    };
  }
  if (!name || !phone) {
    return { status: "error", message: "Name(s) and phone number are required." };
  }
  if (!Number.isInteger(attendeeCount) || attendeeCount < 1) {
    return { status: "error", message: "Number of people attending must be at least 1." };
  }
  if (!isSupabaseConfigured) {
    return { status: "error", message: "Registration isn't available yet — please try again later." };
  }

  const { error } = await supabase.from("registrations").insert({
    event_id: eventId,
    name,
    phone,
    attendee_count: attendeeCount,
  });

  if (error) {
    console.warn("[registerForEvent]", error.message);
    return { status: "error", message: "Registration failed — please try again." };
  }

  return { status: "success" };
}
