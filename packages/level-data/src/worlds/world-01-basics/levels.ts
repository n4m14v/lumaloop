import type { LevelDefinition } from "@lumaloop/level-schema";

export const world01Basics: LevelDefinition[] = [
  {
    id: "world-01-level-01",
    name: "Straight Line",
    world: "world-01-basics",
    board: [
      { x: 0, y: 0, z: 0, kind: "NORMAL" },
      { x: 1, y: 0, z: 0, kind: "NORMAL" },
      { id: "goal-1", x: 2, y: 0, z: 0, kind: "TARGET" },
    ],
    start: { x: 0, y: 0, z: 0, facing: "E" },
    allowedCommands: ["FORWARD", "LIGHT"],
    slotLimits: { main: 3 },
    stars: { one: 5, two: 4, three: 3 },
    metadata: {
      concept: "Sequence and execution order",
      designerNotes: "The shortest path is a straight line to the only lamp.",
      idealSolutionLength: 3,
    },
  },
  {
    id: "world-01-level-02",
    name: "Face The Lamp",
    world: "world-01-basics",
    board: [
      { x: 0, y: 0, z: 0, kind: "NORMAL" },
      { x: 0, y: 1, z: 0, kind: "NORMAL" },
      { id: "goal-1", x: 0, y: 2, z: 0, kind: "TARGET" },
    ],
    start: { x: 0, y: 0, z: 0, facing: "E" },
    allowedCommands: ["TURN_RIGHT", "FORWARD", "LIGHT"],
    slotLimits: { main: 4 },
    stars: { one: 6, two: 5, three: 4 },
    metadata: {
      concept: "Rotation changes future movement",
      designerNotes: "The obvious wrong move is walking forward before turning.",
      idealSolutionLength: 4,
    },
  },
  {
    id: "world-01-level-03",
    name: "Right Angle",
    world: "world-01-basics",
    board: [
      { x: 0, y: 0, z: 0, kind: "NORMAL" },
      { x: 1, y: 0, z: 0, kind: "NORMAL" },
      { x: 2, y: 0, z: 0, kind: "NORMAL" },
      { id: "goal-1", x: 2, y: 1, z: 0, kind: "TARGET" },
    ],
    start: { x: 0, y: 0, z: 0, facing: "E" },
    allowedCommands: ["FORWARD", "TURN_RIGHT", "LIGHT"],
    slotLimits: { main: 5 },
    stars: { one: 7, two: 6, three: 5 },
    metadata: {
      concept: "Execution order matters around a corner",
      designerNotes: "The bend teaches that turning too early or too late both fail deterministically.",
      idealSolutionLength: 5,
    },
  },
  {
    id: "world-01-level-04",
    name: "Turn Both Ways",
    world: "world-01-basics",
    board: [
      { x: 0, y: 0, z: 0, kind: "NORMAL" },
      { x: 1, y: 0, z: 0, kind: "NORMAL" },
      { x: 2, y: 0, z: 0, kind: "NORMAL" },
      { x: 2, y: -1, z: 0, kind: "NORMAL" },
      { id: "goal-1", x: 2, y: -2, z: 0, kind: "TARGET" },
    ],
    start: { x: 0, y: 0, z: 0, facing: "E" },
    allowedCommands: ["FORWARD", "TURN_LEFT", "TURN_RIGHT", "LIGHT"],
    slotLimits: { main: 6 },
    stars: { one: 8, two: 7, three: 6 },
    metadata: {
      concept: "Left and right turns are not interchangeable",
      designerNotes: "The route only works if the player turns right after moving twice, then lights the last tile.",
      idealSolutionLength: 6,
    },
  },
];
