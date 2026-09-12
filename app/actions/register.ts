"use server";

import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export type RegisterState =
  | { status: "idle" }
  | { status: "success"; registrationStatus: "confirmed" | "waitlisted" }
  | { status: "error"; message: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Goes through the register_for_event() RPC (see
// supabase/migrations/20260913000000_pooja_slot_waitlist.sql) rather than a
// direct insert — only 2 confirmed sign-ups per day are guaranteed, the
// rest are waitlisted, and that count-then-decide-then-insert sequence has
// to be one atomic database operation to avoid a race between concurrent
// sign-ups. The RPC returns which one this sign-up became.
//
// Duplicate registrations (same phone, same event) are still allowed on
// purpose — families often register together under one phone number.
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

  const { data, error } = await supabase.rpc("register_for_event", {
    p_event_id: eventId,
    p_name: name,
    p_phone: phone,
    p_attendee_count: attendeeCount,
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
