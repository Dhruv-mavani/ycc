import type { Metadata } from "next";
import { GameBackLink } from "@/components/site/game-back-link";

export const metadata: Metadata = {
  title: "Roll a Dice | YCC",
  description:
    "Pick a total from 2 to 12, then roll two dice tumbling through real 3D space — match it to win.",
};

// Deliberately outside the (public) route group — no site header/footer,
// same reasoning as /mystry-box and /spin-wheel: a full-screen game
// experience where marketing chrome would only get in the way. A warm,
// felt-green table gradient gives this game its own identity next to
// Spin the Wheel's ocean teal and Mystery Box's magic-purple.
export default function RollADiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-[#0f2b1c] via-[#123a24] to-[#081810] text-white">
      <GameBackLink />
      {children}
    </div>
  );
}
