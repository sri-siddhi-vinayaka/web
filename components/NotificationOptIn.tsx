"use client";

import { useCallback, useEffect, useState } from "react";
import { requestPushSubscription } from "@/lib/pushClient";
import { SITE_NAME } from "@/lib/config";

type Status = "checking" | "unsupported" | "unconfigured" | "idle" | "subscribing" | "subscribed" | "denied" | "error";

// iOS keeps web push permission in the Settings app, not in Safari's own UI
// (Settings > Notifications > the installed app's name) — everything else
// (Chrome/Edge/Samsung Internet, Android and desktop alike) exposes it from
// the address bar's site-info icon. Same UA-token approach as isIos() in
// PwaInstallPrompt.tsx.
function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

// The one client island for Web Push: registers the service worker (public/sw.js),
// and on request subscribes the browser via requestPushSubscription()
// (lib/pushClient.ts — shared with PwaInstallPrompt, which chains that same
// call right after a successful Android install). Renders nothing if the
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
  const [rechecking, setRechecking] = useState(false);
  const [isIosDevice, setIsIosDevice] = useState(false);

  // Pulled out of the mount effect so it can also be re-run once a visitor
  // fixes a blocked permission from the browser's own site settings — either
  // detected live (the permissions.query listener below) or via the "Check
  // again" button that's the fallback where that API isn't supported.
  const determineStatus = useCallback(async (): Promise<Status> => {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) return "unconfigured";
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return "unsupported";
    if (Notification.permission === "denied") return "denied";

    const registration = await navigator.serviceWorker.register("/sw.js");
    const existing = await registration.pushManager.getSubscription();
    return existing ? "subscribed" : "idle";
  }, []);

  useEffect(() => {
    let cancelled = false;

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
  }, [determineStatus]);

  useEffect(() => {
    // Deferred the same way PwaInstallPrompt reads its own UA flags — never
    // synchronously in the effect body itself.
    const kickoff = setTimeout(() => setIsIosDevice(isIos()), 0);
    return () => clearTimeout(kickoff);
  }, []);

  // Chrome (desktop and Android) fires "change" on this if the visitor flips
  // the permission in the browser's own site settings, so a blocked visitor
  // gets the "Enable notifications" button back without reloading. Safari
  // doesn't support querying "notifications" this way — the "Check again"
  // button in the denied view below is the fallback for it.
  useEffect(() => {
    if (!("permissions" in navigator)) return;

    let cancelled = false;
    let permissionStatus: PermissionStatus | undefined;

    function handleChange() {
      determineStatus().then((result) => {
        if (!cancelled) setStatus(result);
      });
    }

    navigator.permissions
      .query({ name: "notifications" as PermissionName })
      .then((result) => {
        if (cancelled) return;
        permissionStatus = result;
        permissionStatus.addEventListener("change", handleChange);
      })
      .catch(() => {
        // Some browsers don't support this query name — ignore, "Check again" covers it.
      });

    return () => {
      cancelled = true;
      permissionStatus?.removeEventListener("change", handleChange);
    };
  }, [determineStatus]);

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
    setStatus("subscribing");
    try {
      const result = await requestPushSubscription();
      if (result === "dismissed") {
        setStatus("idle");
        return;
      }
      setStatus(result);
      if (result === "subscribed") setJustSubscribed(true);
    } catch {
      setStatus("error");
    }
  }

  // Re-runs the same check as mount, for a visitor who fixed a blocked
  // permission in the browser's own site settings and came back — doesn't
  // touch Notification.requestPermission(), so no browser will treat this
  // as a fresh prompt attempt.
  async function handleCheckAgain() {
    setRechecking(true);
    try {
      setStatus(await determineStatus());
    } catch {
      setStatus("error");
    } finally {
      setRechecking(false);
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
          <div className="flex flex-col items-start gap-2">
            <p className="text-sm text-muted">Notifications are blocked. To fix it:</p>
            {isIosDevice ? (
              <ol className="list-decimal space-y-1 pl-5 text-sm text-muted">
                <li>Open the Settings app on your device</li>
                <li>Tap Notifications</li>
                <li>Find &quot;{SITE_NAME}&quot; and turn on Allow Notifications</li>
              </ol>
            ) : (
              <ol className="list-decimal space-y-1 pl-5 text-sm text-muted">
                <li>Tap the icon next to the address bar (usually ⓘ or 🔒)</li>
                <li>Tap Permissions (or Notifications)</li>
                <li>Turn on Notifications</li>
              </ol>
            )}
            <p className="text-sm text-muted">Then tap below.</p>
            <button
              type="button"
              onClick={handleCheckAgain}
              disabled={rechecking}
              className="min-h-11 rounded-lg bg-surface-muted px-4 py-2 text-sm font-medium text-foreground ring-1 ring-border transition-colors hover:bg-border disabled:opacity-60"
            >
              {rechecking ? "Checking…" : "Check again"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-2">
            <p className="text-sm text-muted">
              Get notified here when something new is posted. Your browser will ask permission — tap Allow.
            </p>
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
