import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quiz Champion | YCC",
  description: "A solo, self-serve KBC-style quiz game for YCC visitors.",
};

// Deliberately outside the (public) route group — no site header/footer.
// Same reasoning as /quiz-game's layout: this is a full-screen game
// experience, so the marketing chrome would only get in the way. Dark
// violet background matches the devxprite/kbc reference this page is
// styled after (see solo-quiz-game.tsx's header comment).
export default function QuizGame2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 to-[#0c0420] text-white">
      {children}
    </div>
  );
}
