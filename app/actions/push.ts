"use server";

import { isSupabaseConfigured, supabase } from "@/lib/supabase";

// Called directly from a client component (not a form) — see
// components/NotificationOptIn.tsx. Basic shape validation only; the real
// security boundary against a malicious endpoint is the allowlist in
// lib/webpush.ts, checked again right before ever sending anything there —
// this insert path can't be trusted to have been called by a real browser.
export async function subscribeToPush(subscription: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}): Promise<{ ok: boolean }> {
  if (
    !isSupabaseConfigured ||
    typeof subscription?.endpoint !== "string" ||
    !subscription.endpoint.startsWith("https://") ||
    typeof subscription?.keys?.p256dh !== "string" ||
    typeof subscription?.keys?.auth !== "string"
  ) {
    return { ok: false };
  }

  const { error } = await supabase.from("push_subscriptions").insert({
    endpoint: subscription.endpoint,
    p256dh: subscription.keys.p256dh,
    auth: subscription.keys.auth,
  });

  // Duplicate endpoint (already subscribed) isn't an error worth surfacing.
  if (error && !error.message.includes("duplicate key")) {
    console.warn("[subscribeToPush]", error.message);
    return { ok: false };
  }

  return { ok: true };
}
