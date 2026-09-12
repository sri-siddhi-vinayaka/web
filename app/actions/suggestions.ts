"use server";

import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export type SuggestionState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

// No pre-check, no rate limiting — same posture as food/pooja registration.
// Name and contact are both optional: a suggestion shouldn't require
// identifying yourself any more than registering for a day does.
export async function submitSuggestion(
  _prevState: SuggestionState,
  formData: FormData
): Promise<SuggestionState> {
  const message = String(formData.get("message") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const contact = String(formData.get("contact") ?? "").trim();

  if (!message) {
    return { status: "error", message: "Please write a suggestion before submitting." };
  }
  if (message.length > 2000) {
    return { status: "error", message: "That's a bit long — please keep it under 2000 characters." };
  }
  if (!isSupabaseConfigured) {
    return { status: "error", message: "Suggestions aren't available yet — please try again later." };
  }

  const { error } = await supabase.from("suggestions").insert({
    message,
    name: name || null,
    contact: contact || null,
  });

  if (error) {
    console.warn("[submitSuggestion]", error.message);
    return { status: "error", message: "Couldn't send that — please try again." };
  }

  return { status: "success" };
}
