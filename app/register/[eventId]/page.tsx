import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RegistrationForm from "@/components/RegistrationForm";
import FreeRegistrationNotice from "@/components/FreeRegistrationNotice";
import { getEventById } from "@/lib/events";

export const metadata: Metadata = { title: "Register" };

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: "America/New_York",
    weekday: "long",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function RegisterPage(props: PageProps<"/register/[eventId]">) {
  const { eventId } = await props.params;
  const event = await getEventById(eventId);

  if (!event) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand">{event.title}</h1>
      <p className="mt-1 text-sm text-muted">{formatDateTime(event.start_time)}</p>
      <div className="mt-4">
        <FreeRegistrationNotice />
      </div>
      <div className="mt-6">
        <RegistrationForm eventId={event.id} eventTitle={event.title} />
      </div>
    </div>
  );
}
