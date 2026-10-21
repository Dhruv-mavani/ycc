"use client";

import { useEffect, useState } from "react";

// Cycled through while YUVAN is "thinking" — funny, cricket-flavoured
// Hinglish only (no plain "Thinking…"), kept short so every phrase fits
// the compact thinking bubble.
const THINKING_PHRASES = [
  "Dimaag laga raha hoon…",
  "Zara ruko boss…",
  "Thoda sabar, jawab aa raha hai…",
  "Full josh mein soch raha hoon…",
  "Apna hi dimaag laga raha hoon 😄",
  "Bas do second, over ban raha hai…",
  "Scene samajh raha hoon…",
  "Ek min, wicket nikaal raha hoon…",
  "Chauka maarne ki tayaari…",
  "Line length soch raha hoon…",
];

/**
 * This component fully unmounts/remounts each time the parent's "thinking"
 * block toggles (it's only ever rendered inside `status === "submitted" ?
 * (...) : null`), so its own state naturally resets to index 0 at the
 * start of every new thinking period without needing a key or a
 * setState-in-effect reset.
 */
export function ThinkingLabel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % THINKING_PHRASES.length);
    }, 1600);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="text-[11px] font-medium text-muted-foreground">
      {THINKING_PHRASES[index]}
    </span>
  );
}
