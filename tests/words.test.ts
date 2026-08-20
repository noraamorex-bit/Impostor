import { describe, expect, it } from "vitest";
import {
  ALL_WORDS,
  CATEGORIES,
  CATEGORY_META,
  findWord,
  getPairPool,
  getWordPool,
  normalizeWord,
  TOTAL_PAIR_COUNT,
  TOTAL_WORD_COUNT,
  WORD_PAIRS,
} from "@/lib/words";

describe("word database", () => {
  it("ships at least 1000 words", () => {
    expect(TOTAL_WORD_COUNT).toBeGreaterThanOrEqual(1000);
  });

  it("has no duplicate words across categories", () => {
    const keys = ALL_WORDS.map((word) => normalizeWord(word.word));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("gives every word a clue that never contains the word itself", () => {
    const offenders = ALL_WORDS.filter((entry) => {
      if (!entry.clue || entry.clue.length < 8) return true;
      const word = normalizeWord(entry.word);
      const clue = entry.clue.toLowerCase();
      return word.split(" ").some((part) => part.length > 3 && clue.includes(part));
    });
    expect(offenders.map((o) => `${o.word} → ${o.clue}`)).toEqual([]);
  });

  it("is overwhelmingly single words, and never longer than three", () => {
    const single = ALL_WORDS.filter((entry) => !entry.word.includes(" "));
    // Compounds survive only when they name one inseparable thing people say as
    // a unit — "Ice Cream", "Hot Dog", "Traffic Light".
    expect(single.length / ALL_WORDS.length).toBeGreaterThan(0.8);
    const tooLong = ALL_WORDS.filter((entry) => entry.word.split(" ").length > 3);
    expect(tooLong.map((entry) => entry.word)).toEqual([]);
  });

  it("keeps every category big enough that rounds do not repeat", () => {
    // The round history holds 40 words; a category far below that repeats fast.
    const thin = CATEGORY_META.filter((category) => category.count < 20);
    expect(thin.map((category) => `${category.label}: ${category.count}`)).toEqual([]);
  });

  it("exposes meta for every category with a non-empty pool", () => {
    expect(CATEGORY_META.length).toBe(CATEGORIES.length);
    expect(CATEGORY_META.every((meta) => meta.count > 0)).toBe(true);
    expect(CATEGORY_META.every((meta) => meta.emoji.length > 0)).toBe(true);
  });

  it("filters the pool by category and falls back to everything", () => {
    const animals = getWordPool(["animals"]);
    expect(animals.length).toBeGreaterThan(50);
    expect(animals.every((word) => word.category === "animals")).toBe(true);

    const combined = getWordPool(["animals", "sports"]);
    expect(combined.length).toBe(animals.length + getWordPool(["sports"]).length);

    expect(getWordPool([]).length).toBe(TOTAL_WORD_COUNT);
    expect(getWordPool(["not-a-category"]).length).toBe(TOTAL_WORD_COUNT);
  });

  it("can look a word up by name", () => {
    expect(findWord("beach")?.clue).toBeTruthy();
    expect(findWord("definitely not a word")).toBeUndefined();
  });
});

describe("word pairs", () => {
  it("ships at least 500 related pairs", () => {
    expect(TOTAL_PAIR_COUNT).toBeGreaterThanOrEqual(500);
  });

  it("never pairs a word with itself and has no duplicate pairs", () => {
    const seen = new Set<string>();
    for (const pair of WORD_PAIRS) {
      expect(normalizeWord(pair.primary)).not.toBe(normalizeWord(pair.secondary));
      const key = [normalizeWord(pair.primary), normalizeWord(pair.secondary)].sort().join("|");
      expect(seen.has(key), `duplicate pair: ${pair.primary} / ${pair.secondary}`).toBe(false);
      seen.add(key);
    }
  });

  it("holds pairs to the same plain-word standard as the word list", () => {
    const sides = WORD_PAIRS.flatMap((pair) => [pair.primary, pair.secondary]);
    const single = sides.filter((side) => !side.includes(" "));
    expect(single.length / sides.length).toBeGreaterThan(0.8);
    expect(sides.filter((side) => side.split(" ").length > 3)).toEqual([]);
  });

  it("tags every pair with a known category and difficulty", () => {
    const ids = new Set(CATEGORIES.map((category) => category.id));
    for (const pair of WORD_PAIRS) {
      expect(ids.has(pair.category), `unknown category ${pair.category}`).toBe(true);
      expect(["easy", "medium", "hard"]).toContain(pair.difficulty);
    }
  });

  it("filters pairs by category", () => {
    const animals = getPairPool(["animals"]);
    expect(animals.length).toBeGreaterThan(10);
    expect(animals.every((pair) => pair.category === "animals")).toBe(true);
    expect(getPairPool([]).length).toBe(TOTAL_PAIR_COUNT);
  });
});
