import type { LevelDefinition } from "@lumaloop/level-schema";

export const world02Orientation: LevelDefinition[] = [
  {
    id: "world-02-level-01",
    name: "Cross Check",
    world: "world-02-orientation",
    board: [
      { x: 0, y: 0, z: 0, kind: "NORMAL" },
      { x: 1, y: 0, z: 0, kind: "NORMAL" },
      { id: "goal-1", x: 2, y: 0, z: 0, kind: "TARGET" },
      { x: 1, y: 1, z: 0, kind: "NORMAL" },
      { x: 2, y: 1, z: 0, kind: "NORMAL" },
      { x: 3, y: 1, z: 0, kind: "NORMAL" },
      { id: "goal-2", x: 4, y: 1, z: 0, kind: "TARGET" },
    ],
    start: { x: 0, y: 0, z: 0, facing: "E" },
    allowedCommands: ["FORWARD", "TURN_LEFT", "TURN_RIGHT", "ACTIVATE"],
    slotLimits: { main: 9 },
    stars: { one: 11, two: 10, three: 9 },
    metadata: {
      concept: "Plan the whole route before the first success",
      designerNotes: "The early branch looks tempting, but the clean solution lights the first target before committing to the turn.",
      idealSolutionLength: 9,
    },
  },
];
