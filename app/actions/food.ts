"use server";

import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export type FoodRegisterState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const QUANTITY_SIZES = ["family_pack", "quarter_pack", "half_tray", "full_tray"] as const;

// No pre-check for an already-claimed dish before inserting — food_registrations
// has no public SELECT policy (see supabase/migrations/20260911195318_food_registrations.sql).
// Duplicate dishes on the same day are fine on purpose (plenty of visitors,
// repeats are expected) — the claimed-dishes table is for headcount
// planning, not deduplication. Phone is optional, same reasoning as Pooja
// registration.
export async function registerFood(
  _prevState: FoodRegisterState,
  formData: FormData
): Promise<FoodRegisterState> {
  const eventId = String(formData.get("event_id") ?? "");
  const contactName = String(formData.get("contact_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const dishName = String(formData.get("dish_name") ?? "").trim();
  const quantitySize = String(formData.get("quantity_size") ?? "");

  if (!UUID_RE.test(eventId)) {
    return { status: "error", message: "Please choose which day you'll bring your dish." };
  }
  if (!contactName || !dishName) {
    return {
      status: "error",
      message: "Contact name and dish are required.",
    };
  }
  if (!QUANTITY_SIZES.includes(quantitySize as (typeof QUANTITY_SIZES)[number])) {
    return { status: "error", message: "Please choose a rough size for how much you're bringing." };
  }
  if (!isSupabaseConfigured) {
    return { status: "error", message: "Registration isn't available yet — please try again later." };
  }

  const { error } = await supabase.from("food_registrations").insert({
    event_id: eventId,
    contact_name: contactName,
    phone: phone || null,
    dish_name: dishName,
    quantity_size: quantitySize,
  });

  if (error) {
    console.warn("[registerFood]", error.message);
    return { status: "error", message: "Registration failed — please try again." };
  }

  return { status: "success" };
}
