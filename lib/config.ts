export const SITE_NAME = "Sri Siddhi Vinayaka";

// TODO(committee): set to this year's actual Ganesh Chaturthi start
// date/time once confirmed — the countdown and schedule both key off this.
export const FESTIVAL_START = new Date("2026-09-14T06:00:00+05:30");

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/schedule", label: "Schedule" },
  { href: "/gallery", label: "Gallery" },
  { href: "/announcements", label: "Announcements" },
  { href: "/contact", label: "Contact" },
] as const;
