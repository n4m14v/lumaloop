import type { LevelDefinition } from "@lumaloop/level-schema";

export function createEmptyLevel(id: string, name: string, world: string): LevelDefinition {
  return {
    id,
    name,
    world,
    board: [{ x: 0, y: 0, z: 0, kind: "NORMAL" }],
    start: { x: 0, y: 0, z: 0, facing: "N" },
    allowedCommands: ["FORWARD", "TURN_LEFT", "TURN_RIGHT", "LIGHT"],
    slotLimits: { main: 6 },
    metadata: {
      concept: "Unspecified",
      designerNotes: "Replace with a focused teaching goal.",
    },
  };
}
