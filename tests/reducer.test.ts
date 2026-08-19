import { describe, expect, it } from "vitest";
import {
  DEFAULT_CONFIG,
  INITIAL_STATE,
  currentPlayer,
  currentVoter,
  gameReducer,
  type GameAction,
  type GameState,
} from "@/lib/game/reducer";
import { seededRng } from "@/lib/game/rng";
import type { GameModeId } from "@/types";

const run = (state: GameState, actions: GameAction[]): GameState =>
  actions.reduce(gameReducer, state);

const setup = (names: string[], patch: Partial<GameState["config"]> = {}): GameState => {
  const base: GameState = {
    ...INITIAL_STATE,
    config: { ...DEFAULT_CONFIG, names, ...patch },
  };
  return gameReducer(base, { type: "start-round", rng: seededRng(17), now: 1_700_000_000_000 });
};

/** Walks the pass-the-phone loop for every player. */
function revealAll(state: GameState): GameState {
  let next = state;
  const total = next.round!.players.length;
  for (let i = 0; i < total; i += 1) {
    expect(next.phase).toBe("pass");
    expect(next.revealed).toBe(false);
    expect(currentPlayer(next)!.id).toBe(next.round!.players[i].id);
    next = gameReducer(next, { type: "ready-to-reveal" });
    expect(next.phase).toBe("reveal");
    expect(next.revealed).toBe(false);
    next = gameReducer(next, { type: "reveal" });
    expect(next.revealed).toBe(true);
    next = gameReducer(next, { type: "hide-and-pass" });
    // Secret must be hidden again the instant the phone is passed on.
    expect(next.revealed).toBe(false);
  }
  expect(next.phase).toBe("handoff");
  return next;
}

describe("setup actions", () => {
  it("keeps names when growing and trims when shrinking", () => {
    let state = gameReducer(INITIAL_STATE, { type: "set-player-count", count: 3 });
    state = run(state, [
      { type: "set-name", index: 0, name: "Maya" },
      { type: "set-name", index: 1, name: "Arjun" },
      { type: "set-name", index: 2, name: "Sarah" },
      { type: "set-player-count", count: 5 },
    ]);
    expect(state.config.names).toEqual(["Maya", "Arjun", "Sarah", "", ""]);
    state = gameReducer(state, { type: "set-player-count", count: 3 });
    expect(state.config.names).toEqual(["Maya", "Arjun", "Sarah"]);
  });

  it("clamps the player count and the imposter count together", () => {
    let state = gameReducer(INITIAL_STATE, { type: "set-player-count", count: 12 });
    state = gameReducer(state, { type: "update-config", patch: { imposterCount: 5 } });
    expect(state.config.imposterCount).toBe(5);
    state = gameReducer(state, { type: "set-player-count", count: 3 });
    expect(state.config.names).toHaveLength(3);
    expect(state.config.imposterCount).toBe(1);
  });

  it("toggles categories and resets to all", () => {
    let state = gameReducer(INITIAL_STATE, { type: "toggle-category", category: "food" });
    state = gameReducer(state, { type: "toggle-category", category: "animals" });
    expect(state.config.categories.sort()).toEqual(["animals", "food"]);
    state = gameReducer(state, { type: "toggle-category", category: "food" });
    expect(state.config.categories).toEqual(["animals"]);
    state = gameReducer(state, { type: "select-all-categories" });
    expect(state.config.categories).toEqual([]);
  });
});

describe("full game flow", () => {
  const modes: GameModeId[] = ["classic", "clue", "blindspot", "cipher", "unknown", "accomplices"];

  it.each(modes)("plays a complete round in %s mode", (mode) => {
    let state = setup(["Maya", "Arjun", "Sarah", "Noah", "Alex"], { mode });
    expect(state.phase).toBe("pass");
    expect(state.roundNumber).toBe(1);
    expect(state.history).toEqual([state.round!.secretWord]);

    state = revealAll(state);
    state = gameReducer(state, { type: "start-discussion" });
    expect(state.phase).toBe("discussion");

    state = gameReducer(state, { type: "begin-voting" });
    expect(state.phase).toBe("vote");

    const imposter = state.round!.imposterIds[0];
    const total = state.round!.players.length;
    for (let i = 0; i < total; i += 1) {
      expect(currentVoter(state)!.id).toBe(state.round!.players[i].id);
      state = gameReducer(state, { type: "cast-vote", targetId: imposter });
    }

    expect(state.phase).toBe("results");
    expect(state.votes).toHaveLength(total);
    expect(state.result!.outcome).toBe("civilians");
    expect(state.result!.tally[0].votes).toBe(total);
  });

  it("routes through privacy screens when private voting is on", () => {
    let state = setup(["A", "B", "C"], { privateVoting: true });
    state = revealAll(state);
    state = gameReducer(state, { type: "start-discussion" });
    state = gameReducer(state, { type: "begin-voting" });
    expect(state.phase).toBe("vote-pass");
    state = gameReducer(state, { type: "voter-ready" });
    expect(state.phase).toBe("vote");
    state = gameReducer(state, { type: "cast-vote", targetId: state.round!.players[1].id });
    expect(state.phase).toBe("vote-pass");
  });

  it("plays a 3 player game and a 12 player game end to end", () => {
    for (const size of [3, 12]) {
      const names = Array.from({ length: size }, (_, i) => `P${i + 1}`);
      let state = setup(names, { imposterCount: size >= 9 ? 2 : 1 });
      expect(state.round!.players).toHaveLength(size);
      state = revealAll(state);
      state = gameReducer(state, { type: "start-discussion" });
      state = gameReducer(state, { type: "begin-voting" });
      for (let i = 0; i < size; i += 1) {
        const target = state.round!.players.find((p) => p.id !== currentVoter(state)!.id)!;
        state = gameReducer(state, { type: "cast-vote", targetId: target.id });
      }
      expect(state.phase).toBe("results");
      expect(state.result).not.toBeNull();
    }
  });

  it("uses typed names throughout the round", () => {
    const state = setup(["Maya", "", "Sarah"]);
    expect(state.round!.players.map((p) => p.name)).toEqual(["Maya", "Player 2", "Sarah"]);
  });
});

describe("replay", () => {
  it("keeps the setup, resets the round and avoids repeating the word", () => {
    let state = setup(["Maya", "Arjun", "Sarah", "Noah"], { mode: "clue", categories: ["animals"] });
    const firstWord = state.round!.secretWord;
    const firstImposters = [...state.round!.imposterIds];

    state = revealAll(state);
    state = gameReducer(state, { type: "start-discussion" });
    state = gameReducer(state, { type: "begin-voting" });
    for (let i = 0; i < 4; i += 1) {
      state = gameReducer(state, { type: "cast-vote", targetId: state.round!.imposterIds[0] });
    }
    expect(state.phase).toBe("results");

    const seen = new Set<string>([firstWord]);
    let changedImposters = firstImposters.join() !== "";
    for (let seed = 2; seed <= 25; seed += 1) {
      const previous = state.round!.secretWord;
      state = gameReducer(state, { type: "play-again", rng: seededRng(seed * 31) });
      expect(state.phase).toBe("pass");
      expect(state.revealIndex).toBe(0);
      expect(state.revealed).toBe(false);
      expect(state.votes).toEqual([]);
      expect(state.result).toBeNull();
      // setup is preserved
      expect(state.config.names).toEqual(["Maya", "Arjun", "Sarah", "Noah"]);
      expect(state.config.mode).toBe("clue");
      expect(state.config.categories).toEqual(["animals"]);
      // a fresh word every time
      expect(state.round!.secretWord).not.toBe(previous);
      expect(seen.has(state.round!.secretWord)).toBe(false);
      seen.add(state.round!.secretWord);
      if (state.round!.imposterIds.join() !== firstImposters.join()) changedImposters = true;
    }
    expect(changedImposters).toBe(true);
    expect(state.roundNumber).toBe(25);
  });

  it("change-setup returns to the lobby and drops the round", () => {
    let state = setup(["A", "B", "C"]);
    state = gameReducer(state, { type: "change-setup" });
    expect(state.phase).toBe("setup");
    expect(state.round).toBeNull();
  });

  it("go-home clears everything secret", () => {
    let state = setup(["A", "B", "C"]);
    state = gameReducer(state, { type: "go-home" });
    expect(state.phase).toBe("home");
    expect(state.round).toBeNull();
    expect(state.result).toBeNull();
    expect(state.votes).toEqual([]);
  });
});

describe("mode changes", () => {
  it("raises the imposter count when switching to Accomplices, and keeps it on the way back", () => {
    let state = gameReducer(INITIAL_STATE, { type: "set-player-count", count: 6 });
    expect(state.config.imposterCount).toBe(1);
    state = gameReducer(state, { type: "update-config", patch: { mode: "accomplices" } });
    expect(state.config.imposterCount).toBe(2);
    state = gameReducer(state, { type: "update-config", patch: { mode: "classic" } });
    expect(state.config.imposterCount).toBe(2);
  });

  it("drops Accomplices when the table shrinks below four players", () => {
    let state = gameReducer(INITIAL_STATE, { type: "set-player-count", count: 6 });
    state = gameReducer(state, { type: "update-config", patch: { mode: "accomplices" } });
    state = gameReducer(state, { type: "set-player-count", count: 3 });
    expect(state.config.mode).toBe("classic");
    expect(state.config.imposterCount).toBe(1);
  });
});

describe("preferences", () => {
  it("defaults sound, haptics and keep-awake on, and name-saving off", () => {
    expect(INITIAL_STATE.preferences).toEqual({
      rememberNames: false,
      haptics: true,
      sound: true,
      keepAwake: true,
    });
  });

  it("patches one preference without disturbing the rest", () => {
    const state = gameReducer(INITIAL_STATE, { type: "set-preferences", patch: { sound: false } });
    expect(state.preferences.sound).toBe(false);
    expect(state.preferences.haptics).toBe(true);
    expect(state.preferences.keepAwake).toBe(true);
  });

  it("keeps preferences through a hydrate that does not mention them", () => {
    let state = gameReducer(INITIAL_STATE, { type: "set-preferences", patch: { sound: false } });
    state = gameReducer(state, { type: "hydrate", config: {} });
    expect(state.preferences.sound).toBe(false);
  });
});

describe("hydration", () => {
  it("falls back to Classic when storage holds a mode that no longer exists", () => {
    const state = gameReducer(INITIAL_STATE, {
      type: "hydrate",
      // "knowing" shipped in an earlier version and was removed.
      config: { mode: "knowing" as never, names: ["A", "B", "C", "D"] },
    });
    expect(state.config.mode).toBe("classic");
  });

  it("merges stored config and clamps it", () => {
    const state = gameReducer(INITIAL_STATE, {
      type: "hydrate",
      config: { names: ["A", "B", "C", "D"], imposterCount: 9, mode: "unknown" },
      history: ["Beach"],
    });
    expect(state.hydrated).toBe(true);
    expect(state.config.names).toHaveLength(4);
    expect(state.config.imposterCount).toBe(2);
    expect(state.config.mode).toBe("unknown");
    expect(state.history).toEqual(["Beach"]);
  });
});
