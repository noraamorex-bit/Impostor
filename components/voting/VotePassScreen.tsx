"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Lock } from "lucide-react";
import Button from "@/components/ui/Button";
import Screen from "@/components/ui/Screen";
import { useGame } from "@/lib/game/GameProvider";
import { currentVoter } from "@/lib/game/reducer";
import { avatarGradient, initials } from "@/lib/game/helpers";
import WordDisplay from "@/components/ui/WordDisplay";

/** Privacy buffer for secret voting — mirrors the reveal pass screen. */
export default function VotePassScreen() {
  const { state, dispatch, buzz, play } = useGame();
  const reduce = useReducedMotion();
  const voter = currentVoter(state);
  const total = state.round?.players.length ?? 0;
  if (!voter) return null;

  return (
    <Screen screenKey={`vote-pass-${voter.id}`}>
      <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
        <motion.span
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="font-display flex h-24 w-24 items-center justify-center rounded-full text-2xl font-extrabold text-black/80 shadow-2xl"
          style={{ background: avatarGradient(voter.index) }}
        >
          {initials(voter.name)}
        </motion.span>

        <div className="space-y-3">
          <p className="eyebrow">Secret vote</p>
          <h1 className="px-2">
            <WordDisplay text={voter.name} />
          </h1>
          <p className="text-[0.85rem] text-ink-400">
            Vote {voter.index + 1} of {total}
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[0.78rem] text-ink-300">
          <Lock size={14} strokeWidth={2.2} />
          Nobody else sees this vote
        </div>
      </div>

      <div className="shrink-0 pb-1">
        <Button
          variant="primary"
          size="lg"
          block
          iconRight={<ArrowRight size={20} strokeWidth={2.4} />}
          onClick={() => {
            buzz(10);
            play("select");
            dispatch({ type: "voter-ready" });
          }}
        >
          I&apos;m ready
        </Button>
      </div>
    </Screen>
  );
}
