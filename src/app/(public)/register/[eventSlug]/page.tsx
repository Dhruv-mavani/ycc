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
  const [{ eventSlug }, supabase] = await Promise.all([params, createClient()]);
  const [{ data: event }, { data: colleges }, { data: campusPartners }, { data: classPartners }] =
    await Promise.all([
      supabase
        .from("events")
        .select("*")
        .eq("slug", eventSlug)
        .eq("is_active", true)
        .maybeSingle(),
      supabase
        .from("colleges")
        .select("id, name")
        .eq("is_public", true)
        .order("name"),
      supabase
        .from("partner_program_applications")
        .select("id, name, team_code")
        .eq("partner_type", "campus")
        .eq("status", "approved")
        .order("name"),
      supabase
        .from("partner_program_applications")
        .select("id, name, team_code")
        .eq("partner_type", "class")
        .eq("status", "approved")
        .order("name"),
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
          maxTeamSize={event.max_team_size ?? 6}
          feePaise={event.fee_paise}
          campusPartners={campusPartners ?? []}
          classPartners={classPartners ?? []}
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
