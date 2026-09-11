"use server";

import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export type FoodRegisterState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

// No pre-check for an already-claimed dish before inserting — food_registrations
// has no public SELECT policy (see infra/migrations/0003_food_registrations.sql),
// and two people bringing the same dish is a social coordination problem, not
// a data-integrity one. The claimed-dishes list on the page is there so people
// can self-select something different before they submit.
export async function registerFood(
  _prevState: FoodRegisterState,
  formData: FormData
): Promise<FoodRegisterState> {
  const contactName = String(formData.get("contact_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const dishName = String(formData.get("dish_name") ?? "").trim();

  if (!contactName || !phone || !dishName) {
    return {
      status: "error",
      message: "Contact name, phone number, and dish are all required.",
    };
  }
  if (!isSupabaseConfigured) {
    return { status: "error", message: "Registration isn't available yet — please try again later." };
  }

  const { error } = await supabase.from("food_registrations").insert({
    contact_name: contactName,
    phone,
    dish_name: dishName,
  });

  if (error) {
    console.warn("[registerFood]", error.message);
    return { status: "error", message: "Registration failed — please try again." };
  }

  return { status: "success" };
}
