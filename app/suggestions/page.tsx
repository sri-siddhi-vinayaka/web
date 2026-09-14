import type { Metadata } from "next";
import PrivacyNotice from "@/components/PrivacyNotice";
import SuggestionForm from "@/components/SuggestionForm";

export const metadata: Metadata = { title: "Suggestions" };

export default function SuggestionsPage() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand">Suggestions</h1>
      <p className="mt-1 text-sm text-muted">
        Have an idea for this year&apos;s celebration, or something we
        could do better? Let us know below — the committee reads every
        one and may turn it into an announcement or a change to the plan.
      </p>

      <div className="mt-4">
        <PrivacyNotice>
          Your name and contact info, if you share them, are visible only
          to the admin team — never shown publicly.
        </PrivacyNotice>
      </div>

      <div className="mt-6">
        <SuggestionForm />
      </div>
    </div>
  );
}
