import { describe, expect, it } from "vitest";
import { CUE_NAMES } from "@/lib/game/audio";

/**
 * The reveal cue is the one piece of sound design that is a correctness
 * concern: a different sting for the imposter would leak the round to anyone
 * listening across the table. There is exactly one `reveal` cue, and the
 * reveal screen has no branch that picks a different one.
 */
describe("sound cues", () => {
  it("defines every cue the game asks for", () => {
    for (const cue of [
      "reveal",
      "hide",
      "select",
      "vote",
      "start",
      "timerWarning",
      "timeUp",
      "suspense",
      "civiliansWin",
      "impostersWin",
    ]) {
      expect(CUE_NAMES).toContain(cue);
    }
  });

  it("has a single reveal cue, shared by every role", () => {
    expect(CUE_NAMES.filter((cue) => cue.startsWith("reveal"))).toEqual(["reveal"]);
  });
});
