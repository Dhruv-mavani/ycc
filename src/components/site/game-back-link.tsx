import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

// Top-left "back to the games hub" pill for the standalone full-screen game
// routes (/quiz-game2, /mystry-box). They render outside the (public) route
// group, so there's no site header to navigate back from.
export function GameBackLink() {
  return (
    <Link
      href="/games"
      className="absolute left-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white/80 backdrop-blur transition-colors hover:bg-white/20 hover:text-white"
    >
      <ArrowLeftIcon className="size-4" />
      Games
    </Link>
  );
}
