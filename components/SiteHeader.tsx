import Link from "next/link";
import VinayakaIcon from "@/components/icons/VinayakaIcon";
import MobileNav from "@/components/MobileNav";
import { NAV_LINKS, SITE_NAME } from "@/lib/config";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-brand" aria-label={SITE_NAME}>
          <VinayakaIcon className="h-8 w-8" />
        </Link>

        {/* Six nav items don't fit on a phone without wrapping or a scroll
            hint — collapse to a dropdown below sm:, where there's room for
            the full row instead. */}
        <nav className="hidden gap-1 text-sm sm:flex">
          {NAV_LINKS.slice(1).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 font-medium text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="sm:hidden">
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
