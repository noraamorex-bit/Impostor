"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { itemVariants } from "@/components/ui/Screen";

interface SectionCardProps {
  title: string;
  hint?: ReactNode;
  children: ReactNode;
}

export default function SectionCard({ title, hint, children }: SectionCardProps) {
  return (
    <motion.section variants={itemVariants} className="glass p-5">
      <header className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="eyebrow">{title}</h2>
        {hint ? <span className="text-[0.75rem] text-ink-400">{hint}</span> : null}
      </header>
      {children}
    </motion.section>
  );
}
