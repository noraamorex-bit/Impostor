"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Pause, Play, RotateCcw, Vote } from "lucide-react";
import Button from "@/components/ui/Button";
import Screen from "@/components/ui/Screen";
import { useGame } from "@/lib/game/GameProvider";
import { firstSpeaker, formatSeconds } from "@/lib/game/helpers";

const RING_SIZE = 224;
const RADIUS = 100;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function DiscussionScreen() {
  const { state, dispatch, buzz, play } = useGame();
  const reduce = useReducedMotion();
  const total = state.config.timerSeconds;
  const [remaining, setRemaining] = useState(total);
  const [running, setRunning] = useState(total > 0);
  const finishedRef = useRef(false);
  const warnedRef = useRef(false);

  useEffect(() => {
    if (!running || total === 0) return;
    const id = window.setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, total]);

  useEffect(() => {
    if (total > 0 && remaining === 0 && !finishedRef.current) {
      finishedRef.current = true;
      setRunning(false);
      buzz([30, 60, 30, 60, 60]);
      play("timeUp");
    }
    // One warning as the last ten seconds start, so nobody is caught mid-sentence.
    if (total > 10 && remaining === 10 && !warnedRef.current) {
      warnedRef.current = true;
      buzz(20);
      play("timerWarning");
    }
  }, [remaining, total, buzz, play]);

  const reset = useCallback(() => {
    finishedRef.current = false;
    warnedRef.current = false;
    setRemaining(total);
    setRunning(true);
  }, [total]);

  const round = state.round;
  if (!round) return null;

  const starter = firstSpeaker(round);
  const progress = total > 0 ? remaining / total : 0;
  const timeUp = total > 0 && remaining === 0;
  const urgent = total > 0 && remaining > 0 && remaining <= 10;

  return (
    <Screen screenKey="discussion">
      <div className="flex flex-1 flex-col items-center justify-center gap-7 text-center">
        <div className="space-y-2">
          <p className="eyebrow">Discussion</p>
          <h1 className="headline">Who doesn&apos;t belong?</h1>
        </div>

        {total > 0 ? (
          <button
            type="button"
            aria-label={running ? "Pause the timer" : "Start the timer"}
            onClick={() => {
              buzz(8);
              if (timeUp) reset();
              else setRunning((value) => !value);
            }}
            className="relative rounded-full transition active:scale-[0.97]"
            style={{ width: RING_SIZE, height: RING_SIZE }}
          >
            <svg width={RING_SIZE} height={RING_SIZE} className="-rotate-90" aria-hidden="true">
              <defs>
                <linearGradient id="timer-gradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={timeUp || urgent ? "#FFB59E" : "#FFD89E"} />
                  <stop offset="100%" stopColor={timeUp || urgent ? "#FF5F7A" : "#FFC46B"} />
                </linearGradient>
              </defs>
              <circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="10"
              />
              <motion.circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke="url(#timer-gradient)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - progress) }}
                transition={{ duration: reduce ? 0 : 0.9, ease: "linear" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                className="font-display text-5xl font-bold tabular-nums tracking-tight"
                animate={urgent && !reduce ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                transition={urgent ? { duration: 1, repeat: Infinity } : { duration: 0.2 }}
                style={{ color: urgent || timeUp ? "#FFB59E" : undefined }}
              >
                {formatSeconds(remaining)}
              </motion.span>
              <span className="mt-1 text-[0.72rem] uppercase tracking-[0.22em] text-ink-400">
                {timeUp ? "Time's up" : running ? "Talking" : "Paused"}
              </span>
            </div>
          </button>
        ) : (
          <div className="glass flex w-full max-w-xs flex-col items-center gap-2 px-6 py-8">
            <span className="font-display text-2xl font-bold">No timer</span>
            <span className="text-[0.85rem] text-ink-300">Talk for as long as you like.</span>
          </div>
        )}

        <div className="glass-flat w-full max-w-xs px-4 py-3">
          <p className="text-[0.8rem] text-ink-300">
            <span className="font-semibold text-ink-50">{starter.name}</span> starts — describe the
            word in one sentence, then go clockwise.
          </p>
        </div>

        {total > 0 ? (
          <div className="flex gap-3">
            <Button
              icon={running ? <Pause size={17} strokeWidth={2.4} /> : <Play size={17} strokeWidth={2.4} />}
              onClick={() => {
                buzz(8);
                if (timeUp) reset();
                else setRunning((value) => !value);
              }}
            >
              {timeUp ? "Restart" : running ? "Pause" : "Resume"}
            </Button>
            {!timeUp ? (
              <Button
                icon={<RotateCcw size={17} strokeWidth={2.4} />}
                onClick={reset}
                aria-label="Reset the timer"
              >
                Reset
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="shrink-0 space-y-3 pb-1">
        <Button
          variant="primary"
          size="lg"
          block
          icon={<Vote size={19} strokeWidth={2.2} />}
          onClick={() => {
            buzz([14, 40, 14]);
            play("start");
            dispatch({ type: "begin-voting" });
          }}
        >
          Go to voting
        </Button>
      </div>
    </Screen>
  );
}
