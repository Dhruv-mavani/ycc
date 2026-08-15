import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/site/back-button";
import { GstBreakdown } from "@/components/registration/gst-breakdown";
import { Banknote, Users, ScrollText, AlertCircle, Trophy } from "lucide-react";
import { EventRegisterCta } from "@/components/registration/event-register-cta";

function formatRupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [{ slug }, supabase] = await Promise.all([params, createClient()]);
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!event) notFound();

  const isQuiz = event.type === "quiz" || event.slug.includes("quiz");

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden pb-24">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-400/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-300/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="mx-auto max-w-4xl px-4 pt-32 relative z-10">
        <BackButton className="mb-8 text-slate-500 hover:text-slate-900 transition-colors" />
        
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50">
          
          {/* Banner Image for Quiz */}
          {isQuiz && (
            <div className="w-full relative border-b border-slate-100 bg-slate-100 flex">

              <Image
                src="/ycc_quiz_banner.png"
                alt={`${event.name} Banner`}
                width={1200}
                height={600}
                className="w-full h-auto"
                priority
              />
            </div>
          )}

          {/* Event Header */}
          <div className="p-6 sm:p-12 border-b border-slate-100 relative">
            {!isQuiz && (
               <div className="absolute top-0 right-0 p-8 sm:p-12 opacity-5 pointer-events-none">
                 <Trophy className="w-32 h-32 sm:w-64 sm:h-64 text-slate-900" />
               </div>
            )}
            
            <div className="mb-4 sm:mb-6 flex flex-wrap items-center gap-2 sm:gap-3 relative z-10">
              <Badge variant="secondary" className="px-3 py-1 sm:px-4 sm:py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs sm:text-sm font-semibold tracking-wide uppercase shadow-[0_0_15px_rgba(99,102,241,0.05)]">
                {event.type}
              </Badge>
              {event.registration_open && (
                <Badge variant="secondary" className="px-3 py-1 sm:px-4 sm:py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs sm:text-sm font-semibold tracking-wide shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                  <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2 mr-1.5 sm:mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-emerald-500"></span>
                  </span>
                  Registration Open
                </Badge>
              )}
            </div>
            
            <h1 className="text-3xl min-[320px]:text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 sm:mb-6 tracking-tight leading-tight relative z-10 break-words">
              {event.name}
            </h1>
            <p className="text-slate-600 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl relative z-10">
              {event.description}
            </p>
          </div>

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 p-6 sm:p-12 bg-slate-50">
            
            {/* Left Column: Cost & Squad */}
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-indigo-600" /> Registration Details
                </h3>
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm">
                  <div className="flex flex-wrap items-end gap-2 mb-2">
                    <span className="text-3xl sm:text-4xl font-bold text-slate-900 leading-none">{formatRupees(event.fee_paise)}</span>
                    <span className="text-slate-500 mb-0.5 text-sm sm:text-base">{event.type === "cricket" ? "per team" : "per person"}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 mb-5 sm:mb-6">+ 18% GST applicable</p>
                  
                  <div className="pt-5 sm:pt-6 border-t border-slate-100">
                    <GstBreakdown basePaise={event.fee_paise} />
                  </div>
                </div>
              </div>

              {event.type === "cricket" && event.min_team_size && event.max_team_size ? (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-600" /> Team Requirements
                  </h3>
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <p className="text-slate-600">
                      <span className="text-slate-500 block mb-1">Squad size</span>
                      <span className="text-xl font-semibold text-slate-900">
                        {event.min_team_size === event.max_team_size
                          ? `Exactly ${event.min_team_size}`
                          : `${event.min_team_size}–${event.max_team_size}`}{" "}
                        players
                      </span>
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Right Column: Rules & CTA */}
            <div className="space-y-8 flex flex-col justify-between">
              {event.rules ? (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <ScrollText className="w-5 h-5 text-amber-600" /> Tournament Rules
                  </h3>
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm prose prose-sm max-w-none prose-p:text-slate-600 prose-li:text-slate-600">
                    <p className="whitespace-pre-line leading-relaxed">
                      {event.rules}
                    </p>
                  </div>
                </div>
              ) : <div></div>}
              
              <div className="pt-6 sm:pt-8">
                {event.is_partner_only ? (
                  <div className="space-y-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-5 sm:p-6 text-sm">
                    <div className="flex items-center gap-2 text-indigo-700 mb-2 font-semibold text-sm sm:text-base">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" /> Partner Exclusive
                    </div>
                    <p className="text-indigo-900/80 leading-relaxed text-xs sm:text-sm">
                      Registration for this event is exclusively through the YCC
                      Partner Program — a YCC Co-Partner registers their own team
                      (themselves + 5 approved Classmate Partners). To join a team,
                      ask your YCC Co-Partner for their team code and apply as a
                      Classmate Partner.
                    </p>
                    <Button
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 sm:h-12 mt-2 shadow-[0_5px_15px_rgba(79,70,229,0.2)] transition-all text-xs sm:text-sm rounded-xl"
                      nativeButton={false}
                      render={<Link href="/partner-program">Go to Partner Program</Link>}
                    />
                  </div>
                ) : (
                  <EventRegisterCta eventSlug={event.slug} />
                )}
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
