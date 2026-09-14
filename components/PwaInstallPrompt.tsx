"use client";

import { useEffect, useState } from "react";
import InstallIcon from "@/components/icons/InstallIcon";
import ShareIcon from "@/components/icons/ShareIcon";
import { requestPushSubscription, type PushSubscribeResult } from "@/lib/pushClient";

// Chrome/Edge/Android fire this instead of installing immediately, so the
// browser's own UI can be replaced with ours; it's not in lib.dom.d.ts yet.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

// Versioned (v2, not "pwa-install-dismissed") to invalidate every stale
// dismissal set before the "Got it" button stopped permanently hiding this
// banner — testers who saw the old, broken behavior would otherwise carry a
// dismissed flag on their phone forever, with a plain refresh (or even a new
// deploy) never clearing localStorage on its own. Bump again if this banner
// ever needs a second clean slate.
const DISMISSED_KEY = "pwa-install-dismissed-v2";

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari's own flag — it never fires beforeinstallprompt or reports
    // display-mode: standalone the same way Chrome does.
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

// Every iOS browser (Chrome, Firefox, Edge included) runs on Apple's WebKit
// under the hood, but "Add to Home Screen" is a Safari-exclusive feature —
// Apple doesn't expose it to any other iOS browser's UI at all, even though
// their user-agent strings still match isIos() above. Detected by each
// browser's own UA token (CriOS/FxiOS/EdgiOS/OPiOS) rather than assuming
// "Safari" is the default, so a real Safari UA (no such token) falls
// through correctly.
function isIosNonSafariBrowser(): boolean {
  return /CriOS|FxiOS|EdgiOS|OPiOS/i.test(navigator.userAgent);
}

// iPad's Safari toolbar (and its Share icon) sits at the top, next to the
// address bar — the opposite edge from iPhone's bottom toolbar — so the
// bounce-arrow hint below needs to point the right way for each.
function isIpad(): boolean {
  return /ipad/i.test(navigator.userAgent);
}

// Registers the service worker itself (idempotent — NotificationOptIn may
// have already done this on the Home page) since a registered SW covering
// start_url is one of Chrome's installability requirements; this banner
// shouldn't depend on that other, unrelated feature having rendered first.
export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [iosInstructionsOpen, setIosInstructionsOpen] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [showIosBanner, setShowIosBanner] = useState(false);
  const [isIosOtherBrowser, setIsIosOtherBrowser] = useState(false);
  const [isIpadDevice, setIsIpadDevice] = useState(false);
  const [notifResult, setNotifResult] = useState<PushSubscribeResult | null>(null);

  useEffect(() => {
    if (isStandalone()) return;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Fail-soft — a service worker isn't required for anything else this
        // app does today, so a registration error here shouldn't be loud.
      });
    }

    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);

    // Deferred via setTimeout, same trick CountdownTimer uses for its own
    // first tick — reading localStorage/UA synchronously in the effect body
    // itself (rather than from a callback) trips the set-state-in-effect
    // lint rule.
    const kickoff = setTimeout(() => {
      setDismissed(localStorage.getItem(DISMISSED_KEY) === "1");
      if (isIos()) {
        setShowIosBanner(true);
        setIsIosOtherBrowser(isIosNonSafariBrowser());
        setIsIpadDevice(isIpad());
      }
    }, 0);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      clearTimeout(kickoff);
    };
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, "1");
    setDismissed(true);
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome !== "accepted") return;

    dismiss();

    // Chained immediately after the same install tap, rather than making
    // the visitor separately notice and click NotificationOptIn's own card
    // later — folds two opt-ins into one flow. This still shows the
    // browser's real native permission dialog and still requires an
    // explicit Allow tap; nothing here skips or pre-answers it. iOS can't
    // do this at all: Safari has no Push API in a regular browser tab, so
    // this chaining is Android/Chrome-only — see the iOS instructions
    // dialog below instead, which sets that expectation for the next step.
    try {
      const result = await requestPushSubscription();
      if (result !== "unconfigured") setNotifResult(result);
    } catch {
      setNotifResult("error");
    }
  }

  if (!notifResult && (dismissed || (!deferredPrompt && !showIosBanner))) return null;

  return (
    <section className="mx-auto w-full max-w-3xl rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border">
      {notifResult ? (
        <div className="flex items-center gap-3">
          <InstallIcon className="h-8 w-8 shrink-0 text-brand" />
          <p className="flex-1 text-sm font-medium text-foreground">
            {notifResult === "subscribed"
              ? "Installed, and notifications are on — you're all set!"
              : notifResult === "denied"
                ? "Installed! Notifications are blocked in your browser settings — enable them there if you change your mind."
                : "Installed! You can turn on notifications any time further down this page."}
          </p>
          <button
            type="button"
            onClick={() => setNotifResult(null)}
            aria-label="Dismiss"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
          >
            ✕
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <InstallIcon className="h-8 w-8 shrink-0 text-brand" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Add to your home screen</p>
              <p className="text-xs text-muted">
                Install this app for quick, one-tap access — no app store needed.
              </p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={deferredPrompt ? handleInstall : () => setIosInstructionsOpen(true)}
              className="min-h-11 flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-contrast transition-opacity hover:opacity-90"
            >
              Install app
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="min-h-11 rounded-lg px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-muted"
            >
              Not now
            </button>
          </div>
        </>
      )}

      {iosInstructionsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Install instructions"
          onClick={() => setIosInstructionsOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-xs rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-border"
          >
            <p className="text-sm font-medium text-foreground">To install on iPhone/iPad:</p>
            {isIosOtherBrowser ? (
              // "Add to Home Screen" is a Safari-exclusive feature on iOS —
              // Apple doesn't expose it to any other browser's UI (Chrome,
              // Firefox, Edge all run on WebKit but don't get this feature),
              // so pointing someone at Share → Add to Home Screen here would
              // send them looking for an option that doesn't exist for them.
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted">
                <li>Tap the ••• or Share icon in this browser</li>
                <li>Choose &quot;Open in Safari&quot;</li>
                <li className="flex flex-wrap items-center gap-1">
                  In Safari, tap
                  <ShareIcon className="inline h-4 w-4 shrink-0 text-foreground" />
                  Share, then &quot;Add to Home Screen&quot;
                </li>
              </ol>
            ) : (
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted">
                <li className="flex flex-wrap items-center gap-1">
                  Tap
                  <ShareIcon className="inline h-4 w-4 shrink-0 text-foreground" />
                  Share in Safari&apos;s toolbar
                </li>
                <li>Scroll down and tap &quot;Add to Home Screen&quot;</li>
                <li>Tap &quot;Add&quot; to confirm</li>
              </ol>
            )}
            {/* Safari has no Push API at all in a regular browser tab —
                notifications only become available once this is opened from
                the Home Screen icon, so that's the honest next step to set
                here rather than a step this dialog could complete itself. */}
            <p className="mt-2 text-sm text-muted">
              Then open it from your Home Screen — that&apos;s where you&apos;ll be able to turn on notifications too.
            </p>
            {/* Deliberately doesn't call dismiss() — closing this dialog
                means "I read the steps," not "leave me alone forever," and
                conflating the two is exactly what silently hid this banner
                for anyone who saw it before this component's iOS fixes
                shipped, with no way back short of clearing site data.
                Actually installing already hides this banner correctly, via
                isStandalone() at the top of this component's effect. */}
            <button
              type="button"
              onClick={() => setIosInstructionsOpen(false)}
              className="mt-4 min-h-11 w-full rounded-lg bg-surface-muted px-4 py-2 text-sm font-medium text-foreground ring-1 ring-border transition-colors hover:bg-border"
            >
              Got it
            </button>
          </div>

          {/* Points at where the Share icon actually lives on real Safari
              chrome, which this dialog can't touch or highlight directly —
              bottom toolbar on iPhone, top toolbar (next to the address bar)
              on iPad. Purely decorative (pointer-events-none) so it never
              blocks the tap-outside-to-close behavior on the overlay. */}
          <div
            className={`pointer-events-none fixed inset-x-0 flex flex-col items-center gap-1 text-white ${isIpadDevice ? "top-3" : "bottom-3"}`}
          >
            {isIpadDevice && (
              <svg viewBox="0 0 24 24" className="h-6 w-6 animate-bounce" fill="currentColor">
                <path d="M12 4l-7 7h4v9h6v-9h4z" />
              </svg>
            )}
            <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-medium shadow-sm">
              {isIpadDevice ? "Share is up here, near the address bar" : "Share is down here, in your toolbar"}
            </span>
            {!isIpadDevice && (
              <svg viewBox="0 0 24 24" className="h-6 w-6 animate-bounce" fill="currentColor">
                <path d="M12 20l7-7h-4V4H9v9H5z" />
              </svg>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
