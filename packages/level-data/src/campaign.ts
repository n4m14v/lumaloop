import type { LevelDefinition } from "@lumaloop/level-schema";

import { world01Basics } from "./worlds/world-01-basics/levels";
import { world03Height } from "./worlds/world-03-height/levels";
import { world04Procedures } from "./worlds/world-04-procedures/levels";
import { world05Recursion } from "./worlds/world-05-recursion/levels";
import { world06Hard } from "./worlds/world-06-hard/levels";
import { world07VeryHard } from "./worlds/world-07-very-hard/levels";
import { world08Mastery } from "./worlds/world-08-mastery/levels";
import { world09Trickery } from "./worlds/world-09-trickery/levels";
import { world10Phantoms } from "./worlds/world-10-phantoms/levels";
import { world11Switches } from "./worlds/world-11-switches/levels";
import { world12Switchbacks } from "./worlds/world-12-switchbacks/levels";
import { world13Landscapes } from "./worlds/world-13-landscapes/levels";

function pickLevels(levels: LevelDefinition[], ids: string[]) {
  const byId = new Map(levels.map((level) => [level.id, level]));

  return ids.map((id) => {
    const level = byId.get(id);

    if (!level) {
      throw new Error(`Unknown campaign level id: ${id}`);
    }

    return level;
  });
}

export const allHandcraftedLevels: LevelDefinition[] = [
  ...world01Basics,
  ...world03Height,
  ...world04Procedures,
  ...world11Switches,
  ...world05Recursion,
  ...world06Hard,
  ...world07VeryHard,
  ...world08Mastery,
  ...world09Trickery,
  ...world10Phantoms,
  ...world12Switchbacks,
  ...world13Landscapes,
];

const curatedHardLevels = pickLevels(world06Hard, [
  "world-06-level-01",
  "world-06-level-02",
  "world-06-level-04",
]);

const curatedVeryHardLevels = pickLevels(world07VeryHard, [
  "world-07-level-03",
  "world-07-level-05",
]);

const curatedMasteryLevels = pickLevels(world08Mastery, [
  "world-08-level-01",
  "world-08-level-04",
  "world-08-level-07",
  "world-08-level-09",
]);

const curatedMisdirectionLevels = pickLevels(world09Trickery, [
  "world-09-level-01",
  "world-09-level-03",
]);

const curatedFalsePathLevels = pickLevels(world10Phantoms, [
  "world-10-level-03",
  "world-10-level-05",
]);

export const campaignLevels: LevelDefinition[] = [
  ...world01Basics,
  ...world03Height,
  ...world04Procedures,
  ...world11Switches,
  ...world05Recursion,
  ...curatedHardLevels,
  ...curatedVeryHardLevels,
  ...curatedMasteryLevels,
  ...curatedMisdirectionLevels,
  ...curatedFalsePathLevels,
  ...world12Switchbacks,
  ...world13Landscapes,
];
