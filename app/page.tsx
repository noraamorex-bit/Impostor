"use client";

import GameShell from "@/components/GameShell";
import { GameProvider } from "@/lib/game/GameProvider";

export default function Page() {
  return (
    <GameProvider>
      <GameShell />
    </GameProvider>
  );
}
