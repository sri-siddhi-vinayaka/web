import Link from "next/link";
import type { ComponentType } from "react";
import CountdownTimer from "@/components/CountdownTimer";
import GaneshaPhoto from "@/components/GaneshaPhoto";
import NotificationOptIn from "@/components/NotificationOptIn";
import ScrollIcon from "@/components/icons/ScrollIcon";
import ClipboardIcon from "@/components/icons/ClipboardIcon";
import ModakIcon from "@/components/icons/ModakIcon";
import { getEvents, getTodayHighlights } from "@/lib/events";
import { FESTIVAL_END, FESTIVAL_START, VENUE_MAPS_URL } from "@/lib/config";

// "Today's highlights" must roll over with the calendar date on its own, with
// no admin action to hang a revalidation off — static prerendering would
// freeze it to whatever day the last deploy happened to run on.
export const dynamic = "force-dynamic";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
  });
}

// "Mythology" (and its /mythology route) removed for now — out of scope,
// revisit later. 32 forms + mantras still live on /about-ganesha. ScrollIcon
// (not VinayakaIcon, already the header logo just above) keeps this tile
// visually distinct from the brand mark sitting right on top of it.
const QUICK_LINKS: { href: string; label: string; Icon: ComponentType<{ className?: string }> }[] = [
  { href: "/about-ganesha", label: "About Ganesha", Icon: ScrollIcon },
  { href: "/register/pooja", label: "Pooja Registration", Icon: ClipboardIcon },
  { href: "/register/food", label: "Food Registration", Icon: ModakIcon },
];

export default async function Home() {
  const events = await getEvents();
  const highlights = getTodayHighlights(events);

  return (
    <div className="flex flex-col gap-10 px-4 py-10 sm:px-6">
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 text-center">
        <h1 className="text-lg font-semibold tracking-tight text-brand sm:text-xl">
          Sri Siddhi Vinayaka Youth Association
        </h1>
        <p className="font-display text-3xl text-accent sm:text-4xl">
          Ganesh Chaturthi 2026
        </p>

        <GaneshaPhoto />

        <p className="max-w-md text-left text-base text-muted">
          Welcome! Every year we bring the community together to celebrate
          Ganesh Chaturthi with pooja, fun events, and community
          spirit. This site is your guide to the celebration — browse the
          schedule, register for events, watch live darshan, and stay
          updated, all in one place.
        </p>
        <CountdownTimer
          start={FESTIVAL_START.toISOString()}
          end={FESTIVAL_END.toISOString()}
        />
      </section>

      <section className="mx-auto grid w-full max-w-3xl grid-cols-3 gap-2">
        {QUICK_LINKS.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl bg-surface p-2 text-center shadow-sm ring-1 ring-border transition-colors hover:bg-surface-muted"
          >
            <Icon className="h-6 w-6 text-brand" />
            <span className="text-xs font-medium text-foreground">{label}</span>
          </Link>
        ))}
      </section>

      <section className="mx-auto w-full max-w-3xl rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-border">
        <h2 className="text-lg font-semibold text-foreground">
          Today&apos;s highlights
        </h2>
        {highlights.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            The full day-by-day schedule is being finalized — check back here or
            the{" "}
            <Link href="/schedule" className="font-medium text-primary underline underline-offset-2">
              schedule page
            </Link>{" "}
            soon.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {highlights.map((event) => (
              <li key={event.id} className="text-sm text-muted">
                <span className="font-medium text-foreground">{event.title}</span>
                {" — "}
                {formatTime(event.start_time)}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mx-auto w-full max-w-3xl rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-border">
        <h2 className="text-lg font-semibold text-foreground">Stay in the loop</h2>
        <div className="mt-2">
          <NotificationOptIn />
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl rounded-2xl bg-surface p-6 text-center shadow-sm ring-1 ring-border">
        <h2 className="text-lg font-semibold text-foreground">We&apos;d Love to See You</h2>
        <p className="mt-2 text-sm text-muted">
          A question, a helping hand, or just a moment for Ganpati&apos;s
          blessings — whatever brings you here, there&apos;s a place for you.
          Swing by the venue, or send us a note.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link
            href="/contact"
            className="inline-block min-h-11 rounded-lg bg-surface-muted px-4 py-2 text-sm font-medium text-foreground ring-1 ring-border transition-colors hover:bg-border"
          >
            Contact Us
          </Link>
          <a
            href={VENUE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block min-h-11 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-contrast transition-opacity hover:opacity-90"
          >
            Venue
          </a>
        </div>
      </section>
    </div>
  );
}
