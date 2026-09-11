export default function ModakIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Modak"
    >
      {/* pleated dome, the modak's signature shape */}
      <path
        d="M32 12 C20 12 12 24 12 38 C12 48 20 54 32 54 C44 54 52 48 52 38 C52 24 44 12 32 12 Z"
        fill="currentColor"
      />
      <path
        d="M32 12 L32 22 M24 14.5 L27 23 M40 14.5 L37 23 M18 21 L23 27 M46 21 L41 27"
        stroke="var(--color-surface)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* pinch at the top where the pleats meet */}
      <circle cx="32" cy="13" r="2.6" fill="var(--color-primary)" />
    </svg>
  );
}
