export type LevelStarProgress = Record<string, 0 | 1 | 2 | 3>;

const LEVEL_STAR_PROGRESS_STORAGE_KEY = "lumaloop-level-stars-v1";
const LEGACY_LEVEL_ID_MIGRATIONS: Record<string, string> = {
  "world-02-level-01": "world-01-level-05",
};

export function readLevelStarProgress(): LevelStarProgress {
  if (typeof window === "undefined") {
    return {};
  }

  const rawValue = window.localStorage.getItem(LEVEL_STAR_PROGRESS_STORAGE_KEY);

  if (!rawValue) {
    return {};
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Record<string, unknown>;
    const normalizedProgress: LevelStarProgress = {};

    for (const [levelId, value] of Object.entries(parsedValue)) {
      if (typeof value !== "number" || value < 0 || value > 3) {
        continue;
      }

      const nextLevelId = LEGACY_LEVEL_ID_MIGRATIONS[levelId] ?? levelId;
      const existingValue = normalizedProgress[nextLevelId] ?? 0;
      normalizedProgress[nextLevelId] = Math.max(existingValue, value) as 0 | 1 | 2 | 3;
    }

    return normalizedProgress;
  } catch {
    return {};
  }
}

export function writeLevelStarProgress(progressByLevelId: LevelStarProgress) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LEVEL_STAR_PROGRESS_STORAGE_KEY, JSON.stringify(progressByLevelId));
}
