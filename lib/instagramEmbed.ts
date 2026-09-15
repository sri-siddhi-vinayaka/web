// Shared by every client component that renders an Instagram embed.js +
// <blockquote> card (see lib/config.ts's comment on PREVIOUS_YEARS for why
// Instagram needs this instead of a plain <iframe>). Module-level promise
// cache means the script tag is only ever added once per page load, no
// matter how many Instagram tiles get tapped.

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

let instagramScriptPromise: Promise<void> | null = null;

export function loadInstagramEmbedScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.instgrm) return Promise.resolve();
  if (instagramScriptPromise) return instagramScriptPromise;

  instagramScriptPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    script.onload = () => resolve();
    document.body.appendChild(script);
  });
  return instagramScriptPromise;
}
