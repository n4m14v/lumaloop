import type { LevelDefinition } from "@lumaloop/level-schema";

export const world03Height: LevelDefinition[] = [
  {
    id: "world-03-level-01",
    name: "First Step Up",
    world: "world-03-height",
    board: [
      { x: 0, y: 0, z: 0, kind: "NORMAL" },
      { x: 1, y: 0, z: 1, kind: "NORMAL" },
      { id: "goal-1", x: 2, y: 0, z: 1, kind: "TARGET" },
    ],
    start: { x: 0, y: 0, z: 0, facing: "E" },
    allowedCommands: ["JUMP", "FORWARD", "LIGHT"],
    slotLimits: { main: 3 },
    stars: { one: 5, two: 4, three: 3 },
    metadata: {
      concept: "Jump is required to climb one level",
      designerNotes: "FORWARD looks correct but fails because of the height mismatch.",
      idealSolutionLength: 3,
    },
  },
  {
    id: "world-03-level-02",
    name: "Step Down",
    world: "world-03-height",
    board: [
      { x: 0, y: 0, z: 1, kind: "NORMAL" },
      { x: 1, y: 0, z: 0, kind: "NORMAL" },
      { id: "goal-1", x: 2, y: 0, z: 0, kind: "TARGET" },
    ],
    start: { x: 0, y: 0, z: 1, facing: "E" },
    allowedCommands: ["JUMP", "FORWARD", "LIGHT"],
    slotLimits: { main: 3 },
    stars: { one: 5, two: 4, three: 3 },
    metadata: {
      concept: "Jump also handles descending moves",
      designerNotes: "The level isolates the asymmetry between FORWARD and JUMP.",
      idealSolutionLength: 3,
    },
  },
  {
    id: "world-03-level-03",
    name: "Plateau Bend",
    world: "world-03-height",
    board: [
      { x: 0, y: 0, z: 0, kind: "NORMAL" },
      { x: 1, y: 0, z: 1, kind: "NORMAL" },
      { x: 2, y: 0, z: 1, kind: "NORMAL" },
      { x: 2, y: 1, z: 1, kind: "NORMAL" },
      { id: "goal-1", x: 2, y: 2, z: 1, kind: "TARGET" },
    ],
    start: { x: 0, y: 0, z: 0, facing: "E" },
    allowedCommands: ["JUMP", "FORWARD", "TURN_RIGHT", "LIGHT"],
    slotLimits: { main: 6 },
    stars: { one: 8, two: 7, three: 6 },
    metadata: {
      concept: "Combine jump legality with orientation",
      designerNotes: "Only the first move uses JUMP; the rest use same-height motion.",
      idealSolutionLength: 6,
    },
  },
  {
    id: "world-03-level-04",
    name: "Up Then Down",
    world: "world-03-height",
    board: [
      { x: 0, y: 0, z: 0, kind: "NORMAL" },
      { x: 1, y: 0, z: 1, kind: "NORMAL" },
      { x: 2, y: 0, z: 1, kind: "NORMAL" },
      { x: 3, y: 0, z: 0, kind: "NORMAL" },
      { id: "goal-1", x: 4, y: 0, z: 0, kind: "TARGET" },
    ],
    start: { x: 0, y: 0, z: 0, facing: "E" },
    allowedCommands: ["JUMP", "FORWARD", "LIGHT"],
    slotLimits: { main: 5 },
    stars: { one: 7, two: 6, three: 5 },
    metadata: {
      concept: "Height transitions can happen more than once in one path",
      designerNotes: "The player must notice that both the ascent and descent need JUMP.",
      idealSolutionLength: 5,
    },
  },
];
