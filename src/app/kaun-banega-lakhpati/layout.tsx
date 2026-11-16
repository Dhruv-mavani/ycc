import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kaun Banega Lakhpati | YCC",
  description: "A solo, self-serve KBC-style quiz game for YCC visitors.",
};

// Deliberately outside the (public) route group — no site header/footer,
// same reasoning as /quiz-game2: this is a full-screen game experience and
// the marketing chrome would only get in the way.
export default function KaunBanegaLakhpatiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-violet-950 to-[#0c0420] text-white">
      {children}
    </div>
  );
}
