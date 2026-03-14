import { describe, expect, it } from "vitest";

import type { LevelDefinition } from "@lumaloop/level-schema";

import { runProgram, validateLevel } from "../src/index";

const baseLevel: LevelDefinition = {
  id: "test-level",
  name: "Test Level",
  world: "world-01",
  board: [
    { x: 0, y: 0, z: 0, kind: "NORMAL" },
    { x: 1, y: 0, z: 0, kind: "NORMAL" },
    { id: "goal-1", x: 2, y: 0, z: 0, kind: "TARGET" },
  ],
  start: {
    x: 0,
    y: 0,
    z: 0,
    facing: "E",
  },
  allowedCommands: ["FORWARD", "TURN_LEFT", "TURN_RIGHT", "JUMP", "LIGHT", "CALL_P1", "CALL_P2"],
  slotLimits: {
    main: 8,
    p1: 4,
    p2: 4,
  },
  stars: {
    one: 6,
    two: 4,
    three: 3,
  },
  metadata: {
    concept: "Regression coverage",
  },
};

describe("validateLevel", () => {
  it("rejects duplicated board coordinates", () => {
    const result = validateLevel({
      ...baseLevel,
      board: [...baseLevel.board, { x: 0, y: 0, z: 1, kind: "NORMAL" }],
    });

    expect(result.success).toBe(false);
    expect(result.issues[0]?.message).toContain("coordinates");
  });
});

describe("runProgram", () => {
  it("succeeds on a valid straight-line solution", () => {
    const result = runProgram({
      level: baseLevel,
      program: {
        main: ["FORWARD", "FORWARD", "LIGHT"],
      },
    });

    expect(result.status).toBe("SUCCESS");
    expect(result.stepCount).toBe(3);
    expect(result.activatedTargetIds).toEqual(["goal-1"]);
    expect(result.score.starsEarned).toBe(3);
  });

  it("fails invalid forward moves across a height change", () => {
    const result = runProgram({
      level: {
        ...baseLevel,
        board: [
          { x: 0, y: 0, z: 0, kind: "NORMAL" },
          { id: "goal-1", x: 1, y: 0, z: 1, kind: "TARGET" },
        ],
      },
      program: {
        main: ["FORWARD"],
      },
    });

    expect(result.status).toBe("FAILED_INVALID_MOVE");
  });

  it("allows jumping up one level and lighting the target", () => {
    const result = runProgram({
      level: {
        ...baseLevel,
        board: [
          { x: 0, y: 0, z: 0, kind: "NORMAL" },
          { id: "goal-1", x: 1, y: 0, z: 1, kind: "TARGET" },
        ],
      },
      program: {
        main: ["JUMP", "LIGHT"],
      },
    });

    expect(result.status).toBe("SUCCESS");
  });

  it("fails when LIGHT is used on a non-target tile", () => {
    const result = runProgram({
      level: baseLevel,
      program: {
        main: ["LIGHT"],
      },
    });

    expect(result.status).toBe("FAILED_WRONG_LIGHT");
  });

  it("fails when the program finishes with unlit targets", () => {
    const result = runProgram({
      level: baseLevel,
      program: {
        main: ["FORWARD", "FORWARD"],
      },
    });

    expect(result.status).toBe("FAILED_INCOMPLETE");
  });

  it("supports procedure calls without duplicating movement logic", () => {
    const result = runProgram({
      level: baseLevel,
      program: {
        main: ["CALL_P1", "LIGHT"],
        p1: ["FORWARD", "FORWARD"],
      },
    });

    expect(result.status).toBe("SUCCESS");
    expect(result.trace.map((frame) => frame.command)).toEqual([
      "CALL_P1",
      "FORWARD",
      "FORWARD",
      "LIGHT",
    ]);
  });

  it("succeeds immediately when the final target is lit during recursion", () => {
    const result = runProgram({
      level: {
        ...baseLevel,
        board: [
          { id: "goal-1", x: 0, y: 0, z: 0, kind: "TARGET" },
          { id: "goal-2", x: 1, y: 0, z: 0, kind: "TARGET" },
          { id: "goal-3", x: 2, y: 0, z: 0, kind: "TARGET" },
        ],
        start: {
          x: 0,
          y: 0,
          z: 0,
          facing: "E",
        },
        allowedCommands: ["FORWARD", "LIGHT", "CALL_P1"],
        slotLimits: {
          main: 1,
          p1: 3,
        },
      },
      program: {
        main: ["CALL_P1"],
        p1: ["LIGHT", "FORWARD", "CALL_P1"],
      },
    });

    expect(result.status).toBe("SUCCESS");
    expect(result.activatedTargetIds).toEqual(["goal-1", "goal-2", "goal-3"]);
  });

  it("fails on empty procedures when called", () => {
    const result = runProgram({
      level: baseLevel,
      program: {
        main: ["CALL_P1"],
        p1: [],
      },
    });

    expect(result.status).toBe("FAILED_EMPTY_PROCEDURE");
  });

  it("fails when max steps are exceeded", () => {
    const result = runProgram({
      level: baseLevel,
      program: {
        main: ["TURN_LEFT", "TURN_RIGHT", "TURN_LEFT"],
      },
      options: {
        maxSteps: 2,
      },
    });

    expect(result.status).toBe("FAILED_MAX_STEPS");
  });

  it("fails when recursion exceeds the configured call depth", () => {
    const result = runProgram({
      level: baseLevel,
      program: {
        main: ["CALL_P1"],
        p1: ["CALL_P1"],
      },
      options: {
        maxCallDepth: 2,
      },
    });

    expect(result.status).toBe("FAILED_RECURSION");
  });

  it("fails invalid programs that use commands outside the palette", () => {
    const result = runProgram({
      level: {
        ...baseLevel,
        allowedCommands: ["FORWARD", "LIGHT"],
        slotLimits: {
          main: 3,
        },
      },
      program: {
        main: ["TURN_LEFT"],
      },
    });

    expect(result.status).toBe("FAILED_INVALID_PROGRAM");
  });

  it("solves the false-branch route in seven commands", () => {
    const result = runProgram({
      level: {
        ...baseLevel,
        board: [
          { x: 0, y: 0, z: 0, kind: "NORMAL" },
          { x: 1, y: 0, z: 0, kind: "NORMAL" },
          { x: 2, y: 0, z: 0, kind: "NORMAL" },
          { x: 1, y: 1, z: 0, kind: "NORMAL" },
          { x: 2, y: -1, z: 0, kind: "NORMAL" },
          { id: "goal-1", x: 3, y: -1, z: 0, kind: "TARGET" },
        ],
        allowedCommands: ["FORWARD", "TURN_LEFT", "TURN_RIGHT", "LIGHT"],
        slotLimits: {
          main: 7,
        },
      },
      program: {
        main: ["FORWARD", "FORWARD", "TURN_LEFT", "FORWARD", "TURN_RIGHT", "FORWARD", "LIGHT"],
      },
    });

    expect(result.status).toBe("SUCCESS");
    expect(result.stepCount).toBe(7);
    expect(result.activatedTargetIds).toEqual(["goal-1"]);
  });
});
