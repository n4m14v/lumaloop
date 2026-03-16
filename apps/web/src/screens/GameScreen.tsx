import { useEffect, useRef, useState } from "react";

import { Play, Sparkles } from "lucide-react";

import { GameCanvas } from "../components/GameCanvas";
import { GameMenu } from "../components/GameMenu";
import { LanguageSelect } from "../components/LanguageSelect";
import { ProgramWorkspace } from "../components/ProgramWorkspace";
import { ThemeToggle } from "../components/ThemeToggle";
import { campaignLevels, createSlotsForLevel, useGameStore } from "../features/game/store";
import { useI18n } from "../i18n/I18nProvider";
import { localizeLevel } from "../i18n/translations";

const ROBOT_DEATH_STATUSES = new Set([
  "FAILED_INVALID_JUMP",
  "FAILED_INVALID_MOVE",
  "FAILED_WRONG_LIGHT",
]);
const THEME_STORAGE_KEY = "lumaloop-theme";

type ThemeMode = "dark" | "light";

function countFilledSlots(slots: ReturnType<typeof createSlotsForLevel>) {
  return [...slots.main, ...slots.p1, ...slots.p2].filter(Boolean).length;
}

function calculateProjectedStars(
  programLength: number,
  stars?: { one: number; two: number; three: number },
): 0 | 1 | 2 | 3 {
  if (!stars) {
    return 0;
  }

  if (programLength <= stars.three) {
    return 3;
  }

  if (programLength <= stars.two) {
    return 2;
  }

  if (programLength <= stars.one) {
    return 1;
  }

  return 0;
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

function renderScoreStars(starCount: number) {
  return Array.from({ length: 3 }, (_, index) => (
    <span
      className={index < starCount ? "text-[#ffd76a] drop-shadow-[0_0_12px_rgba(255,215,106,0.42)]" : "text-white/80"}
      key={index}
    >
      ★
    </span>
  ));
}

export function GameScreen() {
  const { locale, t } = useI18n();
  const [isVictorySequenceComplete, setIsVictorySequenceComplete] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const lastResolvedSuccessRef = useRef<object | null>(null);
  const activeRoutine = useGameStore((state) => state.activeRoutine);
  const activeFrameIndex = useGameStore((state) => state.activeFrameIndex);
  const appendCommand = useGameStore((state) => state.appendCommand);
  const cameraQuarterTurns = useGameStore((state) => state.cameraQuarterTurns);
  const clearRoutine = useGameStore((state) => state.clearRoutine);
  const committedFrames = useGameStore((state) => state.committedFrames);
  const ensureLevelProgram = useGameStore((state) => state.ensureLevelProgram);
  const isAutoRunning = useGameStore((state) => state.isAutoRunning);
  const levelIndex = useGameStore((state) => state.levelIndex);
  const programs = useGameStore((state) => state.programs);
  const queueNextFrame = useGameStore((state) => state.queueNextFrame);
  const removeCommand = useGameStore((state) => state.removeCommand);
  const result = useGameStore((state) => state.result);
  const robotColorId = useGameStore((state) => state.robotColorId);
  const rotateCamera = useGameStore((state) => state.rotateCamera);
  const setActiveRoutine = useGameStore((state) => state.setActiveRoutine);
  const setLevelIndex = useGameStore((state) => state.setLevelIndex);
  const setRobotColorId = useGameStore((state) => state.setRobotColorId);
  const setShowAllActions = useGameStore((state) => state.setShowAllActions);
  const setSpeed = useGameStore((state) => state.setSpeed);
  const settleFrame = useGameStore((state) => state.settleFrame);
  const showAllActions = useGameStore((state) => state.showAllActions);
  const speed = useGameStore((state) => state.speed);
  const startAutoRun = useGameStore((state) => state.startAutoRun);
  const stepRun = useGameStore((state) => state.stepRun);
  const stopRun = useGameStore((state) => state.stopRun);
  const toggleAutoRunning = useGameStore((state) => state.toggleAutoRunning);
  const localizedLevels = campaignLevels.map((campaignLevel) => localizeLevel(campaignLevel, locale));
  const level = localizedLevels[levelIndex] ?? localizedLevels[0];

  useEffect(() => {
    ensureLevelProgram();
  }, [ensureLevelProgram, levelIndex]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

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
    return null;
  }

  const slots = programs[level.id] ?? createSlotsForLevel(level);
  const activeFrame = activeFrameIndex === null ? null : result?.trace[activeFrameIndex] ?? null;
  const lastCommittedFrame = committedFrames > 0 ? result?.trace[committedFrames - 1] : undefined;
  const committedRobot =
    (committedFrames > 0 ? result?.trace[committedFrames - 1]?.robotAfter : level.start) ?? level.start;
  const litTargets = lastCommittedFrame?.activatedTargetIds ?? [];
  const currentPointer = activeFrame?.pointer;
  const totalTargets = level.board.filter((tile) => tile.kind === "TARGET").length;
  const failurePulse = Boolean(
    result &&
    committedFrames >= result.trace.length &&
    ROBOT_DEATH_STATUSES.has(result.status),
  );
  const failurePulseToken = failurePulse ? result : null;
  const currentProgramLength = countFilledSlots(slots);
  const projectedStars = calculateProjectedStars(currentProgramLength, level.stars);
  const displayedScore = result?.score ?? {
    executedInstructions: committedFrames,
    programLength: currentProgramLength,
    starsEarned: projectedStars,
  };
  const isSuccessResolved = Boolean(
    result &&
    result.status === "SUCCESS" &&
    committedFrames >= result.trace.length,
  );
  const showVictorySequence = isSuccessResolved && !isVictorySequenceComplete;
  const showSuccessPopup = isSuccessResolved && isVictorySequenceComplete;
  const hasNextLevel = levelIndex < campaignLevels.length - 1;
  const isRotationLocked = isAutoRunning || activeFrame !== null || showVictorySequence || showSuccessPopup;
  const canStartRun = currentProgramLength > 0;

  return (
    <main className="relative min-h-screen px-4 py-3 text-[var(--text-primary)] md:px-6 md:py-4">
      <div className="mx-auto max-w-[1920px]">
        <ProgramWorkspace
          activeRoutine={activeRoutine}
          allowedCommands={level.allowedCommands}
          currentPointer={currentPointer}
          onAppendCommand={appendCommand}
          onClearRoutine={clearRoutine}
          onRemoveCommand={removeCommand}
          onSelectRoutine={setActiveRoutine}
          routines={slots}
          showAllActions={showAllActions}
          scene={
            <>
              <GameCanvas
                activeFrame={activeFrame}
                className="fixed inset-0 h-screen w-screen overflow-hidden xl:-translate-x-[182px]"
                committedRobot={committedRobot}
                failurePulse={failurePulse}
                failurePulseToken={failurePulseToken}
                isRotationLocked={isRotationLocked}
                level={level}
                litTargets={litTargets}
                onFrameComplete={settleFrame}
                onVictorySequenceComplete={() => setIsVictorySequenceComplete(true)}
                quarterTurns={cameraQuarterTurns}
                robotColorId={robotColorId}
                showVictorySequence={showVictorySequence}
                theme={theme}
              />

              <div className="pointer-events-none relative z-10 flex min-h-[calc(100vh-3rem)] flex-col">
                <div className="pointer-events-none relative xl:pr-[364px]">
                  <div className="ui-gloss-panel pointer-events-auto grid gap-3 px-4 py-2.5 md:grid-cols-[auto_1fr_auto] md:items-center xl:pr-20" dir="ltr">
                    <div className="flex items-center gap-2">
                      <GameMenu
                        cameraRotationLocked={isRotationLocked}
                        level={level}
                        levels={localizedLevels}
                        levelIndex={levelIndex}
                        onLevelChange={setLevelIndex}
                        onReset={stopRun}
                        onRotateLeft={() => rotateCamera(-1)}
                        onRotateRight={() => rotateCamera(1)}
                        onSetRobotColorId={setRobotColorId}
                        onSetShowAllActions={setShowAllActions}
                        onSetSpeed={setSpeed}
                        onStep={stepRun}
                        scoreStars={displayedScore.starsEarned}
                        result={result}
                        robotColorId={robotColorId}
                        showAllActions={showAllActions}
                        speed={speed}
                        stepsTaken={committedFrames}
                        targetsSummary={`[${litTargets.length}/${totalTargets}]`}
                      />
                      <LanguageSelect />
                      <ThemeToggle
                        onToggle={() => setTheme(theme === "dark" ? "light" : "dark")}
                        theme={theme}
                      />
                    </div>

                    <div className="text-center">
                      <h1 className="font-display text-[clamp(1.6rem,2.2vw,2.4rem)] font-semibold tracking-tight text-[var(--text-primary)]">
                        LUMALOOP
                      </h1>
                    </div>

                    <div className="flex items-center justify-start gap-2 md:justify-end">
                      <button
                        className="ui-button-accent inline-flex h-9 min-w-[120px] items-center justify-center gap-2 rounded-[12px] px-4 text-xs font-semibold uppercase tracking-[0.08em] disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={!isAutoRunning && !canStartRun}
                        onClick={() => {
                          if (isAutoRunning) {
                            toggleAutoRunning(false);
                            return;
                          }
                          if (!canStartRun) {
                            return;
                          }
                          startAutoRun();
                        }}
                        type="button"
                      >
                        <Play className="h-4 w-4 fill-current" />
                        {isAutoRunning ? t.pause : t.play}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex-1" />
              </div>

              {showSuccessPopup ? (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
                  <div className="ui-panel pointer-events-auto w-[min(92%,400px)] rounded-[24px] p-8 text-center shadow-2xl">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[var(--panel-border)] bg-[var(--panel-bg-soft)] text-[var(--accent)] shadow-[0_0_32px_var(--accent-shadow)]">
                      <Sparkles className="h-8 w-8" />
                    </div>
                    <h2 className="font-display text-4xl font-semibold tracking-tight">{t.puzzleSolved}</h2>
                    <p className="mt-5 flex justify-center gap-4 text-5xl">{renderScoreStars(result?.score.starsEarned ?? 0)}</p>
                    <p className="mt-6 text-base leading-relaxed text-[var(--text-secondary)]">{t.successBody}</p>
                    <p className="mt-4 text-[11px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
                      {t.programSize(result?.score.programLength ?? currentProgramLength)}
                      {level.metadata?.idealSolutionLength ? ` • ${t.idealSize(level.metadata.idealSolutionLength)}` : ""}
                    </p>
                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                      <button className="ui-button h-12 justify-center text-sm font-semibold uppercase tracking-[0.1em]" onClick={stopRun} type="button">
                        {t.replay}
                      </button>
                      <button
                        className="ui-button-accent h-12 rounded-[14px] px-4 text-sm font-semibold uppercase tracking-[0.1em] disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={!hasNextLevel}
                        onClick={() => {
                          if (!hasNextLevel) {
                            return;
                          }
                          stopRun();
                          setLevelIndex(levelIndex + 1);
                        }}
                        type="button"
                      >
                        {t.next}
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </>
          }
        />
      </div>
    </main>
  );
}
