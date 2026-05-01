import { describe, expect, it } from "vitest";

import { campaignLevels, freeLevelIds, isFreeLevel } from "@lumaloop/level-data";

import { createEmptyLevelProgressState, recordLevelCompletion } from "../../screens/game-screen/levelProgressStorage";
import { getFirstPremiumLevelIndex, getLevelAccessState } from "./access";

describe("campaign monetization access", () => {
  it("keeps the explicit free preview list in campaign order", () => {
    expect(freeLevelIds).toEqual([
      "world-01-level-01",
      "world-01-level-02",
      "world-01-level-03",
      "world-01-level-04",
      "world-01-level-05",
      "world-01-level-06",
      "world-01-level-07",
      "world-01-level-08",
      "world-01-level-09",
      "world-01-level-10",
      "world-01-level-11",
    ]);
  });

  it("marks the first height level as the first premium level", () => {
    const firstPremiumLevelIndex = getFirstPremiumLevelIndex(campaignLevels);
    expect(campaignLevels[firstPremiumLevelIndex]?.id).toBe("world-03-level-01");
  });

  it("locks free preview levels sequentially for free users", () => {
    const progress = createEmptyLevelProgressState();
    const firstLevel = campaignLevels.find((level) => level.id === freeLevelIds[0])!;
    const secondLevelIndex = campaignLevels.findIndex((level) => level.id === freeLevelIds[1]);
    const secondLevel = campaignLevels[secondLevelIndex]!;

    expect(getLevelAccessState({
      hasFullGame: false,
      isAdmin: false,
      level: firstLevel,
      levelIndex: 0,
      levels: campaignLevels,
      progress,
    }).reason).toBe("available");

    expect(getLevelAccessState({
      hasFullGame: false,
      isAdmin: false,
      level: secondLevel,
      levelIndex: secondLevelIndex,
      levels: campaignLevels,
      progress,
    }).reason).toBe("free_progression_locked");
  });

  it("makes non-preview levels premium for free users", () => {
    const progress = createEmptyLevelProgressState();
    const premiumLevelIndex = campaignLevels.findIndex((level) => !isFreeLevel(level.id));
    const premiumLevel = campaignLevels[premiumLevelIndex]!;

    expect(getLevelAccessState({
      hasFullGame: false,
      isAdmin: false,
      level: premiumLevel,
      levelIndex: premiumLevelIndex,
      levels: campaignLevels,
      progress,
    }).reason).toBe("premium_locked");
  });

  it("uses full campaign progression for paid users", () => {
    const progress = recordLevelCompletion(createEmptyLevelProgressState(), {
      levelId: "world-01-level-11",
      programLength: 1,
      starsEarned: 1,
    });
    const premiumLevelIndex = campaignLevels.findIndex((level) => level.id === "world-03-level-01");
    const premiumLevel = campaignLevels[premiumLevelIndex]!;

    expect(getLevelAccessState({
      hasFullGame: true,
      isAdmin: false,
      level: premiumLevel,
      levelIndex: premiumLevelIndex,
      levels: campaignLevels,
      progress,
    }).reason).toBe("available");
  });
});
