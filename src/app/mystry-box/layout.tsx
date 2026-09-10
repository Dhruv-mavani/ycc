import type { Metadata } from "next";
import { GameBackLink } from "@/components/site/game-back-link";

export const metadata: Metadata = {
  title: "Mystery Box | YCC",
  description:
    "Pick a number from 1 to 50 and open the spinning Mystery Box — match it to win.",
};

// Deliberately outside the (public) route group — no site header/footer, same
// reasoning as /quiz-game2: this is a full-screen game experience and the
// marketing chrome would only get in the way. Dark magic-purple ground behind
// a warm amber crate.
export default function MysteryBoxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-[#1b1030] via-[#241247] to-[#0b0616] text-white">
      <GameBackLink />
      {children}
    </div>
  );
}
