import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TeamRegistrationForm } from "@/components/registration/team-registration-form";
import { SelfTeamRegistrationForm } from "@/components/registration/self-team-registration-form";
import { IndividualRegistrationForm } from "@/components/registration/individual-registration-form";
import { SchoolRegistrationForm } from "@/components/registration/school-registration-form";
import { BackButton } from "@/components/site/back-button";
import { Button } from "@/components/ui/button";
import { UserPlus, Download } from "lucide-react";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ eventSlug: string }>;
}) {
  const [{ eventSlug }, supabase] = await Promise.all([params, createClient()]);
  const [{ data: event }, { data: colleges }, { data: campusPartners }, { data: classPartners }, { data: schools }] =
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
      supabase
        .from("schools")
        .select("id, name")
        .eq("is_public", true)
        .order("name"),
    ]);

  if (!event) notFound();

  const partnerOptions = [
    ...(campusPartners ?? []).map((p) => ({ ...p, type: "campus" as const })),
    ...(classPartners ?? []).map((p) => ({ ...p, type: "class" as const })),
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-24">
      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <div className="mx-auto max-w-3xl px-4 pt-32 relative z-10">
        <BackButton className="mb-8 text-slate-500 hover:text-slate-900 transition-colors" />
        
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50">
          <div className="p-8 sm:p-12 border-b border-slate-100 relative bg-slate-50/50">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <UserPlus className="w-32 h-32 sm:w-48 sm:h-48 text-slate-900" />
            </div>
            
            {event.type === "school" ? (
              <p className="text-slate-600 text-base sm:text-lg max-w-2xl relative z-10">
                YCC Super Champs Program is a youth-focused initiative
                designed for teenagers aged 14-20, providing them with a
                supportive platform and community to discover, develop, and
                showcase their talents across sports, education, and
                personal development.
              </p>
            ) : (
              <>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight relative z-10 break-words">
                  Register — {event.name}
                </h1>
                <p className="text-slate-500 text-base sm:text-lg max-w-xl relative z-10">
                  Fill in your details, then complete payment to confirm your spot.
                </p>
              </>
            )}

            {event.type === "school" ? (
              <Button
                variant="outline"
                size="sm"
                className="mt-4 rounded-full border-slate-200 shadow-sm bg-white hover:bg-slate-50 text-slate-700 font-semibold relative z-10"
                nativeButton={false}
                render={
                  <Link href="/super-champs/certificate" className="flex items-center gap-2">
                    <Download className="size-4 text-blue-600" />
                    Download your certificate
                  </Link>
                }
              />
            ) : null}
          </div>

          <div className="p-6 sm:p-12">
            {event.type === "school" ? (
              <SchoolRegistrationForm
                eventId={event.id}
                eventName={event.name}
                schools={schools ?? []}
              />
            ) : event.type === "cricket" ? (
              event.requires_referral ? (
                <TeamRegistrationForm
                  eventId={event.id}
                  eventName={event.name}
                  maxTeamSize={event.max_team_size ?? 6}
                  feePaise={event.fee_paise}
                  campusPartners={campusPartners ?? []}
                  classPartners={classPartners ?? []}
                />
              ) : (
                <SelfTeamRegistrationForm
                  eventId={event.id}
                  eventName={event.name}
                  maxTeamSize={event.max_team_size ?? 6}
                  feePaise={event.fee_paise}
                  colleges={colleges ?? []}
                />
              )
            ) : (
              <IndividualRegistrationForm
                eventId={event.id}
                eventName={event.name}
                feePaise={event.fee_paise}
                colleges={colleges ?? []}
                partnerOptions={partnerOptions}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
