/**
 * Comments:
 * - Centralizes GameScreen state wiring, derived view data, and screen-level side effects.
 * - The screen component can stay layout-focused while desktop and mobile shells share this controller.
 */

import { useEffect, useRef, useState } from "react";

import {
  campaignLevels,
  createSlotsForLevel,
  getCompletedLevelsStorageKey,
  useGameStore,
} from "../../features/game/store";
import { useI18n } from "../../i18n/I18nProvider";
import { localizeLevel } from "../../i18n/translations";

const ROBOT_DEATH_STATUSES = new Set([
  "FAILED_INVALID_JUMP",
  "FAILED_INVALID_MOVE",
  "FAILED_WRONG_LIGHT",
]);
const THEME_STORAGE_KEY = "lumaloop-theme";
const COMPLETED_LEVELS_STORAGE_KEY = getCompletedLevelsStorageKey();
const LEVEL_INDEX_STORAGE_KEY = "lumaloop-level-index";

type ThemeMode = "dark" | "light";
type RunMode = "normal" | "fast" | "instant";

function countFilledSlots(slots: ReturnType<typeof createSlotsForLevel>) {
  return [...slots.main, ...slots.p1, ...slots.p2].filter(Boolean).length;
}

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "dark";
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme;
  }

  return "dark";
}

export function useGameScreenController() {
  const { locale } = useI18n();
  const [unlockedLevelIndex, setUnlockedLevelIndex] = useState(0);
  const [hasHydratedLevelIndex, setHasHydratedLevelIndex] = useState(false);
  const [isVictorySequenceComplete, setIsVictorySequenceComplete] = useState(false);
  const [selectedRunMode, setSelectedRunMode] = useState<RunMode>("normal");
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const lastResolvedSuccessRef = useRef<object | null>(null);
  const activeRoutine = useGameStore((state) => state.activeRoutine);
  const activeFrameIndex = useGameStore((state) => state.activeFrameIndex);
  const appendCommand = useGameStore((state) => state.appendCommand);
  const cameraQuarterTurns = useGameStore((state) => state.cameraQuarterTurns);
  const clearRoutine = useGameStore((state) => state.clearRoutine);
  const completeRunImmediately = useGameStore((state) => state.completeRunImmediately);
  const committedFrames = useGameStore((state) => state.committedFrames);
  const completedLevelIds = useGameStore((state) => state.completedLevelIds);
  const ensureLevelProgram = useGameStore((state) => state.ensureLevelProgram);
  const hydrateCompletedLevelIds = useGameStore((state) => state.hydrateCompletedLevelIds);
  const isAutoRunning = useGameStore((state) => state.isAutoRunning);
  const levelIndex = useGameStore((state) => state.levelIndex);
  const programs = useGameStore((state) => state.programs);
  const queueNextFrame = useGameStore((state) => state.queueNextFrame);
  const removeCommand = useGameStore((state) => state.removeCommand);
  const result = useGameStore((state) => state.result);
  const robotColorId = useGameStore((state) => state.robotColorId);
  const setActiveRoutine = useGameStore((state) => state.setActiveRoutine);
  const setLevelIndex = useGameStore((state) => state.setLevelIndex);
  const setRobotColorId = useGameStore((state) => state.setRobotColorId);
  const setShowAllActions = useGameStore((state) => state.setShowAllActions);
  const setSpeed = useGameStore((state) => state.setSpeed);
  const settleFrame = useGameStore((state) => state.settleFrame);
  const showAllActions = useGameStore((state) => state.showAllActions);
  const speed = useGameStore((state) => state.speed);
  const startAutoRun = useGameStore((state) => state.startAutoRun);
  const stopRun = useGameStore((state) => state.stopRun);
  const toggleAutoRunning = useGameStore((state) => state.toggleAutoRunning);
  const localizedLevels = campaignLevels.map((campaignLevel) => localizeLevel(campaignLevel, locale));
  const level = localizedLevels[levelIndex] ?? localizedLevels[0];
  const isAdmin = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("admin");
  const unlockedLevels = localizedLevels.map((_, index) => {
    if (isAdmin || index === 0 || index <= unlockedLevelIndex) {
      return true;
    }

    const previousLevel = localizedLevels[index - 1];
    return previousLevel ? completedLevelIds.includes(previousLevel.id) : false;
  });

  useEffect(() => {
    ensureLevelProgram();
  }, [ensureLevelProgram, levelIndex]);

  useEffect(() => {
    const savedCompletedLevelIds = window.localStorage.getItem(COMPLETED_LEVELS_STORAGE_KEY);

    if (!savedCompletedLevelIds) {
      hydrateCompletedLevelIds([]);
      return;
    }

    try {
      const parsed = JSON.parse(savedCompletedLevelIds);
      hydrateCompletedLevelIds(Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : []);
    } catch {
      hydrateCompletedLevelIds([]);
    }
  }, [hydrateCompletedLevelIds]);

  useEffect(() => {
    const savedLevelIndex = window.localStorage.getItem(LEVEL_INDEX_STORAGE_KEY);

    if (!savedLevelIndex) {
      setHasHydratedLevelIndex(true);
      return;
    }

    const parsedLevelIndex = Number.parseInt(savedLevelIndex, 10);
    if (Number.isNaN(parsedLevelIndex)) {
      setUnlockedLevelIndex(0);
      setHasHydratedLevelIndex(true);
      return;
    }

    const nextLevelIndex = Math.min(Math.max(parsedLevelIndex, 0), campaignLevels.length - 1);
    setUnlockedLevelIndex(nextLevelIndex);
    setLevelIndex(nextLevelIndex);
    setHasHydratedLevelIndex(true);
  }, [setLevelIndex]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem(COMPLETED_LEVELS_STORAGE_KEY, JSON.stringify(completedLevelIds));
  }, [completedLevelIds]);

  useEffect(() => {
    if (!isAutoRunning || activeFrameIndex !== null || !result || committedFrames >= result.trace.length) {
      return undefined;
    }

    const timeoutId = window.setTimeout(
      () => {
        queueNextFrame();
      },
      Math.max(40, 120 / speed),
    );

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeFrameIndex, committedFrames, isAutoRunning, queueNextFrame, result, speed]);

  useEffect(() => {
    if (!result || result.status !== "SUCCESS" || committedFrames < result.trace.length) {
      lastResolvedSuccessRef.current = null;
      setIsVictorySequenceComplete(false);
      return;
    }

    if (lastResolvedSuccessRef.current !== result) {
      lastResolvedSuccessRef.current = result;
      setIsVictorySequenceComplete(false);
    }
  }, [committedFrames, result]);

  if (!level) {
    return {
      level: null,
    } as const;
  }

  const slots = programs[level.id] ?? createSlotsForLevel(level);
  const activeFrame = activeFrameIndex === null ? null : result?.trace[activeFrameIndex] ?? null;
  const lastCommittedFrame = committedFrames > 0 ? result?.trace[committedFrames - 1] : undefined;
  const committedRobot =
    (committedFrames > 0 ? result?.trace[committedFrames - 1]?.robotAfter : level.start) ?? level.start;
  const isRunResolved = Boolean(result && committedFrames >= result.trace.length);
  const didRunFail = Boolean(result && isRunResolved && result.status !== "SUCCESS");
  const litTargets = didRunFail ? [] : lastCommittedFrame?.activatedTargetIds ?? [];
  const currentPointer = activeFrame?.pointer;
  const failurePulse = Boolean(
    result &&
    isRunResolved &&
    ROBOT_DEATH_STATUSES.has(result.status),
  );
  const failurePulseToken = failurePulse ? result : null;
  const currentProgramLength = countFilledSlots(slots);
  const isSuccessResolved = Boolean(
    result &&
    result.status === "SUCCESS" &&
    isRunResolved,
  );

  useEffect(() => {
    if (!hasHydratedLevelIndex || !isSuccessResolved) {
      return;
    }

    const nextUnlockedLevelIndex = Math.min(
      Math.max(unlockedLevelIndex, levelIndex + 1),
      campaignLevels.length - 1,
    );
    if (nextUnlockedLevelIndex === unlockedLevelIndex) {
      return;
    }

    setUnlockedLevelIndex(nextUnlockedLevelIndex);
    window.localStorage.setItem(LEVEL_INDEX_STORAGE_KEY, String(nextUnlockedLevelIndex));
  }, [hasHydratedLevelIndex, isSuccessResolved, levelIndex, unlockedLevelIndex]);

  const showVictorySequence = isSuccessResolved && !isVictorySequenceComplete;
  const showSuccessPopup = isSuccessResolved && isVictorySequenceComplete;
  const hasNextLevel = levelIndex < campaignLevels.length - 1;
  const isRotationLocked = isAutoRunning || activeFrame !== null || showVictorySequence || showSuccessPopup;
  const canStartRun = currentProgramLength > 0;

  function handleToggleTheme() {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  }

  function handleSetLevelIndex(nextLevelIndex: number) {
    if (!unlockedLevels[nextLevelIndex]) {
      return;
    }

    setLevelIndex(nextLevelIndex);
  }

  function executeRunMode(mode: RunMode) {
    if (!canStartRun) {
      return;
    }

    if (mode === "instant") {
      completeRunImmediately();
      return;
    }

    setSpeed(mode === "fast" ? 2 : 1);
    startAutoRun();
  }

  function handleToggleRun() {
    if (isAutoRunning) {
      toggleAutoRunning(false);
      return;
    }

    executeRunMode(selectedRunMode);
  }

  function handleSelectRunMode(mode: RunMode) {
    setSelectedRunMode(mode);
  }

  function handleAdvanceToNextLevel() {
    if (!hasNextLevel) {
      return;
    }

    stopRun();
    handleSetLevelIndex(levelIndex + 1);
  }

  return {
    activeRoutine,
    cameraQuarterTurns,
    canStartRun,
    clearRoutine,
    committedRobot,
    currentPointer,
    currentProgramLength,
    failurePulse,
    failurePulseToken,
    handleAdvanceToNextLevel,
    handleToggleRun,
    handleToggleTheme,
    hasNextLevel,
    isAutoRunning,
    isRotationLocked,
    level,
    levelIndex,
    litTargets,
    localizedLevels,
    removeCommand,
    result,
    robotColorId,
    setActiveRoutine,
    setLevelIndex,
    setRobotColorId,
    setShowAllActions,
    settleFrame,
    showAllActions,
    showSuccessPopup,
    showVictorySequence,
    slots,
    speed,
    stopRun,
    theme,
    workspace: {
      activeRoutine,
      allowedCommands: level.allowedCommands,
      currentPointer,
      onAppendCommand: appendCommand,
      onClearRoutine: clearRoutine,
      onRemoveCommand: removeCommand,
      onSelectRoutine: setActiveRoutine,
      routines: slots,
      showAllActions,
    },
    canvas: {
      activeFrame,
      committedRobot,
      failurePulse,
      failurePulseToken,
      isRotationLocked,
      level,
      litTargets,
      onFrameComplete: settleFrame,
      onVictorySequenceComplete: () => setIsVictorySequenceComplete(true),
      playbackSpeed: speed,
      quarterTurns: cameraQuarterTurns,
      robotColorId,
      victoryExpressionActive: isSuccessResolved,
      showVictorySequence,
      theme,
    },
    header: {
      canStartRun,
      currentLevelIndex: levelIndex,
      isAutoRunning,
      level,
      localizedLevels,
      onSetLevelIndex: handleSetLevelIndex,
      onSetRobotColorId: setRobotColorId,
      onSetShowAllActions: setShowAllActions,
      onRunWithMode: handleSelectRunMode,
      onToggleRun: handleToggleRun,
      onToggleTheme: handleToggleTheme,
      robotColorId,
      selectedRunMode,
      showAllActions,
      theme,
      unlockedLevels,
    },
    successDialog: showSuccessPopup
      ? {
          hasNextLevel,
          idealSolutionLength: level.metadata?.idealSolutionLength,
          onNext: handleAdvanceToNextLevel,
          onReplay: stopRun,
          programLength: result?.score.programLength ?? currentProgramLength,
          starsEarned: result?.score.starsEarned ?? 0,
        }
      : null,
  };
}
