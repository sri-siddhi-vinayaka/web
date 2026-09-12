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

export const VENUE_ADDRESS = "2526 Kilpeck Dr, Henrico, VA";
export const VENUE_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(VENUE_ADDRESS)}`;

// Highlights from past celebrations, shown on the Gallery page below the
// admin-managed photo grid. Linked out rather than embedded or scraped:
// Instagram's oEmbed API now requires an app-review access token we don't
// have, and a script-tag embed would violate the no-heavy-client-bundles
// rule. The 2025 YouTube recording is the exception — a plain <iframe> costs
// nothing extra to embed inline (same pattern as the live darshan embed).
export const PREVIOUS_YEARS: {
  year: number;
  instagramUrl: string;
  youtubeEmbedUrl?: string;
}[] = [
  {
    year: 2025,
    instagramUrl: "https://www.instagram.com/reel/DN3r3SWwu6G/?igsh=c2d3NnZrdXEwNHZy",
    youtubeEmbedUrl: "https://www.youtube.com/embed/vYQ5CNzOXCU",
  },
  {
    year: 2024,
    instagramUrl: "https://www.instagram.com/reel/C_mstEKAYU-/?igsh=eGM1NXplaTFmNzY1",
  },
  {
    year: 2023,
    instagramUrl: "https://www.instagram.com/reel/CxXMpiAOp9z/?igsh=MWU2OWFvMzd2MDc3Nw==",
  },
  {
    year: 2022,
    instagramUrl: "https://www.instagram.com/reel/Ch6T6z2jlid/?igsh=M2x5NTVyeTMyOGUz",
  },
];

// Memories from the association's cricket tournaments, newest year first
// (manually ordered, same convention as PREVIOUS_YEARS above). Plain links
// rather than embeds, even for the YouTube ones — unlike PREVIOUS_YEARS'
// single video per year, a tournament has several (semifinals, final, post
// -match presentation, ...), and embedding every one would be exactly the
// "heavy client bundle" / mobile-data cost this app deliberately avoids.
export const CRICKET_TOURNAMENTS: {
  year: number;
  leagueUrl: string;
  videos: { label: string; url: string }[];
}[] = [
  {
    year: 2026,
    leagueUrl: "https://cricclubs.com/HenricoCricketLeague/viewLeague.do?league=23&clubId=23078",
    videos: [
      { label: "SF1 match", url: "https://youtu.be/d_Krr3FiSe0?si=6AizGLadW3Oj_ud-" },
      { label: "SF2 match", url: "https://youtu.be/OM7HlY-3D_Y?si=JnFgPealB6RKMvMD" },
      { label: "Final match", url: "https://youtu.be/zXLkFQSUBOQ?si=RW3ySjMdaLLvDK0E" },
      { label: "Post match presentation", url: "https://youtu.be/mxqztePQpC8?si=kAJPTyR2gWPhgC_U" },
    ],
  },
  {
    year: 2025,
    leagueUrl: "https://cricclubs.com/HenricoCricketLeague/viewLeague.do?league=22&clubId=23078",
    videos: [
      { label: "SF1 match", url: "https://www.youtube.com/live/YTa68t1GOi0?si=ygjy2WLqruJn46wO" },
      { label: "SF2 match", url: "https://www.youtube.com/live/219MkaRja4s?si=E5eAsKGXMPED12S6" },
      { label: "Final match", url: "https://www.youtube.com/live/GG8e-pDgYMk?si=75usDEUopVAT_8-t" },
      { label: "Fun event: Ball out challenge", url: "https://www.youtube.com/live/2BaLLBTkbiQ?si=TrSuCgJ-sZM9Oe71" },
      { label: "Post match presentation", url: "https://www.youtube.com/live/vLsXFjW4u_8?si=UyQ-TcGAOwA_l7dw" },
    ],
  },
];

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/schedule", label: "Schedule" },
  { href: "/live", label: "Live Darshan" },
  { href: "/gallery", label: "Gallery" },
  { href: "/cricket", label: "Cricket" },
  { href: "/announcements", label: "Announcements" },
  { href: "/suggestions", label: "Suggestions" },
  { href: "/contact", label: "Contact" },
] as const;
