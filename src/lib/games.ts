// Registry for the /games hub. Add a row here to list a new self-serve game —
// the hub page renders whatever is in this array. Host-driven games (e.g.
// /quiz-game, which one person runs for a seated group) are intentionally not
// listed here.
export interface GameLink {
  slug: string;
  href: string;
  title: string;
  description: string;
  emoji: string;
}

export const GAMES: GameLink[] = [
  {
    slug: "quiz-game2",
    href: "/quiz-game2",
    title: "Quiz Champion",
    description:
      "A solo, KBC-style quiz — timed questions, four lifelines, and every one a little tougher than the last. No login, just you against the quiz.",
    emoji: "🧠",
  },
  {
    slug: "mystry-box",
    href: "/mystry-box",
    title: "Mystery Box",
    description:
      "Pick a number from 1 to 50, then open the spinning Mystery Box. Land on your number and you win — a rare 0.001% shot.",
    emoji: "🎁",
  },
  {
    slug: "spin-wheel",
    href: "/spin-wheel",
    title: "Spin the Wheel",
    description:
      "Pick a number from 1 to 10 and spin an 11-section wheel. Land on your number, or land on the rare Goa Trip with Gang (free to all) section, and you win.",
    emoji: "🎡",
  },
];
