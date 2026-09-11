import type { Metadata } from "next";
import Link from "next/link";
import { DONATION_CONTACT, VENUE_ADDRESS, VENUE_MAPS_URL } from "@/lib/config";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  const hasDonationContact = DONATION_CONTACT.name && DONATION_CONTACT.phone;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand">Contact</h1>
      <p className="mt-3 text-muted">
        Committee contacts will be listed here once confirmed.
      </p>

      <section className="mt-6 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border">
        <h2 className="font-semibold text-foreground">Venue</h2>
        <p className="mt-1 text-sm text-muted">{VENUE_ADDRESS}</p>
        <a
          href={VENUE_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm font-medium text-primary underline underline-offset-2"
        >
          Get directions
        </a>
      </section>

      <section className="mt-4 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border">
        <h2 className="font-semibold text-foreground">Want to contribute?</h2>
        {hasDonationContact ? (
          <p className="mt-1 text-sm text-muted">
            Reach out to {DONATION_CONTACT.name} at {DONATION_CONTACT.phone} to
            coordinate a donation directly.
          </p>
        ) : (
          <p className="mt-1 text-sm text-muted">
            The donation coordinator&apos;s details are being finalized and will
            appear here soon.
          </p>
        )}
        <Link
          href="/donate"
          className="mt-2 inline-block text-sm font-medium text-primary underline underline-offset-2"
        >
          More about donating
        </Link>
      </section>
    </div>
  );
}
