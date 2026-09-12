"use client";

import { useEffect, useState } from "react";
import { subscribeToPush } from "@/app/actions/push";

type Status = "checking" | "unsupported" | "unconfigured" | "idle" | "subscribing" | "subscribed" | "denied" | "error";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

// The one client island for Web Push: registers the service worker (public/sw.js),
// and on request subscribes the browser and hands the subscription to
// subscribeToPush() (app/actions/push.ts) to store. Renders nothing if the
// browser doesn't support push, or if NEXT_PUBLIC_VAPID_PUBLIC_KEY isn't set —
// same fail-soft posture as the rest of this app's optional integrations.

// How long the "you're subscribed" confirmation stays visible after a
// successful enable before it starts fading, and how long the fade itself
// takes — the section unmounts once both have elapsed.
const CONFIRMATION_MS = 5000;
const FADE_MS = 400;

export default function NotificationOptIn() {
  const [status, setStatus] = useState<Status>("checking");
  // True only right after handleEnable succeeds in this render — not when
  // determineStatus() finds an existing subscription on mount — so a repeat
  // visitor who already opted in doesn't see the confirmation replay.
  const [justSubscribed, setJustSubscribed] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Wrapped in an async function, with setStatus only ever called from
    // its resolution — not synchronously in the effect body — even the
    // early, non-await-needing branches (unconfigured/unsupported/denied)
    // go through this same asynchronous path.
    async function determineStatus(): Promise<Status> {
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) return "unconfigured";
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return "unsupported";
      if (Notification.permission === "denied") return "denied";

      const registration = await navigator.serviceWorker.register("/sw.js");
      const existing = await registration.pushManager.getSubscription();
      return existing ? "subscribed" : "idle";
    }

    determineStatus()
      .then((result) => {
        if (!cancelled) setStatus(result);
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!justSubscribed) return;
    const fadeTimer = setTimeout(() => setFadingOut(true), CONFIRMATION_MS - FADE_MS);
    const removeTimer = setTimeout(() => {
      setJustSubscribed(false);
      setFadingOut(false);
    }, CONFIRMATION_MS);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [justSubscribed]);

  async function handleEnable() {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) return;

    setStatus("subscribing");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "idle");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const result = await subscribeToPush(subscription.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } });
      setStatus(result.ok ? "subscribed" : "error");
      if (result.ok) setJustSubscribed(true);
    } catch {
      setStatus("error");
    }
  }

  // Once subscribed there's nothing actionable left to show. A subscription
  // found already in place on mount (a repeat visitor) hides right away; one
  // that just succeeded gets a brief confirmation first (see justSubscribed
  // below) so the visitor sees their tap actually did something, then it
  // hides itself the same way. Section wrapper (owned here, not by the
  // parent page) included either way.
  if (status === "checking" || status === "unsupported" || status === "unconfigured") {
    return null;
  }
  if (status === "subscribed" && !justSubscribed) {
    return null;
  }

  return (
    <section
      className={`mx-auto w-full max-w-3xl rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-border transition-opacity duration-[400ms] ${
        fadingOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <h2 className="text-lg font-semibold text-foreground">Stay in the loop</h2>
      <div className="mt-2">
        {status === "subscribed" ? (
          <p className="text-sm text-muted">You&apos;re all set — you&apos;ll be notified here when something new is posted.</p>
        ) : status === "denied" ? (
          <p className="text-sm text-muted">
            Notifications are blocked in your browser settings — enable them there to get notified about new posts.
          </p>
        ) : (
          <div className="flex flex-col items-start gap-2">
            <p className="text-sm text-muted">Get notified here when something new is posted.</p>
            <button
              type="button"
              onClick={handleEnable}
              disabled={status === "subscribing"}
              className="min-h-11 rounded-lg bg-surface-muted px-4 py-2 text-sm font-medium text-foreground ring-1 ring-border transition-colors hover:bg-border disabled:opacity-60"
            >
              {status === "subscribing" ? "Enabling…" : "Enable notifications"}
            </button>
            {status === "error" && (
              <p className="text-sm font-medium text-danger">Something went wrong — please try again.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
