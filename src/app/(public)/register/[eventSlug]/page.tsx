import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TeamRegistrationForm } from "@/components/registration/team-registration-form";
import { IndividualRegistrationForm } from "@/components/registration/individual-registration-form";
import { BackButton } from "@/components/site/back-button";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ eventSlug: string }>;
}) {
  const { eventSlug } = await params;
  const supabase = await createClient();
  const [{ data: event }, { data: colleges }] = await Promise.all([
    supabase
      .from("events")
      .select("*")
      .eq("slug", eventSlug)
      .eq("is_active", true)
      .maybeSingle(),
    supabase.from("colleges").select("id, name").order("name"),
  ]);

  if (!event) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <BackButton className="mb-4" />
      <h1 className="mb-1 text-xl font-bold">Register — {event.name}</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Fill in your details, then complete payment to confirm your spot.
      </p>

      {event.type === "cricket" ? (
        <TeamRegistrationForm
          eventId={event.id}
          eventName={event.name}
          minTeamSize={event.min_team_size ?? 6}
          maxTeamSize={event.max_team_size ?? 6}
          feePaise={event.fee_paise}
          colleges={colleges ?? []}
        />
      ) : (
        <IndividualRegistrationForm
          eventId={event.id}
          eventName={event.name}
          feePaise={event.fee_paise}
          colleges={colleges ?? []}
        />
      )}
    </div>
  );
}
