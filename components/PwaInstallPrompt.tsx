"use client";

import { useEffect, useState } from "react";
import InstallIcon from "@/components/icons/InstallIcon";

// Chrome/Edge/Android fire this instead of installing immediately, so the
// browser's own UI can be replaced with ours; it's not in lib.dom.d.ts yet.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISSED_KEY = "pwa-install-dismissed";

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

// Registers the service worker itself (idempotent — NotificationOptIn may
// have already done this on the Home page) since a registered SW covering
// start_url is one of Chrome's installability requirements; this banner
// shouldn't depend on that other, unrelated feature having rendered first.
export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [iosInstructionsOpen, setIosInstructionsOpen] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [showIosBanner, setShowIosBanner] = useState(false);

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
      if (isIos()) setShowIosBanner(true);
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
    if (outcome === "accepted") dismiss();
  }

  if (dismissed || (!deferredPrompt && !showIosBanner)) return null;

  return (
    <section className="mx-auto w-full max-w-3xl rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border">
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
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted">
              <li>Tap the Share button in Safari&apos;s toolbar</li>
              <li>Scroll down and tap &quot;Add to Home Screen&quot;</li>
              <li>Tap &quot;Add&quot; to confirm</li>
            </ol>
            <button
              type="button"
              onClick={() => {
                setIosInstructionsOpen(false);
                dismiss();
              }}
              className="mt-4 min-h-11 w-full rounded-lg bg-surface-muted px-4 py-2 text-sm font-medium text-foreground ring-1 ring-border transition-colors hover:bg-border"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
