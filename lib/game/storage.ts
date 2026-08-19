"use client";

import type { GameConfig } from "@/types";
import { STORAGE_KEYS, WORD_HISTORY_LIMIT } from "./constants";

/**
 * Persistence policy
 * -----------------
 * Only setup choices, preferences and a short word history are ever written to
 * localStorage. Round secrets — the word, the pair, who the imposters are —
 * live in memory for exactly as long as the round does, so nothing sensitive
 * survives a refresh or can be dug out of devtools after the game.
 * Player names are stored only when "Remember names" is switched on.
 */

export interface Preferences {
  rememberNames: boolean;
  haptics: boolean;
  sound: boolean;
  /** Hold the screen awake while a round is in progress. */
  keepAwake: boolean;
}

export const DEFAULT_PREFERENCES: Preferences = {
  rememberNames: false,
  haptics: true,
  sound: true,
  keepAwake: true,
};

const isBrowser = () => typeof window !== "undefined";

function read<T>(key: string): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked — the game still works, it just forgets */
  }
}

function remove(key: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function loadPreferences(): Preferences {
  const stored = read<Partial<Preferences>>(STORAGE_KEYS.preferences);
  return { ...DEFAULT_PREFERENCES, ...(stored ?? {}) };
}

export function savePreferences(preferences: Preferences): void {
  write(STORAGE_KEYS.preferences, preferences);
}

export type StoredConfig = Omit<GameConfig, "names"> & { names?: string[] };

export function loadConfig(): Partial<GameConfig> | null {
  return read<Partial<GameConfig>>(STORAGE_KEYS.config);
}

export function saveConfig(config: GameConfig, rememberNames: boolean): void {
  const payload: StoredConfig = rememberNames
    ? { ...config }
    : { ...config, names: config.names.map(() => "") };
  write(STORAGE_KEYS.config, payload);
}

export function loadHistory(): string[] {
  const stored = read<string[]>(STORAGE_KEYS.history);
  return Array.isArray(stored) ? stored.slice(0, WORD_HISTORY_LIMIT) : [];
}

export function saveHistory(history: string[]): void {
  write(STORAGE_KEYS.history, history.slice(0, WORD_HISTORY_LIMIT));
}

export function clearStoredNames(): void {
  const config = loadConfig();
  if (!config) return;
  write(STORAGE_KEYS.config, { ...config, names: (config.names ?? []).map(() => "") });
}

export function clearAll(): void {
  Object.values(STORAGE_KEYS).forEach(remove);
}
