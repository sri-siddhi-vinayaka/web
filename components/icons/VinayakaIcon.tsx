export default function VinayakaIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Vinayaka"
    >
      {/* ears, peeking out behind the head */}
      <circle cx="14" cy="30" r="10" fill="currentColor" />
      <circle cx="50" cy="30" r="10" fill="currentColor" />
      <circle cx="14" cy="30" r="5.5" fill="var(--color-surface-muted)" />
      <circle cx="50" cy="30" r="5.5" fill="var(--color-surface-muted)" />

      {/* head */}
      <ellipse cx="32" cy="36" rx="15" ry="14" fill="currentColor" />

      {/* tiara */}
      <path
        d="M23 21 Q32 11 41 21"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="32" cy="15" r="3.2" fill="var(--color-primary)" />

      {/* tilaka */}
      <ellipse cx="32" cy="27" rx="1.8" ry="4" fill="var(--color-primary)" />

      {/* closed, happy eyes */}
      <path
        d="M24.5 35 Q27 31.5 29.5 35"
        stroke="var(--color-surface)"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M34.5 35 Q37 31.5 39.5 35"
        stroke="var(--color-surface)"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />

      {/* trunk, curling in */}
      <path
        d="M30 48 C27 55 31 59.5 37 57.5 C41.5 56 40 50 35.5 51.5"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
