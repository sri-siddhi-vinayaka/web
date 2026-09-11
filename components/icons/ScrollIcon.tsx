export default function ScrollIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Scroll, representing Ganesha's stories"
    >
      {/* rolled scroll ends */}
      <rect x="9" y="14" width="11" height="36" rx="5.5" fill="currentColor" />
      <rect x="44" y="14" width="11" height="36" rx="5.5" fill="currentColor" />
      {/* body */}
      <rect x="14" y="18" width="36" height="28" rx="2" fill="currentColor" />
      {/* text lines */}
      <path
        d="M23 27h18 M23 32h18 M23 37h13"
        stroke="var(--color-surface)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
