"use client";

import { Minus, Plus } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface StepperProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
  suffix?: string;
}

export default function Stepper({ value, min, max, onChange, label, suffix }: StepperProps) {
  const reduce = useReducedMotion();
  const canDecrease = value > min;
  const canIncrease = value < max;

  return (
    <div className="flex items-center gap-3" role="group" aria-label={label}>
      <button
        type="button"
        className="glass flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition active:scale-90 disabled:opacity-30"
        onClick={() => canDecrease && onChange(value - 1)}
        disabled={!canDecrease}
        aria-label={`Decrease ${label}`}
      >
        <Minus size={18} strokeWidth={2.5} />
      </button>

      <div className="relative min-w-[4.5rem] flex-1 text-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={value}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-3xl font-bold tabular-nums"
          >
            {value}
            {suffix ? <span className="ml-1 text-base text-ink-300">{suffix}</span> : null}
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        type="button"
        className="glass flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition active:scale-90 disabled:opacity-30"
        onClick={() => canIncrease && onChange(value + 1)}
        disabled={!canIncrease}
        aria-label={`Increase ${label}`}
      >
        <Plus size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
}
