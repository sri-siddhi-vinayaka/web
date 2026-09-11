import type { Metadata } from "next";

export const metadata: Metadata = { title: "About Ganesha" };

export default function AboutGaneshaPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand">About Ganesha</h1>
      <p className="mt-3 text-muted">
        A closer look at Lord Ganesha — his story and significance — is coming
        soon.
      </p>
    </div>
  );
}
