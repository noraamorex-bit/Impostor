"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EyeOff, Fingerprint, Lock } from "lucide-react";
import Button from "@/components/ui/Button";
import Screen from "@/components/ui/Screen";
import SecretCard from "./SecretCard";
import { useGame } from "@/lib/game/GameProvider";
import { currentPlayer } from "@/lib/game/reducer";
import { getAssignment } from "@/lib/game/engine";
import { avatarGradient, initials } from "@/lib/game/helpers";

export default function RevealScreen() {
  const { state, dispatch, buzz, play } = useGame();
  const reduce = useReducedMotion();
  const [hiding, setHiding] = useState(false);
  const player = currentPlayer(state);
  const round = state.round;

  const handleHide = useCallback(() => {
    buzz(8);
    play("hide");
    // Curtain first, state second: the card is gone before the phone moves.
    setHiding(true);
    window.setTimeout(
      () => {
        setHiding(false);
        dispatch({ type: "hide-and-pass" });
      },
      reduce ? 60 : 260,
    );
  }, [buzz, play, dispatch, reduce]);

  if (!player || !round) return null;
  const assignment = getAssignment(round, player.id);
  const nextPlayer = round.players[player.index + 1] ?? null;

  return (
    <Screen screenKey={`reveal-${player.id}`}>
      <div className="flex h-12 shrink-0 items-center justify-center gap-2">
        <span
          aria-hidden="true"
          className="font-display flex h-8 w-8 items-center justify-center rounded-full text-[0.7rem] font-bold text-black/80"
          style={{ background: avatarGradient(player.index) }}
        >
          {initials(player.name)}
        </span>
        <span className="eyebrow">{player.name}</span>
      </div>

      <div className="glow-bed relative flex flex-1 items-center justify-center py-4">
        <AnimatePresence mode="wait" initial={false}>
          {!state.revealed ? (
            <motion.button
              key="cover"
              type="button"
              onClick={() => {
                buzz([10, 30, 14]);
                // Deliberately the same cue for every role — a different sting
                // for the imposter would give the game away across the table.
                play("reveal");
                dispatch({ type: "reveal" });
              }}
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.06, filter: "blur(12px)" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="glass glass-strong glass-hero relative z-[1] flex aspect-[3/4] w-full max-w-[19rem] flex-col items-center justify-center gap-5 overflow-hidden rounded-[32px] text-center transition active:scale-[0.98]"
              aria-label={`Reveal the secret for ${player.name}`}
            >
              {!reduce ? (
                <span aria-hidden="true" className="sheen" />
              ) : null}
              <span
                aria-hidden="true"
                className="absolute inset-0 opacity-70"
                style={{
                  background:
                    "radial-gradient(90% 60% at 50% 0%, rgba(139,124,255,0.28), transparent 65%)",
                }}
              />
              <motion.span
                className="relative flex h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-white/5"
                animate={reduce ? undefined : { y: [0, -6, 0] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Fingerprint size={34} strokeWidth={1.6} className="text-violet-soft" />
              </motion.span>
              <span className="relative space-y-2">
                <span className="font-display block text-2xl font-bold tracking-tight">
                  Tap to reveal
                </span>
                <span className="mx-auto block max-w-[13rem] text-[0.82rem] leading-relaxed text-ink-300">
                  Make sure nobody is looking over your shoulder.
                </span>
              </span>
              <span className="relative flex items-center gap-1.5 text-[0.7rem] uppercase tracking-[0.2em] text-ink-400">
                <Lock size={12} strokeWidth={2.4} />
                Private
              </span>
            </motion.button>
          ) : (
            <motion.div
              key="secret"
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              animate={
                hiding && !reduce
                  ? { opacity: 0, scale: 0.94, filter: "blur(16px)" }
                  : { opacity: 1, scale: 1, filter: "blur(0px)" }
              }
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, filter: "blur(16px)" }}
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
              className="glass glass-strong glass-hero relative z-[1] flex aspect-[3/4] w-full max-w-[19rem] items-center justify-center overflow-hidden rounded-[32px] px-6"
            >
              <SecretCard assignment={assignment} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Privacy curtain — sweeps across as the phone changes hands. */}
        <AnimatePresence>
          {hiding && !reduce ? (
            <motion.div
              key="curtain"
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none absolute inset-0 z-10 rounded-[32px]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(10,11,32,1) 55%, rgba(10,11,32,0.92) 100%)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
              }}
            />
          ) : null}
        </AnimatePresence>
      </div>

      <div className="shrink-0 space-y-3 pb-1">
        <AnimatePresence mode="wait" initial={false}>
          {state.revealed ? (
            <motion.div
              key="hide"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              <Button
                variant="primary"
                size="lg"
                block
                icon={<EyeOff size={19} strokeWidth={2.3} />}
                onClick={handleHide}
                disabled={hiding}
              >
                {nextPlayer ? `Hide & pass to ${nextPlayer.name}` : "Hide & finish"}
              </Button>
            </motion.div>
          ) : (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-4 text-center text-[0.8rem] text-ink-400"
            >
              Only {player.name} should see the next screen.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </Screen>
  );
}
