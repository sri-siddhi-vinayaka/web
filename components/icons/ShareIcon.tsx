// Matches iOS's own Share glyph shape (SF Symbol "square.and.arrow.up") so
// the install instructions show people the exact icon shape to hunt for in
// Safari's toolbar, not just the word "Share" — much faster to spot amid a
// row of similar-looking toolbar icons.
export default function ShareIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      role="img"
      aria-label="Share icon"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" />
      <path d="M12 14V3M8 7l4-4 4 4" />
    </svg>
  );
}
