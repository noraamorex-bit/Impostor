"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * The brand mark: a masquerade mask cut into a diamond. No mouth, narrowed
 * eyes — friendly enough for a party, shady enough to be the imposter.
 */
export default function Logo({ size = 76 }: { size?: number }) {
  const reduce = useReducedMotion();

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <span
        aria-hidden="true"
        className="pulse-ring absolute inset-0 rounded-[28%] border"
        style={{ borderColor: "rgba(139,124,255,0.4)" }}
      />
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        role="img"
        aria-label="Imposter"
        initial={{ scale: reduce ? 1 : 0.86, opacity: 0, rotate: reduce ? 0 : -8 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
      >
        <defs>
          <linearGradient id="logo-face" x1="14" y1="6" x2="86" y2="94" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E6E2FF" />
            <stop offset="0.45" stopColor="#9C8DFF" />
            <stop offset="1" stopColor="#4B3BC4" />
          </linearGradient>
          <linearGradient id="logo-shade" x1="50" y1="4" x2="50" y2="96" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" stopOpacity="0.34" />
            <stop offset="0.55" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* diamond body */}
        <path
          d="M50 3 97 50 50 97 3 50z"
          fill="url(#logo-face)"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="1.4"
        />
        <path d="M50 3 97 50 50 97 3 50z" fill="url(#logo-shade)" />

        {/* domino mask across the face */}
        <path
          d="M18 42c11-8 23-7 32-2 9-5 21-6 32 2-3 12-14 20-32 20S21 54 18 42z"
          fill="#0D0D28"
          opacity="0.92"
        />
        {/* eye holes */}
        <g transform="rotate(-11 36 46)">
          <ellipse cx="36" cy="46" rx="9.5" ry="5.6" fill="#F2F0FF" />
        </g>
        <g transform="rotate(11 64 46)">
          <ellipse cx="64" cy="46" rx="9.5" ry="5.6" fill="#F2F0FF" />
        </g>
        {/* mask ribbons */}
        <path
          d="M18 42c-3.5 1-6 2.6-8 5M82 42c3.5 1 6 2.6 8 5"
          stroke="#0D0D28"
          strokeOpacity="0.6"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      </motion.svg>
    </div>
  );
}
