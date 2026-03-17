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
    allowedCommands: ["FORWARD", "ACTIVATE", "CALL_P1"],
    slotLimits: { main: 1, p1: 3 },
    stars: { one: 5, two: 4, three: 4 },
    metadata: {
      concept: "Recursion can express a repeating pattern until the final lamp ends the run",
      designerNotes:
        "Let the recursive call be what decides whether another target still exists. The ideal size counts filled slots, not executed steps.",
      idealSolutionLength: 4,
    },
  },
  {
    id: "world-05-level-02",
    name: "Recursive Stair",
    world: "world-05-recursion",
    board: [
      { id: "goal-1", x: 0, y: 0, z: 0, kind: "TARGET" },
      { id: "goal-2", x: 1, y: 0, z: 1, kind: "TARGET" },
      { id: "goal-3", x: 2, y: 0, z: 0, kind: "TARGET" },
      { id: "goal-4", x: 3, y: 0, z: 1, kind: "TARGET" },
    ],
    start: { x: 0, y: 0, z: 0, facing: "E" },
    allowedCommands: ["JUMP", "ACTIVATE", "CALL_P1"],
    slotLimits: { main: 1, p1: 3 },
    stars: { one: 5, two: 4, three: 4 },
    metadata: {
      concept: "Recursion can express a repeated height transition just as well as a flat corridor",
      designerNotes:
        "The board ending is the stopping condition. The ideal size counts filled slots, not executed steps.",
      idealSolutionLength: 4,
    },
  },
  {
    id: "world-05-level-03",
    name: "Corner Relay",
    world: "world-05-recursion",
    board: [
      { id: "goal-1", x: 0, y: 0, z: 0, kind: "TARGET" },
      { x: 1, y: 0, z: 0, kind: "NORMAL" },
      { id: "goal-2", x: 2, y: 0, z: 0, kind: "TARGET" },
      { x: 2, y: -1, z: 0, kind: "NORMAL" },
      { id: "goal-3", x: 2, y: -2, z: 0, kind: "TARGET" },
      { x: 1, y: -2, z: 0, kind: "NORMAL" },
      { id: "goal-4", x: 0, y: -2, z: 0, kind: "TARGET" },
    ],
    start: { x: 0, y: 0, z: 0, facing: "E" },
    allowedCommands: ["FORWARD", "TURN_LEFT", "ACTIVATE", "CALL_P1", "CALL_P2"],
    slotLimits: { main: 1, p1: 2, p2: 4 },
    stars: { one: 8, two: 7, three: 7 },
    metadata: {
      concept: "Mutual recursion can alternate between lighting and repositioning",
      designerNotes:
        "Let one routine handle activation and the other handle repositioning.",
      idealSolutionLength: 7,
    },
  },
  {
    id: "world-05-level-04",
    name: "Diamond Spin",
    world: "world-05-recursion",
    board: [
      { id: "goal-1", x: 0, y: 0, z: 0, kind: "TARGET" },
      { x: 1, y: 0, z: 0, kind: "NORMAL" },
      { id: "goal-2", x: 1, y: 1, z: 0, kind: "TARGET" },
      { x: 1, y: 2, z: 0, kind: "NORMAL" },
      { id: "goal-3", x: 0, y: 2, z: 0, kind: "TARGET" },
      { x: -1, y: 2, z: 0, kind: "NORMAL" },
      { id: "goal-4", x: -1, y: 1, z: 0, kind: "TARGET" },
    ],
    start: { x: 0, y: 0, z: 0, facing: "E" },
    allowedCommands: ["FORWARD", "TURN_RIGHT", "ACTIVATE", "CALL_P1", "CALL_P2"],
    slotLimits: { main: 1, p1: 2, p2: 4 },
    stars: { one: 8, two: 7, three: 7 },
    metadata: {
      concept: "Recursive helpers can preserve a turning pattern while the board rotates around the robot",
      designerNotes:
        "Preserve the same turning rhythm each time the shape rotates around you.",
      idealSolutionLength: 7,
    },
  },
  {
    id: "world-05-level-05",
    name: "Ridge Relay",
    world: "world-05-recursion",
    board: [
      { id: "goal-1", x: 0, y: 0, z: 0, kind: "TARGET" },
      { x: 1, y: 0, z: 1, kind: "NORMAL" },
      { id: "goal-2", x: 2, y: 0, z: 1, kind: "TARGET" },
      { x: 3, y: 0, z: 0, kind: "NORMAL" },
      { id: "goal-3", x: 4, y: 0, z: 0, kind: "TARGET" },
      { x: 5, y: 0, z: 1, kind: "NORMAL" },
      { id: "goal-4", x: 6, y: 0, z: 1, kind: "TARGET" },
    ],
    start: { x: 0, y: 0, z: 0, facing: "E" },
    allowedCommands: ["JUMP", "FORWARD", "ACTIVATE", "CALL_P1"],
    slotLimits: { main: 1, p1: 4 },
    stars: { one: 7, two: 6, three: 5 },
    metadata: {
      concept: "A recursive routine can encode a longer repeating terrain rhythm",
      designerNotes:
        "The repeated unit is longer than one move. Capture the terrain rhythm instead of a single step.",
      idealSolutionLength: 5,
    },
  },
  {
    id: "world-05-level-06",
    name: "Spiral Ascent",
    world: "world-05-recursion",
    board: [
      { id: "goal-1", x: 0, y: 0, z: 0, kind: "TARGET" },
      { x: 0, y: -1, z: 1, kind: "NORMAL" },
      { id: "goal-2", x: 0, y: -2, z: 1, kind: "TARGET" },
      { x: -1, y: -2, z: 2, kind: "NORMAL" },
      { id: "goal-3", x: -2, y: -2, z: 2, kind: "TARGET" },
      { x: -2, y: -1, z: 3, kind: "NORMAL" },
      { id: "goal-4", x: -2, y: 0, z: 3, kind: "TARGET" },
    ],
    start: { x: 0, y: 0, z: 0, facing: "E" },
    allowedCommands: ["FORWARD", "TURN_LEFT", "JUMP", "ACTIVATE", "CALL_P1", "CALL_P2"],
    slotLimits: { main: 1, p1: 2, p2: 4 },
    stars: { one: 8, two: 7, three: 7 },
    metadata: {
      concept: "Mutual recursion can combine orientation and height into one repeating climb pattern",
      designerNotes:
        "Split the recurring job into 'activate here' and 'advance to the next ledge.'",
      idealSolutionLength: 7,
    },
  },
];
