"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

export type ScreenTone = "default" | "danger";

interface ScreenProps {
  children: ReactNode;
  /** Distinct key per phase so AnimatePresence can cross-fade screens. */
  screenKey: string;
  className?: string;
}

/**
 * Page-level transition wrapper. Screens lift in from below and fall back out —
 * fast enough (240ms) to feel instant when passing the phone around a table.
 */
export default function Screen({ children, screenKey, className = "" }: ScreenProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      key={screenKey}
      // The same style keys in both branches: the server cannot know the
      // motion preference, and differing keys would break hydration.
      initial={{ opacity: 0, y: reduce ? 0 : 18, scale: reduce ? 1 : 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: reduce ? 0 : -14, scale: reduce ? 1 : 0.99 }}
      transition={{ duration: reduce ? 0.12 : 0.26, ease: [0.22, 1, 0.36, 1] }}
      className={`flex min-h-0 flex-1 flex-col ${className}`}
    >
      {children}
    </motion.div>
  );
}

/** Children stagger helpers, shared by the setup and results screens. */
export const EASE_OUT_SOFT = [0.22, 1, 0.36, 1] as const;

export const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.03 } },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: EASE_OUT_SOFT } },
};
