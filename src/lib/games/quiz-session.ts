import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { lookupGameTeamById, type GameTeamSource } from "@/lib/game-plays";
import { QUESTION_TIERS, LEVELS_PER_TIER, TOTAL_LEVELS } from "@/lib/quiz-game-questions";

// ---------------------------------------------------------------------------
// Server-authoritative counterpart to Quiz Champion's former fully
// client-side game loop. The old version imported the whole question bank
// (text, options, AND correctIndex) straight into the browser bundle — so
// the "security fix" for it isn't just about blocking a forged network
// request (like Level Up/Mystery Box needed), it's that the answer key was
// readable in plain JS via devtools regardless of what any request said.
// The question data now never leaves the server at all (quiz-game-questions.ts
// is "server-only"); the client only ever gets a question's text and its 4
// options already shuffled into display order, never which one is correct.
//
// State (which question is live, the correct slot, lifelines used, etc.)
// lives in a signed, opaque token the client round-trips with every call —
// not a DB table. The token is tamper-evident (HMAC-SHA256, keyed off the
// service-role secret so only this server can mint or trust one) but not
// encrypted: nothing in it is secret FROM the holder except the single
// `correctSlot` field, and revealing "which slot number was correct" for a
// question already being shown is unavoidable once the round ends anyway —
// what matters is the client can't forge or edit it. This mirrors the
// "write at decision time, not after" principle from rollAndRecordLevelUpPlay
// (src/lib/game-plays.ts): the only DB write happens once, when a run
// actually ends (won or lost), not per-question.
// ---------------------------------------------------------------------------

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

interface QuizTokenPayload {
  v: 1;
  source: GameTeamSource;
  teamRefId: string;
  playerRefId: string;
  levelIndex: number;
  // Pre-planned pool index (into QUESTION_TIERS[tier].questions) for every
  // level of the whole game, same upfront-assignment approach the old
  // client-side assignAllLevels() used — guarantees no repeated question in
  // one playthrough. Flip Question mutates only the current level's entry.
  assignedIndexByLevel: Record<number, number>;
  // Correct slot (0-3) for the CURRENT (levelIndex) question's shuffled
  // display — the one piece of this payload that's a genuine secret from
  // the client holding it, until they answer or a lifeline reveals it.
  correctSlot: number;
  hiddenSlots: number[];
  questionsCorrect: number;
  lifelinesUsed: { fiftyFifty: boolean; audiencePoll: boolean; askGenius: boolean; flip: boolean };
}

export type Lifeline = "fiftyFifty" | "audiencePoll" | "askGenius" | "flip";

export interface QuizQuestionView {
  text: string;
  options: [string, string, string, string];
}

function tokenSecret(): string {
  // Dual-purposes the service-role key as HMAC entropy rather than adding a
  // new env var for a single internal use — it's already a securely-held
  // server-only secret never exposed to the client, and this doesn't weaken
  // its primary purpose (Supabase auth).
  return `${process.env.SUPABASE_SERVICE_ROLE_KEY}:quiz-session-v1`;
}

function signToken(payload: QuizTokenPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", tokenSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function verifyToken(token: string): QuizTokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expected = createHmac("sha256", tokenSecret()).update(body).digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString()) as QuizTokenPayload;
  } catch {
    return null;
  }
}

function tierForLevel(levelIndex: number): number {
  return Math.floor(levelIndex / LEVELS_PER_TIER);
}

function pickIndexExcluding(poolLength: number, exclude: number[]): number {
  const candidates = Array.from({ length: poolLength }, (_, i) => i).filter((i) => !exclude.includes(i));
  const pool = candidates.length > 0 ? candidates : Array.from({ length: poolLength }, (_, i) => i);
  return pool[Math.floor(Math.random() * pool.length)];
}

function assignAllLevels(): Record<number, number> {
  const assigned: Record<number, number> = {};
  QUESTION_TIERS.forEach((tier, tierIdx) => {
    const shuffled = Array.from({ length: tier.questions.length }, (_, i) => i).sort(() => Math.random() - 0.5);
    for (let slot = 0; slot < LEVELS_PER_TIER; slot++) {
      assigned[tierIdx * LEVELS_PER_TIER + slot] = shuffled[slot % shuffled.length];
    }
  });
  return assigned;
}

// Builds the client-safe view of a question (text + options already
// shuffled into display order) plus the correct slot for that shuffle —
// the shuffle happens fresh per question (unlike the old client-side
// version, which shuffled once for the whole game) since there's no
// downside to it now that the server controls it.
function buildQuestion(levelIndex: number, poolIndex: number): { view: QuizQuestionView; correctSlot: number } {
  const tier = QUESTION_TIERS[tierForLevel(levelIndex)];
  const q = tier.questions[poolIndex];
  const slotOrder = [0, 1, 2, 3].sort(() => Math.random() - 0.5); // slotOrder[slot] = true option index shown at that slot
  const options = slotOrder.map((trueIndex) => q.options[trueIndex]) as [string, string, string, string];
  const correctSlot = slotOrder.indexOf(q.correctIndex);
  return { view: { text: q.question, options }, correctSlot };
}

function correctAnswerTextFor(levelIndex: number, poolIndex: number): string {
  const tier = QUESTION_TIERS[tierForLevel(levelIndex)];
  const q = tier.questions[poolIndex];
  return q.options[q.correctIndex];
}

function generateAudiencePoll(correctSlot: number, hidden: number[]): number[] {
  const visible = [0, 1, 2, 3].filter((i) => !hidden.includes(i));
  const weights = visible.map((i) => (i === correctSlot ? 40 + Math.random() * 35 : Math.random() * 30));
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  const percentages = new Array(4).fill(0);
  visible.forEach((slot, idx) => {
    percentages[slot] = Math.round((weights[idx] / total) * 100);
  });
  const sum = percentages.reduce((a: number, b: number) => a + b, 0);
  if (sum !== 100 && visible.length > 0) {
    const maxIdx = visible.reduce((best, i) => (percentages[i] > percentages[best] ? i : best), visible[0]);
    percentages[maxIdx] += 100 - sum;
  }
  return percentages;
}

async function recordQuizResult(
  payload: QuizTokenPayload,
  result: "won" | "lost",
  questionsCorrect: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const roster = await lookupGameTeamById(payload.source, payload.teamRefId);
  const player = roster?.players.find((p) => p.id === payload.playerRefId);
  if (!roster || !player) return { ok: false, error: "Team not found" };

  const admin = createAdminClient();
  const { error } = await admin.from("game_plays").insert({
    game_slug: "quiz-champion",
    source: payload.source,
    team_ref_id: roster.teamRefId,
    player_ref_id: player.id,
    player_name: player.name,
    team_label: roster.teamLabel,
    is_captain: player.isCaptain,
    result,
    detail: { questionsCorrect, totalQuestions: TOTAL_LEVELS },
  });

  if (error) return { ok: false, error: "Could not record play" };
  return { ok: true };
}

export type StartQuizResult =
  | { ok: true; token: string; levelIndex: number; question: QuizQuestionView }
  | { ok: false; error: string };

export async function startQuizSession(input: {
  source: GameTeamSource;
  teamRefId: string;
  playerRefId: string;
}): Promise<StartQuizResult> {
  const roster = await lookupGameTeamById(input.source, input.teamRefId);
  if (!roster) return { ok: false, error: "Team not found" };
  const player = roster.players.find((p) => p.id === input.playerRefId);
  if (!player) return { ok: false, error: "Player not found on this team" };

  const assignedIndexByLevel = assignAllLevels();
  const { view, correctSlot } = buildQuestion(0, assignedIndexByLevel[0]);

  const payload: QuizTokenPayload = {
    v: 1,
    source: input.source,
    teamRefId: roster.teamRefId,
    playerRefId: player.id,
    levelIndex: 0,
    assignedIndexByLevel,
    correctSlot,
    hiddenSlots: [],
    questionsCorrect: 0,
    lifelinesUsed: { fiftyFifty: false, audiencePoll: false, askGenius: false, flip: false },
  };

  return { ok: true, token: signToken(payload), levelIndex: 0, question: view };
}

export type AnswerQuizResult =
  | { ok: true; correct: true; gameOver: false; token: string; levelIndex: number; question: QuizQuestionView }
  | { ok: true; correct: true; gameOver: true; result: "won"; questionsCorrect: number }
  | {
      ok: true;
      correct: false;
      gameOver: true;
      result: "lost";
      questionsCorrect: number;
      correctSlot: number;
      correctAnswerText: string;
    }
  | { ok: false; error: string };

export async function answerQuizQuestion(input: {
  token: string;
  selectedSlot: number | null; // null = timed out with nothing selected
}): Promise<AnswerQuizResult> {
  const payload = verifyToken(input.token);
  if (!payload) return { ok: false, error: "Your session expired — please start a new game." };

  const poolIndex = payload.assignedIndexByLevel[payload.levelIndex];
  const isCorrect = input.selectedSlot !== null && input.selectedSlot === payload.correctSlot;

  if (!isCorrect) {
    const correctAnswerText = correctAnswerTextFor(payload.levelIndex, poolIndex);
    const recorded = await recordQuizResult(payload, "lost", payload.questionsCorrect);
    if (!recorded.ok) return { ok: false, error: recorded.error };
    return {
      ok: true,
      correct: false,
      gameOver: true,
      result: "lost",
      questionsCorrect: payload.questionsCorrect,
      correctSlot: payload.correctSlot,
      correctAnswerText,
    };
  }

  const questionsCorrect = payload.questionsCorrect + 1;
  const nextLevelIndex = payload.levelIndex + 1;
  if (nextLevelIndex >= TOTAL_LEVELS) {
    const recorded = await recordQuizResult(payload, "won", questionsCorrect);
    if (!recorded.ok) return { ok: false, error: recorded.error };
    return { ok: true, correct: true, gameOver: true, result: "won", questionsCorrect };
  }

  const { view, correctSlot } = buildQuestion(nextLevelIndex, payload.assignedIndexByLevel[nextLevelIndex]);
  const newPayload: QuizTokenPayload = {
    ...payload,
    levelIndex: nextLevelIndex,
    correctSlot,
    hiddenSlots: [],
    questionsCorrect,
  };
  return { ok: true, correct: true, gameOver: false, token: signToken(newPayload), levelIndex: nextLevelIndex, question: view };
}

export type LifelineResult =
  | {
      ok: true;
      token: string;
      fiftyFifty?: { hiddenSlots: number[] };
      audiencePoll?: { poll: number[] };
      askGenius?: { correctLabel: string };
      flip?: { question: QuizQuestionView };
    }
  | { ok: false; error: string };

export async function applyQuizLifeline(input: { token: string; lifeline: Lifeline }): Promise<LifelineResult> {
  const payload = verifyToken(input.token);
  if (!payload) return { ok: false, error: "Your session expired — please start a new game." };
  if (payload.lifelinesUsed[input.lifeline]) return { ok: false, error: "That lifeline is already used" };

  const lifelinesUsed = { ...payload.lifelinesUsed, [input.lifeline]: true };

  if (input.lifeline === "fiftyFifty") {
    const wrongSlots = [0, 1, 2, 3].filter((i) => i !== payload.correctSlot);
    const hiddenSlots = [...wrongSlots].sort(() => Math.random() - 0.5).slice(0, 2);
    const newPayload: QuizTokenPayload = { ...payload, lifelinesUsed, hiddenSlots };
    return { ok: true, token: signToken(newPayload), fiftyFifty: { hiddenSlots } };
  }

  if (input.lifeline === "audiencePoll") {
    const poll = generateAudiencePoll(payload.correctSlot, payload.hiddenSlots);
    const newPayload: QuizTokenPayload = { ...payload, lifelinesUsed };
    return { ok: true, token: signToken(newPayload), audiencePoll: { poll } };
  }

  if (input.lifeline === "askGenius") {
    const correctLabel = OPTION_LABELS[payload.correctSlot];
    const newPayload: QuizTokenPayload = { ...payload, lifelinesUsed };
    return { ok: true, token: signToken(newPayload), askGenius: { correctLabel } };
  }

  // flip — swaps the current level's question for a different one from the
  // same tier, excluding every pool index already assigned elsewhere in
  // this tier (so it can't flip into a question another level will ask).
  const tier = tierForLevel(payload.levelIndex);
  const tierStart = tier * LEVELS_PER_TIER;
  const usedInTier = Array.from({ length: LEVELS_PER_TIER }, (_, i) => payload.assignedIndexByLevel[tierStart + i]);
  const newPoolIndex = pickIndexExcluding(QUESTION_TIERS[tier].questions.length, usedInTier);
  const { view, correctSlot } = buildQuestion(payload.levelIndex, newPoolIndex);
  const newPayload: QuizTokenPayload = {
    ...payload,
    assignedIndexByLevel: { ...payload.assignedIndexByLevel, [payload.levelIndex]: newPoolIndex },
    correctSlot,
    hiddenSlots: [],
    lifelinesUsed,
  };
  return { ok: true, token: signToken(newPayload), flip: { question: view } };
}
