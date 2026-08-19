export type RNG = () => number;

export const defaultRng: RNG = () => Math.random();

/** Deterministic generator — used by tests and for reproducible debugging. */
export function seededRng(seed: number): RNG {
  let state = seed >>> 0 || 1;
  return () => {
    // xorshift32
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 0xffffffff;
  };
}

export function randomInt(max: number, rng: RNG = defaultRng): number {
  return Math.floor(rng() * max);
}

export function pickRandom<T>(items: readonly T[], rng: RNG = defaultRng): T {
  if (!items.length) throw new Error("pickRandom: empty list");
  return items[randomInt(items.length, rng)];
}

export function shuffle<T>(items: readonly T[], rng: RNG = defaultRng): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1, rng);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Pick `count` distinct items (count is clamped to the list length). */
export function sample<T>(items: readonly T[], count: number, rng: RNG = defaultRng): T[] {
  return shuffle(items, rng).slice(0, Math.max(0, Math.min(count, items.length)));
}
