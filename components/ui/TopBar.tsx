"use client";

import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

interface TopBarProps {
  title?: string;
  onBack?: () => void;
  right?: ReactNode;
}

export default function TopBar({ title, onBack, right }: TopBarProps) {
  return (
    <header className="mb-4 flex h-12 shrink-0 items-center justify-between gap-3">
      <div className="flex w-12 justify-start">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="glass flex h-11 w-11 items-center justify-center rounded-full transition active:scale-90"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
        ) : null}
      </div>
      {title ? <h1 className="eyebrow truncate text-center">{title}</h1> : <span />}
      <div className="flex w-12 justify-end">{right}</div>
    </header>
  );
}
