"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Home, RotateCw, Settings2, VenetianMask } from "lucide-react";
import Button from "@/components/ui/Button";
import Screen from "@/components/ui/Screen";
import Confetti from "./Confetti";
import VoteTally from "./VoteTally";
import { useGame } from "@/lib/game/GameProvider";
import { avatarGradient, initials, listNames } from "@/lib/game/helpers";
import { getMode } from "@/lib/game/modes";
import type { Outcome } from "@/types";
import WordDisplay from "@/components/ui/WordDisplay";

type Stage = "suspense" | "imposter" | "full";

const OUTCOME_ACCENT: Record<Outcome, string> = {
  civilians: "#4FE3B0",
  imposters: "#FF8A6B",
  split: "#FFC46B",
};

/** Copy that knows how many imposters there were and how many got caught. */
function outcomeCopy(outcome: Outcome, caught: number, total: number) {
  const many = total > 1;
  switch (outcome) {
    case "civilians":
      return {
        title: "Civilians win",
        body:
          caught === total
            ? many
              ? "Every imposter was caught. Flawless."
              : "The table pointed at the right person."
            : "One imposter went down — the rest are still out there.",
      };
    case "imposters":
      return {
        title: many ? "Imposters win" : "Imposter wins",
        body: "Nobody caught them. Ice cold.",
      };
    case "split":
    default:
      return {
        title: "Split vote",
        body: `The table couldn't agree — ${
          many ? "the imposters slip" : "the imposter slips"
        } away with the doubt.`,
      };
  }
}

export default function ResultsScreen() {
  const { state, dispatch, buzz } = useGame();
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<Stage>(reduce ? "full" : "suspense");
  const round = state.round;
  const result = state.result;

  useEffect(() => {
    if (reduce) return;
    const first = window.setTimeout(() => setStage("imposter"), 1500);
    const second = window.setTimeout(() => setStage("full"), 3200);
    return () => {
      window.clearTimeout(first);
      window.clearTimeout(second);
    };
  }, [reduce]);

  useEffect(() => {
    if (stage === "imposter") buzz([20, 50, 20, 50, 40]);
  }, [stage, buzz]);

  if (!round || !result) return null;

  const mode = getMode(round.mode);
  const imposters = round.players.filter((player) => round.imposterIds.includes(player.id));
  const plural = imposters.length > 1;
  const outcome = outcomeCopy(result.outcome, result.caughtImposterIds.length, imposters.length);
  const accent = OUTCOME_ACCENT[result.outcome];

  return (
    <Screen screenKey="results">
      <div className="relative flex min-h-0 flex-1 flex-col">
        <Confetti active={stage !== "suspense" && result.outcome === "civilians"} />

        <div className="scroll-area -mx-1 px-1">
          <div className="flex min-h-full flex-col justify-center gap-4 py-2">
            <AnimatePresence mode="wait">
              {stage === "suspense" ? (
                <motion.div
                  key="suspense"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center gap-6 py-16 text-center"
                >
                  <motion.span
                    className="flex h-20 w-20 items-center justify-center rounded-full border border-white/12 bg-white/5"
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <VenetianMask size={34} strokeWidth={1.7} className="text-violet-soft" />
                  </motion.span>
                  <h1 className="headline">
                    The {plural ? "imposters were" : "imposter was"}
                    <span className="text-ink-400">…</span>
                  </h1>
                  <span className="flex gap-2" aria-hidden="true">
                    {[0, 1, 2].map((dot) => (
                      <motion.span
                        key={dot}
                        className="h-2 w-2 rounded-full bg-white/60"
                        animate={{ opacity: [0.25, 1, 0.25] }}
                        transition={{ duration: 1.1, repeat: Infinity, delay: dot * 0.18 }}
                      />
                    ))}
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="reveal"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 210, damping: 20 }}
                  className="space-y-4"
                >
                  {/* --- the imposters ------------------------------------ */}
                  <div className="glass glass-strong overflow-hidden px-5 py-6 text-center">
                    <p className="eyebrow mb-4">
                      {plural ? "The imposters were" : "The imposter was"}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-4">
                      {imposters.map((player, index) => (
                        <motion.div
                          key={player.id}
                          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.85 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{
                            delay: reduce ? 0 : 0.1 + index * 0.12,
                            type: "spring",
                            stiffness: 240,
                            damping: 18,
                          }}
                          className="flex flex-col items-center gap-2"
                        >
                          <span
                            aria-hidden="true"
                            className="font-display flex h-16 w-16 items-center justify-center rounded-full text-xl font-extrabold text-black/80 shadow-xl"
                            style={{ background: avatarGradient(player.index) }}
                          >
                            {initials(player.name)}
                          </span>
                          <WordDisplay
                            text={player.name}
                            tone="imposter"
                            className={imposters.length > 1 ? "!text-4xl" : ""}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <AnimatePresence>
                    {stage === "full" ? (
                      <motion.div
                        key="details"
                        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                        className="space-y-3"
                      >
                        {/* --- outcome ------------------------------------ */}
                        <div
                          className="rounded-[22px] border px-5 py-4 text-center"
                          style={{
                            background: `linear-gradient(135deg, ${accent}26, ${accent}0d)`,
                            borderColor: `${accent}55`,
                          }}
                        >
                          <h2
                            className="font-display text-2xl font-extrabold uppercase tracking-[0.06em]"
                            style={{ color: accent }}
                          >
                            {outcome.title}
                          </h2>
                          <p className="mt-1 text-[0.85rem] text-ink-200">{outcome.body}</p>
                        </div>

                        {/* --- the word ----------------------------------- */}
                        <div className="glass px-5 py-5 text-center">
                          <p className="eyebrow mb-2">The secret word</p>
                          <WordDisplay text={round.secretWord} />

                          {round.mode === "clue" && round.clue ? (
                            <p className="mt-4 text-[0.85rem] leading-relaxed text-ink-300">
                              <span className="text-ink-400">Imposter&apos;s clue: </span>
                              {round.clue}
                            </p>
                          ) : null}

                          {round.mode === "unknown" && round.imposterWord ? (
                            <p className="mt-4 text-[0.85rem] leading-relaxed text-ink-300">
                              <span className="text-ink-400">
                                {plural ? "They all saw" : "They saw"}:{" "}
                              </span>
                              <span className="font-display font-bold text-coral-soft">
                                {round.imposterWord}
                              </span>
                            </p>
                          ) : null}

                          {round.mode === "knowing" ? (
                            <p className="mt-4 text-[0.85rem] text-ink-400">
                              {plural ? "The imposters" : "The imposter"} knew the word all along.
                            </p>
                          ) : null}
                        </div>

                        {/* --- votes -------------------------------------- */}
                        <div className="glass px-4 py-4">
                          <div className="mb-3 space-y-1">
                            <p className="eyebrow">The votes</p>
                            <p className="text-[0.75rem] leading-snug text-ink-400">
                              {result.accusedIds.length
                                ? `Accused: ${listNames(
                                    round.players.filter((p) => result.accusedIds.includes(p.id)),
                                  )}`
                                : "Nobody was accused"}
                            </p>
                          </div>
                          <VoteTally
                            players={round.players}
                            result={result}
                            imposterIds={round.imposterIds}
                          />
                          {result.escapedImposterIds.length && result.caughtImposterIds.length ? (
                            <p className="mt-3 text-center text-[0.78rem] text-ink-400">
                              {listNames(
                                round.players.filter((p) =>
                                  result.escapedImposterIds.includes(p.id),
                                ),
                              )}{" "}
                              got away.
                            </p>
                          ) : null}
                        </div>

                        <p className="text-center text-[0.72rem] uppercase tracking-[0.18em] text-ink-500">
                          {mode.name} · round {state.roundNumber}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {stage !== "full" ? (
          <button
            type="button"
            onClick={() => setStage("full")}
            aria-label="Skip the reveal"
            className="absolute inset-0 z-20"
          />
        ) : null}
      </div>

      <div className="shrink-0 space-y-2 pt-3">
        <Button
          variant="primary"
          size="lg"
          block
          icon={<RotateCw size={19} strokeWidth={2.3} />}
          onClick={() => {
            buzz([12, 40, 18]);
            dispatch({ type: "play-again" });
          }}
        >
          Play again
        </Button>
        <div className="flex gap-2">
          <Button
            block
            className="btn-compact"
            icon={<Settings2 size={16} strokeWidth={2.2} />}
            onClick={() => dispatch({ type: "change-setup" })}
          >
            Change setup
          </Button>
          <Button
            block
            className="btn-compact"
            icon={<Home size={16} strokeWidth={2.2} />}
            onClick={() => dispatch({ type: "go-home" })}
          >
            Home
          </Button>
        </div>
      </div>
    </Screen>
  );
}
