import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Yatra_One } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import TourGuideProvider from "@/components/TourGuideProvider";
import { FESTIVAL_END, FESTIVAL_START, SITE_NAME } from "@/lib/config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Festive display face for the "Ganesh Chaturthi 2026" headline — Geist's
// geometric tech-sans didn't fit that line.
const yatraOne = Yatra_One({
  variable: "--font-yatra-one",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "Schedule, pooja registration, live darshan, and updates for the Sri Siddhi Vinayaka Youth Association's Ganesh Chaturthi celebration.",
  // iOS ignores the PWA manifest (app/manifest.ts) for "Add to Home Screen"
  // and looks for these instead — without them, Safari falls back to a
  // screenshot of the page as the "icon" rather than app/apple-icon.tsx.
  appleWebApp: {
    title: SITE_NAME,
    statusBarStyle: "black-translucent",
  },
  // `appleWebApp.capable` (above) only renders the modern unprefixed
  // "mobile-web-app-capable" meta tag as of Next 16.3.0 (verified against
  // node_modules/next/dist/lib/metadata/metadata.js, not assumed) — Safari
  // still requires this legacy vendor-prefixed one to actually launch a
  // home-screen icon standalone. Without it, "Add to Home Screen" still
  // creates an icon, but tapping it opens a regular Safari tab (address bar
  // and all) instead of a full-screen app, which reads as "the install
  // didn't work." `other` is the documented escape hatch for a meta tag the
  // typed Metadata API doesn't cover.
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
};

// themeColor lives here, not in `metadata` above — deprecated there since
// Next.js 14 in favor of this separate export.
export const viewport: Viewport = {
  themeColor: "#6e1b33",
};

function formatDay(date: Date): string {
  return date.toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    month: "long",
    day: "numeric",
  });
}

// FESTIVAL_END is an exclusive upper bound (see its comment in
// lib/config.ts) — the festival's actual last day is one day before it.
const FESTIVAL_LAST_DAY = new Date(FESTIVAL_END.getTime() - 24 * 60 * 60 * 1000);

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${yatraOne.variable} h-full antialiased`}
    >
      {/* suppressHydrationWarning: browser extensions (Grammarly, etc.) inject
          data-gr-* attributes onto <body> before React hydrates — a false
          positive, not a real mismatch. Scoped to this element only, so it
          won't hide a genuine mismatch elsewhere in the tree. */}
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <TourGuideProvider sthapanaDate={formatDay(FESTIVAL_START)} ladooDate={formatDay(FESTIVAL_LAST_DAY)}>
          <SiteHeader />
          <main className="flex flex-1 flex-col">{children}</main>
        </TourGuideProvider>
      </body>
    </html>
  );
}
