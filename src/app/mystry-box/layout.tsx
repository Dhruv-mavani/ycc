import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mystery Box | YCC",
  description:
    "Pick a number from 1 to 50 and open the spinning Mystery Box — match it to win.",
};

// Deliberately outside the (public) route group — no site header/footer, same
// reasoning as /quiz-game2: this is a full-screen game experience and the
// marketing chrome would only get in the way. Dark magic-purple ground behind
// a warm amber crate. No back-to-games link here either, matching Level Up's
// layout — the game screens are meant to be played start to finish.
export default function MysteryBoxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-[#1b1030] via-[#241247] to-[#0b0616] text-white">
      {children}
    </div>
  );
}
