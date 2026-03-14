import type { LevelDefinition } from "@lumaloop/level-schema";

export const world04Procedures: LevelDefinition[] = [
  {
    id: "world-04-level-01",
    name: "Twin March",
    world: "world-04-procedures",
    board: [
      { x: 0, y: 0, z: 0, kind: "NORMAL" },
      { x: 1, y: 0, z: 0, kind: "NORMAL" },
      { x: 2, y: 0, z: 0, kind: "NORMAL" },
      { x: 3, y: 0, z: 0, kind: "NORMAL" },
      { id: "goal-1", x: 4, y: 0, z: 0, kind: "TARGET" },
    ],
    start: { x: 0, y: 0, z: 0, facing: "E" },
    allowedCommands: ["FORWARD", "LIGHT", "CALL_P1"],
    slotLimits: { main: 3, p1: 2 },
    stars: { one: 7, two: 6, three: 5 },
    metadata: {
      concept: "Use a procedure instead of repeating the same walk block",
      designerNotes: "The optimal path is MAIN: P1, P1, LIGHT and P1: FORWARD, FORWARD.",
      idealSolutionLength: 5,
    },
  },
  {
    id: "world-04-level-02",
    name: "Nested Corner",
    world: "world-04-procedures",
    board: [
      { x: 0, y: 0, z: 0, kind: "NORMAL" },
      { x: 1, y: 0, z: 0, kind: "NORMAL" },
      { x: 2, y: 0, z: 0, kind: "NORMAL" },
      { id: "goal-1", x: 2, y: 1, z: 0, kind: "TARGET" },
    ],
    start: { x: 0, y: 0, z: 0, facing: "E" },
    allowedCommands: ["FORWARD", "TURN_RIGHT", "LIGHT", "CALL_P1", "CALL_P2"],
    slotLimits: { main: 3, p1: 2, p2: 2 },
    stars: { one: 8, two: 7, three: 6 },
    metadata: {
      concept: "Functions can call other functions to compress a route",
      designerNotes: "One compact solution is MAIN: P1, P2, LIGHT with P1: FORWARD, FORWARD and P2: TURN_RIGHT, FORWARD.",
      idealSolutionLength: 7,
    },
  },
];
