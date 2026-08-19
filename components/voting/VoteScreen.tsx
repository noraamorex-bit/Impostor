"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Gavel, SkipForward } from "lucide-react";
import Button from "@/components/ui/Button";
import Screen from "@/components/ui/Screen";
import { useGame } from "@/lib/game/GameProvider";
import { currentVoter } from "@/lib/game/reducer";
import { votableFor } from "@/lib/game/engine";
import { avatarGradient, initials } from "@/lib/game/helpers";

export default function VoteScreen() {
  const { state, dispatch, buzz, play } = useGame();
  const reduce = useReducedMotion();
  // The ballot is tied to a voter, so handing the phone on always starts blank.
  const [ballot, setBallot] = useState<{ voterId: string; selected: string | null }>({
    voterId: "",
    selected: null,
  });
  const voter = currentVoter(state);
  const round = state.round;
  const selected = voter && ballot.voterId === voter.id ? ballot.selected : null;

  if (!voter || !round) return null;
  const candidates = votableFor(round, voter.id);

  const submit = (targetId: string | null) => {
    buzz(targetId ? [12, 30, 12] : 8);
    play("vote");
    dispatch({ type: "cast-vote", targetId });
  };

  return (
    <Screen screenKey={`vote-${voter.id}`}>
      <div className="shrink-0 space-y-2 pb-4 text-center">
        <p className="eyebrow">
          {state.config.privateVoting ? "Your secret vote" : `${voter.name} votes`}
        </p>
        <h1 className="headline">Who is the imposter?</h1>
        <p className="text-[0.8rem] text-ink-400">
          Vote {voter.index + 1} of {round.players.length}
          {state.config.privateVoting ? "" : " · say it out loud, then tap"}
        </p>
        <div className="flex justify-center gap-1.5 pt-1" aria-hidden="true">
          {round.players.map((player, index) => (
            <span
              key={player.id}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: index === voter.index ? 20 : 6,
                background:
                  index < voter.index
                    ? "rgb(var(--accent) / 0.85)"
                    : index === voter.index
                      ? "#fff"
                      : "rgba(255,255,255,0.18)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Centre the ballot only when it cannot overflow — a centred flex column
          that overflows would push the first cards under the header. */}
      <div
        className={`scroll-area -mx-1 px-1 ${
          candidates.length <= 4 ? "flex flex-col justify-center" : ""
        }`}
      >
        <ul className="grid grid-cols-2 gap-2.5 py-2">
          {candidates.map((player, index) => {
            const isSelected = selected === player.id;
            return (
              <motion.li
                key={player.id}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduce ? 0 : index * 0.035, duration: 0.28 }}
              >
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    buzz(8);
                    play("select");
                    setBallot({ voterId: voter.id, selected: isSelected ? null : player.id });
                  }}
                  className="glass relative flex h-full w-full flex-col items-center gap-2.5 overflow-hidden rounded-[22px] px-3 py-5 text-center transition active:scale-[0.97]"
                  style={
                    isSelected
                      ? {
                          borderColor: "rgb(var(--accent-soft) / 0.7)",
                          background: "rgb(var(--accent) / 0.16)",
                          boxShadow: "0 18px 44px -22px rgb(var(--accent) / 0.95)",
                        }
                      : undefined
                  }
                >
                  <span
                    aria-hidden="true"
                    className="font-display flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-black/80"
                    style={{ background: avatarGradient(player.index) }}
                  >
                    {initials(player.name)}
                  </span>
                  <span className="line-clamp-2 text-[0.9rem] font-semibold leading-tight">
                    {player.name}
                  </span>
                  {isSelected ? (
                    <motion.span
                      layoutId={reduce ? undefined : `vote-tick-${voter.id}`}
                      className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full"
                      style={{
                        background:
                          "linear-gradient(135deg, rgb(var(--accent-soft)), rgb(var(--accent)))",
                      }}
                    >
                      <Check size={14} strokeWidth={3} className="text-black/80" />
                    </motion.span>
                  ) : null}
                </button>
              </motion.li>
            );
          })}
        </ul>
      </div>

      <div className="shrink-0 space-y-2 pt-3">
        <Button
          variant="primary"
          size="lg"
          block
          disabled={!selected}
          icon={<Gavel size={18} strokeWidth={2.2} />}
          onClick={() => selected && submit(selected)}
        >
          {selected
            ? `Accuse ${candidates.find((player) => player.id === selected)?.name}`
            : "Pick someone"}
        </Button>
        <Button
          variant="ghost"
          block
          icon={<SkipForward size={16} strokeWidth={2.2} />}
          onClick={() => submit(null)}
        >
          Abstain
        </Button>
      </div>
    </Screen>
  );
}
