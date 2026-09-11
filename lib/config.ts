export const SITE_NAME = "Sri Siddhi Vinayaka";

// TODO(committee): confirm these once final — the countdown, "today's
// highlights", and the festival-status banner all key off these two dates.
// Venue is in Henrico, VA — Eastern time, not IST. Both dates fall in EDT
// (UTC-4); if the festival ever moves outside DST (after ~early Nov), these
// offsets need to become -05:00 (EST) instead.
//
// Starts at midnight, not some arbitrary morning hour — that's when the day
// of the festival begins, even if the first pooja itself is later that day.
export const FESTIVAL_START = new Date("2026-09-14T00:00:00-04:00");
// Exclusive upper bound: the festival runs through all of Sept 25, so this
// is the instant Sept 26 begins.
export const FESTIVAL_END = new Date("2026-09-26T00:00:00-04:00");

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
