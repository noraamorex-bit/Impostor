"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, MessagesSquare, RotateCw, SkipForward } from "lucide-react";
import Button from "@/components/ui/Button";
import Screen from "@/components/ui/Screen";
import { useGame } from "@/lib/game/GameProvider";
import { avatarGradient, initials } from "@/lib/game/helpers";

/** "Everyone ready?" — the beat between the last reveal and the discussion. */
export default function HandoffScreen() {
  const { state, dispatch, buzz, play } = useGame();
  const reduce = useReducedMotion();
  const round = state.round;
  if (!round) return null;

  return (
    <Screen screenKey="handoff">
      <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
        <motion.span
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 18 }}
          className="flex h-20 w-20 items-center justify-center rounded-full"
          style={{
            background: "linear-gradient(135deg, rgba(79,227,176,0.3), rgba(23,169,124,0.15))",
            border: "1px solid rgba(255,255,255,0.18)",
          }}
        >
          <CheckCircle2 size={36} strokeWidth={1.8} className="text-mint" />
        </motion.span>

        <div className="space-y-3">
          <h1 className="headline">Everyone ready?</h1>
          <p className="mx-auto max-w-[17rem] text-[0.9rem] leading-relaxed text-ink-300">
            All {round.players.length} players have seen their screen. Put the phone in the middle
            of the table.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {round.players.map((player, index) => (
            <motion.span
              key={player.id}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.05 * index, type: "spring", stiffness: 300, damping: 22 }}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3"
            >
              <span
                aria-hidden="true"
                className="font-display flex h-7 w-7 items-center justify-center rounded-full text-[0.65rem] font-bold text-black/80"
                style={{ background: avatarGradient(player.index) }}
              >
                {initials(player.name)}
              </span>
              <span className="text-[0.78rem] text-ink-200">{player.name}</span>
            </motion.span>
          ))}
        </div>
      </div>

      <div className="shrink-0 space-y-2 pb-1">
        <Button
          variant="primary"
          size="lg"
          block
          icon={<MessagesSquare size={19} strokeWidth={2.2} />}
          onClick={() => {
            buzz([12, 30, 12]);
            play("start");
            dispatch({ type: "start-discussion" });
          }}
        >
          Start discussion
        </Button>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            block
            className="btn-compact"
            icon={<SkipForward size={15} strokeWidth={2.2} />}
            onClick={() => dispatch({ type: "begin-voting" })}
          >
            Skip to voting
          </Button>
          {/* Someone glanced at the wrong screen — deal a fresh word and roles
              rather than playing out a round everybody knows is spoiled. */}
          <Button
            variant="ghost"
            block
            className="btn-compact"
            icon={<RotateCw size={15} strokeWidth={2.2} />}
            onClick={() => {
              buzz(10);
              dispatch({ type: "start-round" });
            }}
          >
            Redeal round
          </Button>
        </div>
      </div>
    </Screen>
  );
}
