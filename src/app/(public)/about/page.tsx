import Link from "next/link";
import { BackButton } from "@/components/site/back-button";
import { Trophy, Target, Smartphone, Sparkles, PhoneCall } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="relative min-h-screen pb-20">
      {/* Background grid */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_100%_50%_at_50%_50%,#000_60%,transparent_100%)]"></div>

      <div className="relative mx-auto max-w-4xl px-4 min-[320px]:px-6 pt-10">
        <BackButton className="mb-6 sm:mb-10" />

        <div className="mb-10 sm:mb-16 text-center">
          <h1 className="text-3xl min-[320px]:text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600 mb-4">
            About YCC
          </h1>
          <p className="text-muted-foreground text-sm min-[320px]:text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Yuva Champions Cricket — A modern, youth-first sports platform built by the youth, for the youth.
          </p>
        </div>

        <div className="space-y-6 sm:space-y-8">
          {/* Card 1: Platform */}
          <div className="group relative overflow-hidden rounded-3xl bg-white/60 dark:bg-card/40 backdrop-blur-md border border-border/50 p-6 min-[320px]:p-8 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
            <div className="flex flex-col sm:flex-row gap-5 min-[320px]:gap-6 items-start">
              <div className="rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 p-4 text-blue-600 shadow-inner group-hover:scale-110 group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white transition-all duration-300 shrink-0">
                <Trophy className="size-6 min-[320px]:size-8" />
              </div>
              <div>
                <h2 className="text-xl min-[320px]:text-2xl font-bold text-foreground tracking-tight mb-3">
                  The Platform
                </h2>
                <p className="text-muted-foreground text-sm min-[320px]:text-base leading-relaxed">
                  We bring college students together through exciting cricket tournaments and quiz competitions, delivering unforgettable experiences, exclusive rewards, and opportunities to become tomorrow&apos;s champions.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Mission */}
          <div className="group relative overflow-hidden rounded-3xl bg-white/60 dark:bg-card/40 backdrop-blur-md border border-border/50 p-6 min-[320px]:p-8 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300">
            <div className="flex flex-col sm:flex-row gap-5 min-[320px]:gap-6 items-start">
              <div className="rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 p-4 text-indigo-600 shadow-inner group-hover:scale-110 group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:text-white transition-all duration-300 shrink-0">
                <Target className="size-6 min-[320px]:size-8" />
              </div>
              <div>
                <h2 className="text-xl min-[320px]:text-2xl font-bold text-foreground tracking-tight mb-3">
                  Our Mission
                </h2>
                <p className="text-muted-foreground text-sm min-[320px]:text-base leading-relaxed">
                  Our mission is simple: give college students a genuine platform to compete, showcase their talent, and build a name for themselves — on the field and off it. From tennis-ball and box cricket formats to general knowledge and sports quizzes, YCC events are designed to be accessible, competitive, and fun.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Experience */}
          <div className="group relative overflow-hidden rounded-3xl bg-white/60 dark:bg-card/40 backdrop-blur-md border border-border/50 p-6 min-[320px]:p-8 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
            <div className="flex flex-col sm:flex-row gap-5 min-[320px]:gap-6 items-start">
              <div className="rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 p-4 text-emerald-600 shadow-inner group-hover:scale-110 group-hover:from-emerald-500 group-hover:to-teal-600 group-hover:text-white transition-all duration-300 shrink-0">
                <Smartphone className="size-6 min-[320px]:size-8" />
              </div>
              <div>
                <h2 className="text-xl min-[320px]:text-2xl font-bold text-foreground tracking-tight mb-3">
                  The Experience
                </h2>
                <p className="text-muted-foreground text-sm min-[320px]:text-base leading-relaxed">
                  Every team and participant that registers with YCC gets a smooth, mobile-first registration experience, instant digital receipts with a unique participant ID and QR code, and fair, transparent verification at the venue.
                </p>
              </div>
            </div>
          </div>

          {/* Card 4: Future */}
          <div className="group relative overflow-hidden rounded-3xl bg-white/60 dark:bg-card/40 backdrop-blur-md border border-border/50 p-6 min-[320px]:p-8 shadow-sm hover:shadow-xl hover:shadow-pink-500/10 transition-all duration-300">
            <div className="flex flex-col sm:flex-row gap-5 min-[320px]:gap-6 items-start">
              <div className="rounded-2xl bg-gradient-to-br from-pink-100 to-pink-50 p-4 text-pink-600 shadow-inner group-hover:scale-110 group-hover:from-pink-500 group-hover:to-rose-600 group-hover:text-white transition-all duration-300 shrink-0">
                <Sparkles className="size-6 min-[320px]:size-8" />
              </div>
              <div>
                <h2 className="text-xl min-[320px]:text-2xl font-bold text-foreground tracking-tight mb-3">
                  What&apos;s Next
                </h2>
                <p className="text-muted-foreground text-sm min-[320px]:text-base leading-relaxed">
                  We&apos;re just getting started — more tournaments, more colleges, and more formats are on the way. Follow our official channels for schedules, fixtures, and updates.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Banner */}
        <div className="mt-12 sm:mt-16 overflow-hidden rounded-3xl border border-blue-200 shadow-lg">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 min-[320px]:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-white">
              <div className="rounded-full bg-white/20 p-3 min-[320px]:p-4 backdrop-blur-md shrink-0">
                <PhoneCall className="size-5 min-[320px]:size-6" />
              </div>
              <div>
                <p className="font-bold text-lg min-[320px]:text-xl tracking-tight">Get in touch</p>
                <p className="text-blue-100 text-xs min-[320px]:text-sm mt-0.5">Need help or have questions?</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 w-full sm:w-auto">
              <a 
                href="tel:+918487832810" 
                className="w-full sm:w-auto text-center bg-white text-blue-700 hover:bg-blue-50 hover:scale-105 font-bold py-3 px-8 rounded-full shadow-md transition-all duration-300 text-sm min-[320px]:text-base"
              >
                Call +91 84878 32810
              </a>
              <Link 
                href="/contact" 
                className="w-full sm:w-auto text-center bg-white/20 text-white border border-white/20 hover:bg-white/30 hover:scale-105 font-bold py-3 px-8 rounded-full shadow-sm transition-all duration-300 text-sm min-[320px]:text-base"
              >
                Message Us
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
