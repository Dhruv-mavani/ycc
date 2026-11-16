import "server-only";

// Hindi translations of the quiz question bank — positionally aligned with
// src/lib/quiz-game-questions.ts's QUESTION_TIERS / AI_TRAP_QUESTIONS.
// TIERS[tierIndex][questionIndex] must correspond to exactly the same
// question as QUESTION_TIERS[tierIndex].questions[questionIndex] in that
// file (same correctIndex, same position) — translate text/options only,
// never reorder. correctIndex is NOT duplicated here; it's inherited from
// the English entry at the same [tier][index].
//
// Tier lengths (English source, for reference): 176, 176, 195, 182, 184.
// TRAP length: 14.
//
// quiz-session.ts falls back to the English entry for any index missing
// here (bounds-checked), so this file can be filled in incrementally
// without ever breaking the game — an untranslated question just shows in
// English until its slot is filled in.

export interface TranslatedQuizText {
  question: string;
  options: [string, string, string, string];
}

export const TIERS: TranslatedQuizText[][] = [[], [], [], [], []];
export const TRAP: TranslatedQuizText[] = [];
