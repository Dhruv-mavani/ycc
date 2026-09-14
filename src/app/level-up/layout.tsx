import type { Metadata } from "next";
import { GameBackLink } from "@/components/site/game-back-link";

export const metadata: Metadata = {
  title: "Level Up | YCC",
  description:
    "Two levels, one code: Spin the Wheel, then Roll a Dice. Win or lose, you always move on to the next level.",
};

// Deliberately outside the (public) route group — no site header/footer,
// same reasoning as the other self-serve games: a full-screen experience
// where marketing chrome would only get in the way. Deep violet, its own
// identity distinct from Mystery Box's magic-purple, Spin the Wheel's
// ocean teal (now folded in as Level 1's own accent color), and Roll a
// Dice's felt-green (now Level 2's).
export default function LevelUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-[#1e1240] via-[#2a1854] to-[#0d0824] text-white">
      <GameBackLink />
      {children}
    </div>
  );
}
