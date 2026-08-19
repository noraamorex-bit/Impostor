"use client";

import type { CSSProperties } from "react";

interface WordDisplayProps {
  text: string;
  tone?: "default" | "imposter";
  className?: string;
}

/**
 * The big word. Font size is driven by the longest single word in the phrase,
 * so "BEACH" fills the screen while "ARTIFICIAL INTELLIGENCE" still fits.
 */
export default function WordDisplay({ text, tone = "default", className = "" }: WordDisplayProps) {
  const longest = text
    .split(/\s+/)
    .reduce((max, part) => Math.max(max, part.length), 1);

  return (
    <span
      className={`word-display block ${tone === "imposter" ? "word-display--imposter" : ""} ${className}`}
      style={{ "--len": Math.max(longest, 4) } as CSSProperties}
    >
      {text}
    </span>
  );
}
