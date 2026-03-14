import { validateLevel } from "@lumaloop/engine";
import type { LevelDefinition } from "@lumaloop/level-schema";

export function runValidation(level: LevelDefinition) {
  return validateLevel(level);
}
