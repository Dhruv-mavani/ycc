import Link from "next/link";
import { BackButton } from "@/components/site/back-button";
import { Trophy, Gamepad2, Mic, Music, UserRound, PhoneCall } from "lucide-react";

const categories = [
  {
    title: "Cricket Tournaments",
    detail: "Tennis Ball • Plastic Ball • Box Cricket",
    emoji: "🏏",
    icon: Trophy,
    tone: "from-blue-100 to-blue-50 text-blue-600",
  },
  {
    title: "E-Gaming",
    detail: "PUBG • BGMI • Free Fire • 8 Ball Pool",
    emoji: "🎮",
    icon: Gamepad2,
    tone: "from-indigo-100 to-indigo-50 text-indigo-600",
  },
  {
    title: "Stand-Up Comedy",
    detail: "Gujarati • Hindi • Crowd Work",
    emoji: "🎤",
    icon: Mic,
    tone: "from-emerald-100 to-emerald-50 text-emerald-600",
  },
  {
    title: "Music Fest",
    detail: "Pop Music • Concerts • DJ Parties",
    emoji: "🎵",
    icon: Music,
    tone: "from-pink-100 to-pink-50 text-pink-600",
  },
];

export default function AboutPage() {
  return (
    <div className="relative min-h-screen pb-20">
      {/* Background grid */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_100%_50%_at_50%_50%,#000_60%,transparent_100%)]"></div>

      <div className="relative mx-auto max-w-4xl px-4 min-[320px]:px-6 pt-10">
        <BackButton className="mb-6 sm:mb-10" />

        <div className="mb-10 sm:mb-16 text-center">
          <h1 className="text-3xl min-[320px]:text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600 mb-4">
            What is YCC?
          </h1>
          <p className="text-muted-foreground text-sm min-[320px]:text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Yuva Champions Cricket — a sports, entertainment &amp; youth-focused platform.
          </p>
        </div>

        <div className="space-y-6 sm:space-y-8">
          {/* Card 1: What is YCC */}
          <div className="group relative overflow-hidden rounded-3xl bg-white/60 dark:bg-card/40 backdrop-blur-md border border-border/50 p-6 min-[320px]:p-8 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
            <div className="flex flex-col sm:flex-row gap-5 min-[320px]:gap-6 items-start">
              <div className="rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 p-4 text-blue-600 shadow-inner group-hover:scale-110 group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white transition-all duration-300 shrink-0">
                <Trophy className="size-6 min-[320px]:size-8" />
              </div>
              <div>
                <h2 className="text-xl min-[320px]:text-2xl font-bold text-foreground tracking-tight mb-3">
                  What is YCC?
                </h2>
                <p className="text-muted-foreground text-sm min-[320px]:text-base leading-relaxed">
                  YCC (Yuva Champions Cricket) is a sports, entertainment &amp; youth-focused platform with a primary focus on organizing and managing cricket tournaments across multiple formats like Tennis Ball &amp; Plastic Ball Tournaments, Box Cricket Tournaments, and more.
                </p>
                <p className="text-muted-foreground text-sm min-[320px]:text-base leading-relaxed mt-3">
                  While cricket is YCC&apos;s core focus, we also cater to other popular categories.
                </p>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <p className="mb-4 text-center text-xs min-[320px]:text-sm font-bold uppercase tracking-widest text-muted-foreground">
              YCC Categories • Upcoming Events
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {categories.map(({ title, detail, emoji, icon: Icon, tone }) => (
                <div
                  key={title}
                  className="group rounded-3xl bg-white/60 dark:bg-card/40 backdrop-blur-md border border-border/50 p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className={`rounded-2xl bg-gradient-to-br ${tone} p-3 shadow-inner group-hover:scale-110 transition-all duration-300 shrink-0`}>
                      <Icon className="size-6" />
                    </div>
                    <h3 className="text-lg min-[320px]:text-xl font-bold text-foreground tracking-tight">
                      <span aria-hidden="true">{emoji} </span>
                      {title}
                    </h3>
                  </div>
                  <p className="mt-3 text-muted-foreground text-sm min-[320px]:text-base leading-relaxed">
                    {detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Founder & Team */}
          <div className="group relative overflow-hidden rounded-3xl bg-white/60 dark:bg-card/40 backdrop-blur-md border border-border/50 p-6 min-[320px]:p-8 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
            <div className="flex flex-col sm:flex-row gap-5 min-[320px]:gap-6 items-start">
              <div className="rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 p-4 text-emerald-600 shadow-inner group-hover:scale-110 group-hover:from-emerald-500 group-hover:to-teal-600 group-hover:text-white transition-all duration-300 shrink-0">
                <UserRound className="size-6 min-[320px]:size-8" />
              </div>
              <div>
                <h2 className="text-xl min-[320px]:text-2xl font-bold text-foreground tracking-tight mb-3">
                  Founder &amp; Team
                </h2>
                <div className="space-y-3 text-muted-foreground text-sm min-[320px]:text-base leading-relaxed">
                  <p>
                    Abhishek N. Chaudhari (Abhi) is a 25-year-old entrepreneur from Bardoli, Gujarat, and the Founder of YCC. His entrepreneurial journey began in 2019 with e-commerce, followed by ventures in media and advertising.
                  </p>
                  <p>
                    In 2024, he began organizing local cricket tournaments across Bardoli and Tapi District. As participation grew significantly in 2025, he envisioned a more structured and scalable platform for grassroots sports.
                  </p>
                  <p>
                    This vision led to the establishment of YCC in 2026, with an expanding focus on cricket, e-gaming, media, and entertainment.
                  </p>
                </div>
                <p className="mt-4 font-bold text-foreground">And the journey continues.</p>
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
