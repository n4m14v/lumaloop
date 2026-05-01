export interface LevelProgressEntry {
  bestProgramSize?: number;
  bestStars: 0 | 1 | 2 | 3;
  completed: boolean;
  perfected: boolean;
}

export type LevelProgress = Record<string, LevelProgressEntry>;

export interface LevelProgressState {
  levels: LevelProgress;
  version: 2;
}

const LEVEL_PROGRESS_STORAGE_KEY = "lumaloop-level-progress-v2";
const LEGACY_LEVEL_STAR_PROGRESS_STORAGE_KEY = "lumaloop-level-stars-v1";
const LEGACY_LEVEL_BEST_SIZE_PROGRESS_STORAGE_KEY = "lumaloop-level-best-sizes-v1";
const LEGACY_LEVEL_ID_MIGRATIONS: Record<string, string> = {
  "world-02-level-01": "world-01-level-05",
};

function createEmptyEntry(): LevelProgressEntry {
  return {
    bestStars: 0,
    completed: false,
    perfected: false,
  };
}

export function createEmptyLevelProgressState(): LevelProgressState {
  return {
    levels: {},
    version: 2,
  };
}

function normalizeLevelId(levelId: string) {
  return LEGACY_LEVEL_ID_MIGRATIONS[levelId] ?? levelId;
}

function normalizeBestStars(value: unknown): 0 | 1 | 2 | 3 {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return 0;
  }

  if (value <= 0) {
    return 0;
  }

  if (value >= 3) {
    return 3;
  }

  return value as 1 | 2;
}

function normalizeBestProgramSize(value: unknown) {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    return undefined;
  }

  return value;
}

function mergeEntries(
  currentEntry: LevelProgressEntry | undefined,
  nextEntry: Partial<LevelProgressEntry>,
): LevelProgressEntry {
  const baseEntry = currentEntry ?? createEmptyEntry();
  const nextStars = Math.max(baseEntry.bestStars, nextEntry.bestStars ?? 0) as 0 | 1 | 2 | 3;
  const nextBestProgramSize =
    nextEntry.bestProgramSize === undefined
      ? baseEntry.bestProgramSize
      : baseEntry.bestProgramSize === undefined
        ? nextEntry.bestProgramSize
        : Math.min(baseEntry.bestProgramSize, nextEntry.bestProgramSize);
  const completed = baseEntry.completed || Boolean(nextEntry.completed) || nextStars > 0;
  const perfected = baseEntry.perfected || Boolean(nextEntry.perfected) || nextStars === 3;

  return {
    ...(nextBestProgramSize !== undefined ? { bestProgramSize: nextBestProgramSize } : {}),
    bestStars: nextStars,
    completed,
    perfected,
  };
}

export function mergeLevelProgressStates(
  currentProgress: LevelProgressState,
  nextProgress: LevelProgressState,
): LevelProgressState {
  let didChange = false;
  const mergedLevels: LevelProgress = { ...currentProgress.levels };

  for (const [levelId, nextEntry] of Object.entries(nextProgress.levels)) {
    const normalizedLevelId = normalizeLevelId(levelId);
    const currentEntry = mergedLevels[normalizedLevelId];
    const mergedEntry = mergeEntries(currentEntry, nextEntry);

    if (
      !currentEntry ||
      currentEntry.bestStars !== mergedEntry.bestStars ||
      currentEntry.bestProgramSize !== mergedEntry.bestProgramSize ||
      currentEntry.completed !== mergedEntry.completed ||
      currentEntry.perfected !== mergedEntry.perfected
    ) {
      didChange = true;
      mergedLevels[normalizedLevelId] = mergedEntry;
    }
  }

  if (!didChange) {
    return currentProgress;
  }

  return {
    levels: mergedLevels,
    version: 2,
  };
}

function normalizeParsedProgress(rawLevels: Record<string, unknown>): LevelProgressState {
  const normalizedLevels: LevelProgress = {};

  for (const [rawLevelId, rawEntry] of Object.entries(rawLevels)) {
    const levelId = normalizeLevelId(rawLevelId);

    if (!rawEntry || typeof rawEntry !== "object") {
      continue;
    }

    const entry = rawEntry as Record<string, unknown>;
    const normalizedBestProgramSize = normalizeBestProgramSize(entry.bestProgramSize);
    normalizedLevels[levelId] = mergeEntries(normalizedLevels[levelId], {
      ...(normalizedBestProgramSize !== undefined ? { bestProgramSize: normalizedBestProgramSize } : {}),
      bestStars: normalizeBestStars(entry.bestStars),
      completed: entry.completed === true,
      perfected: entry.perfected === true,
    });
  }

  return {
    levels: normalizedLevels,
    version: 2,
  };
}

function readLegacyLevelStarProgress(): Record<string, 0 | 1 | 2 | 3> {
  const rawValue = window.localStorage.getItem(LEGACY_LEVEL_STAR_PROGRESS_STORAGE_KEY);

  if (!rawValue) {
    return {};
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Record<string, unknown>;
    const normalizedProgress: Record<string, 0 | 1 | 2 | 3> = {};

    for (const [levelId, value] of Object.entries(parsedValue)) {
      const nextLevelId = normalizeLevelId(levelId);
      const existingValue = normalizedProgress[nextLevelId] ?? 0;
      normalizedProgress[nextLevelId] = Math.max(existingValue, normalizeBestStars(value)) as 0 | 1 | 2 | 3;
    }

    return normalizedProgress;
  } catch {
    return {};
  }
}

function readLegacyLevelBestSizeProgress(): Record<string, number> {
  const rawValue = window.localStorage.getItem(LEGACY_LEVEL_BEST_SIZE_PROGRESS_STORAGE_KEY);

  if (!rawValue) {
    return {};
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Record<string, unknown>;
    const normalizedProgress: Record<string, number> = {};

    for (const [levelId, value] of Object.entries(parsedValue)) {
      const normalizedValue = normalizeBestProgramSize(value);

      if (normalizedValue === undefined) {
        continue;
      }

      const nextLevelId = normalizeLevelId(levelId);
      const existingValue = normalizedProgress[nextLevelId];
      normalizedProgress[nextLevelId] =
        existingValue === undefined ? normalizedValue : Math.min(existingValue, normalizedValue);
    }

    return normalizedProgress;
  } catch {
    return {};
  }
}

function migrateLegacyProgress(): LevelProgressState {
  const legacyStars = readLegacyLevelStarProgress();
  const legacyBestSizes = readLegacyLevelBestSizeProgress();
  const allLevelIds = new Set([
    ...Object.keys(legacyStars),
    ...Object.keys(legacyBestSizes),
  ]);
  const migratedLevels: LevelProgress = {};

  for (const levelId of allLevelIds) {
    const bestStars = legacyStars[levelId] ?? 0;
    const bestProgramSize = legacyBestSizes[levelId];

    migratedLevels[levelId] = {
      ...(bestProgramSize !== undefined ? { bestProgramSize } : {}),
      bestStars,
      completed: bestStars > 0,
      perfected: bestStars === 3,
    };
  }

  const migratedState = {
    levels: migratedLevels,
    version: 2 as const,
  };

  writeLevelProgress(migratedState);
  window.localStorage.removeItem(LEGACY_LEVEL_STAR_PROGRESS_STORAGE_KEY);
  window.localStorage.removeItem(LEGACY_LEVEL_BEST_SIZE_PROGRESS_STORAGE_KEY);
  return migratedState;
}

export function readLevelProgress(): LevelProgressState {
  if (typeof window === "undefined") {
    return createEmptyLevelProgressState();
  }

  const rawValue = window.localStorage.getItem(LEVEL_PROGRESS_STORAGE_KEY);

  if (!rawValue) {
    return migrateLegacyProgress();
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Record<string, unknown>;

    if (!parsedValue.levels || typeof parsedValue.levels !== "object") {
      return migrateLegacyProgress();
    }

    const normalizedProgress = normalizeParsedProgress(parsedValue.levels as Record<string, unknown>);
    writeLevelProgress(normalizedProgress);
    return normalizedProgress;
  } catch {
    return migrateLegacyProgress();
  }
}

export function writeLevelProgress(progressState: LevelProgressState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LEVEL_PROGRESS_STORAGE_KEY, JSON.stringify(progressState));
}

export function recordLevelCompletion(
  progressState: LevelProgressState,
  {
    levelId,
    programLength,
    starsEarned,
  }: {
    levelId: string;
    programLength: number;
    starsEarned: 0 | 1 | 2 | 3;
  },
): LevelProgressState {
  const normalizedLevelId = normalizeLevelId(levelId);
  const currentEntry = progressState.levels[normalizedLevelId];
  const nextEntry = mergeEntries(currentEntry, {
    bestProgramSize: programLength,
    bestStars: starsEarned,
    completed: true,
    perfected: starsEarned === 3,
  });

  if (
    currentEntry &&
    currentEntry.bestStars === nextEntry.bestStars &&
    currentEntry.bestProgramSize === nextEntry.bestProgramSize &&
    currentEntry.completed === nextEntry.completed &&
    currentEntry.perfected === nextEntry.perfected
  ) {
    return progressState;
  }

  return {
    ...progressState,
    levels: {
      ...progressState.levels,
      [normalizedLevelId]: nextEntry,
    },
  };
}

export function getLevelProgressEntry(progressState: LevelProgressState, levelId: string) {
  return progressState.levels[normalizeLevelId(levelId)] ?? createEmptyEntry();
}

export function getLevelStars(progressState: LevelProgressState, levelId: string) {
  return getLevelProgressEntry(progressState, levelId).bestStars;
}

export function getLevelBestProgramSize(progressState: LevelProgressState, levelId: string) {
  return getLevelProgressEntry(progressState, levelId).bestProgramSize;
}

export function isLevelCompleted(progressState: LevelProgressState, levelId: string) {
  return getLevelProgressEntry(progressState, levelId).completed;
}

export function isLevelPerfected(progressState: LevelProgressState, levelId: string) {
  return getLevelProgressEntry(progressState, levelId).perfected;
}

export function getWorldProgressSummary(progressState: LevelProgressState, levelIds: string[]) {
  let completedCount = 0;
  let perfectedCount = 0;
  let totalStars = 0;

  for (const levelId of levelIds) {
    const entry = getLevelProgressEntry(progressState, levelId);
    totalStars += entry.bestStars;

    if (entry.completed) {
      completedCount += 1;
    }

    if (entry.perfected) {
      perfectedCount += 1;
    }
  }

  return {
    completedCount,
    perfectedCount,
    totalStars,
  };
}
