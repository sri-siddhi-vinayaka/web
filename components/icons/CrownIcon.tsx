export default function CrownIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Crown, representing Ganesha as a beloved child of the gods"
    >
      {/* three-peak crown, base and jewels */}
      <path d="M10 44 L14 22 L26 34 L32 16 L38 34 L50 22 L54 44 Z" fill="currentColor" />
      <rect x="8" y="44" width="48" height="8" rx="2" fill="currentColor" />
      <circle cx="32" cy="16" r="3.4" fill="var(--color-primary)" />
      <circle cx="20" cy="30" r="2.6" fill="var(--color-primary)" />
      <circle cx="44" cy="30" r="2.6" fill="var(--color-primary)" />
    </svg>
  );
}
