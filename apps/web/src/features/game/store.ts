import { create } from "zustand";

import {
  runProgram,
  type Command,
  type LevelDefinition,
  type ProgramSlots,
  type RoutineName,
  type RunResult,
} from "@lumaloop/engine";
import {
  world01Basics,
  world02Orientation,
  world03Height,
  world04Procedures,
  world05Recursion,
  world06Hard,
  world07VeryHard,
  world08Mastery,
  world09Trickery,
  world10Phantoms,
} from "@lumaloop/level-data";

import type { RobotColorId } from "./robotColors";

export type SlotCommand = Command | null;
export type RoutineSlots = Record<RoutineName, SlotCommand[]>;
export type PlaybackSpeed = 1 | 2 | 4;
export const ALL_COMMANDS: Command[] = ["FORWARD", "TURN_LEFT", "TURN_RIGHT", "JUMP", "ACTIVATE", "CALL_P1", "CALL_P2"];
const DEFAULT_PROC_SLOTS = 4;
const COMPLETED_LEVELS_STORAGE_KEY = "lumaloop-completed-level-ids";

const MAX_STEPS = 1000;
const MAX_CALL_DEPTH = 100;

export const campaignLevels = [
  ...world01Basics,
  ...world02Orientation,
  ...world03Height,
  ...world04Procedures,
  ...world05Recursion,
  ...world06Hard,
  ...world07VeryHard,
  ...world08Mastery,
  ...world09Trickery,
  ...world10Phantoms,
];

const campaignLevelIds = new Set(campaignLevels.map((level) => level.id));

function sanitizeCompletedLevelIds(levelIds: string[]) {
  return [...new Set(levelIds.filter((levelId) => campaignLevelIds.has(levelId)))];
}

export function getCompletedLevelsStorageKey() {
  return COMPLETED_LEVELS_STORAGE_KEY;
}

function createRoutineSlots(level: LevelDefinition): RoutineSlots {
  return {
    main: Array.from({ length: level.slotLimits.main }, () => null),
    p1: Array.from({ length: level.slotLimits.p1 ?? DEFAULT_PROC_SLOTS }, () => null),
    p2: Array.from({ length: level.slotLimits.p2 ?? DEFAULT_PROC_SLOTS }, () => null),
  };
}

function buildProgram(slots: RoutineSlots): ProgramSlots {
  const main = slots.main.filter((command): command is Command => command !== null);
  const p1 = slots.p1.filter((command): command is Command => command !== null);
  const p2 = slots.p2.filter((command): command is Command => command !== null);

  return {
    main,
    ...(p1.length > 0 ? { p1 } : {}),
    ...(p2.length > 0 ? { p2 } : {}),
  };
}

function getLevel(levelIndex: number) {
  return campaignLevels[levelIndex] ?? campaignLevels[0];
}

function getEffectiveLevel(level: LevelDefinition, showAllActions: boolean): LevelDefinition {
  if (!showAllActions) {
    return level;
  }

  return {
    ...level,
    allowedCommands: ALL_COMMANDS,
    slotLimits: {
      main: level.slotLimits.main,
      p1: level.slotLimits.p1 ?? DEFAULT_PROC_SLOTS,
      p2: level.slotLimits.p2 ?? DEFAULT_PROC_SLOTS,
    },
  };
}

function getRunResult(level: LevelDefinition, slots: RoutineSlots, showAllActions: boolean) {
  return runProgram({
    level: getEffectiveLevel(level, showAllActions),
    program: buildProgram(slots),
    options: {
      maxSteps: MAX_STEPS,
      maxCallDepth: MAX_CALL_DEPTH,
    },
  });
}

function cloneSlots(slots: RoutineSlots): RoutineSlots {
  return {
    main: [...slots.main],
    p1: [...slots.p1],
    p2: [...slots.p2],
  };
}

interface GameStoreState {
  activeRoutine: RoutineName;
  cameraQuarterTurns: number;
  completedLevelIds: string[];
  committedFrames: number;
  isAutoRunning: boolean;
  levelIndex: number;
  programs: Record<string, RoutineSlots>;
  result: RunResult | null;
  robotColorId: RobotColorId;
  showAllActions: boolean;
  speed: PlaybackSpeed;
  activeFrameIndex: number | null;
  appendCommand: (command: Command) => void;
  ensureLevelProgram: (levelIndex?: number) => void;
  clearRoutine: (routine: RoutineName) => void;
  queueNextFrame: () => void;
  removeCommand: (routine: RoutineName, index: number) => void;
  rotateCamera: (delta: number) => void;
  hydrateCompletedLevelIds: (levelIds: string[]) => void;
  setActiveRoutine: (routine: RoutineName) => void;
  setRobotColorId: (value: RobotColorId) => void;
  setShowAllActions: (value: boolean) => void;
  setLevelIndex: (levelIndex: number) => void;
  setSpeed: (speed: PlaybackSpeed) => void;
  settleFrame: () => void;
  startAutoRun: () => void;
  stepRun: () => void;
  stopRun: () => void;
  toggleAutoRunning: (value: boolean) => void;
}

export function createSlotsForLevel(level: LevelDefinition) {
  return createRoutineSlots(level);
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  activeRoutine: "main",
  cameraQuarterTurns: 0,
  completedLevelIds: [],
  committedFrames: 0,
  isAutoRunning: false,
  levelIndex: 0,
  programs: {},
  result: null,
  robotColorId: "gold",
  showAllActions: true,
  speed: 1,
  activeFrameIndex: null,
  appendCommand: (command) => {
    const state = get();
    const level = getLevel(state.levelIndex);

    if (!level) {
      return;
    }

    if (!state.showAllActions && !level.allowedCommands.includes(command)) {
      return;
    }

    const currentSlots = state.programs[level.id] ?? createRoutineSlots(level);
    const nextSlots = cloneSlots(currentSlots);
    const routineAllowed =
      state.showAllActions ||
      state.activeRoutine === "main" ||
      (state.activeRoutine === "p1" && level.allowedCommands.includes("CALL_P1")) ||
      (state.activeRoutine === "p2" && level.allowedCommands.includes("CALL_P2"));
    const preferredRoutine = routineAllowed ? state.activeRoutine : "main";
    const targetRoutine = nextSlots[preferredRoutine].length > 0 ? preferredRoutine : "main";
    const targetIndex = nextSlots[targetRoutine].findIndex((slot) => slot === null);

    if (targetIndex === -1) {
      return;
    }

    nextSlots[targetRoutine][targetIndex] = command;

    set({
      activeFrameIndex: null,
      committedFrames: 0,
      isAutoRunning: false,
      programs: {
        ...state.programs,
        [level.id]: nextSlots,
      },
      result: null,
    });
  },
  ensureLevelProgram: (requestedLevelIndex) => {
    const state = get();
    const level = getLevel(requestedLevelIndex ?? state.levelIndex);

    if (!level || state.programs[level.id]) {
      return;
    }

    set({
      programs: {
        ...state.programs,
        [level.id]: createRoutineSlots(level),
      },
    });
  },
  clearRoutine: (routine) => {
    const state = get();
    const level = getLevel(state.levelIndex);

    if (!level) {
      return;
    }

    const currentSlots = state.programs[level.id] ?? createRoutineSlots(level);
    const nextSlots = cloneSlots(currentSlots);
    nextSlots[routine] = nextSlots[routine].map(() => null);

    set({
      activeFrameIndex: null,
      committedFrames: 0,
      isAutoRunning: false,
      programs: {
        ...state.programs,
        [level.id]: nextSlots,
      },
      result: null,
    });
  },
  queueNextFrame: () => {
    const state = get();

    if (!state.result || state.activeFrameIndex !== null || state.committedFrames >= state.result.trace.length) {
      return;
    }

    set({
      activeFrameIndex: state.committedFrames,
    });
  },
  removeCommand: (routine, index) => {
    const state = get();
    const level = getLevel(state.levelIndex);

    if (!level) {
      return;
    }

    const currentSlots = state.programs[level.id] ?? createRoutineSlots(level);

    if (index >= currentSlots[routine].length) {
      return;
    }

    const nextSlots = cloneSlots(currentSlots);
    nextSlots[routine][index] = null;

    set({
      activeFrameIndex: null,
      committedFrames: 0,
      isAutoRunning: false,
      programs: {
        ...state.programs,
        [level.id]: nextSlots,
      },
      result: null,
    });
  },
  rotateCamera: (delta) => {
    set((state) => ({
      cameraQuarterTurns: ((state.cameraQuarterTurns + delta) % 4 + 4) % 4,
    }));
  },
  hydrateCompletedLevelIds: (levelIds) => {
    set({
      completedLevelIds: sanitizeCompletedLevelIds(levelIds),
    });
  },
  setActiveRoutine: (routine) => {
    set({ activeRoutine: routine });
  },
  setRobotColorId: (value) => {
    set({ robotColorId: value });
  },
  setShowAllActions: (value) => {
    const state = get();
    const level = getLevel(state.levelIndex);
    const activeRoutine =
      !value &&
        level &&
        ((state.activeRoutine === "p1" && !level.allowedCommands.includes("CALL_P1")) ||
          (state.activeRoutine === "p2" && !level.allowedCommands.includes("CALL_P2")))
        ? "main"
        : state.activeRoutine;

    set({ activeRoutine, showAllActions: value });
  },
  setLevelIndex: (levelIndex) => {
    const state = get();
    const level = getLevel(levelIndex);

    if (!level) {
      return;
    }

    set({
      activeRoutine: "main",
      activeFrameIndex: null,
      cameraQuarterTurns: 0,
      committedFrames: 0,
      isAutoRunning: false,
      levelIndex,
      programs: state.programs[level.id]
        ? state.programs
        : {
          ...state.programs,
          [level.id]: createRoutineSlots(level),
        },
      result: null,
    });
  },
  setSpeed: (speed) => {
    set({ speed });
  },
  settleFrame: () => {
    const state = get();

    if (!state.result || state.activeFrameIndex === null) {
      return;
    }

    const committedFrames = state.activeFrameIndex + 1;
    const isComplete = committedFrames >= state.result.trace.length;
    const level = getLevel(state.levelIndex);
    const completedLevelIds =
      level &&
        isComplete &&
        state.result.status === "SUCCESS" &&
        !state.completedLevelIds.includes(level.id)
        ? [...state.completedLevelIds, level.id]
        : state.completedLevelIds;

    set({
      activeFrameIndex: null,
      committedFrames,
      completedLevelIds,
      isAutoRunning: isComplete ? false : state.isAutoRunning,
    });
  },
  startAutoRun: () => {
    const state = get();
    const level = getLevel(state.levelIndex);

    if (!level) {
      return;
    }

    const slots = state.programs[level.id] ?? createRoutineSlots(level);

    if (state.result && state.committedFrames < state.result.trace.length) {
      set({ isAutoRunning: true });
      return;
    }

    const result = getRunResult(level, slots, state.showAllActions);
    const shouldAnimate = result.trace.length > 0;
    const completedLevelIds =
      result.status === "SUCCESS" &&
        !shouldAnimate &&
        !state.completedLevelIds.includes(level.id)
        ? [...state.completedLevelIds, level.id]
        : state.completedLevelIds;

    set({
      activeFrameIndex: shouldAnimate ? 0 : null,
      committedFrames: 0,
      completedLevelIds,
      isAutoRunning: shouldAnimate,
      result,
    });
  },
  stepRun: () => {
    const state = get();
    const level = getLevel(state.levelIndex);

    if (!level || state.activeFrameIndex !== null) {
      return;
    }

    const slots = state.programs[level.id] ?? createRoutineSlots(level);
    const result = state.result ?? getRunResult(level, slots, state.showAllActions);

    if (state.committedFrames >= result.trace.length) {
      set({
        isAutoRunning: false,
        result,
      });
      return;
    }

    set({
      activeFrameIndex: state.committedFrames,
      isAutoRunning: false,
      result,
    });
  },
  stopRun: () => {
    set({
      activeFrameIndex: null,
      committedFrames: 0,
      isAutoRunning: false,
      result: null,
    });
  },
  toggleAutoRunning: (value) => {
    set({ isAutoRunning: value });
  },
}));
