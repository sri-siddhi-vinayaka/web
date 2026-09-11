export default function ConchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Conch shell, symbolizing chanting and sound"
    >
      {/* shell body, a curling spiral */}
      <path
        d="M22 44 C10 40 8 26 18 18 C28 10 42 12 47 22 C51 30 47 38 39 39 C33 40 29 35 32 30 C34 27 38 27 39 30"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* mouthpiece, flaring out to the right */}
      <path
        d="M22 44 C30 50 42 52 52 46"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      {/* sound ripples */}
      <path
        d="M55 40 Q60 46 55 52"
        stroke="var(--color-primary)"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
