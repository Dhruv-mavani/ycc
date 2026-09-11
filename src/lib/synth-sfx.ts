"use client";

// Lightweight, dependency-free sound effects via the Web Audio API. Used by
// the mini-games (mystery-box-game.tsx, spin-wheel-game.tsx) instead of
// audio files, so each game can have its own distinct sound identity
// without shipping/licensing more mp3s — everything here is synthesized.

let sharedCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? window.webkitAudioContext;
  if (!Ctor) return null;
  if (!sharedCtx) sharedCtx = new Ctor();
  // Browsers start an AudioContext "suspended" until a user gesture; every
  // call here happens from a click handler or shortly after one, so this
  // resume is safe to fire-and-forget.
  if (sharedCtx.state === "suspended") sharedCtx.resume().catch(() => {});
  return sharedCtx;
}

export interface ActiveSound {
  stop: () => void;
}

const NO_OP_SOUND: ActiveSound = { stop() {} };

interface Note {
  freq: number;
  start: number; // seconds from now
  dur: number; // seconds
  type?: OscillatorType;
  gain?: number; // 0-1 peak volume
}

// Schedules a set of notes (a chime, a short melody) all at once. Returns a
// handle that fades and cuts everything early if called.
export function playNotes(notes: Note[]): ActiveSound {
  const ctx = getContext();
  if (!ctx) return NO_OP_SOUND;
  const now = ctx.currentTime;
  const nodes: { osc: OscillatorNode; gainNode: GainNode }[] = [];
  for (const n of notes) {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = n.type ?? "sine";
    osc.frequency.value = n.freq;
    const startAt = now + n.start;
    const endAt = startAt + n.dur;
    const peak = n.gain ?? 0.2;
    gainNode.gain.setValueAtTime(0, startAt);
    gainNode.gain.linearRampToValueAtTime(peak, startAt + Math.min(0.02, n.dur / 4));
    gainNode.gain.linearRampToValueAtTime(0, endAt);
    osc.connect(gainNode).connect(ctx.destination);
    osc.start(startAt);
    osc.stop(endAt + 0.02);
    nodes.push({ osc, gainNode });
  }
  return {
    stop() {
      const t = ctx.currentTime;
      for (const { osc, gainNode } of nodes) {
        try {
          gainNode.gain.cancelScheduledValues(t);
          gainNode.gain.setValueAtTime(gainNode.gain.value, t);
          gainNode.gain.linearRampToValueAtTime(0, t + 0.03);
          osc.stop(t + 0.05);
        } catch {
          // Already stopped/scheduled to stop — ignore.
        }
      }
    },
  };
}

// A run of short clicks with growing gaps between them — mimics a
// wheel-of-fortune's ratchet peg, or a box lid's rattle, decelerating over
// the run. `count`/`startGap`/`endGap` control the shape of the slow-down.
export function playClickTrain({
  count,
  startGap,
  endGap,
  freq = 1400,
  dur = 0.03,
  type = "square",
  gain = 0.14,
}: {
  count: number;
  startGap: number;
  endGap: number;
  freq?: number;
  dur?: number;
  type?: OscillatorType;
  gain?: number;
}): ActiveSound {
  const notes: Note[] = [];
  let t = 0;
  for (let i = 0; i < count; i++) {
    const progress = i / Math.max(1, count - 1);
    const gap = startGap + (endGap - startGap) * progress ** 2; // ease-out: gaps grow slowly then a lot
    notes.push({ freq, start: t, dur, type, gain });
    t += gap;
  }
  return playNotes(notes);
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
