import type { RoutineSlots } from "../game/store";
import type { LevelProgressState } from "../../screens/game-screen/levelProgressStorage";
import { createEmptyLevelProgressState, mergeLevelProgressStates } from "../../screens/game-screen/levelProgressStorage";

export const CLOUD_PROGRESS_MERGED_EVENT = "lumaloop:cloud-progress-merged";

export interface CloudProgressRow {
  best_program_size: number | null;
  best_stars: number | null;
  completed: boolean | null;
  level_id: string;
}

export interface CloudProgramRow {
  level_id: string;
  main: unknown;
  p1: unknown;
  p2: unknown;
  updated_at: string | null;
}

export interface SavedProgramRecord {
  levelId: string;
  updatedAt: number;
  value: RoutineSlots;
}

function normalizeStars(value: number | null): 0 | 1 | 2 | 3 {
  if (value === null || !Number.isInteger(value) || value <= 0) {
    return 0;
  }

  if (value >= 3) {
    return 3;
  }

  return value as 1 | 2;
}

function normalizeProgramSize(value: number | null) {
  if (value === null || !Number.isInteger(value) || value <= 0) {
    return undefined;
  }

  return value;
}

function normalizeRoutine(value: unknown) {
  return Array.isArray(value) ? value : [];
}

export function cloudProgressRowsToState(rows: CloudProgressRow[]): LevelProgressState {
  const progress = createEmptyLevelProgressState();

  for (const row of rows) {
    const bestStars = normalizeStars(row.best_stars);
    const bestProgramSize = normalizeProgramSize(row.best_program_size);
    progress.levels[row.level_id] = {
      ...(bestProgramSize !== undefined ? { bestProgramSize } : {}),
      bestStars,
      completed: row.completed === true || bestStars > 0,
      perfected: bestStars === 3,
    };
  }

  return progress;
}

export function mergeCloudProgress(localProgress: LevelProgressState, cloudRows: CloudProgressRow[]) {
  return mergeLevelProgressStates(localProgress, cloudProgressRowsToState(cloudRows));
}

export function progressStateToCloudRows(progressState: LevelProgressState, userId: string) {
  return Object.entries(progressState.levels).map(([levelId, entry]) => ({
    best_program_size: entry.bestProgramSize ?? null,
    best_stars: entry.bestStars,
    completed: entry.completed,
    level_id: levelId,
    updated_at: new Date().toISOString(),
    user_id: userId,
  }));
}

export function cloudProgramRowToRecord(row: CloudProgramRow): SavedProgramRecord | null {
  const updatedAt = row.updated_at ? Date.parse(row.updated_at) : NaN;

  if (!Number.isFinite(updatedAt)) {
    return null;
  }

  return {
    levelId: row.level_id,
    updatedAt,
    value: {
      main: normalizeRoutine(row.main),
      p1: normalizeRoutine(row.p1),
      p2: normalizeRoutine(row.p2),
    } as RoutineSlots,
  };
}

export function pickLatestProgramRecord(
  localRecord: SavedProgramRecord | null,
  cloudRecord: SavedProgramRecord | null,
) {
  if (!localRecord) {
    return cloudRecord;
  }

  if (!cloudRecord) {
    return localRecord;
  }

  return cloudRecord.updatedAt > localRecord.updatedAt ? cloudRecord : localRecord;
}

export function dispatchCloudProgressMerged() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(CLOUD_PROGRESS_MERGED_EVENT));
}
