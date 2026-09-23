import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/site/back-button";
import { GstBreakdown } from "@/components/registration/gst-breakdown";
import { Banknote, Users, ScrollText, AlertCircle, Trophy, Download } from "lucide-react";
import { EventRegisterCta } from "@/components/registration/event-register-cta";

function formatRupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

// Poster used per event for social share previews — falls back to the site's
// default OG image (see root layout) when an event has none of its own.
function posterFor(slug: string): string | undefined {
  if (slug === "ycc-go-goa-gone") return "/go-goa-gone/poster.png";
  if (slug === "cricket-championship-2026") return "/box-cricket/poster-999.png";
  if (slug === "ycc-jackpot-heist") return "/jackpot-heist/poster.png";
  return undefined;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const [{ slug }, supabase] = await Promise.all([params, createClient()]);
  const { data: event } = await supabase
    .from("events")
    .select("name, description")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!event) return {};

  const title = `${event.name} | YCC`;
  const description = event.description ?? undefined;
  const poster = posterFor(slug);

  return {
    title,
    description,
    alternates: { canonical: `/events/${slug}` },
    openGraph: {
      title,
      description,
      url: `/events/${slug}`,
      images: poster ? [{ url: poster }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: poster ? [poster] : undefined,
    },
  };
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
  // Go Goa Gone is a "cricket" event (team registration), but it's free and
  // wants the same centered, poster-led treatment as the individual_free
  // events below rather than the two-column paid-tournament layout.
  const isGoGoaGone = event.slug === "ycc-go-goa-gone";
  const isBoxCricket = event.slug === "cricket-championship-2026";

  // BreadcrumbList — helps search/AI crawlers place this event within the
  // site hierarchy without inferring it from nav markup. No full Event
  // schema here: schema.org/Event requires startDate + location, which
  // this events table doesn't track, and emitting it without them would
  // just surface as structured-data errors in Search Console.
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.ycct10.in/" },
      { "@type": "ListItem", position: 2, name: event.name, item: `https://www.ycct10.in/events/${event.slug}` },
    ],
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <div className="mx-auto max-w-4xl px-4 pt-32 relative z-10">
        <BackButton className="mb-8 text-slate-500 hover:text-slate-900 transition-colors" />
        
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50">
          
          {/* Banner Image for Quiz */}
          {isQuiz && (
            <div className="w-full relative border-b border-slate-100 bg-slate-100 flex">

              <Image
                src="/ycc_quiz_banner1.png"
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
              {isGoGoaGone ? null : (
                // Go Goa Gone is stored as type "cricket" (team registration
                // of 6, same as the paid tournaments) but isn't marketed as
                // a cricket event — it's the Kismat Ke Khiladi prize games,
                // so the "CRICKET" type badge doesn't belong on its page.
                <Badge variant="secondary" className="px-3 py-1 sm:px-4 sm:py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs sm:text-sm font-semibold tracking-wide uppercase shadow-[0_0_15px_rgba(99,102,241,0.05)]">
                  {event.type}
                </Badge>
              )}
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
            {isGoGoaGone && (
              <div className="mt-4 max-w-2xl rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-relaxed text-blue-700 relative z-10 sm:text-base">
                Please play only once — we can see every game played on our
                end, and repeat gameplay may cost you your chance at the Goa
                trip. Thanks for keeping it fair!
              </div>
            )}
          </div>

          {/* Event Details */}
          {event.type === "school" || event.type === "individual_free" || isGoGoaGone || isBoxCricket ? (
            // Single, centered column — this free/solo event has no team
            // requirements or tournament rules to justify the two-column
            // layout the paid cricket events use, so the fee card and CTA
            // just stack, centered, one below the other. Go Goa Gone and Box
            // Cricket both opt into this same centered, poster-led layout
            // despite being team events (and, for Box Cricket, actually
            // paid) — the poster already covers most of this visually, so a
            // wide two-column split just looks inconsistent underneath it.
            <div className="flex justify-center p-6 sm:p-12 bg-slate-50">
              <div className="w-full max-w-md space-y-8 text-center">
                {event.type === "individual_free" || isGoGoaGone || isBoxCricket ? (
                  // A ₹0 fee breakdown is dead weight here for the two free
                  // events — the event's own poster plus the actual steps to
                  // register are far more useful than an all-zero GST table.
                  // Box Cricket isn't free, so it keeps its own Registration
                  // Details card further down, after these steps.
                  <div>
                    <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                      <Image
                        src={
                          isGoGoaGone
                            ? "/go-goa-gone/poster.png"
                            : isBoxCricket
                              ? "/box-cricket/poster-999.png"
                              : "/jackpot-heist/poster.png"
                        }
                        alt={`${event.name} poster`}
                        width={1024}
                        height={1536}
                        className="w-full h-auto"
                      />
                    </div>
                    <div className="mt-6 text-left">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center justify-center gap-2">
                        <ScrollText className="w-5 h-5 text-indigo-600" /> How to Register
                      </h3>
                      {isGoGoaGone ? (
                        <ol className="space-y-3">
                          <li className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                              1
                            </span>
                            <p className="text-sm text-slate-600">
                              <span className="font-semibold text-slate-900">
                                Follow our WhatsApp channel & Instagram.
                              </span>{" "}
                              It&apos;s mandatory to join both — we&apos;ll share
                              important updates there.
                            </p>
                          </li>
                          <li className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                              2
                            </span>
                            <p className="text-sm text-slate-600">
                              <span className="font-semibold text-slate-900">
                                Fill the team form correctly.
                              </span>{" "}
                              Captain details, plus your 6 squad members&apos; names.
                            </p>
                          </li>
                          <li className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                              3
                            </span>
                            <p className="text-sm text-slate-600">
                              <span className="font-semibold text-slate-900">
                                Get your Game Certificate & Specialized Team Code.
                              </span>{" "}
                              Your Team Code is mandatory for Match Play and
                              verification.
                            </p>
                          </li>
                          <li className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                              4
                            </span>
                            <p className="text-sm text-slate-600">
                              <span className="font-semibold text-slate-900">
                                Participate in all games for special benefits.
                              </span>{" "}
                              All registered players must take part in every
                              designated challenge/game to unlock eligibility
                              for the Special Goa Travel Coupon — starting at
                              ₹2,499/person.
                            </p>
                          </li>
                        </ol>
                      ) : isBoxCricket ? (
                        <ol className="space-y-3">
                          <li className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                              1
                            </span>
                            <p className="text-sm text-slate-600">
                              <span className="font-semibold text-slate-900">
                                Follow our WhatsApp channel & Instagram.
                              </span>{" "}
                              It&apos;s mandatory to join both — we&apos;ll share
                              important updates there.
                            </p>
                          </li>
                          <li className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                              2
                            </span>
                            <p className="text-sm text-slate-600">
                              <span className="font-semibold text-slate-900">
                                Fill the team form correctly.
                              </span>{" "}
                              College, team name, captain details, plus your 6
                              squad members&apos; names.
                            </p>
                          </li>
                          <li className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                              3
                            </span>
                            <p className="text-sm text-slate-600">
                              <span className="font-semibold text-slate-900">
                                Get instant confirmation.
                              </span>{" "}
                              You have to pay entry fee in cash, the place
                              will be decided by the YCC Team — your
                              squad&apos;s invitation letter and team code download
                              automatically the moment you submit.
                            </p>
                          </li>
                        </ol>
                      ) : (
                        <ol className="space-y-3">
                          <li className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                              1
                            </span>
                            <p className="text-sm text-slate-600">
                              <span className="font-semibold text-slate-900">
                                Follow our WhatsApp channel & Instagram.
                              </span>{" "}
                              It&apos;s mandatory to join both — we&apos;ll share
                              important updates there.
                            </p>
                          </li>
                          <li className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                              2
                            </span>
                            <p className="text-sm text-slate-600">
                              <span className="font-semibold text-slate-900">
                                Fill the form correctly.
                              </span>{" "}
                              Tap &ldquo;Register for free&rdquo; and enter your real name, WhatsApp
                              number, email, age and gender.
                            </p>
                          </li>
                          <li className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                              3
                            </span>
                            <p className="text-sm text-slate-600">
                              <span className="font-semibold text-slate-900">
                                Get your personal code instantly.
                              </span>{" "}
                              Your certificate downloads automatically the moment you submit.
                            </p>
                          </li>
                        </ol>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center justify-center gap-2">
                      <Banknote className="w-5 h-5 text-indigo-600" /> Registration Details
                    </h3>
                    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm text-left">
                      <div className="flex flex-wrap items-end justify-center gap-2 mb-2">
                        <span className="text-3xl sm:text-4xl font-bold text-slate-900 leading-none">{formatRupees(event.fee_paise)}</span>
                        <span className="text-slate-500 mb-0.5 text-sm sm:text-base">per person</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500 mb-5 sm:mb-6 text-center">+ 18% GST applicable</p>

                      <div className="pt-5 sm:pt-6 border-t border-slate-100">
                        <GstBreakdown basePaise={event.fee_paise} />
                      </div>
                    </div>
                  </div>
                )}

                {isBoxCricket && (event.rules || (event.min_team_size && event.max_team_size)) ? (
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center justify-center gap-2">
                      <ScrollText className="w-5 h-5 text-amber-600" /> Tournament Rules
                    </h3>
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
                      {event.min_team_size && event.max_team_size ? (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            Squad size:{" "}
                            <span className="font-semibold text-slate-900">
                              {event.min_team_size === event.max_team_size
                                ? `Exactly ${event.min_team_size}`
                                : `${event.min_team_size}–${event.max_team_size}`}{" "}
                              players
                            </span>
                          </span>
                        </div>
                      ) : null}
                      {event.rules ? (
                        <div
                          className={
                            event.min_team_size && event.max_team_size
                              ? "pt-5 border-t border-slate-100"
                              : undefined
                          }
                        >
                          {/* Box Cricket's rules are stored as one line per
                              bullet (see the DB value) — split and render as
                              an actual list rather than a run-on paragraph,
                              clearer for the 3 separate facts it covers. */}
                          <ul className="list-disc space-y-2 pl-5 text-slate-600 leading-relaxed marker:text-amber-500">
                            {event.rules
                              .split("\n")
                              .map((line) => line.trim())
                              .filter(Boolean)
                              .map((line) => (
                                <li key={line}>{line}</li>
                              ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {isBoxCricket ? (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center justify-center gap-2">
                      <Banknote className="w-5 h-5 text-indigo-600" /> Registration Details
                    </h3>
                    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm text-left">
                      <div className="flex flex-wrap items-end gap-2 mb-2">
                        <span className="text-3xl sm:text-4xl font-bold text-slate-900 leading-none">{formatRupees(event.fee_paise)}</span>
                        <span className="text-slate-500 mb-0.5 text-sm sm:text-base">per team</span>
                      </div>
                      {event.gst_exempt ? (
                        <p className="text-xs sm:text-sm text-slate-500">No GST applicable</p>
                      ) : (
                        <>
                          <p className="text-xs sm:text-sm text-slate-500 mb-5 sm:mb-6">+ 18% GST applicable</p>
                          <div className="pt-5 sm:pt-6 border-t border-slate-100">
                            <GstBreakdown basePaise={event.fee_paise} />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ) : null}

                {/* Go Goa Gone / Box Cricket are team registrations, not a
                    personal-code flow — they re-download via the generic
                    unique-ID/mobile lookup at /receipt (same PDF,
                    captain-first roster, that the team already got on
                    successful registration), rather than the
                    school/individual_free single-field lookups. */}
                <Button
                  variant="outline"
                  // buttonVariants' own base classes already give the
                  // rendered <a> (via `render` below) inline-flex/items-
                  // center/justify-center — putting gap-2 here too, rather
                  // than as a second className on the Link itself, avoids
                  // two independent className sources that base-ui's
                  // render-prop merge was combining in a different order
                  // between server and client (a real, harmless-but-noisy
                  // hydration mismatch on this exact button).
                  className="w-full rounded-full h-12 gap-2 border-slate-200 shadow-sm bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-all hover:scale-[1.02]"
                  nativeButton={false}
                  render={
                    <Link
                      href={
                        event.type === "school"
                          ? "/super-champs/certificate"
                          : isGoGoaGone || isBoxCricket
                            ? "/receipt"
                            : "/jackpot-heist/certificate"
                      }
                    >
                      <Download className="size-4 text-blue-600" />
                      Download your certificate
                    </Link>
                  }
                />

                {isBoxCricket && event.is_partner_only ? (
                  <div className="space-y-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-5 sm:p-6 text-sm text-left">
                    <div className="flex items-center gap-2 text-indigo-700 mb-2 font-semibold text-sm sm:text-base">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" /> Partner Exclusive
                    </div>
                    <p className="text-indigo-900/80 leading-relaxed text-xs sm:text-sm">
                      Registration for this event is exclusively through the YCC
                      Partner Program — a YCC Co-Partner registers their own team
                      (themselves + 5 Squad Members). To join a team,
                      ask your YCC Co-Partner for their team code and apply as a
                      Squad Member.
                    </p>
                    <Button
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 sm:h-12 mt-2 shadow-[0_5px_15px_rgba(79,70,229,0.2)] transition-all text-xs sm:text-sm rounded-xl"
                      nativeButton={false}
                      render={<Link href="/partner-program">Go to Partner Program</Link>}
                    />
                  </div>
                ) : !event.registration_open ? (
                  <Button
                    disabled
                    variant="outline"
                    className="w-full rounded-full h-12 border-slate-200 text-slate-400 bg-transparent font-semibold"
                  >
                    Coming Soon
                  </Button>
                ) : (
                  <EventRegisterCta
                    eventSlug={event.slug}
                    // The join-to-unlock gate used to live here too,
                    // alongside the "How to Register" list above — meaning
                    // visitors joined WhatsApp+Instagram on this page, then
                    // had to do it again as Step 1 of RegistrationSteps on
                    // /register/[eventSlug]. That page is now the one real
                    // gate for every event in this branch (school,
                    // individual_free, Go Goa Gone, Box Cricket) —
                    // reachable directly too, unlike this marketing page —
                    // so this CTA always just links straight through.
                    requireCommunityGate={false}
                    label={isBoxCricket ? "Register Now & Pay" : "Register for free"}
                  />
                )}
              </div>
            </div>
          ) : (
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
                  {event.gst_exempt ? (
                    <p className="text-xs sm:text-sm text-slate-500">No GST applicable</p>
                  ) : (
                    <>
                      <p className="text-xs sm:text-sm text-slate-500 mb-5 sm:mb-6">+ 18% GST applicable</p>
                      <div className="pt-5 sm:pt-6 border-t border-slate-100">
                        <GstBreakdown basePaise={event.fee_paise} />
                      </div>
                    </>
                  )}
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
                      (themselves + 5 Squad Members). To join a team,
                      ask your YCC Co-Partner for their team code and apply as a
                      Squad Member.
                    </p>
                    <Button
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 sm:h-12 mt-2 shadow-[0_5px_15px_rgba(79,70,229,0.2)] transition-all text-xs sm:text-sm rounded-xl"
                      nativeButton={false}
                      render={<Link href="/partner-program">Go to Partner Program</Link>}
                    />
                  </div>
                ) : !event.registration_open ? (
                  <Button
                    disabled
                    variant="outline"
                    className="w-full rounded-full h-12 border-slate-200 text-slate-400 bg-transparent font-semibold"
                  >
                    Coming Soon
                  </Button>
                ) : (
                  <EventRegisterCta
                    eventSlug={event.slug}
                    requireCommunityGate={event.fee_paise > 0}
                    label={event.fee_paise === 0 ? "Register for free" : "Register Now & Pay"}
                  />
                )}
              </div>
            </div>

          </div>
          )}
        </div>
      </div>
    </div>
  );
}
