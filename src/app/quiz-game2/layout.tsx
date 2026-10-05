import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quiz Champion | YCC",
  description: "A solo, self-serve KBC-style quiz game for YCC visitors.",
};

// Deliberately outside the (public) route group — no site header/footer.
// This is a full-screen game experience, so the marketing chrome would
// only get in the way. Dark violet background matches the devxprite/kbc
// reference this page is styled after (see solo-quiz-game.tsx's header
// comment). No back-to-games link here either, matching Mystery Box and
// Level Up's layouts.
export default function QuizGame2Layout({
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
