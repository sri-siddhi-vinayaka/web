import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand">Contact</h1>
      <p className="mt-3 text-muted">
        Venue address, committee contacts, and the donation coordinator&apos;s
        details will be listed here once confirmed.
      </p>
    </div>
  );
}
