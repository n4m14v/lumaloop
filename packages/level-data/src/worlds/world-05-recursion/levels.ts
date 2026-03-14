import type { LevelDefinition } from "@lumaloop/level-schema";

export const world05Recursion: LevelDefinition[] = [
  {
    id: "world-05-level-01",
    name: "Recursive Lamps",
    world: "world-05-recursion",
    board: [
      { id: "goal-1", x: 0, y: 0, z: 0, kind: "TARGET" },
      { id: "goal-2", x: 1, y: 0, z: 0, kind: "TARGET" },
      { id: "goal-3", x: 2, y: 0, z: 0, kind: "TARGET" },
      { id: "goal-4", x: 3, y: 0, z: 0, kind: "TARGET" },
    ],
    start: { x: 0, y: 0, z: 0, facing: "E" },
    allowedCommands: ["FORWARD", "LIGHT", "CALL_P1"],
    slotLimits: { main: 1, p1: 3 },
    stars: { one: 5, two: 4, three: 4 },
    metadata: {
      concept: "Recursion can express a repeating pattern until the final lamp ends the run",
      designerNotes: "Use MAIN: P1 and P1: LIGHT, FORWARD, P1. The run succeeds as soon as the last target is lit.",
      idealSolutionLength: 4,
    },
  },
];
