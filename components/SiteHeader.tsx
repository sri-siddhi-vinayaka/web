import Link from "next/link";
import CompassIcon from "@/components/icons/CompassIcon";
import VinayakaIcon from "@/components/icons/VinayakaIcon";
import MobileNav from "@/components/MobileNav";
import TourGuideButton from "@/components/TourGuideButton";
import { NAV_LINKS, SITE_NAME } from "@/lib/config";
import { isLiveDarshanActive } from "@/lib/events";

export default function SiteHeader() {
  // Live Darshan drops out of the nav once Day 1 (ET) is over — the
  // recording has moved to Gallery by then (see isLiveDarshanActive).
  // Computed here, not inside MobileNav, so both the desktop row and the
  // mobile dropdown below share one decision instead of two client/server
  // copies drifting apart.
  const links = isLiveDarshanActive()
    ? NAV_LINKS
    : NAV_LINKS.filter((link) => link.href !== "/live");

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-brand" aria-label={SITE_NAME}>
            <VinayakaIcon className="h-8 w-8" />
          </Link>

          {/* Always visible, on every screen size, right next to the logo —
              a first-time visitor's most likely next tap, not a line item
              buried at the end of a nav list (desktop) or behind the
              hamburger menu (mobile) where it's easy to miss entirely. */}
          <TourGuideButton
            aria-label="Take a quick tour of the app"
            className="flex min-h-11 items-center gap-1 rounded-full bg-primary/10 px-3 text-xs font-semibold text-primary ring-1 ring-primary/30 transition-colors hover:bg-primary/20"
          >
            <CompassIcon className="h-4 w-4" />
            Tour
          </TourGuideButton>
        </div>

        {/* Six nav items don't fit on a phone without wrapping or a scroll
            hint — collapse to a dropdown below sm:, where there's room for
            the full row instead. */}
        <nav className="hidden gap-1 text-sm sm:flex">
          {links.slice(1).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 font-medium text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="sm:hidden">
          <MobileNav links={links} />
        </div>
      </div>
    </header>
  );
}
