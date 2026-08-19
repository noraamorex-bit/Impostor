import type { GameConfig, GamePhase, Round, RoundResult, Vote } from "@/types";
import {
  buildPlayers,
  clampImposterCount,
  clampPlayerCount,
  createRound,
  pushHistory,
  resizeNames,
  resolveRound,
  suggestedImposterCount,
} from "./engine";
import { DEFAULT_PLAYERS, DEFAULT_TIMER_SECONDS } from "./constants";
import { DEFAULT_PREFERENCES, type Preferences } from "./storage";
import type { RNG } from "./rng";

export interface GameState {
  phase: GamePhase;
  config: GameConfig;
  round: Round | null;
  /** Index of the player currently holding the phone during the reveal loop. */
  revealIndex: number;
  /** Whether the current player's secret is on screen right now. */
  revealed: boolean;
  voteIndex: number;
  votes: Vote[];
  result: RoundResult | null;
  history: string[];
  roundNumber: number;
  preferences: Preferences;
  /** True once a config/history hydrate from storage has happened. */
  hydrated: boolean;
}

export const DEFAULT_CONFIG: GameConfig = {
  names: Array.from({ length: DEFAULT_PLAYERS }, () => ""),
  imposterCount: suggestedImposterCount(DEFAULT_PLAYERS),
  mode: "classic",
  categories: [],
  timerSeconds: DEFAULT_TIMER_SECONDS,
  privateVoting: false,
};

export const INITIAL_STATE: GameState = {
  phase: "home",
  config: DEFAULT_CONFIG,
  round: null,
  revealIndex: 0,
  revealed: false,
  voteIndex: 0,
  votes: [],
  result: null,
  history: [],
  roundNumber: 0,
  preferences: DEFAULT_PREFERENCES,
  hydrated: false,
};

export type GameAction =
  | {
      type: "hydrate";
      config?: Partial<GameConfig>;
      history?: string[];
      preferences?: Partial<Preferences>;
    }
  | { type: "set-preferences"; patch: Partial<Preferences> }
  | { type: "navigate"; phase: GamePhase }
  | { type: "update-config"; patch: Partial<GameConfig> }
  | { type: "set-player-count"; count: number }
  | { type: "set-name"; index: number; name: string }
  | { type: "toggle-category"; category: string }
  | { type: "select-all-categories" }
  | { type: "start-round"; rng?: RNG; now?: number }
  | { type: "ready-to-reveal" }
  | { type: "reveal" }
  | { type: "hide-and-pass" }
  | { type: "start-discussion" }
  | { type: "begin-voting" }
  | { type: "voter-ready" }
  | { type: "cast-vote"; targetId: string | null }
  | { type: "play-again"; rng?: RNG; now?: number }
  | { type: "change-setup" }
  | { type: "go-home" };

function normalizeConfig(config: GameConfig): GameConfig {
  const count = clampPlayerCount(config.names.length);
  const names = resizeNames(config.names, count);
  return {
    ...config,
    names,
    imposterCount: clampImposterCount(config.imposterCount, count),
    categories: [...new Set(config.categories)],
  };
}

function startRound(state: GameState, rng?: RNG, now?: number): GameState {
  const config = normalizeConfig(state.config);
  const round = createRound(config, { rng, history: state.history, now });
  return {
    ...state,
    config,
    round,
    phase: "pass",
    revealIndex: 0,
    revealed: false,
    voteIndex: 0,
    votes: [],
    result: null,
    history: pushHistory(state.history, round.secretWord),
    roundNumber: state.roundNumber + 1,
  };
}

function finishVoting(state: GameState, votes: Vote[]): GameState {
  const round = state.round as Round;
  const result: RoundResult = resolveRound(round, votes);
  return { ...state, votes, result, phase: "results" };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "hydrate": {
      const merged = normalizeConfig({ ...state.config, ...action.config });
      return {
        ...state,
        config: merged,
        history: action.history ?? state.history,
        preferences: { ...DEFAULT_PREFERENCES, ...state.preferences, ...action.preferences },
        hydrated: true,
      };
    }

    case "set-preferences":
      return { ...state, preferences: { ...state.preferences, ...action.patch } };

    case "navigate":
      return { ...state, phase: action.phase };

    case "update-config": {
      const next = { ...state.config, ...action.patch };
      return { ...state, config: normalizeConfig(next) };
    }

    case "set-player-count": {
      const count = clampPlayerCount(action.count);
      const names = resizeNames(state.config.names, count);
      return {
        ...state,
        config: {
          ...state.config,
          names,
          imposterCount: clampImposterCount(state.config.imposterCount, count),
        },
      };
    }

    case "set-name": {
      const names = [...state.config.names];
      if (action.index < 0 || action.index >= names.length) return state;
      names[action.index] = action.name;
      return { ...state, config: { ...state.config, names } };
    }

    case "toggle-category": {
      const current = new Set(state.config.categories);
      if (current.has(action.category)) current.delete(action.category);
      else current.add(action.category);
      return { ...state, config: { ...state.config, categories: [...current] } };
    }

    case "select-all-categories":
      return { ...state, config: { ...state.config, categories: [] } };

    case "start-round":
      return startRound(state, action.rng, action.now);

    case "ready-to-reveal":
      return { ...state, phase: "reveal", revealed: false };

    case "reveal":
      return { ...state, revealed: true };

    case "hide-and-pass": {
      const total = state.round?.players.length ?? 0;
      const next = state.revealIndex + 1;
      if (next >= total) {
        return { ...state, revealed: false, revealIndex: total, phase: "handoff" };
      }
      return { ...state, revealed: false, revealIndex: next, phase: "pass" };
    }

    case "start-discussion":
      return { ...state, phase: "discussion" };

    case "begin-voting":
      return {
        ...state,
        phase: state.config.privateVoting ? "vote-pass" : "vote",
        voteIndex: 0,
        votes: [],
      };

    case "voter-ready":
      return { ...state, phase: "vote" };

    case "cast-vote": {
      const round = state.round;
      if (!round) return state;
      const voter = round.players[state.voteIndex];
      if (!voter) return state;
      const votes = [
        ...state.votes.filter((vote) => vote.voterId !== voter.id),
        { voterId: voter.id, targetId: action.targetId },
      ];
      const nextIndex = state.voteIndex + 1;
      if (nextIndex >= round.players.length) {
        return finishVoting(state, votes);
      }
      return {
        ...state,
        votes,
        voteIndex: nextIndex,
        phase: state.config.privateVoting ? "vote-pass" : "vote",
      };
    }

    case "play-again":
      return startRound(state, action.rng, action.now);

    case "change-setup":
      return { ...state, phase: "setup", round: null, result: null, votes: [] };

    case "go-home":
      return {
        ...state,
        phase: "home",
        round: null,
        result: null,
        votes: [],
        revealIndex: 0,
        revealed: false,
        voteIndex: 0,
      };

    default:
      return state;
  }
}

/** Convenience selector used across screens. */
export function currentPlayer(state: GameState) {
  if (!state.round) return null;
  return state.round.players[Math.min(state.revealIndex, state.round.players.length - 1)] ?? null;
}

export function currentVoter(state: GameState) {
  if (!state.round) return null;
  return state.round.players[state.voteIndex] ?? null;
}

export function playersFromConfig(config: GameConfig) {
  return buildPlayers(config.names);
}
