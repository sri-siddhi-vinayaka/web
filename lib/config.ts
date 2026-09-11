export const SITE_NAME = "Sri Siddhi Vinayaka";

// TODO(committee): set to this year's actual Ganesh Chaturthi start
// date/time once confirmed — the countdown and schedule both key off this.
export const FESTIVAL_START = new Date("2026-09-14T06:00:00+05:30");

// TODO(committee): confirm the live stream platform (YouTube vs Facebook
// Live) and paste the embeddable URL once it exists. Left empty until then —
// the live page shows a "not started yet" message rather than a broken embed.
export const LIVE_STREAM_URL = "";

// TODO(committee): confirm the donation coordinator's name and number.
// Donations are coordinated off-app by phone — never add a payment gateway.
export const DONATION_CONTACT = {
  name: "",
  phone: "",
};

export const VENUE_ADDRESS = "2526 Kilpeck Dr, Henrico, VA";
export const VENUE_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(VENUE_ADDRESS)}`;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/schedule", label: "Schedule" },
  { href: "/live", label: "Live Darshan" },
  { href: "/gallery", label: "Gallery" },
  { href: "/announcements", label: "Announcements" },
  { href: "/donate", label: "Donate" },
  { href: "/contact", label: "Contact" },
] as const;
