import type { LevelDefinition } from "../schema";

export const basicLevelExample: LevelDefinition = {
  id: "world-01-level-01",
  name: "First Light",
  world: "world-01-basics",
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
  allowedCommands: ["FORWARD", "LIGHT"],
  slotLimits: {
    main: 3,
  },
  stars: {
    one: 5,
    two: 4,
    three: 3,
  },
  metadata: {
    concept: "Sequence and execution order",
    designerNotes: "The shortest path is a straight line to a single target.",
    idealSolutionLength: 3,
  },
};
