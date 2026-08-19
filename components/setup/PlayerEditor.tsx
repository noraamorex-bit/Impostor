"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useRef } from "react";
import { Shuffle, X } from "lucide-react";
import Stepper from "@/components/ui/Stepper";
import { MAX_PLAYERS, MIN_PLAYERS } from "@/lib/game/constants";
import { avatarGradient, initials } from "@/lib/game/helpers";

interface PlayerEditorProps {
  names: string[];
  onCountChange: (count: number) => void;
  onNameChange: (index: number, name: string) => void;
}

export default function PlayerEditor({ names, onCountChange, onNameChange }: PlayerEditorProps) {
  const reduce = useReducedMotion();
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const focusNext = useCallback(
    (index: number) => {
      const next = inputsRef.current[index + 1];
      if (next) next.focus();
      else inputsRef.current[index]?.blur();
    },
    [],
  );

  return (
    <div className="space-y-4">
      <Stepper
        label="players"
        value={names.length}
        min={MIN_PLAYERS}
        max={MAX_PLAYERS}
        onChange={onCountChange}
      />

      <ul className="space-y-2">
        <AnimatePresence initial={false}>
          {names.map((name, index) => (
            <motion.li
              key={index}
              layout={!reduce}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8, height: 0 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, height: "auto" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3"
            >
              <span
                aria-hidden="true"
                className="font-display flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[0.8rem] font-bold text-black/80"
                style={{ background: avatarGradient(index) }}
              >
                {name.trim() ? initials(name) : index + 1}
              </span>
              <div className="relative flex-1">
                <input
                  ref={(element) => {
                    inputsRef.current[index] = element;
                  }}
                  className="field pr-10"
                  value={name}
                  maxLength={16}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint={index === names.length - 1 ? "done" : "next"}
                  aria-label={`Name of player ${index + 1}`}
                  placeholder={`Player ${index + 1}`}
                  onChange={(event) => onNameChange(index, event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      focusNext(index);
                    }
                  }}
                />
                {name ? (
                  <button
                    type="button"
                    onClick={() => onNameChange(index, "")}
                    aria-label={`Clear name of player ${index + 1}`}
                    className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-ink-400 transition hover:text-ink-100"
                  >
                    <X size={16} strokeWidth={2.5} />
                  </button>
                ) : null}
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <p className="flex items-center gap-2 text-[0.75rem] text-ink-400">
        <Shuffle size={13} strokeWidth={2.2} />
        Leave a name blank and it becomes “Player {names.length}”.
      </p>
    </div>
  );
}
