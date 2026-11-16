import "server-only";

// Gujarati translations — see hi.ts's header comment for the exact same
// alignment/fallback rules; everything there applies here too.

export interface TranslatedQuizText {
  question: string;
  options: [string, string, string, string];
}

export const TIERS: TranslatedQuizText[][] = [[], [], [], [], []];
export const TRAP: TranslatedQuizText[] = [];
