import type { Metadata } from "next";
import { Geist, Geist_Mono, Yatra_One } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import { SITE_NAME } from "@/lib/config";
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
};

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
        <SiteHeader />
        <main className="flex flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
