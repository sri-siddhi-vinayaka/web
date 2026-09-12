// Shared by app/icon.tsx, app/apple-icon.tsx, and the dedicated manifest
// icon routes (app/icon-192.png, app/icon-512.png) — all generated via
// next/og's ImageResponse (Satori), which renders outside this app's own
// CSS, so VinayakaIcon's `currentColor` / `var(--color-*)` references
// wouldn't resolve here. Colors are hardcoded to match its light-mode
// values instead (see app/globals.css: --brand, --primary, --surface-muted).
//
// The glyph itself already nearly touches the edges of its own 64x64
// viewBox (see components/icons/VinayakaIcon.tsx) — rendered at 65% of the
// requested canvas size here, leaving a generous margin so it isn't clipped
// by OS icon masking (circle/squircle/adaptive-icon crops).
export function AppIconGlyph({ size }: { size: number }) {
  const glyphSize = Math.round(size * 0.65);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fff4e6",
      }}
    >
      <svg width={glyphSize} height={glyphSize} viewBox="0 0 64 64">
        <circle cx="14" cy="30" r="10" fill="#6e1b33" />
        <circle cx="50" cy="30" r="10" fill="#6e1b33" />
        <circle cx="14" cy="30" r="5.5" fill="#fff4e6" />
        <circle cx="50" cy="30" r="5.5" fill="#fff4e6" />
        <ellipse cx="32" cy="36" rx="15" ry="14" fill="#6e1b33" />
        <path d="M23 21 Q32 11 41 21" stroke="#6e1b33" strokeWidth="4" strokeLinecap="round" fill="none" />
        <circle cx="32" cy="15" r="3.2" fill="#b54708" />
        <ellipse cx="32" cy="27" rx="1.8" ry="4" fill="#b54708" />
        <path d="M24.5 35 Q27 31.5 29.5 35" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <path d="M34.5 35 Q37 31.5 39.5 35" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <path
          d="M30 48 C27 55 31 59.5 37 57.5 C41.5 56 40 50 35.5 51.5"
          stroke="#6e1b33"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );
}
