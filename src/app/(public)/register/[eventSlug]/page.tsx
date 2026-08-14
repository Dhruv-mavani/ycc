import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TeamRegistrationForm } from "@/components/registration/team-registration-form";
import { IndividualRegistrationForm } from "@/components/registration/individual-registration-form";
import { BackButton } from "@/components/site/back-button";
import { UserPlus } from "lucide-react";

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
    <div className="min-h-screen bg-slate-50 relative overflow-hidden pb-24">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-400/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-300/10 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="mx-auto max-w-3xl px-4 pt-32 relative z-10">
        <BackButton className="mb-8 text-slate-500 hover:text-slate-900 transition-colors" />
        
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50">
          <div className="p-8 sm:p-12 border-b border-slate-100 relative bg-slate-50/50">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <UserPlus className="w-32 h-32 sm:w-48 sm:h-48 text-slate-900" />
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight relative z-10 break-words">
              Register — {event.name}
            </h1>
            <p className="text-slate-500 text-base sm:text-lg max-w-xl relative z-10">
              Fill in your details, then complete payment to confirm your spot.
            </p>
          </div>
          
          <div className="p-6 sm:p-12">
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
        </div>
      </div>
    </div>
  );
}
