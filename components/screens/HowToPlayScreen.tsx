"use client";

import { motion } from "framer-motion";
import { Eye, MessageCircle, Trophy, Vote } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import Screen, { itemVariants, listVariants } from "@/components/ui/Screen";
import TopBar from "@/components/ui/TopBar";
import Button from "@/components/ui/Button";
import { useGame } from "@/lib/game/GameProvider";
import { GAME_MODES } from "@/lib/game/modes";

const STEPS = [
  {
    icon: Eye,
    title: "Pass & peek",
    body: "The phone goes around the table. Everyone taps to reveal their own screen in private, then hides it again before passing it on.",
  },
  {
    icon: MessageCircle,
    title: "Talk it out",
    body: "Take turns describing the word without saying it. The imposter has to bluff their way through without ever knowing what everyone else is talking about.",
  },
  {
    icon: Vote,
    title: "Vote",
    body: "When the talking runs out, everyone accuses one player. Votes can be shouted out loud or cast privately on the phone.",
  },
  {
    icon: Trophy,
    title: "Reveal",
    body: "Accuse only imposters and the civilians win. Point at an innocent and the imposters walk free.",
  },
];

export default function HowToPlayScreen() {
  const { dispatch } = useGame();

  return (
    <Screen screenKey="how-to-play">
      <TopBar title="How to play" onBack={() => dispatch({ type: "go-home" })} />

      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="scroll-area space-y-3 pb-4"
      >
        {STEPS.map((step, index) => (
          <motion.div key={step.title} variants={itemVariants}>
            <GlassCard className="flex gap-4">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, rgba(139,124,255,0.35), rgba(90,73,214,0.2))",
                  border: "1px solid rgba(255,255,255,0.14)",
                }}
              >
                <step.icon size={19} strokeWidth={2.2} />
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-[1.0625rem] font-bold">
                  <span className="mr-2 text-ink-400">{index + 1}</span>
                  {step.title}
                </h2>
                <p className="mt-1 text-[0.875rem] leading-relaxed text-ink-300">{step.body}</p>
              </div>
            </GlassCard>
          </motion.div>
        ))}

        <motion.h2 variants={itemVariants} className="eyebrow px-1 pt-4">
          The four modes
        </motion.h2>

        {GAME_MODES.map((mode) => (
          <motion.div key={mode.id} variants={itemVariants}>
            <GlassCard>
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-[1.0625rem] font-bold">{mode.name}</h3>
                <span className="text-[0.7rem] uppercase tracking-[0.16em] text-violet-soft">
                  {mode.tagline}
                </span>
              </div>
              <p className="mt-1.5 text-[0.875rem] leading-relaxed text-ink-300">{mode.description}</p>
            </GlassCard>
          </motion.div>
        ))}

        <motion.div variants={itemVariants} className="pt-2">
          <GlassCard className="text-center">
            <p className="text-[0.85rem] leading-relaxed text-ink-300">
              <span className="font-semibold text-ink-100">House rule:</span> nobody says the word
              out loud — not even the civilians. Describe it, never define it.
            </p>
          </GlassCard>
        </motion.div>
      </motion.div>

      <div className="pt-3">
        <Button variant="primary" block onClick={() => dispatch({ type: "navigate", phase: "setup" })}>
          Start a game
        </Button>
      </div>
    </Screen>
  );
}
