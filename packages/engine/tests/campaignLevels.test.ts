import { describe, expect, it } from "vitest";

import type { ProgramSlots } from "../src";
import { runProgram, validateLevel } from "../src";
import { world01Basics } from "../../level-data/src/worlds/world-01-basics/levels";
import { world02Orientation } from "../../level-data/src/worlds/world-02-orientation/levels";
import { world03Height } from "../../level-data/src/worlds/world-03-height/levels";
import { world04Procedures } from "../../level-data/src/worlds/world-04-procedures/levels";
import { world05Recursion } from "../../level-data/src/worlds/world-05-recursion/levels";

const campaignLevels = [
  ...world01Basics,
  ...world02Orientation,
  ...world03Height,
  ...world04Procedures,
  ...world05Recursion,
];

const referencePrograms: Record<string, ProgramSlots> = {
  "world-01-level-05": {
    main: [
      "FORWARD",
      "FORWARD",
      "TURN_RIGHT",
      "FORWARD",
      "TURN_LEFT",
      "FORWARD",
      "FORWARD",
      "TURN_LEFT",
      "FORWARD",
      "LIGHT",
    ],
  },
  "world-02-level-05": {
    main: [
      "FORWARD",
      "FORWARD",
      "LIGHT",
      "TURN_RIGHT",
      "FORWARD",
      "TURN_RIGHT",
      "FORWARD",
      "FORWARD",
      "TURN_LEFT",
      "FORWARD",
      "LIGHT",
    ],
  },
  "world-02-level-06": {
    main: [
      "FORWARD",
      "FORWARD",
      "LIGHT",
      "TURN_LEFT",
      "FORWARD",
      "FORWARD",
      "TURN_LEFT",
      "FORWARD",
      "FORWARD",
      "LIGHT",
    ],
  },
  "world-03-level-05": {
    main: ["JUMP", "FORWARD", "TURN_LEFT", "JUMP", "FORWARD", "LIGHT"],
  },
  "world-03-level-06": {
    main: ["JUMP", "FORWARD", "LIGHT", "TURN_LEFT", "FORWARD", "JUMP", "LIGHT"],
  },
  "world-03-level-07": {
    main: ["JUMP", "FORWARD", "JUMP", "TURN_RIGHT", "FORWARD", "JUMP", "TURN_LEFT", "FORWARD", "LIGHT"],
  },
  "world-04-level-03": {
    main: ["LIGHT", "CALL_P1", "CALL_P1", "CALL_P1"],
    p1: ["FORWARD", "LIGHT"],
  },
  "world-04-level-04": {
    main: ["CALL_P1", "LIGHT", "CALL_P2", "LIGHT"],
    p1: ["FORWARD", "FORWARD"],
    p2: ["TURN_LEFT", "CALL_P1"],
  },
  "world-04-level-05": {
    main: ["CALL_P2", "CALL_P2", "CALL_P1", "LIGHT"],
    p1: ["FORWARD", "FORWARD"],
    p2: ["CALL_P1", "LIGHT", "TURN_LEFT"],
  },
  "world-04-level-06": {
    main: ["CALL_P1", "CALL_P1", "CALL_P1"],
    p1: ["JUMP", "LIGHT", "JUMP"],
  },
  "world-05-level-02": {
    main: ["CALL_P1"],
    p1: ["LIGHT", "JUMP", "CALL_P1"],
  },
  "world-05-level-03": {
    main: ["CALL_P1"],
    p1: ["LIGHT", "CALL_P2"],
    p2: ["FORWARD", "FORWARD", "TURN_LEFT", "CALL_P1"],
  },
  "world-05-level-04": {
    main: ["CALL_P1"],
    p1: ["LIGHT", "CALL_P2"],
    p2: ["FORWARD", "TURN_RIGHT", "FORWARD", "CALL_P1"],
  },
  "world-05-level-05": {
    main: ["CALL_P1"],
    p1: ["LIGHT", "JUMP", "FORWARD", "CALL_P1"],
  },
  "world-05-level-06": {
    main: ["CALL_P1"],
    p1: ["LIGHT", "CALL_P2"],
    p2: ["TURN_LEFT", "JUMP", "FORWARD", "CALL_P1"],
  },
};

function getProgramLength(program: ProgramSlots) {
  return program.main.length + (program.p1?.length ?? 0) + (program.p2?.length ?? 0);
}

describe("campaign levels", () => {
  it("contains 30 handcrafted levels with unique ids", () => {
    expect(campaignLevels).toHaveLength(30);
    expect(new Set(campaignLevels.map((level) => level.id)).size).toBe(campaignLevels.length);
  });

  it("validates every level definition", () => {
    for (const level of campaignLevels) {
      const validation = validateLevel(level);
      expect(validation.success, `${level.id}: ${validation.issues.map((issue) => issue.message).join(", ")}`).toBe(true);
    }
  });

  it("keeps published ideal sizes aligned with 3-star thresholds", () => {
    for (const level of campaignLevels) {
      if (!level.metadata?.idealSolutionLength || !level.stars) {
        continue;
      }

      expect(level.stars.three, level.id).toBe(level.metadata.idealSolutionLength);
    }
  });

  it("keeps new levels solvable at their published ideal size", () => {
    for (const [levelId, program] of Object.entries(referencePrograms)) {
      const level = campaignLevels.find((entry) => entry.id === levelId);

      expect(level, `${levelId} should exist`).toBeTruthy();

      const result = runProgram({
        level: level!,
        program,
        options: {
          maxSteps: 1000,
          maxCallDepth: 100,
        },
      });

      expect(result.status, levelId).toBe("SUCCESS");
      expect(getProgramLength(program), levelId).toBe(level!.metadata?.idealSolutionLength);
      expect(result.score.starsEarned, levelId).toBe(3);
    }
  });
});
