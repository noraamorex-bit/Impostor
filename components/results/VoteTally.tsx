"use client";

import { motion } from "framer-motion";
import type { Player, RoundResult } from "@/types";
import { avatarGradient, initials } from "@/lib/game/helpers";

interface VoteTallyProps {
  players: Player[];
  result: RoundResult;
  imposterIds: string[];
}

export default function VoteTally({ players, result, imposterIds }: VoteTallyProps) {
  const byId = new Map(players.map((player) => [player.id, player]));
  const max = Math.max(1, ...result.tally.map((entry) => entry.votes));

  return (
    <ul className="space-y-2">
      {result.tally.map((entry, index) => {
        const player = byId.get(entry.playerId);
        if (!player) return null;
        const isImposter = imposterIds.includes(player.id);
        const share = entry.votes / max;

        return (
          <li key={entry.playerId} className="relative overflow-hidden rounded-2xl">
            <motion.span
              className="absolute inset-y-0 left-0 rounded-2xl"
              style={{
                background: isImposter
                  ? "linear-gradient(90deg, rgba(255,138,107,0.38), rgba(255,138,107,0.10))"
                  : "linear-gradient(90deg, rgba(255,255,255,0.18), rgba(255,255,255,0.04))",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(share * 100, entry.votes ? 14 : 0)}%` }}
              transition={{ duration: 0.6, delay: 0.06 * index, ease: [0.22, 1, 0.36, 1] }}
            />
            <div className="relative flex items-center gap-3 px-3 py-2.5">
              <span
                aria-hidden="true"
                className="font-display flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-bold text-black/80"
                style={{ background: avatarGradient(player.index) }}
              >
                {initials(player.name)}
              </span>
              <span className="min-w-0 flex-1 truncate text-[0.9rem] font-semibold">
                {player.name}
                {isImposter ? (
                  <span className="ml-2 rounded-full border border-coral/40 px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.14em] text-coral-soft">
                    Imposter
                  </span>
                ) : null}
              </span>
              <span className="font-display shrink-0 text-[0.95rem] font-bold tabular-nums">
                {entry.votes}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
