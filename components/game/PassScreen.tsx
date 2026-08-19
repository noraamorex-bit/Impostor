"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, EyeOff, Smartphone } from "lucide-react";
import Button from "@/components/ui/Button";
import Screen from "@/components/ui/Screen";
import { useGame } from "@/lib/game/GameProvider";
import { currentPlayer } from "@/lib/game/reducer";
import WordDisplay from "@/components/ui/WordDisplay";
import { avatarGradient, initials } from "@/lib/game/helpers";

/**
 * The privacy buffer between two players. Nothing secret is ever rendered on
 * this screen — it exists so the previous player's card is long gone before the
 * next person looks at the phone.
 */
export default function PassScreen() {
  const { state, dispatch, buzz, play } = useGame();
  const reduce = useReducedMotion();
  const player = currentPlayer(state);
  const total = state.round?.players.length ?? 0;

  if (!player) return null;

  return (
    <Screen screenKey={`pass-${player.id}`}>
      <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="relative"
        >
          <span
            aria-hidden="true"
            className="pulse-ring absolute inset-0 rounded-full border-2"
            style={{ borderColor: "rgba(139,124,255,0.4)" }}
          />
          <span
            className="font-display flex h-28 w-28 items-center justify-center rounded-full text-3xl font-extrabold text-black/80 shadow-2xl"
            style={{ background: avatarGradient(player.index) }}
          >
            {initials(player.name)}
          </span>
        </motion.div>

        <div className="space-y-3">
          <p className="eyebrow flex items-center justify-center gap-2">
            <Smartphone size={13} strokeWidth={2.4} />
            Pass the phone to
          </p>
          <motion.h1
            key={player.id}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="px-2"
          >
            <WordDisplay text={player.name} />
          </motion.h1>
          <p className="text-[0.85rem] text-ink-400">
            Player {player.index + 1} of {total}
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[0.78rem] text-ink-300">
          <EyeOff size={14} strokeWidth={2.2} />
          Everyone else: look away
        </div>
      </div>

      <div className="shrink-0 space-y-3 pb-1">
        <div className="flex justify-center gap-1.5" aria-hidden="true">
          {Array.from({ length: total }).map((_, index) => (
            <span
              key={index}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: index === player.index ? 22 : 6,
                background:
                  index < player.index
                    ? "rgba(139,124,255,0.85)"
                    : index === player.index
                      ? "#fff"
                      : "rgba(255,255,255,0.18)",
              }}
            />
          ))}
        </div>
        <Button
          variant="primary"
          size="lg"
          block
          iconRight={<ArrowRight size={20} strokeWidth={2.4} />}
          onClick={() => {
            buzz(10);
            play("select");
            dispatch({ type: "ready-to-reveal" });
          }}
        >
          I&apos;m {player.name.length <= 8 ? player.name : "ready"}
        </Button>
      </div>
    </Screen>
  );
}
