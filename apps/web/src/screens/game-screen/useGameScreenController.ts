/**
 * Comments:
 * - Centralizes GameScreen state wiring, derived view data, and dark-mode screen side effects.
 * - The screen component can stay layout-focused while desktop and mobile shells share this controller.
 */

import { useEffect, useRef, useState } from "react";

import { campaignLevels, freeLevelIds } from "@lumaloop/level-data";

import { withBasePath, withoutBasePath } from "../../app/basePath";
import { useAuth } from "../../features/auth/AuthProvider";
import { CLOUD_PROGRESS_MERGED_EVENT } from "../../features/auth/cloudSync";
import {
  createSlotsForLevel,
  useGameStore,
} from "../../features/game/store";
import {
  getFirstPremiumLevelIndex,
  getLevelAccessStates,
} from "../../features/monetization/access";
import {
  enqueueSyncOperation,
  readProgramFromIndexedDb,
  readProgressFromIndexedDb,
  writeProgramToIndexedDb,
  writeProgressToIndexedDb,
} from "../../features/offline/indexedDb";
import { useI18n } from "../../i18n/I18nProvider";
import {
  createEmptyLevelProgressState,
  readLevelProgress,
  recordLevelCompletion,
  type LevelProgressState,
} from "./levelProgressStorage";

const ROBOT_DEATH_STATUSES = new Set([
  "FAILED_INVALID_JUMP",
  "FAILED_INVALID_MOVE",
  "FAILED_INVALID_TOGGLE",
  "FAILED_WRONG_LIGHT",
]);
const LEVEL_INDEX_STORAGE_KEY = "lumaloop-level-index";
const RUN_MODE_STORAGE_KEY = "lumaloop-run-mode";

type RunMode = "normal" | "fast" | "instant" | "pov";

function isRunMode(value: string | null): value is RunMode {
  return value === "normal" || value === "fast" || value === "instant" || value === "pov";
}

function getInitialRunMode(): RunMode {
  if (typeof window === "undefined") {
    return "normal";
  }

  const savedRunMode = window.localStorage.getItem(RUN_MODE_STORAGE_KEY);
  return isRunMode(savedRunMode) ? savedRunMode : "normal";
}

function countFilledSlots(slots: ReturnType<typeof createSlotsForLevel>) {
  return [...slots.main, ...slots.p1, ...slots.p2].filter(Boolean).length;
}

export function useGameScreenController() {
  const auth = useAuth();
  const { localizeLevel, t } = useI18n();
  const [unlockedLevelIndex, setUnlockedLevelIndex] = useState(0);
  const [hasHydratedLevelIndex, setHasHydratedLevelIndex] = useState(false);
  const [isVictorySequenceComplete, setIsVictorySequenceComplete] = useState(false);
  const [levelProgress, setLevelProgress] = useState<LevelProgressState>(createEmptyLevelProgressState());
  const [isPurchasePromptOpen, setIsPurchasePromptOpen] = useState(false);
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);
  const [selectedRunMode, setSelectedRunMode] = useState<RunMode>(getInitialRunMode);
  const isPovActive = selectedRunMode === "pov";
  const lastResolvedSuccessRef = useRef<object | null>(null);
  const lastPersistedSuccessRef = useRef<object | null>(null);
  const lastPersistedProgramSnapshotRef = useRef<Record<string, string>>({});
  const activeRoutine = useGameStore((state) => state.activeRoutine);
  const activeFrameIndex = useGameStore((state) => state.activeFrameIndex);
  const appendCommand = useGameStore((state) => state.appendCommand);
  const cameraQuarterTurns = useGameStore((state) => state.cameraQuarterTurns);
  const clearRoutine = useGameStore((state) => state.clearRoutine);
  const completeRunImmediately = useGameStore((state) => state.completeRunImmediately);
  const committedFrames = useGameStore((state) => state.committedFrames);
  const ensureLevelProgram = useGameStore((state) => state.ensureLevelProgram);
  const isAutoRunning = useGameStore((state) => state.isAutoRunning);
  const levelIndex = useGameStore((state) => state.levelIndex);
  const programs = useGameStore((state) => state.programs);
  const queueNextFrame = useGameStore((state) => state.queueNextFrame);
  const removeCommand = useGameStore((state) => state.removeCommand);
  const result = useGameStore((state) => state.result);
  const robotColorId = useGameStore((state) => state.robotColorId);
  const setActiveRoutine = useGameStore((state) => state.setActiveRoutine);
  const setLevelIndex = useGameStore((state) => state.setLevelIndex);
  const setLevelProgram = useGameStore((state) => state.setLevelProgram);
  const setRobotColorId = useGameStore((state) => state.setRobotColorId);
  const setShowAllActions = useGameStore((state) => state.setShowAllActions);
  const setSpeed = useGameStore((state) => state.setSpeed);
  const settleFrame = useGameStore((state) => state.settleFrame);
  const showAllActions = useGameStore((state) => state.showAllActions);
  const speed = useGameStore((state) => state.speed);
  const startAutoRun = useGameStore((state) => state.startAutoRun);
  const stopRun = useGameStore((state) => state.stopRun);
  const toggleAutoRunning = useGameStore((state) => state.toggleAutoRunning);
  const localizedLevels = campaignLevels.map(localizeLevel);

  function closePurchasePrompt() {
    setIsPurchasePromptOpen(false);
    setPurchaseMessage(null);

    if (typeof window === "undefined") {
      return;
    }

    const url = new URL(window.location.href);
    const shouldCleanDialogRoute =
      withoutBasePath(url.pathname) === "/unlock" ||
      url.searchParams.get("account") === "1" ||
      url.searchParams.get("unlock") === "1";

    if (!shouldCleanDialogRoute) {
      return;
    }

    url.pathname = withBasePath("/play");
    url.searchParams.delete("account");
    url.searchParams.delete("unlock");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const url = new URL(window.location.href);
    const shouldOpenPurchasePrompt =
      withoutBasePath(url.pathname) === "/unlock" ||
      url.searchParams.get("account") === "1" ||
      url.searchParams.get("unlock") === "1";

    if (!shouldOpenPurchasePrompt) {
      return;
    }

    setPurchaseMessage(null);
    setIsPurchasePromptOpen(true);
  }, []);
  const level = localizedLevels[levelIndex] ?? localizedLevels[0]!;
  const isAdmin = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("admin");
  const levelAccessStates = getLevelAccessStates({
    hasFullGame: auth.hasFullGame,
    isAdmin,
    levels: localizedLevels,
    progress: levelProgress,
  });
  const unlockedLevels = levelAccessStates.map((accessState) => accessState.isAvailable);

  useEffect(() => {
    ensureLevelProgram();
  }, [ensureLevelProgram, levelIndex]);

  useEffect(() => {
    window.localStorage.setItem(RUN_MODE_STORAGE_KEY, selectedRunMode);
  }, [selectedRunMode]);

  useEffect(() => {
    if (!isAdmin && showAllActions) {
      setShowAllActions(false);
    }
  }, [isAdmin, setShowAllActions, showAllActions]);

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
    let isActive = true;

    async function hydrateProgress() {
      const legacyProgress = readLevelProgress();
      setLevelProgress(legacyProgress);

      const indexedDbProgress = await readProgressFromIndexedDb().catch(() => null);
      if (!isActive) {
        return;
      }

      if (indexedDbProgress) {
        setLevelProgress(indexedDbProgress);
        return;
      }

      await writeProgressToIndexedDb(legacyProgress).catch(() => undefined);
    }

    void hydrateProgress();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    async function handleCloudProgressMerged() {
      const indexedDbProgress = await readProgressFromIndexedDb().catch(() => null);
      if (indexedDbProgress) {
        setLevelProgress(indexedDbProgress);
      }
    }

    window.addEventListener(CLOUD_PROGRESS_MERGED_EVENT, handleCloudProgressMerged);

    return () => {
      window.removeEventListener(CLOUD_PROGRESS_MERGED_EVENT, handleCloudProgressMerged);
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function hydrateProgram() {
      if (!level) {
        return;
      }

      const savedProgram = await readProgramFromIndexedDb(level.id).catch(() => null);
      if (!isActive || !savedProgram) {
        return;
      }

      setLevelProgram(level.id, savedProgram);
    }

    void hydrateProgram();

    return () => {
      isActive = false;
    };
  }, [level, setLevelProgram]);

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
  const paletteCommands = level.allowedCommands;
  const committedActiveToggleGroups = lastCommittedFrame?.activeToggleGroups ?? [];
  const isRunResolved = Boolean(result && committedFrames >= result.trace.length);
  const didRunFail = Boolean(result && isRunResolved && result.status !== "SUCCESS");
  const litTargets = didRunFail ? [] : lastCommittedFrame?.activatedTargetIds ?? [];
  const currentPointer = activeFrame?.pointer;
  const failurePulse = Boolean(
    !isAutoRunning &&
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
    if (!isSuccessResolved || !result || lastPersistedSuccessRef.current === result) {
      return;
    }

    lastPersistedSuccessRef.current = result;
    setLevelProgress((currentProgress) => {
      const resultProgramLength = result.score.programLength ?? currentProgramLength;
      const nextProgress = recordLevelCompletion(currentProgress, {
        levelId: level.id,
        programLength: resultProgramLength,
        starsEarned: result.score.starsEarned,
      });

      if (nextProgress === currentProgress) {
        return currentProgress;
      }

      void writeProgressToIndexedDb(nextProgress);
      void enqueueSyncOperation({
        payload: {
          levelId: level.id,
          programLength: resultProgramLength,
          starsEarned: result.score.starsEarned,
        },
        type: "progress_updated",
      });
      return nextProgress;
    });
  }, [currentProgramLength, isSuccessResolved, level.id, result]);

  useEffect(() => {
    if (!level || !slots) {
      return;
    }

    const programSnapshot = JSON.stringify(slots);
    if (lastPersistedProgramSnapshotRef.current[level.id] === programSnapshot) {
      return;
    }

    lastPersistedProgramSnapshotRef.current[level.id] = programSnapshot;
    void writeProgramToIndexedDb(level.id, slots);
    void enqueueSyncOperation({
      payload: {
        levelId: level.id,
        main: slots.main,
        p1: slots.p1,
        p2: slots.p2,
      },
      type: "program_saved",
    });
  }, [level, slots]);

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

  useEffect(() => {
    if (auth.checkoutStatus !== "success" || !auth.hasFullGame) {
      return;
    }

    const firstPremiumLevelIndex = getFirstPremiumLevelIndex(localizedLevels);
    if (firstPremiumLevelIndex >= 0) {
      setLevelIndex(firstPremiumLevelIndex);
      window.localStorage.setItem(LEVEL_INDEX_STORAGE_KEY, String(firstPremiumLevelIndex));
      setUnlockedLevelIndex(Math.max(unlockedLevelIndex, firstPremiumLevelIndex));
    }

    auth.clearCheckoutStatus();
  }, [auth, localizedLevels, setLevelIndex, unlockedLevelIndex]);

  useEffect(() => {
    if (!hasHydratedLevelIndex || levelAccessStates[levelIndex]?.isAvailable) {
      return;
    }

    const fallbackIndex = levelAccessStates.findIndex((accessState) => accessState.isAvailable);
    if (fallbackIndex >= 0 && fallbackIndex !== levelIndex) {
      setLevelIndex(fallbackIndex);
    }
  }, [hasHydratedLevelIndex, levelAccessStates, levelIndex, setLevelIndex]);

  const showVictorySequence = isSuccessResolved && !isVictorySequenceComplete;
  const showSuccessPopup = isSuccessResolved && isVictorySequenceComplete;
  const hasNextLevel = levelIndex < campaignLevels.length - 1;
  const isFinalFreePreviewLevel = freeLevelIds[freeLevelIds.length - 1] === level.id;
  const shouldShowPremiumPreviewGate = isFinalFreePreviewLevel && !auth.hasFullGame && !isAdmin;
  const isRotationLocked = isAutoRunning || activeFrame !== null || showVictorySequence || showSuccessPopup;
  const canStartRun = currentProgramLength > 0;

  function handleSetLevelIndex(nextLevelIndex: number) {
    const accessState = levelAccessStates[nextLevelIndex];

    if (!accessState?.isAvailable) {
      if (accessState?.reason === "premium_locked") {
        setPurchaseMessage("Unlock the full game to play this level.");
        setIsPurchasePromptOpen(true);
      }
      return;
    }

    setLevelIndex(nextLevelIndex);
  }

  async function handleSignIn(email: string, password: string) {
    await auth.signIn(email, password);
    await auth.refreshEntitlements();
  }

  async function handleSignUp(email: string, password: string) {
    await auth.signUp(email, password);
    await auth.refreshEntitlements();
  }

  async function handleUnlockFullGame() {
    if (!auth.user) {
      setPurchaseMessage("Sign in or create an account before checkout.");
      setIsPurchasePromptOpen(true);
      return;
    }

    await auth.startFullGameCheckout();
  }

  function executeRunMode(mode: RunMode) {
    if (!canStartRun) {
      return;
    }

    if (mode === "instant") {
      completeRunImmediately();
      return;
    }

    // "pov" runs at normal speed (or we could make it slightly slower for better viz)
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

    if (!auth.hasFullGame && !isAdmin) {
      const currentFreeIndex = freeLevelIds.findIndex((freeLevelId) => freeLevelId === level.id);
      const nextFreeLevelId = currentFreeIndex >= 0 ? freeLevelIds[currentFreeIndex + 1] : undefined;
      const nextFreeLevelIndex = nextFreeLevelId
        ? localizedLevels.findIndex((candidateLevel) => candidateLevel.id === nextFreeLevelId)
        : -1;

      if (nextFreeLevelIndex >= 0) {
        handleSetLevelIndex(nextFreeLevelIndex);
        return;
      }

      setPurchaseMessage("You finished the free preview. Unlock the full game to continue.");
      setIsPurchasePromptOpen(true);
      return;
    }

    handleSetLevelIndex(levelIndex + 1);
  }

  function handleReplayLevel() {
    stopRun();
  }

  return {
    activeRoutine,
    cameraQuarterTurns,
    canStartRun,
    clearRoutine,
    committedFrames,
    committedRobot,
    currentPointer,
    currentProgramLength,
    failurePulse,
    failurePulseToken,
    handleAdvanceToNextLevel,
    handleToggleRun,
    hasNextLevel,
    isAutoRunning,
    isRotationLocked,
    level,
    levelIndex,
    levelProgress,
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
    workspace: {
      activeRoutine,
      allowedCommands: level.allowedCommands,
      currentPointer,
      onAppendCommand: appendCommand,
      onClearRoutine: clearRoutine,
      onRemoveCommand: removeCommand,
      onSelectRoutine: setActiveRoutine,
      paletteCommands,
      routines: slots,
      showAllActions,
    },
    canvas: {
      activeFrame,
      committedRobot,
      committedActiveToggleGroups,
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
      isPovActive,
      isAutoRunning,
    },
    header: {
      canStartRun,
      levelProgress,
      currentLevelIndex: levelIndex,
      isAutoRunning,
      levelId: level.id,
      levelName: level.name,
      localizedLevels,
      onRunWithMode: handleSelectRunMode,
      onSetLevelIndex: handleSetLevelIndex,
      onToggleRun: handleToggleRun,
      selectedRunMode,
      unlockedLevels,
      levelAccessStates,
      menu: {
        extraActions: [
          ...(auth.hasFullGame
            ? [{ label: "Full Game Unlocked", onSelect: () => {} }]
            : [{ label: "Unlock Full Game", onSelect: handleUnlockFullGame }]),
          ...(auth.user
            ? [{ label: `Sign out ${auth.user.email ?? ""}`.trim(), onSelect: () => void auth.signOut() }]
            : []),
        ],
        onReplayTutorial: () => {},
        onSetRobotColorId: setRobotColorId,
        robotColorId,
        ...(isAdmin
          ? {
              onSetShowAllActions: setShowAllActions,
              showAllActions,
            }
          : {}),
      },
      monetization: {
        checkoutStatus: auth.checkoutStatus,
        hasFullGame: auth.hasFullGame,
        isAuthConfigured: auth.isAuthConfigured,
        isPurchasePromptOpen,
        message: purchaseMessage,
        previewNextWorldName: t.worldDisplayName("world-03-height", "Rising Paths"),
        previewProgressCompleted: freeLevelIds.length,
        previewProgressTotal: campaignLevels.length,
        onClosePurchasePrompt: closePurchasePrompt,
        onRefreshEntitlements: auth.refreshEntitlements,
        onSignIn: handleSignIn,
        onSignOut: auth.signOut,
        onSignUp: handleSignUp,
        onUnlockFullGame: handleUnlockFullGame,
        syncStatus: auth.syncStatus,
        userEmail: auth.user?.email ?? null,
      },
    },
    successDialog: showSuccessPopup
      ? {
          hasNextLevel,
          idealSolutionLength: level.metadata?.idealSolutionLength,
          onNext: handleAdvanceToNextLevel,
          onReplay: handleReplayLevel,
          premiumNextWorldName: t.worldDisplayName("world-03-height", "Rising Paths"),
          premiumProgressCompleted: freeLevelIds.length,
          premiumProgressTotal: campaignLevels.length,
          showPremiumPreviewGate: shouldShowPremiumPreviewGate,
          programLength: result?.score.programLength ?? currentProgramLength,
          showLevelOnlyIdealNote: showAllActions,
          starsEarned: result?.score.starsEarned ?? 0,
        }
      : null,
  };
}
