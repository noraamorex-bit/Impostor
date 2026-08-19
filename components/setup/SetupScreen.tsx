"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Play, Users, VenetianMask } from "lucide-react";
import Button from "@/components/ui/Button";
import Screen, { listVariants } from "@/components/ui/Screen";
import Stepper from "@/components/ui/Stepper";
import Toggle from "@/components/ui/Toggle";
import TopBar from "@/components/ui/TopBar";
import CategoryPicker from "./CategoryPicker";
import ModePicker from "./ModePicker";
import PlayerEditor from "./PlayerEditor";
import SectionCard from "./SectionCard";
import Segmented from "./OptionRow";
import { useGame } from "@/lib/game/GameProvider";
import { maxImposters } from "@/lib/game/engine";
import { TIMER_OPTIONS } from "@/lib/game/constants";
import { getMode } from "@/lib/game/modes";
import { CATEGORY_META, getPairPool, getWordPool, WORD_PAIRS } from "@/lib/words";

const CATEGORIES_WITH_PAIRS = new Set(WORD_PAIRS.map((pair) => pair.category));

const TIMER_LABELS: Record<number, string> = {
  0: "Off",
  60: "1 min",
  90: "1½ min",
  120: "2 min",
  180: "3 min",
  300: "5 min",
};

export default function SetupScreen() {
  const { state, dispatch, buzz } = useGame();
  const { config } = state;
  const playerCount = config.names.length;
  const mode = getMode(config.mode);

  // In unknown-imposter mode the round is drawn from the pair database, so
  // categories without pairs would silently fall back to everything.
  const categoriesWithoutPairs = useMemo(
    () =>
      mode.usesPairs
        ? CATEGORY_META.filter((category) => !CATEGORIES_WITH_PAIRS.has(category.id)).map((c) => c.id)
        : [],
    [mode.usesPairs],
  );

  const poolSize = useMemo(() => {
    if (mode.usesPairs) return getPairPool(config.categories).length;
    return getWordPool(config.categories).length;
  }, [config.categories, mode.usesPairs]);

  const categoryLabel = config.categories.length
    ? config.categories
        .map((id) => CATEGORY_META.find((category) => category.id === id)?.label ?? id)
        .join(", ")
    : "All categories";

  return (
    <Screen screenKey="setup">
      <TopBar title="Game setup" onBack={() => dispatch({ type: "go-home" })} />

      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="scroll-area space-y-3 pb-4"
      >
        <SectionCard title="Players" hint={`${playerCount} playing`}>
          <PlayerEditor
            names={config.names}
            onCountChange={(count) => {
              buzz(8);
              dispatch({ type: "set-player-count", count });
            }}
            onNameChange={(index, name) => dispatch({ type: "set-name", index, name })}
          />
        </SectionCard>

        <SectionCard title="Imposters" hint={`up to ${maxImposters(playerCount)}`}>
          <Stepper
            label="imposters"
            value={config.imposterCount}
            min={1}
            max={maxImposters(playerCount)}
            onChange={(imposterCount) => {
              buzz(8);
              dispatch({ type: "update-config", patch: { imposterCount } });
            }}
          />
          <p className="mt-3 text-center text-[0.8rem] text-ink-400">
            {config.imposterCount === 1
              ? "One outsider among " + (playerCount - 1) + " civilians."
              : `${config.imposterCount} outsiders among ${playerCount - config.imposterCount} civilians.`}
          </p>
        </SectionCard>

        <SectionCard title="Game mode">
          <ModePicker
            playerCount={playerCount}
            value={config.mode}
            onChange={(nextMode) => {
              buzz(10);
              dispatch({ type: "update-config", patch: { mode: nextMode } });
            }}
          />
        </SectionCard>

        <SectionCard title="Category" hint={`${poolSize} to draw from`}>
          <CategoryPicker
            selected={config.categories}
            disabledIds={categoriesWithoutPairs}
            onToggle={(category) => {
              buzz(6);
              dispatch({ type: "toggle-category", category });
            }}
            onSelectAll={() => {
              buzz(6);
              dispatch({ type: "select-all-categories" });
            }}
          />
        </SectionCard>

        <SectionCard title="Round options">
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-[0.85rem] font-semibold text-ink-100">Discussion timer</p>
              <Segmented
                label="Discussion timer"
                value={config.timerSeconds}
                options={TIMER_OPTIONS.map((seconds) => ({
                  value: seconds,
                  label: TIMER_LABELS[seconds] ?? `${seconds}s`,
                }))}
                onChange={(timerSeconds) =>
                  dispatch({ type: "update-config", patch: { timerSeconds } })
                }
              />
            </div>
            <div className="hairline" />
            <Toggle
              label="Private voting"
              description="Pass the phone again so each vote is cast in secret."
              checked={config.privateVoting}
              onChange={(privateVoting) =>
                dispatch({ type: "update-config", patch: { privateVoting } })
              }
            />
          </div>
        </SectionCard>
      </motion.div>

      <div className="shrink-0 space-y-3 pt-3">
        <div className="glass-flat flex items-center justify-between gap-3 px-4 py-3 text-[0.78rem] text-ink-300">
          <span className="flex items-center gap-1.5">
            <Users size={14} strokeWidth={2.2} />
            {playerCount}
          </span>
          <span className="flex items-center gap-1.5">
            <VenetianMask size={14} strokeWidth={2.2} />
            {config.imposterCount}
          </span>
          <span className="truncate">{mode.name}</span>
          <span className="max-w-[9rem] truncate text-right">{categoryLabel}</span>
        </div>

        <Button
          variant="primary"
          size="lg"
          block
          icon={<Play size={20} fill="currentColor" strokeWidth={0} />}
          onClick={() => {
            buzz([12, 40, 18]);
            dispatch({ type: "start-round" });
          }}
        >
          Start game
        </Button>
      </div>
    </Screen>
  );
}
