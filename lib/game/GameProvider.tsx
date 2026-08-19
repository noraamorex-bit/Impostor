"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import type { ReactNode } from "react";
import { gameReducer, INITIAL_STATE, type GameAction, type GameState } from "./reducer";
import {
  DEFAULT_PREFERENCES,
  clearAll,
  loadConfig,
  loadHistory,
  loadPreferences,
  saveConfig,
  saveHistory,
  savePreferences,
  type Preferences,
} from "./storage";

interface GameContextValue {
  state: GameState;
  dispatch: (action: GameAction) => void;
  preferences: Preferences;
  setPreferences: (patch: Partial<Preferences>) => void;
  resetEverything: () => void;
  /** Short haptic tick — no-op where unsupported or switched off. */
  buzz: (pattern?: number | number[]) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
  const { preferences, hydrated } = state;

  // Stored setup, history and preferences can only be read on the client, so
  // the first render always uses the defaults and this fills them in after.
  useEffect(() => {
    dispatch({
      type: "hydrate",
      config: loadConfig() ?? undefined,
      history: loadHistory(),
      preferences: loadPreferences(),
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveConfig(state.config, preferences.rememberNames);
  }, [state.config, hydrated, preferences.rememberNames]);

  useEffect(() => {
    if (!hydrated) return;
    saveHistory(state.history);
  }, [state.history, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    savePreferences(preferences);
  }, [preferences, hydrated]);

  const setPreferences = useCallback((patch: Partial<Preferences>) => {
    dispatch({ type: "set-preferences", patch });
  }, []);

  const resetEverything = useCallback(() => {
    clearAll();
    dispatch({ type: "hydrate", config: {}, history: [], preferences: DEFAULT_PREFERENCES });
  }, []);

  const haptics = preferences.haptics;
  const buzz = useCallback(
    (pattern: number | number[] = 12) => {
      if (!haptics) return;
      if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
      try {
        navigator.vibrate(pattern);
      } catch {
        /* some browsers throw when the page is not focused */
      }
    },
    [haptics],
  );

  const value = useMemo<GameContextValue>(
    () => ({ state, dispatch, preferences, setPreferences, resetEverything, buzz }),
    [state, preferences, setPreferences, resetEverything, buzz],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used inside <GameProvider>");
  return context;
}
