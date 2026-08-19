"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import type { GameModeId } from "@/types";
import { GAME_MODES } from "@/lib/game/modes";

interface ModePickerProps {
  value: GameModeId;
  onChange: (mode: GameModeId) => void;
}

const MODE_ACCENT: Record<GameModeId, string> = {
  classic: "rgba(139,124,255,0.9)",
  clue: "rgba(255,196,107,0.9)",
  knowing: "rgba(255,138,107,0.9)",
  unknown: "rgba(79,227,176,0.9)",
};

export default function ModePicker({ value, onChange }: ModePickerProps) {
  const reduce = useReducedMotion();

  return (
    <div className="grid gap-2.5" role="radiogroup" aria-label="Game mode">
      {GAME_MODES.map((mode) => {
        const selected = mode.id === value;
        return (
          <button
            key={mode.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(mode.id)}
            className="relative overflow-hidden rounded-[22px] p-[1px] text-left transition active:scale-[0.985]"
            style={{
              background: selected
                ? `linear-gradient(135deg, ${MODE_ACCENT[mode.id]}, rgba(255,255,255,0.06))`
                : "rgba(255,255,255,0.09)",
            }}
          >
            <span
              className="relative flex items-start gap-3 rounded-[21px] p-4 transition-colors"
              style={{
                background: selected ? "rgba(19,19,48,0.82)" : "rgba(255,255,255,0.035)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              }}
            >
              {selected && !reduce ? (
                <motion.span
                  layoutId="mode-glow"
                  className="pointer-events-none absolute inset-0 rounded-[21px]"
                  style={{
                    background: `radial-gradient(120% 100% at 8% 0%, ${MODE_ACCENT[mode.id].replace("0.9", "0.22")}, transparent 62%)`,
                  }}
                  transition={{ type: "spring", stiffness: 320, damping: 32 }}
                />
              ) : null}

              <span
                aria-hidden="true"
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all"
                style={{
                  borderColor: selected ? "transparent" : "rgba(255,255,255,0.22)",
                  background: selected ? MODE_ACCENT[mode.id] : "transparent",
                }}
              >
                {selected ? <Check size={14} strokeWidth={3} className="text-black/80" /> : null}
              </span>

              <span className="relative min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-display text-[1.0625rem] font-bold">{mode.name}</span>
                  <span
                    className="text-[0.7rem] uppercase tracking-[0.14em]"
                    style={{ color: selected ? MODE_ACCENT[mode.id] : "rgba(154,160,189,0.9)" }}
                  >
                    {mode.tagline}
                  </span>
                </span>
                <AnimatePresence initial={false}>
                  {selected ? (
                    <motion.span
                      key="description"
                      initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                      animate={reduce ? { opacity: 1 } : { opacity: 1, height: "auto" }}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                      className="block overflow-hidden text-[0.82rem] leading-relaxed text-ink-300"
                    >
                      <span className="mt-1.5 block">{mode.description}</span>
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
