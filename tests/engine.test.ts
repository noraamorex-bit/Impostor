import { describe, expect, it } from "vitest";
import {
  buildPlayers,
  clampImposterCount,
  clampPlayerCount,
  createRound,
  getAssignment,
  letterCount,
  maskWord,
  maxImposters,
  modeSupportsPlayerCount,
  pickWord,
  pushHistory,
  resolveRound,
  suggestedImposterCount,
  tallyVotes,
  votableFor,
} from "@/lib/game/engine";
import { seededRng } from "@/lib/game/rng";
import { CATEGORY_META, getWordPool, findWord, normalizeWord } from "@/lib/words";
import { WORD_PAIRS } from "@/lib/words/pairs";
import { WORD_HISTORY_LIMIT } from "@/lib/game/constants";
import type { GameConfig, GameModeId, Vote } from "@/types";

const config = (patch: Partial<GameConfig> = {}): GameConfig => ({
  names: ["Maya", "Arjun", "Sarah", "Noah", "Alex"],
  imposterCount: 1,
  mode: "classic",
  categories: [],
  timerSeconds: 120,
  privateVoting: false,
  ...patch,
});

describe("players", () => {
  it("falls back to Player N for blank names and keeps typed ones", () => {
    const players = buildPlayers(["Maya", "  ", "", "  Noah  "]);
    expect(players.map((p) => p.name)).toEqual(["Maya", "Player 2", "Player 3", "Noah"]);
    expect(players.map((p) => p.id)).toEqual(["player-1", "player-2", "player-3", "player-4"]);
    expect(players.map((p) => p.index)).toEqual([0, 1, 2, 3]);
  });

  it("clamps the player count to the supported range", () => {
    expect(clampPlayerCount(1)).toBe(3);
    expect(clampPlayerCount(7)).toBe(7);
    expect(clampPlayerCount(30)).toBe(12);
  });
});

describe("imposter count", () => {
  it("never allows as many imposters as players", () => {
    for (let players = 3; players <= 12; players += 1) {
      expect(maxImposters(players)).toBeLessThanOrEqual(players - 2);
      expect(maxImposters(players)).toBeGreaterThanOrEqual(1);
      expect(clampImposterCount(99, players)).toBe(maxImposters(players));
      expect(clampImposterCount(0, players)).toBe(1);
    }
  });

  it("suggests 1 imposter for small groups and 2 for large ones", () => {
    expect(suggestedImposterCount(3)).toBe(1);
    expect(suggestedImposterCount(5)).toBe(1);
    expect(suggestedImposterCount(8)).toBe(1);
    expect(suggestedImposterCount(9)).toBe(2);
    expect(suggestedImposterCount(12)).toBe(2);
  });
});

describe("createRound", () => {
  it("rejects rounds that are too small or too large", () => {
    expect(() => createRound(config({ names: ["A", "B"] }))).toThrow();
    expect(() => createRound(config({ names: Array(13).fill("") }))).toThrow();
  });

  it("plays a 3 player game with a single imposter", () => {
    const round = createRound(config({ names: ["A", "B", "C"], imposterCount: 1 }), {
      rng: seededRng(11),
    });
    expect(round.players).toHaveLength(3);
    expect(round.imposterIds).toHaveLength(1);
    expect(round.assignments).toHaveLength(3);
  });

  it("plays a 12 player game with multiple imposters", () => {
    const names = Array.from({ length: 12 }, (_, i) => `P${i + 1}`);
    const round = createRound(config({ names, imposterCount: 3 }), { rng: seededRng(7) });
    expect(round.players).toHaveLength(12);
    expect(round.imposterIds).toHaveLength(3);
    expect(new Set(round.imposterIds).size).toBe(3);
    const imposterAssignments = round.assignments.filter((a) => a.isImposter);
    expect(imposterAssignments).toHaveLength(3);
  });

  it("assigns every player exactly one assignment", () => {
    const round = createRound(config(), { rng: seededRng(3) });
    for (const player of round.players) {
      expect(getAssignment(round, player.id).playerId).toBe(player.id);
    }
  });

  const modes: GameModeId[] = ["classic", "clue", "blindspot", "cipher", "unknown", "accomplices"];

  it.each(modes)("assigns correct information in %s mode", (mode) => {
    const round = createRound(config({ mode, imposterCount: 2, names: ["A", "B", "C", "D", "E", "F"] }), {
      rng: seededRng(42),
    });

    const civilians = round.assignments.filter((a) => !a.isImposter);
    const imposters = round.assignments.filter((a) => a.isImposter);

    expect(civilians).toHaveLength(4);
    expect(imposters).toHaveLength(2);
    expect(civilians.every((a) => a.kind === "word" && a.word === round.secretWord)).toBe(true);
    expect(round.secretWord).toBeTruthy();

    switch (mode) {
      case "classic":
        expect(imposters.every((a) => a.kind === "imposter")).toBe(true);
        expect(imposters.every((a) => !a.word && !a.clue)).toBe(true);
        break;
      case "clue":
        expect(imposters.every((a) => a.kind === "imposter-clue")).toBe(true);
        expect(imposters.every((a) => a.clue === round.clue && a.clue!.length > 0)).toBe(true);
        expect(imposters.every((a) => !a.word)).toBe(true);
        break;
      case "blindspot":
        expect(imposters.every((a) => a.kind === "imposter-category")).toBe(true);
        // The category label, never the word or its clue.
        expect(imposters.every((a) => !a.word && !a.clue)).toBe(true);
        expect(imposters.every((a) => (a.categoryLabel ?? "").length > 0)).toBe(true);
        expect(imposters.every((a) => (a.categoryEmoji ?? "").length > 0)).toBe(true);
        break;
      case "cipher":
        expect(imposters.every((a) => a.kind === "imposter-mask")).toBe(true);
        expect(imposters.every((a) => !a.word && !a.clue)).toBe(true);
        expect(imposters.every((a) => a.mask === maskWord(round.secretWord))).toBe(true);
        expect(imposters.every((a) => a.maskLength === letterCount(round.secretWord))).toBe(true);
        break;
      case "accomplices":
        expect(imposters.every((a) => a.kind === "imposter")).toBe(true);
        expect(imposters.every((a) => !a.word && !a.clue)).toBe(true);
        // Each imposter is told about the others, and never about themselves.
        for (const assignment of imposters) {
          const self = round.players.find((p) => p.id === assignment.playerId)!;
          const others = round.players
            .filter((p) => round.imposterIds.includes(p.id) && p.id !== self.id)
            .map((p) => p.name);
          expect(assignment.allyNames).toEqual(others);
          expect(assignment.allyNames).not.toContain(self.name);
        }
        break;
      case "unknown":
        // Screen must be indistinguishable from a civilian's.
        expect(imposters.every((a) => a.kind === "word")).toBe(true);
        expect(round.imposterWord).toBeTruthy();
        expect(imposters.every((a) => a.word === round.imposterWord)).toBe(true);
        expect(round.imposterWord).not.toBe(round.secretWord);
        break;
    }
  });

  it("uses a curated related pair in unknown mode", () => {
    for (let seed = 1; seed <= 40; seed += 1) {
      const round = createRound(config({ mode: "unknown" }), { rng: seededRng(seed) });
      const match = WORD_PAIRS.find(
        (pair) =>
          (pair.primary === round.secretWord && pair.secondary === round.imposterWord) ||
          (pair.secondary === round.secretWord && pair.primary === round.imposterWord),
      );
      expect(match, `${round.secretWord} / ${round.imposterWord}`).toBeTruthy();
    }
  });

  it("always carries a clue for clue mode", () => {
    for (let seed = 1; seed <= 50; seed += 1) {
      const round = createRound(config({ mode: "clue" }), { rng: seededRng(seed) });
      expect(round.clue.length).toBeGreaterThan(5);
      expect(findWord(round.secretWord)?.clue).toBe(round.clue);
    }
  });

  it("respects category filtering", () => {
    const animals = new Set(getWordPool(["animals"]).map((w) => w.word));
    for (let seed = 1; seed <= 30; seed += 1) {
      const round = createRound(config({ categories: ["animals"] }), { rng: seededRng(seed) });
      expect(animals.has(round.secretWord)).toBe(true);
      expect(round.category).toBe("animals");
    }
  });

  it("filters pairs by category in unknown mode", () => {
    for (let seed = 1; seed <= 20; seed += 1) {
      const round = createRound(config({ mode: "unknown", categories: ["food"] }), {
        rng: seededRng(seed),
      });
      expect(round.category).toBe("food");
    }
  });
});

describe("word history", () => {
  it("caps the history and de-duplicates", () => {
    let history: string[] = [];
    for (let i = 0; i < WORD_HISTORY_LIMIT + 10; i += 1) history = pushHistory(history, `Word ${i}`);
    expect(history).toHaveLength(WORD_HISTORY_LIMIT);
    expect(history[0]).toBe(`Word ${WORD_HISTORY_LIMIT + 9}`);

    history = pushHistory(history, "Beach");
    history = pushHistory(history, "Beach");
    expect(history.filter((w) => w === "Beach")).toHaveLength(1);
  });

  it("never picks a word that is still in the history", () => {
    const pool = getWordPool(["weather"]).map((w) => w.word);
    const history = pool.slice(0, pool.length - 1);
    for (let seed = 1; seed <= 20; seed += 1) {
      const word = pickWord(["weather"], history, seededRng(seed));
      expect(word.word).toBe(pool[pool.length - 1]);
    }
  });

  it("falls back to the whole pool when history covers everything", () => {
    const pool = getWordPool(["weather"]).map((w) => w.word);
    const word = pickWord(["weather"], pool, seededRng(5));
    expect(pool.map(normalizeWord)).toContain(normalizeWord(word.word));
  });

  it("does not immediately repeat the previous word across many rounds", () => {
    let history: string[] = [];
    let previous = "";
    for (let seed = 1; seed <= 60; seed += 1) {
      const round = createRound(config({ categories: ["sports"] }), {
        rng: seededRng(seed * 13),
        history,
      });
      expect(round.secretWord).not.toBe(previous);
      previous = round.secretWord;
      history = pushHistory(history, round.secretWord);
    }
  });
});

describe("voting", () => {
  const round = createRound(config(), { rng: seededRng(21) });
  const [p1, p2, p3, p4, p5] = round.players;

  it("does not let a player vote for themselves", () => {
    for (const player of round.players) {
      expect(votableFor(round, player.id).map((p) => p.id)).not.toContain(player.id);
      expect(votableFor(round, player.id)).toHaveLength(round.players.length - 1);
    }
  });

  it("counts votes per player and records who voted", () => {
    const votes: Vote[] = [
      { voterId: p1.id, targetId: p3.id },
      { voterId: p2.id, targetId: p3.id },
      { voterId: p3.id, targetId: p1.id },
      { voterId: p4.id, targetId: null },
      { voterId: p5.id, targetId: p3.id },
    ];
    const tally = tallyVotes(round.players, votes);
    const top = tally[0];
    expect(top.playerId).toBe(p3.id);
    expect(top.votes).toBe(3);
    expect(top.voterIds).toEqual([p1.id, p2.id, p5.id]);
    expect(tally.reduce((sum, entry) => sum + entry.votes, 0)).toBe(4);
    expect(tally).toHaveLength(5);
  });
});

describe("outcomes", () => {
  const build = (mode: GameModeId = "classic", imposterCount = 1) =>
    createRound(config({ mode, imposterCount }), { rng: seededRng(99) });

  it("civilians win when the accused player is the imposter", () => {
    const round = build();
    const imposter = round.imposterIds[0];
    const votes = round.players.map((player) => ({ voterId: player.id, targetId: imposter }));
    const result = resolveRound(round, votes);
    expect(result.outcome).toBe("civilians");
    expect(result.accusedIds).toEqual([imposter]);
    expect(result.caughtImposterIds).toEqual([imposter]);
    expect(result.escapedImposterIds).toEqual([]);
  });

  it("imposters win when an innocent is accused", () => {
    const round = build();
    const innocent = round.players.find((p) => !round.imposterIds.includes(p.id))!;
    const votes = round.players.map((player) => ({ voterId: player.id, targetId: innocent.id }));
    const result = resolveRound(round, votes);
    expect(result.outcome).toBe("imposters");
    expect(result.caughtImposterIds).toEqual([]);
    expect(result.escapedImposterIds).toEqual(round.imposterIds);
  });

  it("imposters win when nobody casts a vote", () => {
    const round = build();
    const votes = round.players.map((player) => ({ voterId: player.id, targetId: null }));
    const result = resolveRound(round, votes);
    expect(result.outcome).toBe("imposters");
    expect(result.accusedIds).toEqual([]);
  });

  it("declares a split vote when a tie mixes an imposter and an innocent", () => {
    const round = build();
    const imposter = round.imposterIds[0];
    const innocent = round.players.find((p) => !round.imposterIds.includes(p.id))!;
    const votes: Vote[] = [
      { voterId: round.players[0].id, targetId: imposter },
      { voterId: round.players[1].id, targetId: innocent.id },
    ];
    const result = resolveRound(round, votes);
    expect(result.outcome).toBe("split");
    expect(result.accusedIds.sort()).toEqual([imposter, innocent.id].sort());
  });

  it("supports multiple imposters: catching both wins the round", () => {
    const names = Array.from({ length: 9 }, (_, i) => `P${i + 1}`);
    const round = createRound(config({ names, imposterCount: 2 }), { rng: seededRng(5) });
    expect(round.imposterIds).toHaveLength(2);
    const [a, b] = round.imposterIds;
    const votes: Vote[] = [
      { voterId: round.players[0].id, targetId: a },
      { voterId: round.players[1].id, targetId: a },
      { voterId: round.players[2].id, targetId: b },
      { voterId: round.players[3].id, targetId: b },
    ];
    const result = resolveRound(round, votes);
    expect(result.outcome).toBe("civilians");
    expect(result.caughtImposterIds.sort()).toEqual([a, b].sort());
  });

  it("supports multiple imposters: catching one leaves the other escaped", () => {
    const names = Array.from({ length: 9 }, (_, i) => `P${i + 1}`);
    const round = createRound(config({ names, imposterCount: 2 }), { rng: seededRng(5) });
    const [a, b] = round.imposterIds;
    const votes: Vote[] = round.players.map((player) => ({ voterId: player.id, targetId: a }));
    const result = resolveRound(round, votes);
    expect(result.outcome).toBe("civilians");
    expect(result.caughtImposterIds).toEqual([a]);
    expect(result.escapedImposterIds).toEqual([b]);
  });
});

describe("mode requirements", () => {
  it("keeps Accomplices off tables that cannot field two imposters", () => {
    expect(modeSupportsPlayerCount("accomplices", 3)).toBe(false);
    expect(modeSupportsPlayerCount("accomplices", 4)).toBe(true);
    expect(modeSupportsPlayerCount("classic", 3)).toBe(true);
  });

  it("raises the imposter count to the mode's minimum", () => {
    expect(clampImposterCount(1, 6, "accomplices")).toBe(2);
    expect(clampImposterCount(1, 6, "classic")).toBe(1);
    expect(clampImposterCount(9, 6, "accomplices")).toBe(maxImposters(6));
  });

  it("always deals at least two imposters in Accomplices", () => {
    for (let seed = 1; seed <= 20; seed += 1) {
      const round = createRound(
        config({ mode: "accomplices", imposterCount: 1, names: ["A", "B", "C", "D", "E"] }),
        { rng: seededRng(seed) },
      );
      expect(round.imposterIds.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("cipher masking", () => {
  it("keeps the first letter of each word and hides the rest", () => {
    expect(maskWord("Beach")).toBe("B▪▪▪▪");
    expect(maskWord("Fish and Chips")).toBe("F▪▪▪ A▪▪ C▪▪▪▪");
    expect(maskWord("A")).toBe("A");
  });

  it("counts only letters", () => {
    expect(letterCount("Beach")).toBe(5);
    expect(letterCount("Fish and Chips")).toBe(12);
    expect(letterCount("Mac and Cheese")).toBe(12);
  });

  it("never leaks a letter beyond the first of each word", () => {
    for (let seed = 1; seed <= 40; seed += 1) {
      const round = createRound(config({ mode: "cipher" }), { rng: seededRng(seed) });
      const mask = round.assignments.find((a) => a.isImposter)!.mask!;
      const maskedLetters = mask.replace(/[^A-Z]/g, "");
      const initials = round.secretWord
        .split(/\s+/)
        .map((part) => part[0].toUpperCase())
        .join("");
      expect(maskedLetters).toBe(initials);
    }
  });
});

describe("blind spot", () => {
  it("names the category the word actually came from", () => {
    for (const category of ["animals", "food", "sports"]) {
      const round = createRound(config({ mode: "blindspot", categories: [category] }), {
        rng: seededRng(9),
      });
      const assignment = round.assignments.find((a) => a.isImposter)!;
      const meta = CATEGORY_META.find((entry) => entry.id === category)!;
      expect(round.category).toBe(category);
      expect(assignment.categoryLabel).toBe(meta.label);
    }
  });
});
