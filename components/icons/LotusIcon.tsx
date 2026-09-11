export default function LotusIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Lotus, symbolizing Ganesha's many forms"
    >
      {/* center petal */}
      <path d="M32 50 C32 32 24 22 32 10 C40 22 32 32 32 50 Z" fill="currentColor" />
      {/* left petals */}
      <path d="M30 48 C16 44 8 34 12 20 C24 22 30 32 30 48 Z" fill="currentColor" opacity="0.75" />
      <path d="M27 46 C10 46 2 38 4 26 C16 30 24 34 27 46 Z" fill="currentColor" opacity="0.5" />
      {/* right petals */}
      <path d="M34 48 C48 44 56 34 52 20 C40 22 34 32 34 48 Z" fill="currentColor" opacity="0.75" />
      <path d="M37 46 C54 46 62 38 60 26 C48 30 40 34 37 46 Z" fill="currentColor" opacity="0.5" />
      {/* base */}
      <ellipse cx="32" cy="52" rx="16" ry="4" fill="var(--color-primary)" />
    </svg>
  );
}
