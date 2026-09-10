import type { Metadata } from "next";
import Link from "next/link";
import { BackButton } from "@/components/site/back-button";
import { GAMES } from "@/lib/games";

export const metadata: Metadata = {
  title: "Games | YCC",
  description:
    "Play YCC's quick, no-login mini-games — the Quiz Champion quiz, the Mystery Box, and more.",
};

export default function GamesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <BackButton className="mb-4" />
      <h1 className="mb-1 text-2xl font-bold">Games</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Quick, no-login mini-games to play while you wait. More coming soon.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {GAMES.map((game) => (
          <Link
            key={game.slug}
            href={game.href}
            className="group ring-foreground/10 hover:ring-primary/40 rounded-xl bg-card p-5 ring-1 transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="text-3xl">{game.emoji}</div>
            <h2 className="group-hover:text-primary mt-3 font-semibold">
              {game.title}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {game.description}
            </p>
            <span className="text-primary mt-3 inline-block text-sm font-medium">
              Play →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
