import { subscribeToPush } from "@/app/actions/push";

export function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

// "dismissed" is the rare case where the permission dialog closed without a
// real answer (e.g. the user pressed Escape) rather than an explicit
// Allow/Block — worth trying again, not the same as "denied" or "error".
export type PushSubscribeResult = "subscribed" | "denied" | "dismissed" | "unconfigured" | "error";

// Shared by NotificationOptIn (the standing "Stay in the loop" card) and
// PwaInstallPrompt (which chains this immediately after a successful
// Android install, so installing and enabling notifications feel like one
// guided flow instead of two separately-discovered opt-ins) — one place
// owns the actual subscribe sequence so the two can't drift apart.
//
// Notification.requestPermission() below still shows the browser's own
// native permission dialog and still requires the visitor to tap Allow —
// no code can skip or pre-answer that part, on any browser. It also still
// needs to run from a real user gesture (a click handler, not on mount or
// after an awaited promise loses that trust), so callers must invoke this
// directly from one.
export async function requestPushSubscription(): Promise<PushSubscribeResult> {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) return "unconfigured";

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return permission === "denied" ? "denied" : "dismissed";

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  const result = await subscribeToPush(
    subscription.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } }
  );
  return result.ok ? "subscribed" : "error";
}
