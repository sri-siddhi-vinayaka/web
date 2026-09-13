"use client";

import { createContext, useContext, useEffect, useState, type ComponentType, type ReactNode } from "react";
import Link from "next/link";
import BellIcon from "@/components/icons/BellIcon";
import CalendarIcon from "@/components/icons/CalendarIcon";
import ChatIcon from "@/components/icons/ChatIcon";
import ClipboardIcon from "@/components/icons/ClipboardIcon";
import ConchIcon from "@/components/icons/ConchIcon";
import ModakIcon from "@/components/icons/ModakIcon";
import PhotoIcon from "@/components/icons/PhotoIcon";
import TrophyIcon from "@/components/icons/TrophyIcon";
import VinayakaIcon from "@/components/icons/VinayakaIcon";
import YouTubeIcon from "@/components/icons/YouTubeIcon";

type TourStep = {
  Icon: ComponentType<{ className?: string }>;
  title: string;
  body: string;
  href: string;
  linkLabel: string;
};

const TourGuideContext = createContext<(() => void) | null>(null);

// Lets any page open the tour without needing to know how it works — the
// nav trigger (TourGuideButton) is the only caller today, but a future
// "first visit" auto-open could call this too.
export function useTourGuide(): () => void {
  const openTour = useContext(TourGuideContext);
  if (!openTour) throw new Error("useTourGuide must be used within TourGuideProvider");
  return openTour;
}

// Mounted once in the root layout, wrapping the whole app, so the trigger
// button in SiteHeader/MobileNav and the modal itself share one open/step
// state regardless of which page is currently showing. `sthapanaDate` and
// `ladooDate` come from the server (lib/config.ts's FESTIVAL_START/END,
// formatted) rather than being computed here, same reasoning as
// CountdownTimer's start/end props — keeps a Date off this client
// component's own module.
export default function TourGuideProvider({
  sthapanaDate,
  ladooDate,
  children,
}: {
  sthapanaDate: string;
  ladooDate: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  const steps: TourStep[] = [
    {
      Icon: VinayakaIcon,
      title: "Welcome!",
      body: "This app is your guide to the Sri Siddhi Vinayaka Youth Association's Ganesh Chaturthi celebration — schedule, registration, live darshan, and more, all in one place.",
      href: "/",
      linkLabel: "Back to Home",
    },
    {
      Icon: ConchIcon,
      title: "Darshan is walk-in, any time",
      body: `No registration, no headcount — just come by any time from Ganesh Sthapana (${sthapanaDate}) through the Ladoo celebration (${ladooDate}).`,
      href: "/",
      linkLabel: "Back to Home",
    },
    {
      Icon: CalendarIcon,
      title: "Full day-by-day schedule",
      body: "See every pooja and event across all the nights of the celebration — pick a day, then register right from there.",
      href: "/schedule",
      linkLabel: "Open Schedule",
    },
    {
      Icon: ClipboardIcon,
      title: "Pooja Registration",
      body: "Reserve your spot for a specific day's pooja. The admin team reviews and confirms each sign-up — see who else has already secured that day.",
      href: "/register/pooja",
      linkLabel: "Register for Pooja",
    },
    {
      Icon: ModakIcon,
      title: "Food Registration",
      body: "Bringing a dish to share? Sign up for the day you'll bring it, and see what's already claimed for that day.",
      href: "/register/food",
      linkLabel: "Register for Food",
    },
    {
      Icon: YouTubeIcon,
      title: "Live Darshan",
      body: "Watch Day 1's Ganesh Sthapana & Pooja live, right from this site — no separate app or login needed.",
      href: "/live",
      linkLabel: "Watch Live",
    },
    {
      Icon: PhotoIcon,
      title: "Gallery",
      body: "Browse this year's photos, plus highlight videos and reels from past celebrations, year by year.",
      href: "/gallery",
      linkLabel: "Open Gallery",
    },
    {
      Icon: TrophyIcon,
      title: "Cricket",
      body: "Relive match highlights from the association's cricket tournaments, with league standings for the latest season.",
      href: "/cricket",
      linkLabel: "Open Cricket",
    },
    {
      Icon: BellIcon,
      title: "Stay updated",
      body: "Check Announcements for the latest updates, and turn on notifications from the home page to get notified the moment something new is posted.",
      href: "/announcements",
      linkLabel: "Open Announcements",
    },
    {
      Icon: ChatIcon,
      title: "We'd love to hear from you",
      body: "Have an idea or a question? Share it on Suggestions, or reach out on Contact — you're all set to explore the rest of the app!",
      href: "/suggestions",
      linkLabel: "Open Suggestions",
    },
  ];

  function openTour() {
    setStep(0);
    setOpen(true);
  }

  function close() {
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") setStep((current) => Math.min(current + 1, steps.length - 1));
      if (event.key === "ArrowLeft") setStep((current) => Math.max(current - 1, 0));
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
    // steps.length is a fixed constant every render, safe to omit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const current = steps[step];
  const isFirst = step === 0;
  const isLast = step === steps.length - 1;

  return (
    <TourGuideContext.Provider value={openTour}>
      {children}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Quick tour guide"
          onClick={close}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="flex w-full max-w-sm flex-col rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-border"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close tour"
              className="ml-auto flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
            >
              ✕
            </button>

            <current.Icon className="mx-auto h-14 w-14 text-brand" />
            <h2 className="mt-3 text-center text-lg font-bold text-foreground">{current.title}</h2>
            <p className="mt-2 text-center text-sm text-muted">{current.body}</p>

            <div className="mt-4 flex justify-center gap-1.5" aria-hidden="true">
              {steps.map((_, index) => (
                <span
                  key={index}
                  className={`h-1.5 w-1.5 rounded-full ${index === step ? "bg-primary" : "bg-border"}`}
                />
              ))}
            </div>

            <Link
              href={current.href}
              onClick={close}
              className="mt-4 min-h-11 rounded-lg bg-surface-muted px-4 py-2 text-center text-sm font-medium text-foreground ring-1 ring-border transition-colors hover:bg-border"
            >
              {current.linkLabel}
            </Link>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setStep((value) => Math.max(value - 1, 0))}
                disabled={isFirst}
                className="min-h-11 flex-1 rounded-lg px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-muted disabled:opacity-40"
              >
                Back
              </button>
              {isLast ? (
                <button
                  type="button"
                  onClick={close}
                  className="min-h-11 flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-contrast transition-opacity hover:opacity-90"
                >
                  Done
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep((value) => Math.min(value + 1, steps.length - 1))}
                  className="min-h-11 flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-contrast transition-opacity hover:opacity-90"
                >
                  Next
                </button>
              )}
            </div>

            <p className="mt-2 text-center text-xs text-muted">
              Step {step + 1} of {steps.length}
            </p>
          </div>
        </div>
      )}
    </TourGuideContext.Provider>
  );
}
