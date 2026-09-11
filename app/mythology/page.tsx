import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mythology" };

export default function MythologyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand">Mythology</h1>
      <p className="mt-3 text-muted">
        Stories, forms, and traditions behind Ganesh Chaturthi are being put
        together and will appear here soon.
      </p>
    </div>
  );
}
