"use client";

import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useGame } from "@/lib/game/GameProvider";
import HomeScreen from "@/components/screens/HomeScreen";
import HowToPlayScreen from "@/components/screens/HowToPlayScreen";
import SettingsScreen from "@/components/screens/SettingsScreen";
import SetupScreen from "@/components/setup/SetupScreen";
import PassScreen from "@/components/game/PassScreen";
import RevealScreen from "@/components/game/RevealScreen";
import HandoffScreen from "@/components/game/HandoffScreen";
import DiscussionScreen from "@/components/game/DiscussionScreen";
import VotePassScreen from "@/components/voting/VotePassScreen";
import VoteScreen from "@/components/voting/VoteScreen";
import ResultsScreen from "@/components/results/ResultsScreen";

/**
 * One screen at a time, chosen by the phase in the reducer. Every screen owns
 * its own transition through <Screen>, so the shell only picks who is on stage.
 */
export default function GameShell() {
  const { state } = useGame();

  // A round in progress should survive a stray swipe-back, but never a reload:
  // secrets live in memory only.
  useEffect(() => {
    const inRound = ["pass", "reveal", "handoff", "discussion", "vote-pass", "vote"].includes(
      state.phase,
    );
    if (!inRound) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [state.phase]);

  const screen = () => {
    switch (state.phase) {
      case "home":
        return <HomeScreen />;
      case "how-to-play":
        return <HowToPlayScreen />;
      case "settings":
        return <SettingsScreen />;
      case "setup":
        return <SetupScreen />;
      case "pass":
        return <PassScreen />;
      case "reveal":
        return <RevealScreen />;
      case "handoff":
        return <HandoffScreen />;
      case "discussion":
        return <DiscussionScreen />;
      case "vote-pass":
        return <VotePassScreen />;
      case "vote":
        return <VoteScreen />;
      case "results":
        return <ResultsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <main className="app-shell">
      <AnimatePresence mode="wait" initial={false}>
        {screen()}
      </AnimatePresence>
    </main>
  );
}
