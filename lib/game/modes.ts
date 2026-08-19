import type { GameMode, GameModeId } from "@/types";

/**
 * Modes are ordered from "easiest to explain" to "most devious" — the setup
 * list reads top to bottom as a difficulty ramp.
 */
export const GAME_MODES: GameMode[] = [
  {
    id: "classic",
    name: "Classic",
    tagline: "No word. Just nerve.",
    description:
      "Everyone gets the secret word except the imposter, who is told they are the imposter and nothing else.",
    imposterSeesOwnWord: false,
    imposterKnowsRole: true,
    usesPairs: false,
    impostersKnowEachOther: false,
    minImposters: 1,
  },
  {
    id: "clue",
    name: "With a Clue",
    tagline: "A hint to hide behind.",
    description:
      "The imposter knows they are the imposter and gets a short clue about the word — just enough to bluff.",
    imposterSeesOwnWord: false,
    imposterKnowsRole: true,
    usesPairs: false,
    impostersKnowEachOther: false,
    minImposters: 1,
  },
  {
    id: "blindspot",
    name: "Blind Spot",
    tagline: "They know the shelf, not the book.",
    description:
      "The imposter is told which category the word came from and nothing else. Enough to sound plausible, nowhere near enough to be safe.",
    imposterSeesOwnWord: false,
    imposterKnowsRole: true,
    usesPairs: false,
    impostersKnowEachOther: false,
    minImposters: 1,
  },
  {
    id: "cipher",
    name: "Cipher",
    tagline: "First letter. Good luck.",
    description:
      "The imposter sees the word with its letters hidden — the first letter and the length are all they get.",
    imposterSeesOwnWord: false,
    imposterKnowsRole: true,
    usesPairs: false,
    impostersKnowEachOther: false,
    minImposters: 1,
  },
  {
    id: "unknown",
    name: "Unknown Imposter",
    tagline: "They don't even know.",
    description:
      "Everyone sees a word, but the imposter's word is subtly different — and they have no idea they are the imposter.",
    imposterSeesOwnWord: true,
    imposterKnowsRole: false,
    usesPairs: true,
    impostersKnowEachOther: false,
    minImposters: 1,
  },
  {
    id: "accomplices",
    name: "Accomplices",
    tagline: "Two liars, one story.",
    description:
      "Two or more imposters, and they are shown each other's names. No word between them — just a partner to cover for, and be betrayed by.",
    imposterSeesOwnWord: false,
    imposterKnowsRole: true,
    usesPairs: false,
    impostersKnowEachOther: true,
    minImposters: 2,
  },
];

const MODE_MAP = new Map<GameModeId, GameMode>(GAME_MODES.map((mode) => [mode.id, mode]));

export const DEFAULT_MODE: GameModeId = "classic";

export function getMode(id: GameModeId): GameMode {
  const mode = MODE_MAP.get(id);
  if (!mode) throw new Error(`Unknown game mode: ${id}`);
  return mode;
}

/** Storage may hold a mode from an older version — fall back rather than throw. */
export function isGameModeId(value: unknown): value is GameModeId {
  return typeof value === "string" && MODE_MAP.has(value as GameModeId);
}
