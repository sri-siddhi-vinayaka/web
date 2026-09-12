import "server-only";
import webpush from "web-push";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

// Fail-soft, same posture as lib/notify.ts: no keys configured means new
// announcements still post fine, they just don't push. VAPID (not a
// third-party account) is what authenticates these — see the setup note in
// AGENTS.md for how these were generated.
const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT || "mailto:admin@localhost";

const isConfigured = Boolean(publicKey && privateKey);

if (isConfigured) {
  webpush.setVapidDetails(subject, publicKey!, privateKey!);
}

// `endpoint` comes from push_subscriptions, which anyone can insert an
// arbitrary value into (see the migration's comment) — sending a push
// means the server makes an HTTP request to that stored URL, so an
// unvalidated one is a straightforward SSRF vector (an internal service,
// a cloud metadata address, anything). Only ever send to a small,
// hardcoded allowlist of real push-service hosts, checked via URL parsing
// (not a substring/includes check, which something like
// "evil.com/fcm.googleapis.com" would slip past).
const ALLOWED_PUSH_HOSTS = [
  "fcm.googleapis.com", // Chrome, Edge, most Chromium/Android browsers
  "updates.push.services.mozilla.com", // Firefox
  "web.push.apple.com", // Safari (macOS/iOS 16.4+)
];

function isAllowedEndpoint(endpoint: string): boolean {
  try {
    const { hostname, protocol } = new URL(endpoint);
    return protocol === "https:" && ALLOWED_PUSH_HOSTS.includes(hostname);
  } catch {
    return false;
  }
}

export async function sendPushToAllSubscribers(
  title: string,
  body: string,
  url: string = "/announcements"
): Promise<void> {
  if (!isConfigured) {
    console.warn("[sendPushToAllSubscribers] VAPID keys not set — skipping push.");
    return;
  }
  if (!isSupabaseAdminConfigured) return;

  const { data: subscriptions, error } = await supabaseAdmin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth");

  if (error) {
    console.warn("[sendPushToAllSubscribers] failed to load subscriptions:", error.message);
    return;
  }

  const payload = JSON.stringify({ title, body, url });

  await Promise.allSettled(
    (subscriptions ?? []).map(async (sub) => {
      if (!isAllowedEndpoint(sub.endpoint)) {
        console.warn("[sendPushToAllSubscribers] refusing to send to disallowed endpoint host, deleting:", sub.id);
        await supabaseAdmin.from("push_subscriptions").delete().eq("id", sub.id);
        return;
      }

      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload
        );
      } catch (e) {
        const statusCode = (e as { statusCode?: number }).statusCode;
        // 404/410: the push service says this subscription is gone
        // (uninstalled, revoked, expired) — clean it up rather than
        // retrying it forever.
        if (statusCode === 404 || statusCode === 410) {
          await supabaseAdmin.from("push_subscriptions").delete().eq("id", sub.id);
        } else {
          console.warn("[sendPushToAllSubscribers] send failed:", sub.id, (e as Error).message);
        }
      }
    })
  );
}
