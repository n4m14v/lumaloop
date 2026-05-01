import type { LevelDefinition } from "@lumaloop/engine";
import { freeLevelIds, isFreeLevel } from "@lumaloop/level-data";

import { isLevelCompleted, type LevelProgressState } from "../../screens/game-screen/levelProgressStorage";

export type LevelAccessReason =
  | "available"
  | "free_progression_locked"
  | "premium_locked"
  | "premium_progression_locked";

export interface LevelAccessState {
  isAvailable: boolean;
  isPremium: boolean;
  reason: LevelAccessReason;
}

function getPreviousFreeLevelId(levelId: string) {
  const freeIndex = freeLevelIds.findIndex((freeLevelId) => freeLevelId === levelId);
  return freeIndex > 0 ? freeLevelIds[freeIndex - 1] ?? null : null;
}

function getPreviousCampaignLevelId(levels: LevelDefinition[], levelIndex: number) {
  return levelIndex > 0 ? levels[levelIndex - 1]?.id ?? null : null;
}

export function getFirstPremiumLevelIndex(levels: LevelDefinition[]) {
  return levels.findIndex((level) => !isFreeLevel(level.id));
}

export function getLevelAccessState({
  hasFullGame,
  isAdmin,
  level,
  levelIndex,
  levels,
  progress,
}: {
  hasFullGame: boolean;
  isAdmin: boolean;
  level: LevelDefinition;
  levelIndex: number;
  levels: LevelDefinition[];
  progress: LevelProgressState;
}): LevelAccessState {
  const isPremium = !isFreeLevel(level.id);

  if (isAdmin) {
    return {
      isAvailable: true,
      isPremium,
      reason: "available",
    };
  }

  if (!isPremium && !hasFullGame) {
    const previousFreeLevelId = getPreviousFreeLevelId(level.id);
    const isUnlocked = previousFreeLevelId === null || isLevelCompleted(progress, previousFreeLevelId);

    return {
      isAvailable: isUnlocked,
      isPremium,
      reason: isUnlocked ? "available" : "free_progression_locked",
    };
  }

  if (isPremium && !hasFullGame) {
    return {
      isAvailable: false,
      isPremium,
      reason: "premium_locked",
    };
  }

  const previousCampaignLevelId = getPreviousCampaignLevelId(levels, levelIndex);
  const isUnlocked = previousCampaignLevelId === null || isLevelCompleted(progress, previousCampaignLevelId);

  return {
    isAvailable: isUnlocked,
    isPremium,
    reason: isUnlocked ? "available" : "premium_progression_locked",
  };
}

export function getLevelAccessStates({
  hasFullGame,
  isAdmin,
  levels,
  progress,
}: {
  hasFullGame: boolean;
  isAdmin: boolean;
  levels: LevelDefinition[];
  progress: LevelProgressState;
}) {
  return levels.map((level, levelIndex) =>
    getLevelAccessState({
      hasFullGame,
      isAdmin,
      level,
      levelIndex,
      levels,
      progress,
    }),
  );
}
