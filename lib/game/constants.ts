export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 12;
export const DEFAULT_PLAYERS = 5;

/** How many recent words to remember so rounds don't repeat themselves. */
export const WORD_HISTORY_LIMIT = 40;

export const TIMER_OPTIONS = [0, 60, 90, 120, 180, 300] as const;
export const DEFAULT_TIMER_SECONDS = 120;

export const STORAGE_KEYS = {
  config: "imposter:config",
  history: "imposter:history",
  preferences: "imposter:preferences",
} as const;
