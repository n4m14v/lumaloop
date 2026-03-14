import type { LevelDefinition } from "@lumaloop/level-schema";

export function exportLevel(level: LevelDefinition): string {
  return JSON.stringify(level, null, 2);
}
