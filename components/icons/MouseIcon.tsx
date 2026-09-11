export default function MouseIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Mushika, Ganesha's mouse"
    >
      {/* ears */}
      <circle cx="20" cy="20" r="7" fill="currentColor" />
      <circle cx="36" cy="16" r="7" fill="currentColor" />
      {/* body */}
      <ellipse cx="30" cy="38" rx="18" ry="14" fill="currentColor" />
      {/* snout */}
      <circle cx="47" cy="40" r="5" fill="currentColor" />
      {/* eye */}
      <circle cx="45" cy="37" r="1.6" fill="var(--color-surface)" />
      {/* tail, curling behind */}
      <path
        d="M14 42 C6 44 6 52 14 52 C20 52 18 46 12 47"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
