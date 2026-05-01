import { describe, expect, it } from "vitest";

import type { SavedProgramRecord } from "./cloudSync";
import { createEmptyLevelProgressState, recordLevelCompletion } from "../../screens/game-screen/levelProgressStorage";
import {
  cloudProgressRowsToState,
  mergeCloudProgress,
  pickLatestProgramRecord,
  progressStateToCloudRows,
} from "./cloudSync";

describe("cloud sync merge helpers", () => {
  it("converts cloud progress rows into local progress state", () => {
    expect(cloudProgressRowsToState([{
      best_program_size: 7,
      best_stars: 2,
      completed: true,
      level_id: "world-01-level-01",
    }]).levels["world-01-level-01"]).toEqual({
      bestProgramSize: 7,
      bestStars: 2,
      completed: true,
      perfected: false,
    });
  });

  it("merges cloud and local progress with completed, max stars, and lower positive program size winning", () => {
    const localProgress = recordLevelCompletion(createEmptyLevelProgressState(), {
      levelId: "world-01-level-01",
      programLength: 9,
      starsEarned: 3,
    });

    const mergedProgress = mergeCloudProgress(localProgress, [{
      best_program_size: 6,
      best_stars: 2,
      completed: true,
      level_id: "world-01-level-01",
    }]);

    expect(mergedProgress.levels["world-01-level-01"]).toEqual({
      bestProgramSize: 6,
      bestStars: 3,
      completed: true,
      perfected: true,
    });
  });

  it("serializes merged progress rows for Supabase upsert", () => {
    const progress = recordLevelCompletion(createEmptyLevelProgressState(), {
      levelId: "world-01-level-01",
      programLength: 4,
      starsEarned: 2,
    });

    expect(progressStateToCloudRows(progress, "user_123")[0]).toMatchObject({
      best_program_size: 4,
      best_stars: 2,
      completed: true,
      level_id: "world-01-level-01",
      user_id: "user_123",
    });
  });

  it("picks the latest saved program by updated timestamp", () => {
    const older: SavedProgramRecord = {
      levelId: "world-01-level-01",
      updatedAt: 100,
      value: { main: ["FORWARD"], p1: [], p2: [] },
    };
    const newer: SavedProgramRecord = {
      levelId: "world-01-level-01",
      updatedAt: 200,
      value: { main: ["TURN_LEFT"], p1: [], p2: [] },
    };

    expect(pickLatestProgramRecord(older, newer)).toBe(newer);
    expect(pickLatestProgramRecord(newer, older)).toBe(newer);
  });
});
