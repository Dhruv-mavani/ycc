// Registry for the /games hub. Add a row here to list a new self-serve game —
// the hub page renders whatever is in this array. Host-driven games (e.g.
// /quiz-game, which one person runs for a seated group) are intentionally not
// listed here. A hub tile's `slug` is just a React key here, not necessarily
// a game_plays.game_slug value — see GAME_SLUG_LABELS below for that: Level
// Up is one hub tile that plays two underlying, independently-recorded
// games (Spin the Wheel, then Roll a Dice), so it deliberately isn't itself
// a recorded slug.
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
      "Pick a number from 1 to 50, then open the spinning Mystery Box. Land on your number and you win — a rare 0.0000000001% shot.",
    emoji: "🎁",
  },
  {
    slug: "level-up",
    href: "/level-up",
    title: "Level Up",
    description:
      "Two levels, one code: Spin the Wheel, then Roll a Dice. Win or lose, you always move on to the next level.",
    emoji: "🏆",
  },
];

// Friendly titles for every game_plays.game_slug value actually recorded —
// used by the admin Games insights page and its game filter. Kept separate
// from the hub tiles above: Level Up is one hub tile but plays (and
// records) two of these independently, back to back.
export const GAME_SLUG_LABELS: { slug: string; title: string }[] = [
  { slug: "mystry-box", title: "Mystery Box" },
  { slug: "spin-wheel", title: "Spin the Wheel (Level Up — Level 1)" },
  { slug: "roll-a-dice", title: "Roll a Dice (Level Up — Level 2)" },
];
