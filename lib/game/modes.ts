import type { GameMode, GameModeId } from "@/types";

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
  },
  {
    id: "knowing",
    name: "Knowing Imposter",
    tagline: "They know everything.",
    description:
      "The imposter is told they are the imposter and is also given the real word. Pure acting.",
    imposterSeesOwnWord: false,
    imposterKnowsRole: true,
    usesPairs: false,
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
  },
];

const MODE_MAP = new Map<GameModeId, GameMode>(GAME_MODES.map((mode) => [mode.id, mode]));

export function getMode(id: GameModeId): GameMode {
  const mode = MODE_MAP.get(id);
  if (!mode) throw new Error(`Unknown game mode: ${id}`);
  return mode;
}
