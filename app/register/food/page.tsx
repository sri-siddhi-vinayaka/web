import type { Metadata } from "next";
import ClaimedDishesList from "@/components/ClaimedDishesList";
import FoodRegistrationForm from "@/components/FoodRegistrationForm";
import FreeRegistrationNotice from "@/components/FreeRegistrationNotice";
import { getClaimedDishes } from "@/lib/food";

export const metadata: Metadata = { title: "Food Registration" };

// The claimed-dishes list needs to reflect sign-ups made after the last
// deploy, with no admin action to hang a revalidation off — same reasoning
// as the schedule page's registration counts.
export const dynamic = "force-dynamic";

export default async function FoodRegistrationPage() {
  const claimedDishes = await getClaimedDishes();

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand">Food Registration</h1>
      <p className="mt-1 text-sm text-muted">
        Bringing a dish to share? Sign up below so we can plan, and see
        what&apos;s already spoken for.
      </p>

      <div className="mt-4">
        <FreeRegistrationNotice />
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-semibold text-foreground">Dishes already claimed</h2>
        <div className="mt-2">
          <ClaimedDishesList initialDishes={claimedDishes} />
        </div>
      </div>

      <div className="mt-6">
        <FoodRegistrationForm />
      </div>
    </div>
  );
}
