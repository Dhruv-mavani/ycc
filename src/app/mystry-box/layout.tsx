import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mystery Box | YCC",
  description:
    "Pick a number from 1 to 50 and open the spinning Mystery Box — match it to win.",
};

// Deliberately outside the (public) route group — no site header/footer, same
// reasoning as /quiz-game2: this is a full-screen game experience and the
// marketing chrome would only get in the way. A richer, more saturated
// jewel-tone backdrop (indigo -> magenta -> warm amber glow near the box)
// than the old flat dark-purple — a loot-box/arcade feel, inspired by the
// glossy gold/red/blue mystery-box look mobile games like Subway Surfers
// use for their reward boxes — while staying dark enough that the white
// text used throughout every screen keeps its contrast. No back-to-games
// link here either, matching Level Up's layout — the game screens are
// meant to be played start to finish.
export default function MysteryBoxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-[#1a0b3d] via-[#3a0f52] to-[#1a0620] text-white">
      {children}
    </div>
  );
}
