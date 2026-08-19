"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

export interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children?: ReactNode;
  strong?: boolean;
  padded?: boolean;
}

export default function GlassCard({
  children,
  strong,
  padded = true,
  className = "",
  ...rest
}: GlassCardProps) {
  return (
    <motion.div
      className={[
        "glass",
        strong ? "glass-strong" : "",
        padded ? "p-5" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
