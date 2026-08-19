"use client";

/**
 * Sound cues, synthesised with the Web Audio API — no audio files to download
 * and nothing to keep in sync with the bundle.
 *
 * One rule matters more than the sound design: `reveal` and `hide` must be
 * identical for every player. A different sting for the imposter would leak the
 * whole game to anyone listening across the table.
 */

export type Cue =
  | "reveal"
  | "hide"
  | "select"
  | "vote"
  | "start"
  | "timerWarning"
  | "timeUp"
  | "suspense"
  | "civiliansWin"
  | "impostersWin";

interface ToneSpec {
  freq: number;
  /** Seconds from "now" that this tone starts. */
  at?: number;
  dur?: number;
  gain?: number;
  type?: OscillatorType;
  /** Glide to this frequency across the tone. */
  sweepTo?: number;
}

const CUES: Record<Cue, ToneSpec[]> = {
  // Identical for civilians and imposters — see the note above.
  reveal: [
    { freq: 523.25, dur: 0.16, gain: 0.16, type: "triangle" },
    { freq: 783.99, at: 0.08, dur: 0.34, gain: 0.14, type: "triangle" },
  ],
  hide: [
    { freq: 659.25, dur: 0.14, gain: 0.12, type: "triangle" },
    { freq: 392.0, at: 0.07, dur: 0.26, gain: 0.11, type: "triangle" },
  ],
  select: [{ freq: 880, dur: 0.06, gain: 0.07, type: "sine" }],
  vote: [
    { freq: 587.33, dur: 0.1, gain: 0.12, type: "triangle" },
    { freq: 880, at: 0.06, dur: 0.18, gain: 0.1, type: "triangle" },
  ],
  start: [
    { freq: 392.0, dur: 0.14, gain: 0.13, type: "triangle" },
    { freq: 523.25, at: 0.1, dur: 0.16, gain: 0.13, type: "triangle" },
    { freq: 659.25, at: 0.2, dur: 0.3, gain: 0.12, type: "triangle" },
  ],
  timerWarning: [
    { freq: 880, dur: 0.09, gain: 0.1, type: "square" },
    { freq: 880, at: 0.16, dur: 0.09, gain: 0.1, type: "square" },
  ],
  timeUp: [
    { freq: 622.25, dur: 0.16, gain: 0.13, type: "square" },
    { freq: 466.16, at: 0.16, dur: 0.16, gain: 0.13, type: "square" },
    { freq: 311.13, at: 0.32, dur: 0.4, gain: 0.14, type: "square" },
  ],
  // A low rising rumble under the "the imposter was…" beat.
  suspense: [{ freq: 55, dur: 1.4, gain: 0.16, type: "sawtooth", sweepTo: 120 }],
  civiliansWin: [
    { freq: 523.25, dur: 0.18, gain: 0.14, type: "triangle" },
    { freq: 659.25, at: 0.12, dur: 0.18, gain: 0.14, type: "triangle" },
    { freq: 783.99, at: 0.24, dur: 0.2, gain: 0.14, type: "triangle" },
    { freq: 1046.5, at: 0.36, dur: 0.5, gain: 0.13, type: "triangle" },
  ],
  impostersWin: [
    { freq: 440, dur: 0.2, gain: 0.14, type: "sawtooth" },
    { freq: 349.23, at: 0.14, dur: 0.22, gain: 0.13, type: "sawtooth" },
    { freq: 261.63, at: 0.3, dur: 0.6, gain: 0.14, type: "sawtooth", sweepTo: 233.08 },
  ],
};

type WindowWithLegacyAudio = Window & { webkitAudioContext?: typeof AudioContext };

let context: AudioContext | null = null;
let master: GainNode | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (context) return context;
  const Ctor = window.AudioContext ?? (window as WindowWithLegacyAudio).webkitAudioContext;
  if (!Ctor) return null;
  try {
    context = new Ctor();
    master = context.createGain();
    master.gain.value = 0.9;
    master.connect(context.destination);
    return context;
  } catch {
    return null;
  }
}

/**
 * Browsers only allow audio to start inside a user gesture, so the shell calls
 * this on the first tap of the session.
 */
export function unlockAudio(): void {
  const ctx = getContext();
  if (ctx && ctx.state === "suspended") void ctx.resume();
}

export function playCue(cue: Cue): void {
  const ctx = getContext();
  if (!ctx || !master) return;
  if (ctx.state === "suspended") void ctx.resume();

  const now = ctx.currentTime;
  for (const tone of CUES[cue]) {
    const start = now + (tone.at ?? 0);
    const duration = tone.dur ?? 0.2;
    const peak = tone.gain ?? 0.12;

    const osc = ctx.createOscillator();
    osc.type = tone.type ?? "triangle";
    osc.frequency.setValueAtTime(tone.freq, start);
    if (tone.sweepTo) osc.frequency.exponentialRampToValueAtTime(tone.sweepTo, start + duration);

    // Short attack, exponential decay: percussive without clicking.
    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(peak, start + 0.012);
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    osc.connect(envelope);
    envelope.connect(master);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }
}

/** Exposed for tests: every cue must actually be defined. */
export const CUE_NAMES = Object.keys(CUES) as Cue[];
