import type {
  Assignment,
  CategoryId,
  GameConfig,
  GameModeId,
  Outcome,
  Player,
  Round,
  RoundResult,
  Vote,
  VoteTallyEntry,
  Word,
  WordPair,
} from "@/types";
import { CATEGORY_META, findWord, getPairPool, getWordPool, normalizeWord } from "@/lib/words";
import { getMode } from "./modes";
import { MAX_PLAYERS, MIN_PLAYERS, WORD_HISTORY_LIMIT } from "./constants";
import { defaultRng, pickRandom, sample, type RNG } from "./rng";

/* ------------------------------------------------------------------ */
/* Players                                                             */
/* ------------------------------------------------------------------ */

export function playerId(index: number): string {
  return `player-${index + 1}`;
}

/** Turns raw (possibly blank) name inputs into resolved players. */
export function buildPlayers(names: string[]): Player[] {
  return names.map((raw, index) => ({
    id: playerId(index),
    name: raw.trim() || `Player ${index + 1}`,
    index,
  }));
}

export function clampPlayerCount(count: number): number {
  if (!Number.isFinite(count)) return MIN_PLAYERS;
  return Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, Math.round(count)));
}

/** Imposters must never outnumber (or match) the civilians' ability to play. */
export function maxImposters(playerCount: number): number {
  return Math.max(1, Math.min(playerCount - 2, Math.floor(playerCount / 3) + 1));
}

export function clampImposterCount(
  count: number,
  playerCount: number,
  mode?: GameModeId,
): number {
  const max = maxImposters(playerCount);
  const min = Math.min(mode ? getMode(mode).minImposters : 1, max);
  if (!Number.isFinite(count)) return min;
  return Math.max(min, Math.min(max, Math.round(count)));
}

/** Whether a table of this size can play a mode at all (Accomplices needs 4). */
export function modeSupportsPlayerCount(mode: GameModeId, playerCount: number): boolean {
  return maxImposters(playerCount) >= getMode(mode).minImposters;
}

/** "Beach" → "B▪▪▪▪", "Fish and Chips" → "F▪▪▪ ▪▪▪ C▪▪▪▪▪" — cipher mode. */
export function maskWord(word: string): string {
  return word
    .split(/\s+/)
    .map((part) => part.slice(0, 1).toUpperCase() + "▪".repeat(Math.max(part.length - 1, 0)))
    .join(" ");
}

export function letterCount(word: string): number {
  return word.replace(/[^a-z]/gi, "").length;
}

/** Sensible default: 1 imposter up to 5 players, 2 from 9 upwards. */
export function suggestedImposterCount(playerCount: number): number {
  if (playerCount >= 9) return 2;
  return 1;
}

export function resizeNames(names: string[], count: number): string[] {
  const next = names.slice(0, count);
  while (next.length < count) next.push("");
  return next;
}

/* ------------------------------------------------------------------ */
/* Word selection                                                      */
/* ------------------------------------------------------------------ */

function withoutHistory<T>(items: T[], history: string[], key: (item: T) => string): T[] {
  if (!history.length) return items;
  const recent = new Set(history.map(normalizeWord));
  const filtered = items.filter((item) => !recent.has(normalizeWord(key(item))));
  // Never strand the round: if history swallowed the pool, use everything.
  return filtered.length ? filtered : items;
}

export function pickWord(
  categories: CategoryId[],
  history: string[] = [],
  rng: RNG = defaultRng,
): Word {
  const pool = withoutHistory(getWordPool(categories), history, (word) => word.word);
  return pickRandom(pool, rng);
}

export function pickPair(
  categories: CategoryId[],
  history: string[] = [],
  rng: RNG = defaultRng,
): WordPair {
  const pool = withoutHistory(getPairPool(categories), history, (pair) => pair.primary);
  return pickRandom(pool, rng);
}

/** Keeps the most recent words, newest first, capped to the history limit. */
export function pushHistory(history: string[], word: string): string[] {
  const next = [word, ...history.filter((entry) => normalizeWord(entry) !== normalizeWord(word))];
  return next.slice(0, WORD_HISTORY_LIMIT);
}

/* ------------------------------------------------------------------ */
/* Round creation                                                      */
/* ------------------------------------------------------------------ */

export interface CreateRoundOptions {
  rng?: RNG;
  history?: string[];
  /** Overrides the generated id (tests, replays). */
  id?: string;
  now?: number;
}

interface AssignmentContext {
  mode: GameModeId;
  secretWord: string;
  clue: string;
  category: CategoryId;
  imposterWord?: string;
}

function buildAssignments(
  players: Player[],
  imposterIds: Set<string>,
  context: AssignmentContext,
): Assignment[] {
  const { mode, secretWord, clue, category, imposterWord } = context;
  const categoryMeta = CATEGORY_META.find((entry) => entry.id === category);

  return players.map((player) => {
    const isImposter = imposterIds.has(player.id);
    if (!isImposter) {
      return { playerId: player.id, isImposter: false, kind: "word", word: secretWord };
    }
    switch (mode) {
      case "clue":
        return { playerId: player.id, isImposter: true, kind: "imposter-clue", clue };
      case "blindspot":
        return {
          playerId: player.id,
          isImposter: true,
          kind: "imposter-category",
          categoryLabel: categoryMeta?.label ?? "Anything",
          categoryEmoji: categoryMeta?.emoji ?? "✦",
        };
      case "cipher":
        return {
          playerId: player.id,
          isImposter: true,
          kind: "imposter-mask",
          mask: maskWord(secretWord),
          maskLength: letterCount(secretWord),
        };
      case "unknown":
        // Looks exactly like a civilian screen — that is the entire point.
        return { playerId: player.id, isImposter: true, kind: "word", word: imposterWord };
      case "accomplices":
        return {
          playerId: player.id,
          isImposter: true,
          kind: "imposter",
          allyNames: players
            .filter((other) => other.id !== player.id && imposterIds.has(other.id))
            .map((other) => other.name),
        };
      case "classic":
      default:
        return { playerId: player.id, isImposter: true, kind: "imposter" };
    }
  });
}

export function createRound(config: GameConfig, options: CreateRoundOptions = {}): Round {
  const rng = options.rng ?? defaultRng;
  const history = options.history ?? [];
  const players = buildPlayers(config.names);

  if (players.length < MIN_PLAYERS) {
    throw new Error(`A round needs at least ${MIN_PLAYERS} players`);
  }
  if (players.length > MAX_PLAYERS) {
    throw new Error(`A round supports at most ${MAX_PLAYERS} players`);
  }

  const mode = getMode(config.mode);
  const imposterCount = clampImposterCount(config.imposterCount, players.length, config.mode);
  const imposters = sample(players, imposterCount, rng);
  const imposterIds = new Set(imposters.map((player) => player.id));

  let secretWord: string;
  let clue: string;
  let category: CategoryId;
  let imposterWord: string | undefined;

  if (mode.usesPairs) {
    const pair = pickPair(config.categories, history, rng);
    // Randomise which half of the pair the group gets, so pairs never feel fixed.
    const flipped = rng() < 0.5;
    secretWord = flipped ? pair.secondary : pair.primary;
    imposterWord = flipped ? pair.primary : pair.secondary;
    category = pair.category;
    clue = findWord(secretWord)?.clue ?? "";
  } else {
    const word = pickWord(config.categories, history, rng);
    secretWord = word.word;
    clue = word.clue;
    category = word.category;
  }

  return {
    id: options.id ?? `round-${Math.floor((options.now ?? Date.now())).toString(36)}-${Math.floor(rng() * 1e6).toString(36)}`,
    mode: config.mode,
    createdAt: options.now ?? Date.now(),
    players,
    imposterIds: players.filter((p) => imposterIds.has(p.id)).map((p) => p.id),
    secretWord,
    clue,
    category,
    imposterWord,
    assignments: buildAssignments(players, imposterIds, {
      mode: config.mode,
      secretWord,
      clue,
      category,
      imposterWord,
    }),
  };
}

export function getAssignment(round: Round, id: string): Assignment {
  const assignment = round.assignments.find((entry) => entry.playerId === id);
  if (!assignment) throw new Error(`No assignment for player ${id}`);
  return assignment;
}

export function isImposter(round: Round, id: string): boolean {
  return round.imposterIds.includes(id);
}

/* ------------------------------------------------------------------ */
/* Voting                                                              */
/* ------------------------------------------------------------------ */

export function tallyVotes(players: Player[], votes: Vote[]): VoteTallyEntry[] {
  const counts = new Map<string, VoteTallyEntry>(
    players.map((player) => [player.id, { playerId: player.id, votes: 0, voterIds: [] }]),
  );
  for (const vote of votes) {
    if (!vote.targetId) continue;
    const entry = counts.get(vote.targetId);
    if (!entry) continue;
    entry.votes += 1;
    entry.voterIds.push(vote.voterId);
  }
  return players
    .map((player) => counts.get(player.id)!)
    .sort((a, b) => b.votes - a.votes || a.playerId.localeCompare(b.playerId));
}

/**
 * Outcome rules (kept deliberately simple so a group can explain them in one breath):
 *  - the player(s) with the most votes are accused
 *  - accuse only imposters → civilians win
 *  - accuse only innocents (or nobody votes) → imposters win
 *  - a tie that mixes imposters and innocents → split vote, nobody wins outright
 */
export function resolveRound(round: Round, votes: Vote[]): RoundResult {
  const tally = tallyVotes(round.players, votes);
  const topVotes = tally.length ? tally[0].votes : 0;
  const accusedIds = topVotes > 0 ? tally.filter((e) => e.votes === topVotes).map((e) => e.playerId) : [];

  const caughtImposterIds = accusedIds.filter((id) => round.imposterIds.includes(id));
  const escapedImposterIds = round.imposterIds.filter((id) => !caughtImposterIds.includes(id));

  let outcome: Outcome;
  if (!accusedIds.length || caughtImposterIds.length === 0) {
    outcome = "imposters";
  } else if (caughtImposterIds.length === accusedIds.length) {
    outcome = "civilians";
  } else {
    outcome = "split";
  }

  return { tally, accusedIds, caughtImposterIds, escapedImposterIds, outcome };
}

/** Players a given voter is allowed to accuse (everyone but themselves). */
export function votableFor(round: Round, voterId: string): Player[] {
  return round.players.filter((player) => player.id !== voterId);
}

export { MIN_PLAYERS, MAX_PLAYERS };
