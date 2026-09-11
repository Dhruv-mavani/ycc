import type { Metadata } from "next";
import Link from "next/link";
import { BackButton } from "@/components/site/back-button";
import { GAMES } from "@/lib/games";
import { ArrowRight, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Games | YCC",
  description:
    "Play YCC's quick, no-login mini-games — the Quiz Champion quiz, the Mystery Box, and more.",
};

export default function GamesPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-background">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)]"></div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
      <div className="pointer-events-none absolute top-0 right-0 -z-10 h-[30rem] w-[30rem] -translate-y-1/2 translate-x-1/3 rounded-full bg-primary/20 blur-[100px] animate-pulse"></div>
      <div 
        className="pointer-events-none absolute bottom-0 left-0 -z-10 h-[30rem] w-[30rem] translate-y-1/3 -translate-x-1/3 rounded-full bg-blue-500/10 blur-[100px] animate-pulse" 
        style={{ animationDelay: '1s' }}
      ></div>

      <div className="mx-auto max-w-5xl px-3 py-6 sm:px-6 sm:py-16 lg:px-8">
        <BackButton className="mb-6 sm:mb-8" />
        
        <div className="mb-10 flex flex-col items-center text-center sm:items-start sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 mb-5 text-xs sm:text-sm font-medium text-primary shadow-sm backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Instant Play Mini-Games</span>
          </div>
          <h1 className="mb-3 text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60 flex items-center gap-4">
            Games Hub
          </h1>
          <p className="max-w-2xl text-muted-foreground text-xs sm:text-base md:text-lg leading-relaxed">
            Quick, no-login mini-games to play while you wait. Choose a game below and start playing instantly. Compete, win, and have fun!
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {GAMES.map((game) => (
            <Link
              key={game.slug}
              href={game.href}
              className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-border/50 bg-card/40 p-1.5 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/40"
            >
              {/* Card Hover Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              
              <div className="relative flex h-full flex-col rounded-[1.75rem] bg-card/80 p-5 sm:p-7 backdrop-blur-md border border-background/20">
                <div className="mb-5 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-3xl sm:text-4xl shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:from-primary/30 group-hover:to-primary/10 border border-primary/10">
                  {game.emoji}
                </div>
                
                <h2 className="mb-2 sm:mb-3 text-lg sm:text-2xl font-bold tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
                  {game.title}
                </h2>
                
                <p className="mb-6 sm:mb-8 flex-1 text-xs sm:text-sm leading-relaxed text-muted-foreground line-clamp-3">
                  {game.description}
                </p>
                
                <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-4 sm:pt-5">
                  <span className="text-xs sm:text-sm font-semibold text-primary/80 transition-colors duration-300 group-hover:text-primary">
                    Play Now
                  </span>
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:translate-x-2 group-hover:shadow-lg group-hover:shadow-primary/30">
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
