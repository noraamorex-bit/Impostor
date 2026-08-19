"use client";

import { useEffect } from "react";

type WakeLockNavigator = Navigator & {
  wakeLock?: { request: (type: "screen") => Promise<WakeLockSentinel> };
};

/**
 * Holds the screen awake while a round is in progress. A phone going to sleep
 * between two players is the most annoying thing that can happen mid-game.
 *
 * The lock is dropped automatically by the browser when the tab is hidden, so
 * it is re-requested when the page becomes visible again.
 */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active || typeof navigator === "undefined") return;
    const wakeLock = (navigator as WakeLockNavigator).wakeLock;
    if (!wakeLock) return;

    let sentinel: WakeLockSentinel | null = null;
    let released = false;

    const request = async () => {
      try {
        sentinel = await wakeLock.request("screen");
        if (released) void sentinel.release();
      } catch {
        /* denied, low battery, or unsupported — the game plays on regardless */
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void request();
    };

    void request();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      released = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      void sentinel?.release().catch(() => {});
    };
  }, [active]);
}
