import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quiz Game | YCC",
  description: "A host-driven KBC-style quiz game for YCC events.",
};

// Deliberately outside the (public) route group — no site header/footer.
// This is a full-screen game-show display meant to be run by one host on
// their phone in front of a seated group, so every bit of vertical space
// matters and the marketing chrome would only get in the way.
export default function QuizGameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {children}
    </div>
  );
}
