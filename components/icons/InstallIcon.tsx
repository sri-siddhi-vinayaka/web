export default function InstallIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      role="img"
      aria-label="Install app"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="6" y="2" width="12" height="20" rx="2" />
      <path d="M12 8v6M9.5 11.5 12 14l2.5-2.5" />
      <path d="M11 19h2" />
    </svg>
  );
}
