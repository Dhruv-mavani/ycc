import type { Metadata } from "next";
import { GameBackLink } from "@/components/site/game-back-link";

export const metadata: Metadata = {
  title: "Spin the Wheel | YCC",
  description:
    "Pick a number from 1 to 10 and spin an 11-section wheel — land on it, or land on Goa Trip with Gang (free to all), to win.",
};

// Deliberately outside the (public) route group — no site header/footer,
// same reasoning as /quiz-game2 and /mystry-box: a full-screen game
// experience where marketing chrome would only get in the way. Deep
// teal/ocean gradient gives this game its own identity next to Quiz
// Champion's violet and Mystery Box's magic-purple.
export default function SpinWheelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-[#052e3f] via-[#0a3b52] to-[#031820] text-white">
      <GameBackLink />
      {children}
    </div>
  );
}
