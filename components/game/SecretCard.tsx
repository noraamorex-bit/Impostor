"use client";

import { motion, useReducedMotion } from "framer-motion";
import { VenetianMask } from "lucide-react";
import type { Assignment } from "@/types";
import WordDisplay from "@/components/ui/WordDisplay";

/**
 * The dramatic bit: what a single player actually sees. In unknown-imposter
 * mode the imposter's card is rendered by the exact same branch as a
 * civilian's, so the two are pixel-identical.
 */
export default function SecretCard({ assignment }: { assignment: Assignment }) {
  const reduce = useReducedMotion();
  const isRoleCard = assignment.kind !== "word";

  const enter = (delay: number) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 18, filter: "blur(10px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  if (!isRoleCard) {
    const word = assignment.word ?? "";
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <motion.p {...enter(0.02)} className="eyebrow">
          Your secret word
        </motion.p>
        <motion.h1 {...enter(0.1)}>
          <WordDisplay text={word} />
        </motion.h1>
        <motion.p {...enter(0.22)} className="max-w-[16rem] text-[0.85rem] leading-relaxed text-ink-300">
          Remember it. Describe it later — never say it out loud.
        </motion.p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <motion.p {...enter(0.02)} className="eyebrow">
        Your role
      </motion.p>

      <motion.div {...enter(0.08)} className="flex flex-col items-center gap-3">
        <span
          className="flex h-16 w-16 items-center justify-center rounded-3xl"
          style={{
            background: "linear-gradient(135deg, rgba(255,181,158,0.35), rgba(255,138,107,0.18))",
            border: "1px solid rgba(255,255,255,0.18)",
            boxShadow: "0 20px 50px -22px rgba(255,138,107,0.9)",
          }}
        >
          <VenetianMask size={30} strokeWidth={1.8} className="text-coral-soft" />
        </span>
        <h1>
          <WordDisplay text="Imposter" tone="imposter" />
        </h1>
      </motion.div>

      {assignment.kind === "imposter" ? (
        <motion.p {...enter(0.24)} className="max-w-[17rem] text-[0.9rem] leading-relaxed text-ink-200">
          You don&apos;t have the word.
          <span className="mt-1 block text-ink-400">
            Listen hard, answer late, and blend in.
          </span>
        </motion.p>
      ) : null}

      {assignment.kind === "imposter-clue" && assignment.clue ? (
        <motion.div {...enter(0.24)} className="w-full max-w-xs">
          <p className="eyebrow mb-2">Your clue</p>
          <div
            className="rounded-[20px] border px-5 py-4 text-[1.05rem] leading-snug text-ink-50"
            style={{
              background: "rgba(255,196,107,0.09)",
              borderColor: "rgba(255,196,107,0.28)",
            }}
          >
            {assignment.clue}
          </div>
        </motion.div>
      ) : null}

      {assignment.kind === "imposter-word" && assignment.word ? (
        <motion.div {...enter(0.24)} className="w-full max-w-xs">
          <p className="eyebrow mb-2">Your word</p>
          <div
            className="font-display rounded-[20px] border px-5 py-4 text-2xl font-bold uppercase tracking-tight"
            style={{
              background: "rgba(139,124,255,0.12)",
              borderColor: "rgba(139,124,255,0.32)",
            }}
          >
            {assignment.word}
          </div>
          <p className="mt-3 text-[0.82rem] leading-relaxed text-ink-400">
            You know everything. Now act like you earned it.
          </p>
        </motion.div>
      ) : null}
    </div>
  );
}
