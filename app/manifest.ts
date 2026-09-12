import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description:
      "Schedule, pooja registration, live darshan, and updates for the Sri Siddhi Vinayaka Youth Association's Ganesh Chaturthi celebration.",
    start_url: "/",
    display: "standalone",
    background_color: "#fff4e6",
    theme_color: "#6e1b33",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
