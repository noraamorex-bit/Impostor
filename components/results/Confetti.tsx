"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

const COLORS = ["#8B7CFF", "#B3A8FF", "#4FE3B0", "#FFC46B", "#FF8A6B", "#FFFFFF"];

/**
 * A short, cheap burst of particles — 22 divs, one animation each, no canvas.
 * Skipped entirely when the player prefers reduced motion.
 */
export default function Confetti({ active }: { active: boolean }) {
  const reduce = useReducedMotion();

  const pieces = useMemo(
    () =>
      Array.from({ length: 22 }, (_, index) => ({
        id: index,
        x: (index / 22) * 100 + (index % 3) * 4 - 6,
        delay: (index % 7) * 0.06,
        duration: 1.5 + (index % 5) * 0.25,
        rotate: (index % 2 ? 1 : -1) * (120 + index * 18),
        color: COLORS[index % COLORS.length],
        size: 6 + (index % 4) * 3,
      })),
    [],
  );

  if (!active || reduce) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((piece) => (
        <motion.span
          key={piece.id}
          className="absolute top-0 block rounded-[2px]"
          style={{
            left: `${piece.x}%`,
            width: piece.size,
            height: piece.size * 1.6,
            background: piece.color,
            opacity: 0.9,
          }}
          initial={{ y: -40, opacity: 0, rotate: 0 }}
          animate={{ y: "105vh", opacity: [0, 1, 1, 0], rotate: piece.rotate }}
          transition={{ duration: piece.duration, delay: piece.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}
