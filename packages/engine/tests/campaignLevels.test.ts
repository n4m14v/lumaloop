import { describe, expect, it } from "vitest";

import type { ProgramSlots } from "../src";
import { runProgram, validateLevel } from "../src";
import { allHandcraftedLevels, campaignLevels } from "../../level-data/src/campaign";

const referencePrograms: Record<string, ProgramSlots> = {
  "world-01-level-04": {
    main: [
      "FORWARD",
      "FORWARD",
      "ACTIVATE",
      "TURN_RIGHT",
      "FORWARD",
      "FORWARD",
      "ACTIVATE",
    ],
  },
  "world-01-level-05": {
    main: ["CALL_P1", "CALL_P1", "ACTIVATE"],
    p1: ["FORWARD", "FORWARD"],
  },
  "world-01-level-06": {
    main: ["ACTIVATE", "CALL_P1", "CALL_P1", "CALL_P1"],
    p1: ["FORWARD", "ACTIVATE"],
  },
  "world-01-level-07": {
    main: ["CALL_P1", "TURN_RIGHT", "CALL_P1"],
    p1: ["FORWARD", "FORWARD", "ACTIVATE"],
  },
  "world-01-level-08": {
    main: ["CALL_P1", "CALL_P1"],
    p1: ["JUMP", "ACTIVATE", "JUMP"],
  },
  "world-01-level-09": {
    main: ["CALL_P1", "CALL_P2", "ACTIVATE"],
    p1: ["FORWARD", "FORWARD"],
    p2: ["TURN_RIGHT", "CALL_P1"],
  },
  "world-01-level-10": {
    main: ["CALL_P2", "CALL_P2", "CALL_P1", "ACTIVATE"],
    p1: ["FORWARD", "FORWARD"],
    p2: ["CALL_P1", "ACTIVATE", "TURN_LEFT"],
  },
  "world-01-level-11": {
    main: ["TOGGLE", "FORWARD", "FORWARD", "ACTIVATE"],
  },
  "world-03-level-05": {
    main: ["JUMP", "FORWARD", "TURN_LEFT", "JUMP", "FORWARD", "ACTIVATE"],
  },
  "world-03-level-06": {
    main: ["JUMP", "FORWARD", "ACTIVATE", "TURN_LEFT", "FORWARD", "JUMP", "ACTIVATE"],
  },
  "world-03-level-07": {
    main: ["JUMP", "FORWARD", "JUMP", "TURN_RIGHT", "FORWARD", "JUMP", "TURN_LEFT", "FORWARD", "ACTIVATE"],
  },
  "world-11-level-toggle-intro": {
    main: ["TOGGLE", "FORWARD", "FORWARD", "ACTIVATE"],
  },
  "world-11-level-toggle-stretch": {
    main: ["TOGGLE", "FORWARD", "FORWARD", "ACTIVATE", "FORWARD", "FORWARD", "ACTIVATE"],
  },
  "world-11-level-toggle-turn": {
    main: ["FORWARD", "TOGGLE", "FORWARD", "TURN_RIGHT", "FORWARD", "ACTIVATE"],
  },
  "world-11-level-toggle-chain": {
    main: ["TOGGLE", "FORWARD", "FORWARD", "ACTIVATE", "FORWARD", "TOGGLE", "FORWARD", "FORWARD", "ACTIVATE"],
  },
  "world-11-level-01": {
    main: ["TOGGLE", "CALL_P1", "CALL_P1"],
    p1: ["FORWARD", "FORWARD", "ACTIVATE"],
  },
  "world-11-level-02": {
    main: ["CALL_P1", "TOGGLE", "CALL_P2", "CALL_P1", "ACTIVATE"],
    p1: ["FORWARD"],
    p2: ["CALL_P1", "TURN_RIGHT"],
  },
  "world-11-level-03": {
    main: ["FORWARD", "TOGGLE", "CALL_P1", "ACTIVATE", "CALL_P2", "TOGGLE", "TURN_LEFT", "CALL_P1", "ACTIVATE"],
    p1: ["FORWARD", "FORWARD"],
    p2: ["TURN_LEFT", "TURN_LEFT", "CALL_P1"],
  },
  "world-11-level-04": {
    main: ["TOGGLE", "CALL_P1", "CALL_P2", "TURN_RIGHT", "CALL_P1", "TOGGLE", "TURN_RIGHT", "CALL_P1", "ACTIVATE"],
    p1: ["FORWARD", "FORWARD"],
    p2: ["JUMP", "FORWARD", "ACTIVATE"],
  },
  "world-04-level-03": {
    main: ["ACTIVATE", "CALL_P1", "CALL_P1", "CALL_P1"],
    p1: ["FORWARD", "ACTIVATE"],
  },
  "world-04-level-07": {
    main: ["CALL_P1", "TURN_RIGHT", "CALL_P1"],
    p1: ["FORWARD", "FORWARD", "ACTIVATE"],
  },
  "world-04-level-04": {
    main: ["CALL_P1", "ACTIVATE", "CALL_P2", "ACTIVATE"],
    p1: ["FORWARD", "FORWARD"],
    p2: ["TURN_LEFT", "CALL_P1"],
  },
  "world-04-level-05": {
    main: ["CALL_P2", "CALL_P2", "CALL_P1", "ACTIVATE"],
    p1: ["FORWARD", "FORWARD"],
    p2: ["CALL_P1", "ACTIVATE", "TURN_LEFT"],
  },
  "world-04-level-06": {
    main: ["CALL_P1", "CALL_P1", "CALL_P1"],
    p1: ["JUMP", "ACTIVATE", "JUMP"],
  },
  "world-05-level-02": {
    main: ["CALL_P1"],
    p1: ["ACTIVATE", "JUMP", "CALL_P1"],
  },
  "world-05-level-03": {
    main: ["CALL_P1"],
    p1: ["ACTIVATE", "CALL_P2"],
    p2: ["FORWARD", "FORWARD", "TURN_LEFT", "CALL_P1"],
  },
  "world-05-level-04": {
    main: ["CALL_P1"],
    p1: ["ACTIVATE", "CALL_P2"],
    p2: ["FORWARD", "TURN_RIGHT", "FORWARD", "CALL_P1"],
  },
  "world-05-level-05": {
    main: ["CALL_P1"],
    p1: ["ACTIVATE", "JUMP", "FORWARD", "CALL_P1"],
  },
  "world-05-level-06": {
    main: ["CALL_P1"],
    p1: ["ACTIVATE", "CALL_P2"],
    p2: ["TURN_LEFT", "JUMP", "FORWARD", "CALL_P1"],
  },
  "world-06-level-01": {
    main: ["CALL_P1"],
    p1: ["ACTIVATE", "FORWARD", "FORWARD", "TURN_RIGHT", "FORWARD", "CALL_P1"],
  },
  "world-06-level-02": {
    main: ["CALL_P1"],
    p1: ["ACTIVATE", "JUMP", "FORWARD", "TURN_LEFT", "CALL_P1"],
  },
  "world-06-level-03": {
    main: ["CALL_P1"],
    p1: ["ACTIVATE", "CALL_P2"],
    p2: ["FORWARD", "FORWARD", "TURN_LEFT", "FORWARD", "CALL_P1"],
  },
  "world-06-level-04": {
    main: ["CALL_P2", "CALL_P2", "CALL_P1", "ACTIVATE"],
    p1: ["JUMP", "FORWARD"],
    p2: ["CALL_P1", "ACTIVATE", "TURN_RIGHT"],
  },
  "world-06-level-05": {
    main: ["CALL_P1"],
    p1: ["ACTIVATE", "CALL_P2"],
    p2: ["JUMP", "FORWARD", "TURN_RIGHT", "CALL_P1"],
  },
  "world-07-level-01": {
    main: ["CALL_P1"],
    p1: ["ACTIVATE", "FORWARD", "TURN_RIGHT", "JUMP", "FORWARD", "CALL_P1"],
  },
  "world-07-level-02": {
    main: ["CALL_P1"],
    p1: ["ACTIVATE", "CALL_P2"],
    p2: ["FORWARD", "JUMP", "TURN_LEFT", "FORWARD", "CALL_P1"],
  },
  "world-07-level-03": {
    main: ["CALL_P2"],
    p1: ["TURN_LEFT", "JUMP"],
    p2: ["ACTIVATE", "FORWARD", "CALL_P1", "FORWARD", "CALL_P2"],
  },
  "world-07-level-04": {
    main: ["CALL_P2", "CALL_P2", "CALL_P1", "ACTIVATE"],
    p1: ["FORWARD", "FORWARD"],
    p2: ["CALL_P1", "ACTIVATE", "TURN_RIGHT", "JUMP"],
  },
  "world-07-level-05": {
    main: ["CALL_P1", "ACTIVATE", "CALL_P2", "ACTIVATE", "CALL_P1", "ACTIVATE"],
    p1: ["FORWARD", "TURN_LEFT", "JUMP"],
    p2: ["FORWARD", "TURN_RIGHT", "JUMP"],
  },
  "world-08-level-01": {
    main: ["CALL_P2", "CALL_P2", "CALL_P1", "ACTIVATE"],
    p1: ["FORWARD", "FORWARD"],
    p2: ["CALL_P1", "ACTIVATE", "TURN_RIGHT"],
  },
  "world-08-level-02": {
    main: ["CALL_P2", "CALL_P2", "CALL_P1", "ACTIVATE"],
    p1: ["JUMP", "FORWARD"],
    p2: ["CALL_P1", "ACTIVATE", "TURN_LEFT"],
  },
  "world-08-level-03": {
    main: ["CALL_P1"],
    p1: ["ACTIVATE", "CALL_P2"],
    p2: ["FORWARD", "TURN_RIGHT", "FORWARD", "CALL_P1"],
  },
  "world-08-level-04": {
    main: ["CALL_P1"],
    p1: ["ACTIVATE", "CALL_P2"],
    p2: ["JUMP", "TURN_RIGHT", "FORWARD", "CALL_P1"],
  },
  "world-08-level-05": {
    main: ["CALL_P1"],
    p1: ["ACTIVATE", "CALL_P2"],
    p2: ["FORWARD", "FORWARD", "TURN_LEFT", "FORWARD", "CALL_P1"],
  },
  "world-08-level-06": {
    main: ["CALL_P1"],
    p1: ["ACTIVATE", "CALL_P2"],
    p2: ["JUMP", "FORWARD", "TURN_LEFT", "FORWARD", "CALL_P1"],
  },
  "world-08-level-07": {
    main: ["CALL_P2", "CALL_P2", "ACTIVATE", "CALL_P1", "ACTIVATE"],
    p1: ["FORWARD", "FORWARD"],
    p2: ["ACTIVATE", "CALL_P1", "TURN_RIGHT", "CALL_P1"],
  },
  "world-08-level-08": {
    main: ["CALL_P2", "CALL_P2", "ACTIVATE", "CALL_P1", "ACTIVATE"],
    p1: ["JUMP", "FORWARD"],
    p2: ["ACTIVATE", "CALL_P1", "TURN_LEFT", "CALL_P1"],
  },
  "world-08-level-09": {
    main: ["CALL_P1"],
    p1: ["ACTIVATE", "JUMP", "TURN_LEFT", "FORWARD", "JUMP", "CALL_P1"],
  },
  "world-08-level-10": {
    main: ["CALL_P2"],
    p1: ["TURN_RIGHT", "JUMP"],
    p2: ["ACTIVATE", "FORWARD", "CALL_P1", "FORWARD", "CALL_P2"],
  },
  "world-09-level-01": {
    main: ["CALL_P2", "CALL_P2", "CALL_P1", "ACTIVATE"],
    p1: ["FORWARD", "FORWARD"],
    p2: ["CALL_P1", "ACTIVATE", "TURN_RIGHT"],
  },
  "world-09-level-02": {
    main: ["CALL_P1"],
    p1: ["ACTIVATE", "CALL_P2"],
    p2: ["FORWARD", "FORWARD", "TURN_LEFT", "FORWARD", "CALL_P1"],
  },
  "world-09-level-03": {
    main: ["CALL_P2", "CALL_P2", "CALL_P1", "ACTIVATE"],
    p1: ["JUMP", "FORWARD"],
    p2: ["CALL_P1", "ACTIVATE", "TURN_LEFT"],
  },
  "world-09-level-04": {
    main: ["CALL_P2", "CALL_P2", "CALL_P1", "ACTIVATE"],
    p1: ["FORWARD", "FORWARD"],
    p2: ["CALL_P1", "ACTIVATE", "TURN_RIGHT", "JUMP"],
  },
  "world-09-level-05": {
    main: ["CALL_P1"],
    p1: ["ACTIVATE", "CALL_P2"],
    p2: ["JUMP", "TURN_RIGHT", "FORWARD", "CALL_P1"],
  },
  "world-10-level-01": {
    main: ["CALL_P2", "CALL_P2", "ACTIVATE", "CALL_P1", "ACTIVATE"],
    p1: ["FORWARD", "FORWARD"],
    p2: ["ACTIVATE", "CALL_P1", "TURN_RIGHT", "CALL_P1"],
  },
  "world-10-level-02": {
    main: ["CALL_P2", "CALL_P2", "ACTIVATE", "CALL_P1", "ACTIVATE"],
    p1: ["JUMP", "FORWARD"],
    p2: ["ACTIVATE", "CALL_P1", "TURN_LEFT", "CALL_P1"],
  },
  "world-10-level-03": {
    main: ["CALL_P1"],
    p1: ["ACTIVATE", "CALL_P2"],
    p2: ["FORWARD", "TURN_RIGHT", "FORWARD", "CALL_P1"],
  },
  "world-10-level-04": {
    main: ["CALL_P1"],
    p1: ["ACTIVATE", "FORWARD", "TURN_RIGHT", "JUMP", "FORWARD", "CALL_P1"],
  },
  "world-10-level-05": {
    main: ["CALL_P2"],
    p1: ["TURN_RIGHT", "JUMP"],
    p2: ["ACTIVATE", "FORWARD", "CALL_P1", "FORWARD", "CALL_P2"],
  },
  "world-10-level-06": {
    main: ["CALL_P1"],
    p1: ["ACTIVATE", "CALL_P2"],
    p2: ["FORWARD", "FORWARD", "TURN_LEFT", "FORWARD", "CALL_P1"],
  },
  "world-10-level-07": {
    main: ["CALL_P1"],
    p1: ["ACTIVATE", "CALL_P2"],
    p2: ["JUMP", "FORWARD", "TURN_LEFT", "FORWARD", "CALL_P1"],
  },
  "world-10-level-08": {
    main: ["CALL_P2", "CALL_P2", "ACTIVATE", "CALL_P1", "ACTIVATE"],
    p1: ["FORWARD", "FORWARD"],
    p2: ["ACTIVATE", "CALL_P1", "TURN_RIGHT", "CALL_P1"],
  },
  "world-12-level-01": {
    main: ["TOGGLE", "FORWARD", "FORWARD", "ACTIVATE"],
  },
  "world-12-level-02": {
    main: ["CALL_P1", "FORWARD", "CALL_P1"],
    p1: ["TOGGLE", "FORWARD", "FORWARD", "ACTIVATE"],
  },
  "world-12-level-03": {
    main: ["TOGGLE", "CALL_P1", "ACTIVATE", "CALL_P2", "TOGGLE", "TURN_LEFT", "CALL_P1", "ACTIVATE"],
    p1: ["FORWARD", "FORWARD"],
    p2: ["TURN_LEFT", "TURN_LEFT", "CALL_P1"],
  },
  "world-12-level-04": {
    main: ["CALL_P1"],
    p1: [
      "TOGGLE",
      "CALL_P2",
      "ACTIVATE",
      "TURN_LEFT",
      "TURN_LEFT",
      "CALL_P2",
      "TOGGLE",
      "TURN_LEFT",
      "CALL_P2",
      "TURN_LEFT",
      "CALL_P1",
    ],
    p2: ["FORWARD", "FORWARD"],
  },
  "world-12-level-05": {
    main: ["TOGGLE", "CALL_P1", "CALL_P2", "TOGGLE", "TURN_LEFT", "CALL_P1"],
    p1: ["FORWARD", "JUMP", "ACTIVATE"],
    p2: ["TURN_LEFT", "TURN_LEFT", "JUMP", "FORWARD"],
  },
  "world-13-level-01": {
    main: ["CALL_P1"],
    p1: ["ACTIVATE", "FORWARD", "JUMP", "FORWARD", "TURN_RIGHT", "FORWARD", "JUMP", "TURN_LEFT", "CALL_P1"],
  },
  "world-13-level-02": {
    main: ["CALL_P1", "ACTIVATE", "CALL_P2", "TURN_LEFT", "FORWARD", "ACTIVATE", "JUMP", "TURN_RIGHT", "FORWARD", "TURN_LEFT", "JUMP", "ACTIVATE"],
    p1: ["JUMP", "FORWARD"],
    p2: ["TURN_RIGHT", "FORWARD", "JUMP"],
  },
  "world-13-level-03": {
    main: ["ACTIVATE", "CALL_P1", "CALL_P2", "FORWARD", "CALL_P2", "FORWARD", "JUMP", "ACTIVATE"],
    p1: ["JUMP", "FORWARD"],
    p2: ["TURN_RIGHT", "JUMP", "TURN_LEFT"],
  },
  "world-13-level-04": {
    main: ["CALL_P2", "CALL_P2", "CALL_P2", "CALL_P1", "ACTIVATE"],
    p1: ["ACTIVATE", "FORWARD", "FORWARD"],
    p2: ["CALL_P1", "CALL_P1", "TURN_RIGHT"],
  },
  "world-13-level-05": {
    main: [
      "CALL_P1",
      "ACTIVATE",
      "FORWARD",
      "TURN_RIGHT",
      "JUMP",
      "TURN_RIGHT",
      "CALL_P2",
      "ACTIVATE",
      "TURN_LEFT",
      "TURN_LEFT",
      "CALL_P2",
      "FORWARD",
      "FORWARD",
      "FORWARD",
      "ACTIVATE",
    ],
    p1: ["FORWARD", "JUMP", "JUMP"],
    p2: ["FORWARD", "FORWARD"],
  },
  "world-13-level-06": {
    main: [
      "CALL_P2",
      "CALL_P2",
      "CALL_P1",
      "ACTIVATE",
      "TURN_RIGHT",
      "JUMP",
      "TURN_RIGHT",
      "CALL_P2",
      "CALL_P2",
      "ACTIVATE",
      "TURN_LEFT",
      "JUMP",
      "TURN_LEFT",
      "CALL_P2",
      "CALL_P2",
      "ACTIVATE",
    ],
    p1: ["ACTIVATE", "FORWARD"],
    p2: ["CALL_P1", "CALL_P1", "CALL_P1"],
  },
  "world-13-level-07": {
    main: [
      "ACTIVATE",
      "CALL_P2",
      "CALL_P2",
      "CALL_P2",
      "FORWARD",
      "ACTIVATE",
      "CALL_P1",
      "JUMP",
      "ACTIVATE",
      "CALL_P1",
      "CALL_P1",
      "CALL_P1",
      "FORWARD",
      "ACTIVATE",
      "TURN_RIGHT",
      "JUMP",
      "ACTIVATE",
    ],
    p1: ["FORWARD", "ACTIVATE", "FORWARD", "ACTIVATE", "TURN_RIGHT"],
    p2: ["FORWARD", "ACTIVATE", "FORWARD", "ACTIVATE", "CALL_P1"],
  },
};

function getProgramLength(program: ProgramSlots) {
  return program.main.length + (program.p1?.length ?? 0) + (program.p2?.length ?? 0);
}

describe("campaign levels", () => {
  it("contains 84 handcrafted levels with unique ids", () => {
    expect(allHandcraftedLevels).toHaveLength(84);
    expect(new Set(allHandcraftedLevels.map((level) => level.id)).size).toBe(allHandcraftedLevels.length);
  });

  it("publishes a curated 64-level campaign with unique ids", () => {
    expect(campaignLevels).toHaveLength(64);
    expect(new Set(campaignLevels.map((level) => level.id)).size).toBe(campaignLevels.length);
  });

  it("validates every authored level definition", () => {
    for (const level of allHandcraftedLevels) {
      const validation = validateLevel(level);
      expect(validation.success, `${level.id}: ${validation.issues.map((issue) => issue.message).join(", ")}`).toBe(true);
    }
  });

  it("keeps published ideal sizes aligned with 3-star thresholds", () => {
    for (const level of allHandcraftedLevels) {
      if (!level.metadata?.idealSolutionLength || !level.stars) {
        continue;
      }

      expect(level.stars.three, level.id).toBe(level.metadata.idealSolutionLength);
    }
  });

  it("keeps new levels solvable at their published ideal size", () => {
    for (const [levelId, program] of Object.entries(referencePrograms)) {
      const level = allHandcraftedLevels.find((entry) => entry.id === levelId);

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
