/**
 * Domain types for the Imposter party game.
 * These are intentionally UI-free so the game engine can be tested in isolation.
 */

/* ------------------------------------------------------------------ */
/* Words                                                               */
/* ------------------------------------------------------------------ */

/** Raw authoring format for the bundled word database: [word, clue]. */
export type WordSeed = readonly [word: string, clue: string];

export type CategoryId = string;

export interface Word {
  /** Display form, e.g. "Beach". */
  word: string;
  /** Short hint used by the "Imposter with clue" mode. Never names the word. */
  clue: string;
  category: CategoryId;
}

export interface Category {
  id: CategoryId;
  label: string;
  emoji: string;
  words: Word[];
}

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  emoji: string;
  count: number;
}

export type PairDifficulty = "easy" | "medium" | "hard";

/** Related word pair used by the "Unknown imposter" mode. */
export interface WordPair {
  primary: string;
  secondary: string;
  category: CategoryId;
  difficulty: PairDifficulty;
}

/* ------------------------------------------------------------------ */
/* Modes                                                               */
/* ------------------------------------------------------------------ */

export type GameModeId = "classic" | "clue" | "blindspot" | "cipher" | "unknown" | "accomplices";

export interface GameMode {
  id: GameModeId;
  name: string;
  tagline: string;
  description: string;
  /** Imposters see a word that is not the civilians' word (unknown mode). */
  imposterSeesOwnWord: boolean;
  /** Imposters are told they are the imposter. */
  imposterKnowsRole: boolean;
  /** Mode draws from the curated related-pair database instead of raw words. */
  usesPairs: boolean;
  /** Imposters are shown who the other imposters are. */
  impostersKnowEachOther: boolean;
  /** Fewer imposters than this makes no sense for the mode. */
  minImposters: number;
}

/* ------------------------------------------------------------------ */
/* Players & config                                                    */
/* ------------------------------------------------------------------ */

export interface Player {
  id: string;
  /** Resolved display name — never blank (falls back to "Player N"). */
  name: string;
  /** Seat order, 0-based. */
  index: number;
}

export interface GameConfig {
  /** Raw, possibly-blank names as typed in setup. */
  names: string[];
  imposterCount: number;
  mode: GameModeId;
  /** Empty array means "all categories". */
  categories: CategoryId[];
  /** Discussion timer in seconds; 0 disables the countdown. */
  timerSeconds: number;
  /** Hand the phone around for voting instead of voting out loud. */
  privateVoting: boolean;
}

/* ------------------------------------------------------------------ */
/* Round                                                               */
/* ------------------------------------------------------------------ */

/** What a single player's reveal screen should show. */
export type RevealKind =
  | "word" // civilian (and unknown-mode imposter): just a word
  | "imposter" // "you are the imposter", no word
  | "imposter-clue" // "you are the imposter" + clue
  | "imposter-category" // "you are the imposter" + the word's category
  | "imposter-mask"; // "you are the imposter" + the word with its letters hidden

export interface Assignment {
  playerId: string;
  isImposter: boolean;
  kind: RevealKind;
  /** Word shown to this player, if any. */
  word?: string;
  /** Clue shown to this player, if any. */
  clue?: string;
  /** Category the word came from, as a label ("Food") — blind-spot mode. */
  categoryLabel?: string;
  /** Emoji for that category, so the card can carry it. */
  categoryEmoji?: string;
  /** The word with its letters hidden, e.g. "B▪▪▪▪" — cipher mode. */
  mask?: string;
  /** Letter count behind the mask, per word. */
  maskLength?: number;
  /** Names of the other imposters — accomplices mode only. */
  allyNames?: string[];
}

export interface Round {
  id: string;
  mode: GameModeId;
  createdAt: number;
  players: Player[];
  imposterIds: string[];
  /** The civilians' word — the answer revealed at the end. */
  secretWord: string;
  /** Clue for the secret word (always stored, shown in results when relevant). */
  clue: string;
  /** Category the word came from. */
  category: CategoryId;
  /** The alternate word imposters saw (unknown mode only). */
  imposterWord?: string;
  assignments: Assignment[];
}

/* ------------------------------------------------------------------ */
/* Voting & results                                                    */
/* ------------------------------------------------------------------ */

export interface Vote {
  /** Who cast the vote. */
  voterId: string;
  /** Who they accused. `null` means they abstained / skipped. */
  targetId: string | null;
}

export interface VoteTallyEntry {
  playerId: string;
  votes: number;
  voterIds: string[];
}

export type Outcome = "civilians" | "imposters" | "split";

export interface RoundResult {
  tally: VoteTallyEntry[];
  /** Player(s) tied for the most votes. Empty when nobody voted. */
  accusedIds: string[];
  caughtImposterIds: string[];
  escapedImposterIds: string[];
  outcome: Outcome;
}

/* ------------------------------------------------------------------ */
/* Flow                                                                */
/* ------------------------------------------------------------------ */

export type GamePhase =
  | "home"
  | "how-to-play"
  | "settings"
  | "setup"
  | "pass"
  | "reveal"
  | "handoff"
  | "discussion"
  | "vote-pass"
  | "vote"
  | "results";
