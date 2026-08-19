"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, Play, Settings2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Logo from "@/components/ui/Logo";
import Screen from "@/components/ui/Screen";
import { useGame } from "@/lib/game/GameProvider";
import { GAME_MODES } from "@/lib/game/modes";
import { TOTAL_PAIR_COUNT, TOTAL_WORD_COUNT } from "@/lib/words";

export default function HomeScreen() {
  const { dispatch, buzz } = useGame();
  const reduce = useReducedMotion();

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 20 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reduce ? 0.15 : 0.5,
      delay: reduce ? 0 : delay,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  });

  return (
    <Screen screenKey="home">
      <div className="flex flex-1 flex-col items-center justify-center gap-8 py-6 text-center">
        <motion.div {...fadeUp(0.02)}>
          <Logo size={96} />
        </motion.div>

        <motion.div {...fadeUp(0.1)} className="space-y-3">
          <h1
            className="font-display text-[clamp(2.75rem,14vw,4rem)] font-extrabold leading-none"
            style={{ letterSpacing: "-0.045em" }}
          >
            <span
              style={{
                background: "linear-gradient(170deg,#ffffff 25%,#d9d5ff 60%,#a99cff 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              IMPOSTER
            </span>
          </h1>
          <p className="mx-auto max-w-[19rem] text-[0.95rem] leading-relaxed text-ink-300">
            One phone. One secret.
            <br />
            <span className="text-ink-100">Someone doesn&apos;t belong.</span>
          </p>
        </motion.div>

        <motion.div {...fadeUp(0.2)} className="w-full max-w-sm space-y-3 px-2">
          <Button
            variant="primary"
            size="lg"
            block
            icon={<Play size={20} fill="currentColor" strokeWidth={0} />}
            onClick={() => {
              buzz(14);
              dispatch({ type: "navigate", phase: "setup" });
            }}
          >
            Play
          </Button>
          <div className="flex gap-3">
            <Button
              block
              className="btn-compact"
              icon={<BookOpen size={17} strokeWidth={2.2} />}
              onClick={() => dispatch({ type: "navigate", phase: "how-to-play" })}
            >
              How to play
            </Button>
            <Button
              block
              className="btn-compact"
              icon={<Settings2 size={17} strokeWidth={2.2} />}
              onClick={() => dispatch({ type: "navigate", phase: "settings" })}
            >
              Settings
            </Button>
          </div>
        </motion.div>

        <motion.div
          {...fadeUp(0.3)}
          className="flex items-center gap-5 text-[0.7rem] uppercase tracking-[0.2em] text-ink-400"
        >
          <span>{TOTAL_WORD_COUNT.toLocaleString()} words</span>
          <span className="h-3 w-px bg-white/15" />
          <span>{GAME_MODES.length} modes</span>
          <span className="h-3 w-px bg-white/15" />
          <span>{TOTAL_PAIR_COUNT} pairs</span>
        </motion.div>
      </div>

      <motion.p {...fadeUp(0.36)} className="pb-1 text-center text-[0.7rem] text-ink-500">
        3–12 players · no accounts · works offline
      </motion.p>
    </Screen>
  );
}
