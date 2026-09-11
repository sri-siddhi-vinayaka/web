import type { Metadata } from "next";
import { DONATION_CONTACT } from "@/lib/config";

export const metadata: Metadata = { title: "Donate" };

export default function DonatePage() {
  const hasContact = DONATION_CONTACT.name && DONATION_CONTACT.phone;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand">Donate</h1>

      <div className="mt-6 rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-border">
        {hasContact ? (
          <>
            <p className="text-foreground">
              Contact <span className="font-semibold">{DONATION_CONTACT.name}</span>{" "}
              at{" "}
              <a href={`tel:${DONATION_CONTACT.phone}`} className="font-semibold underline underline-offset-2">
                {DONATION_CONTACT.phone}
              </a>{" "}
              to coordinate a contribution.
            </p>
          </>
        ) : (
          <p className="text-muted">
            The donation coordinator&apos;s details are being finalized and will
            appear here soon.
          </p>
        )}
        <p className="mt-4 text-sm text-muted">
          There is no online payment or QR code in this app — every donation is
          coordinated directly with the contact above, by phone.
        </p>
      </div>
    </div>
  );
}
