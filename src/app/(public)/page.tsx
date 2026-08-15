import Link from "next/link";
import Image from "next/image";
import { Trophy, Download, ChevronDown, Star, Users, CalendarDays, Globe, Map, MapPin, TrendingUp, Plane } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HeroCarousel } from "@/components/ui/hero-carousel";
import { WhyChooseCarousel } from "@/components/ui/why-choose-carousel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    question: "What is the YCC Cricket League?",
    answer: "YCC ~ Yuva Champions Cricket is a modern youth-first cricket platform built by the youth, for the youth, delivering exciting tournaments, unforgettable experiences, exclusive rewards, benefits and opportunities to become tomorrow's champions."
  },
  {
    question: "Who can participate?",
    answer: "Anyone meeting the tournament eligibility criteria can participate. Some tournaments may be exclusively for specific group, community, students, while others are open to all."
  },
  {
    question: "How do I register my team?",
    answer: "You can register your team by filling out the online registration form on our website and any other medium like social media, promotional reels, announcement poster or from any Official YCC Partner."
  },
  {
    question: "What tournament formats does YCC organize?",
    answer: "YCC organizes various formats such as Tennis Ball Cricket, Plastic Ball Cricket, Box Cricket and other special editions."
  },
  {
    question: "Where are the matches conducted?",
    answer: "Tournament venues are announced before each event and shared through our website and official social media channels."
  },
  {
    question: "How will I receive match schedules?",
    answer: "Schedules, fixtures, and updates are shared via WhatsApp, Official Instagram Handle, and the official YCC website."
  },
  {
    question: "What happens if a match is affected by bad weather or any other circumstances?",
    answer: "YCC will reschedule or make decisions according to the official tournament rules."
  }
];

export default async function HomePage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("is_active", true)
    .order("created_at");

  return (
    <div>
      <section className="relative z-0 flex min-h-[100svh] flex-col items-center justify-center overflow-hidden pt-36 sm:pt-48 md:pt-56 pb-16 text-center tw-animate-in tw-fade-in tw-slide-in-from-bottom-8 tw-duration-1000">
        <HeroCarousel />
        {/* Cinematic vignette — keeps the headline legible over any carousel frame */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/15 to-black/70"></div>
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_65%_55%_at_50%_48%,transparent,rgba(0,0,0,0.6))]"></div>

        <div className="relative z-10 mx-auto flex max-w-4xl lg:max-w-6xl xl:max-w-7xl flex-col items-center px-4">
          <span className="mb-3 sm:mb-4 text-[10px] min-[380px]:text-xs font-bold uppercase tracking-[0.4em] text-amber-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            Welcome to
          </span>

          <h1 className="font-black uppercase text-white leading-[0.92] tracking-tight text-4xl min-[320px]:text-[2.6rem] min-[380px]:text-6xl min-[480px]:text-7xl sm:text-8xl xl:text-9xl drop-shadow-[0_8px_30px_rgba(0,0,0,0.7)]">
            <span className="block">Yuva Champions</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white">Cricket</span>
          </h1>

          <p className="mt-6 sm:mt-8 text-slate-200/90 font-medium max-w-xl text-sm min-[380px]:text-base sm:text-lg leading-relaxed text-center drop-shadow-md px-2">
            Register your team for the cricket championship, or enter
            solo for the quiz competition. Fast registration, instant QR-coded
            receipt.
          </p>

          <div className="flex flex-col min-[400px]:flex-row items-center justify-center gap-4 sm:gap-6 mt-9 sm:mt-12 w-full max-w-[260px] min-[320px]:max-w-xs min-[400px]:max-w-none mx-auto">
            <Button size="lg" className="w-full min-[400px]:w-auto rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white border border-white/10 shadow-xl shadow-blue-600/40 hover:shadow-blue-500/60 hover:-translate-y-1 hover:scale-105 hover:from-blue-400 hover:to-indigo-500 transition-[transform,box-shadow,background] duration-300 font-bold text-xs min-[320px]:text-sm sm:text-lg px-5 py-4 min-[320px]:px-6 min-[320px]:py-5 sm:px-9 sm:py-7 flex items-center justify-center gap-2 group" nativeButton={false} render={<Link href="/partner-program">
              <Trophy className="size-3.5 min-[320px]:size-4 sm:size-5 group-hover:scale-110 transition-transform" /> Register Now
            </Link>} />
            <Button size="lg" variant="ghost" className="w-full min-[400px]:w-auto rounded-full font-bold text-xs min-[320px]:text-sm sm:text-lg px-5 py-4 min-[320px]:px-6 min-[320px]:py-5 sm:px-9 sm:py-7 flex items-center justify-center gap-2 text-white/90 hover:text-white hover:bg-white/10 transition-colors duration-300" nativeButton={false} render={<Link href="/receipt">
              <Download className="size-3.5 min-[320px]:size-4 sm:size-5" /> Download Receipt
            </Link>} />
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-80 hidden sm:block">
          <ChevronDown className="size-8 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
        </div>
      </section>

      {/* Benefits Marquee / Divider Band */}
      <div className="relative border-y border-blue-600 bg-blue-600 py-3 sm:py-4 overflow-hidden flex whitespace-nowrap shadow-md z-20">
        <div className="animate-marquee inline-flex gap-8 items-center font-bold text-xs sm:text-sm tracking-[0.15em] text-white uppercase">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="inline-flex gap-8 items-center">
              <span>WIN EXCITING PRIZES</span> <span className="text-blue-300">✦</span>
              <span>TRIP TO GOA</span> <span className="text-blue-300">✦</span>
              <span>LAKHS IN PRIZE MONEY</span> <span className="text-blue-300">✦</span>
              <span>CHAMPIONSHIP TROPHIES</span> <span className="text-blue-300">✦</span>
              <span>MAN OF THE MATCH REWARDS</span> <span className="text-blue-300">✦</span>
            </span>
          ))}
        </div>
      </div>

      <section id="events" className="relative w-full py-24 scroll-mt-24 bg-slate-50 border-t border-slate-200 overflow-hidden">
        {/* Background Grid & Effects */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-400/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-sky-300/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="mx-auto max-w-6xl px-4 relative z-10">
          <div className="flex flex-col items-center text-center mb-16">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 border border-slate-200 shadow-sm">
              <CalendarDays className="w-8 h-8 text-slate-700" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-slate-900">Events</h2>
            <p className="text-slate-600 text-lg max-w-2xl">
              Select an active event below to securely complete your team registration and payments.
            </p>
          </div>

          <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-4 min-[380px]:gap-5 sm:gap-8 max-w-5xl mx-auto">
            {(!events || events.length === 0) && (
              <div className="min-[380px]:col-span-2 rounded-3xl border border-dashed border-blue-200 p-16 text-center bg-white/50 backdrop-blur-md">
                <p className="text-slate-500 text-xl font-medium">
                  No events are open for registration right now. Check back soon!
                </p>
              </div>
            )}
            {events?.map((event) =>
              event.registration_open ? (
                <Card key={event.id} className="overflow-hidden flex flex-col group hover:border-blue-400/50 transition-colors bg-white shadow-xl hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.2)] border-blue-100 rounded-3xl">
                  <CardHeader className="pb-4 pt-6 sm:pt-8 px-4 sm:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                      <CardTitle className="text-lg sm:text-2xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors break-words">{event.name}</CardTitle>
                      <Badge
                        variant="secondary"
                        className="whitespace-nowrap w-fit bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1 text-xs shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                      >
                        <span className="relative flex h-1.5 w-1.5 mr-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                        Open Now
                      </Badge>
                    </div>
                    <CardDescription className="text-xs sm:text-base mt-2 sm:mt-3 text-slate-600 leading-relaxed break-words">{event.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-5 sm:pt-6 pb-6 sm:pb-8 px-4 sm:px-8 mt-6 border-t border-slate-100 bg-slate-50">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-[0_10px_20px_rgba(37,99,235,0.2)] transition-all font-semibold rounded-xl h-11 sm:h-12 text-sm sm:text-lg px-2"
                      nativeButton={false}
                      render={<Link href={`/events/${event.slug}`} className="flex items-center justify-center w-full">Proceed to Payment &rarr;</Link>}
                    />
                  </CardFooter>
                </Card>
              ) : (
                <Card key={event.id} className="overflow-hidden border-dashed border-slate-200 bg-white/60 flex flex-col opacity-80 hover:opacity-100 transition-opacity rounded-3xl shadow-sm">
                  <CardHeader className="pb-4 pt-6 sm:pt-8 px-4 sm:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                      <CardTitle className="text-lg sm:text-2xl font-bold text-slate-500 break-words">{event.name}</CardTitle>
                      <Badge
                        variant="secondary"
                        className="whitespace-nowrap w-fit bg-amber-100 text-amber-700 border border-amber-200 px-2.5 py-1 text-xs"
                      >
                        Coming Soon
                      </Badge>
                    </div>
                    <CardDescription className="text-xs sm:text-base mt-2 sm:mt-3 text-slate-500 leading-relaxed break-words">{event.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-5 sm:pt-6 pb-6 sm:pb-8 px-4 sm:px-8 mt-6 border-t border-slate-100 bg-slate-50/50">
                    <Button
                      disabled
                      variant="outline"
                      className="w-full border-slate-200 text-slate-400 bg-transparent rounded-xl h-11 sm:h-12 text-sm sm:text-lg font-semibold px-2"
                    >
                      Stay Tuned
                    </Button>
                  </CardFooter>
                </Card>
              ),
            )}
            <Card className="overflow-hidden border-dashed border-slate-200 bg-white/60 flex flex-col opacity-80 hover:opacity-100 transition-opacity rounded-3xl shadow-sm">
              <CardHeader className="pb-4 pt-6 sm:pt-8 px-4 sm:px-8">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                  <CardTitle className="text-lg sm:text-2xl font-bold text-slate-500 break-words">
                    YCC Regular Cricket Championship 2026
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="whitespace-nowrap w-fit bg-amber-100 text-amber-700 border border-amber-200 px-2.5 py-1 text-xs"
                  >
                    Coming Soon
                  </Badge>
                </div>
                <CardDescription className="text-xs sm:text-base mt-2 sm:mt-3 text-slate-500 leading-relaxed break-words">The flagship tournament returning next year with even bigger prizes.</CardDescription>
              </CardHeader>
              <CardFooter className="pt-5 sm:pt-6 pb-6 sm:pb-8 px-4 sm:px-8 mt-6 border-t border-slate-100 bg-slate-50/50">
                <Button className="w-full border-slate-200 text-slate-400 bg-transparent rounded-xl h-11 sm:h-12 text-sm sm:text-lg font-semibold px-2" variant="outline" disabled>
                  Stay Tuned
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
      {/* Backed By The Best Section */}
      <section className="w-full relative overflow-hidden bg-white py-20 -mt-8 md:-mt-16 rounded-t-[2.5rem] md:rounded-t-[4rem] shadow-[0_-20px_50px_-15px_rgba(0,0,0,0.05)] border-t border-slate-200 z-20">
        <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        <div className="mx-auto max-w-6xl px-4 relative z-10">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center lg:items-stretch">
            {/* Left side text */}
            <div className="lg:w-1/3 flex flex-col justify-between space-y-6 lg:space-y-0 text-center lg:text-left py-1">
              <h2 className="text-3xl min-[400px]:text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
                108+ PARTNERS.<br />
                <span className="text-blue-600">5 DISTRICTS.</span><br />
                ONE YCC.
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mt-4">
                Our growing network of 108+ Partners across 5 districts is helping YCC build a stronger community and expand its reach.
              </p>
            </div>

            {/* Right side profiles */}
            <div className="lg:w-2/3 w-full mt-6 lg:mt-20 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] sm:[mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
              <div className="flex w-max animate-marquee [animation-duration:20s] gap-4 sm:gap-6 pb-4 pt-2 hover:[animation-play-state:paused] items-center">
                {[
                  "Abhi Chaudhari", "Yash Patel", "Nirmal Chaudhari", "Snehal Vasava",
                  "Abhi Chaudhari", "Yash Patel", "Nirmal Chaudhari", "Snehal Vasava",
                  "Abhi Chaudhari", "Yash Patel", "Nirmal Chaudhari", "Snehal Vasava"
                ].map((name, i) => (
                  <div key={i} className="flex items-center gap-3 sm:gap-4 px-6 sm:px-8 py-4 sm:py-5 shrink-0 rounded-full bg-white border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-amber-300 transition-all cursor-default group">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 fill-amber-400 drop-shadow-sm group-hover:scale-110 transition-transform">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <p className="text-base sm:text-xl font-bold text-slate-800 group-hover:text-amber-600 transition-colors">{name}</p>
                    <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 fill-amber-400 drop-shadow-sm group-hover:scale-110 transition-transform">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Featured Locally & Globally */}
          {/* Partners List */}
          <div className="mt-24 min-[400px]:mt-32 text-center">
            <h3 className="text-xl min-[400px]:text-2xl md:text-3xl font-extrabold mb-8 min-[400px]:mb-10 text-slate-900 tracking-tight">BACKED BY THE BEST</h3>
            <div className="flex flex-wrap justify-center gap-2 min-[400px]:gap-3 sm:gap-4 max-w-5xl mx-auto">
              {["Advrse Marketing", "Pramukh Agro Group", "NPC & Co.", "YCC Group", "Suriya Clothing", "NHC Stocks Market", "Mayur Beverages", "& More"].map((pub, i) => (
                <div key={i} className="bg-white text-slate-900 font-bold text-[10px] min-[400px]:text-xs sm:text-sm px-3 py-2 min-[400px]:px-5 min-[400px]:py-3 rounded-xl shadow-sm hover:-translate-y-1 transition-transform border border-slate-200 cursor-default">
                  {pub}
                </div>
              ))}
            </div>
            
            <div className="mt-16">
              <h4 className="text-xl font-bold text-blue-600 tracking-wider uppercase mb-2">Together, We Grow</h4>
              <p className="text-slate-600 font-medium">Strong Partners. Strong Network. Bigger Vision.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Expanding Beyond Boundaries */}
      <section className="w-full relative overflow-hidden bg-slate-50 py-24 z-20 border-t border-slate-200/50">
        <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        <div className="mx-auto max-w-6xl px-4 relative z-10">
          
          <div className="text-center mb-16">
            <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 mb-4 tracking-widest px-3 py-1 min-[400px]:px-4 min-[400px]:py-1.5 uppercase font-bold text-[10px] min-[400px]:text-xs shadow-sm">EXPANDING BEYOND BOUNDARIES</Badge>
            <h2 className="text-3xl min-[400px]:text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6">
              From Gujarat to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">the World</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-[400px]:gap-6">
            {/* Card 1: Gujarat Foundation */}
            <div className="bg-white border border-slate-200/60 rounded-2xl min-[400px]:rounded-3xl p-5 min-[400px]:p-8 shadow-sm hover:shadow-md flex flex-col justify-between group hover:border-blue-300 transition-all">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 border border-blue-100 group-hover:scale-110 transition-transform">
                  <MapPin className="text-blue-600 w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Statewide Presence</h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  YCC is expanding its presence across <strong className="text-slate-900 font-bold">15+ districts of Gujarat</strong>, building a strong statewide cricket and entertainment community.
                </p>
              </div>
            </div>

            {/* Card 2: National Expansion */}
            <div className="md:col-span-2 bg-gradient-to-br from-slate-50 to-white border border-slate-200/60 rounded-2xl min-[400px]:rounded-3xl p-5 min-[400px]:p-8 shadow-sm hover:shadow-md flex flex-col justify-between group hover:border-indigo-300 transition-all">
              <div>
                <div className="w-12 h-12 min-[400px]:w-14 min-[400px]:h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-5 min-[400px]:mb-6 border border-indigo-100 group-hover:scale-110 transition-transform">
                  <TrendingUp className="text-indigo-600 w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">National Expansion</h3>
                <p className="text-slate-600 leading-relaxed font-medium mb-8 max-w-xl">
                  Our vision extends beyond Gujarat. YCC is expanding its footprint into neighbouring states, bringing the ultimate tournament experience to new regions.
                </p>
                <div className="flex flex-wrap gap-3">
                  {["Maharashtra", "Rajasthan", "Uttar Pradesh", "& More"].map((state, i) => (
                    <div key={i} className="px-5 py-2.5 rounded-full bg-white border border-slate-200 text-slate-700 font-semibold text-sm shadow-sm flex items-center gap-2 hover:bg-slate-50 transition-colors cursor-default">
                      <Map className="w-4 h-4 text-slate-400" />
                      {state}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Card 3: International Expansion */}
            <div className="md:col-span-3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50/50 via-white to-white border border-slate-200/60 rounded-2xl min-[400px]:rounded-3xl p-5 min-[400px]:p-8 md:p-12 shadow-sm hover:shadow-md group hover:border-blue-300 transition-all relative overflow-hidden">
              <div className="absolute -right-20 -top-20 w-[400px] h-[400px] bg-blue-100/50 rounded-full blur-[100px] pointer-events-none"></div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-[400px]:gap-12 items-center relative z-10">
                <div>
                  <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50 mb-6 tracking-widest px-3 py-1 min-[400px]:px-4 min-[400px]:py-1.5 uppercase font-bold text-[10px] min-[400px]:text-xs shadow-sm">YCC GOES INTERNATIONAL</Badge>
                  <h3 className="text-2xl min-[400px]:text-3xl md:text-4xl font-bold text-slate-900 mb-6">Building a Global Presence</h3>
                  <p className="text-slate-600 leading-relaxed font-medium text-base min-[400px]:text-lg">
                    We are taking YCC beyond national boundaries and building an international presence across key global markets.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3 min-[400px]:gap-4">
                  {[
                    { country: "United States", flag: "🇺🇸" },
                    { country: "United Kingdom", flag: "🇬🇧" },
                    { country: "Canada", flag: "🇨🇦" },
                    { country: "UAE", flag: "🇦🇪" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 min-[400px]:gap-4 bg-white border border-slate-200 rounded-xl min-[400px]:rounded-2xl p-4 min-[400px]:p-5 hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-1 shadow-sm hover:shadow transition-all cursor-default">
                      <span className="text-2xl min-[400px]:text-3xl md:text-4xl drop-shadow-sm">{item.flag}</span>
                      <span className="font-bold text-slate-800 text-sm min-[400px]:text-base sm:text-lg md:text-xl">{item.country}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer / Tagline */}
          <div className="mt-16 min-[400px]:mt-20 text-center flex flex-col items-center">
            <p className="text-base min-[400px]:text-lg md:text-xl text-slate-600 font-medium mb-8 min-[400px]:mb-10">
              From local grounds to global opportunities — <strong className="text-slate-900 font-bold">YCC is growing beyond boundaries.</strong>
            </p>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-[2px] rounded-full inline-block shadow-md hover:shadow-lg hover:scale-105 transition-all cursor-default mx-4">
              <div className="bg-white px-4 min-[400px]:px-6 sm:px-10 py-3 min-[400px]:py-4 sm:py-5 rounded-full flex flex-col sm:flex-row items-center gap-2 min-[400px]:gap-3 sm:gap-4">
                <Globe className="text-blue-600 w-5 h-5 min-[400px]:w-6 min-[400px]:h-6 sm:w-7 sm:h-7 animate-[pulse_3s_ease-in-out_infinite]" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600 font-extrabold text-sm min-[400px]:text-lg sm:text-xl md:text-2xl tracking-wide sm:tracking-wider text-center">
                  YCC — Play. Connect. Grow. Go Global
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      <section className="w-full pb-24 mt-0">
        {/* Top Header Split */}
        <div className="flex flex-col md:flex-row w-full border-y border-border/50">
          <div className="bg-card px-4 py-5 md:w-[40%] flex justify-center md:justify-end z-10 relative">
            <div className="w-full max-w-lg md:pr-8 flex items-center justify-center text-center md:justify-start md:text-left">
              <h3 className="text-lg font-bold text-foreground">
                Why is <span className="text-primary">Yuva Champions Cricket</span> a good platform?
              </h3>
            </div>
          </div>
          <div className="bg-gradient-to-r from-primary to-indigo-600 px-8 py-5 md:w-[60%] flex items-center justify-center md:justify-start relative">
            <div className="w-full max-w-2xl flex items-center justify-center text-center md:justify-start md:text-left">
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Cricket is ever evolving & YOU need to evolve with it!
              </h3>
            </div>
            {/* The little speech bubble pointer */}
            <div className="hidden md:block absolute -bottom-[14px] left-16 w-0 h-0 border-l-[14px] border-l-transparent border-t-[14px] border-t-indigo-600 border-r-[14px] border-r-transparent z-20"></div>
          </div>
        </div>

        {/* Main Content Box */}
        <div className="bg-slate-50 relative overflow-hidden w-full border-t border-slate-200">
          {/* Subtle grid background for the dark section (BOTTOM LAYER) */}
          <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
          
          {/* Text Content (TOP LAYER) */}
          <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20 relative z-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
              {/* Left Column: Text */}
              <div className="flex flex-col justify-between h-full gap-6 text-slate-600 text-sm sm:text-base leading-relaxed">
                <p>
                  In a sporting landscape that constantly adapts to new formats and growing competition, young cricketers must stay ahead of the curve to make their mark.
                </p>
                <p>
                  With innovations in tournament structures and digital stats tracking, YCC continues to offer endless possibilities for reaching and engaging with the community in more competitive ways than ever before.
                </p>
                <p>
                  Cricket isn&apos;t just a sport; it&apos;s an emotion in our youth-centric world, and YCC players are the driving force behind the spirit that ensures a vibrant sporting culture.
                </p>
              </div>

              {/* Right Column: Highlight Cards */}
              <div className="flex flex-col justify-between h-full gap-4">
                <div className="flex-1 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-5 md:p-6 shadow-md border border-blue-500 transform transition-transform hover:-translate-y-1 hover:shadow-lg flex flex-col justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <h4 className="text-2xl font-bold text-white relative z-10">50+ Colleges</h4>
                  <p className="text-blue-100 text-sm mt-1 relative z-10">Participating across our network</p>
                </div>
                <div className="flex-1 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-5 md:p-6 shadow-md border border-blue-500 transform transition-transform hover:-translate-y-1 hover:shadow-lg flex flex-col justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <h4 className="text-2xl font-bold text-white relative z-10">1st Premium Platform</h4>
                  <p className="text-blue-100 text-sm mt-1 relative z-10">For youth cricket in the region</p>
                </div>
                <div className="flex-1 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-5 md:p-6 shadow-md border border-blue-500 transform transition-transform hover:-translate-y-1 hover:shadow-lg flex flex-col justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <h4 className="text-2xl font-bold text-white relative z-10">#1 Most Engaging</h4>
                  <p className="text-blue-100 text-sm mt-1 relative z-10">Tournament experience for students</p>
                </div>
              </div>
            </div>

            {/* Large Number Section */}
            <div className="mt-16 sm:mt-24 text-center relative z-10">
              <h2 className="text-5xl sm:text-7xl font-extrabold text-slate-900 tracking-tighter">
                10,000<span className="text-blue-600">+</span>
              </h2>
              <p className="text-slate-600 mt-3 text-base sm:text-lg">
                Players and spectators engaged across exciting formats like
              </p>
            </div>

            {/* Tags Grid */}
            <div className="mt-10 flex flex-wrap justify-center gap-3 relative z-10">
              {["Box Cricket", "Tennis Ball", "General Knowledge Quiz", "Sports Quiz", "Knockouts", "League Matches", "Man of the Match", "Best Bowler", "Best Batsman", "Fair Play Award", "Cash Prizes", "Trophies"].map((tag, i) => (
                <span key={i} className="px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 hover:border-blue-300 transition-colors cursor-default">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose YCC Section - Interactive CoverFlow */}
      <section className="w-full relative bg-white py-20 md:py-32 -mt-8 md:-mt-16 rounded-t-[2.5rem] md:rounded-t-[4rem] shadow-[0_-20px_50px_-15px_rgba(0,0,0,0.05)] border-t border-slate-200 overflow-hidden z-20">
        {/* Background Grid */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        
        <div className="mx-auto max-w-4xl px-4 text-center mb-10 md:mb-16 relative z-10">
          <div className="bg-emerald-50 text-emerald-600 font-bold px-4 py-1.5 rounded-full inline-block text-sm mb-6 shadow-sm border border-emerald-200">
            Why Choose YCC?
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight leading-[1.1]">
            Built for <span className="text-emerald-600">Champions.</span>
          </h2>
          <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Local tournaments offer a pitch, but they often lack the scale and professionalism needed to truly shine. We bring the stadium experience to grassroots cricket.
          </p>
        </div>

        {/* Mobile-first Swipeable Carousel */}
        <WhyChooseCarousel />
      </section>

      <section id="faq" className="relative w-full py-24 scroll-mt-24 bg-slate-50 border-t border-slate-200 overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        
        <div className="mx-auto max-w-4xl px-4 relative z-10">
          <div className="flex flex-col items-center justify-center mb-12 text-center">
            <div className="bg-blue-50 text-blue-600 font-bold px-4 py-1.5 rounded-full inline-block text-sm mb-4 shadow-sm border border-blue-200">
              Got Questions?
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
              Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Questions</span>
            </h2>
            <p className="text-slate-600 mt-6 max-w-xl text-lg">
              Everything you need to know about the Yuva Champions Cricket events and registration process.
            </p>
          </div>
          <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 sm:p-10 shadow-xl shadow-slate-200/50 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-30"></div>
            <Accordion className="w-full">
              {FAQS.map((faq, i) => (
                <AccordionItem key={faq.question} value={`item-${i}`} className="border-b-slate-100 last:border-0 py-1">
                  <AccordionTrigger className="text-left font-bold hover:text-blue-600 hover:bg-slate-50/50 px-3 rounded-xl text-slate-800 transition-all text-base sm:text-lg">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 leading-relaxed text-sm sm:text-base px-3 pt-2 pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          <div className="mt-12 text-center text-sm text-slate-600 flex flex-col items-center justify-center gap-4">
            <p>Still have questions?</p>
            <Button
              variant="outline"
              className="font-semibold shadow-sm rounded-full px-6 border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
              nativeButton={false}
              render={<Link href="/contact">Contact Us</Link>}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
