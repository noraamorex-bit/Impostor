"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eraser, ShieldCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import Screen, { itemVariants, listVariants } from "@/components/ui/Screen";
import Toggle from "@/components/ui/Toggle";
import TopBar from "@/components/ui/TopBar";
import { useGame } from "@/lib/game/GameProvider";
import { TOTAL_PAIR_COUNT, TOTAL_WORD_COUNT, CATEGORY_META } from "@/lib/words";

export default function SettingsScreen() {
  const { dispatch, state, preferences, setPreferences, resetEverything } = useGame();
  const [confirmingReset, setConfirmingReset] = useState(false);

  return (
    <Screen screenKey="settings">
      <TopBar title="Settings" onBack={() => dispatch({ type: "go-home" })} />

      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="scroll-area space-y-3 pb-4"
      >
        <motion.div variants={itemVariants}>
          <GlassCard className="space-y-1">
            <h2 className="eyebrow mb-2">Preferences</h2>
            <Toggle
              label="Remember player names"
              description="Keeps this group's names on this device between games. Off by default."
              checked={preferences.rememberNames}
              onChange={(rememberNames) => setPreferences({ rememberNames })}
            />
            <div className="hairline my-2" />
            <Toggle
              label="Haptics"
              description="A short buzz on reveals, votes and the final result."
              checked={preferences.haptics}
              onChange={(haptics) => setPreferences({ haptics })}
            />
          </GlassCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <GlassCard className="flex gap-4">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(79,227,176,0.3), rgba(23,169,124,0.16))",
                border: "1px solid rgba(255,255,255,0.14)",
              }}
            >
              <ShieldCheck size={19} strokeWidth={2.2} />
            </span>
            <div>
              <h2 className="font-display text-[1.0625rem] font-bold">Your secrets stay here</h2>
              <p className="mt-1 text-[0.85rem] leading-relaxed text-ink-300">
                There is no account, no server and no analytics. Words, roles and votes live in the
                phone&apos;s memory for the length of a round and are never written to storage — only
                your setup choices and a short word history are saved.
              </p>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <GlassCard>
            <h2 className="eyebrow mb-3">Library</h2>
            <dl className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Words", value: TOTAL_WORD_COUNT.toLocaleString() },
                { label: "Categories", value: CATEGORY_META.length },
                { label: "Pairs", value: TOTAL_PAIR_COUNT },
              ].map((stat) => (
                <div key={stat.label} className="glass-flat px-2 py-3">
                  <dt className="text-[0.65rem] uppercase tracking-[0.16em] text-ink-400">
                    {stat.label}
                  </dt>
                  <dd className="font-display mt-1 text-xl font-bold tabular-nums">{stat.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-center text-[0.8rem] text-ink-400">
              {state.history.length} recent word{state.history.length === 1 ? "" : "s"} remembered so
              rounds don&apos;t repeat.
            </p>
          </GlassCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <GlassCard className="space-y-3">
            <h2 className="eyebrow">Reset</h2>
            <p className="text-[0.85rem] leading-relaxed text-ink-300">
              Clears saved names, setup choices and the word history from this device.
            </p>
            {confirmingReset ? (
              <div className="flex gap-3">
                <Button block className="btn-compact" variant="danger" onClick={() => { resetEverything(); setConfirmingReset(false); }}>
                  Erase
                </Button>
                <Button block className="btn-compact" onClick={() => setConfirmingReset(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                block
                icon={<Eraser size={18} strokeWidth={2.2} />}
                onClick={() => setConfirmingReset(true)}
              >
                Clear saved data
              </Button>
            )}
          </GlassCard>
        </motion.div>

        <motion.p variants={itemVariants} className="pt-2 text-center text-[0.7rem] text-ink-500">
          Imposter · built for one phone and a table full of suspects
        </motion.p>
      </motion.div>
    </Screen>
  );
}
