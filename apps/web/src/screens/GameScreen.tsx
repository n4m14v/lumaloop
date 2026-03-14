import { useEffect, useRef, useState } from "react";

import { Play, RotateCcw, Sparkles } from "lucide-react";

import { GameCanvas } from "../components/GameCanvas";
import { GameMenu } from "../components/GameMenu";
import { ProgramWorkspace } from "../components/ProgramWorkspace";
import { campaignLevels, createSlotsForLevel, useGameStore } from "../features/game/store";
import { useI18n } from "../i18n/I18nProvider";
import { localizeLevel } from "../i18n/translations";

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

function renderStars(starCount: number) {
  return Array.from({ length: 3 }, (_, index) => (index < starCount ? "★" : "☆")).join("");
}

export function GameScreen() {
  const { locale, t } = useI18n();
  const [isVictorySequenceComplete, setIsVictorySequenceComplete] = useState(false);
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
  const rotateCamera = useGameStore((state) => state.rotateCamera);
  const setActiveRoutine = useGameStore((state) => state.setActiveRoutine);
  const setLevelIndex = useGameStore((state) => state.setLevelIndex);
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
  const failurePulse = Boolean(result && committedFrames >= result.trace.length && result.status !== "SUCCESS");
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

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(120,207,255,0.36),transparent_22%),linear-gradient(180deg,#f8f4bb_0%,#f2efb0_48%,#efe6a0_100%)] px-3 py-4 text-slate-700 md:px-6 md:py-6">
      <div className="mx-auto max-w-[1640px]">
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
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <GameMenu
                    level={level}
                    levels={localizedLevels}
                    levelIndex={levelIndex}
                    onLevelChange={setLevelIndex}
                    onReset={stopRun}
                    onRotateLeft={() => rotateCamera(-1)}
                    onRotateRight={() => rotateCamera(1)}
                    onSetShowAllActions={setShowAllActions}
                    onSetSpeed={setSpeed}
                    onStep={stepRun}
                    result={result}
                    showAllActions={showAllActions}
                    speed={speed}
                  />
                  <button
                    className="inline-flex items-center gap-2 rounded-[18px] border-2 border-[#57a8c4] bg-[#4fc3e8] px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-white shadow-[0_8px_0_rgba(44,130,160,0.7)] transition hover:translate-y-[1px]"
                    onClick={stopRun}
                    type="button"
                  >
                    <RotateCcw className="h-4 w-4" />
                    {t.reset}
                  </button>
                </div>

                <div className="hidden min-w-[280px] rounded-[18px] border-2 border-[#8aa9c7] bg-[#76a6ce] px-6 py-3 text-center text-2xl text-white shadow-[0_8px_0_rgba(91,128,164,0.55)] md:block">
                  {t.solvePuzzle}
                </div>

                <button
                  className="inline-flex items-center gap-3 rounded-[18px] border-2 border-[#51b53b] bg-[#4fc53f] px-7 py-4 text-base font-black uppercase tracking-[0.18em] text-white shadow-[0_10px_0_rgba(63,143,50,0.7)] transition hover:translate-y-[1px]"
                  onClick={() => {
                    if (isAutoRunning) {
                      toggleAutoRunning(false);
                      return;
                    }
                    startAutoRun();
                  }}
                  type="button"
                >
                  <Play className="h-5 w-5 fill-white" />
                  {isAutoRunning ? t.pause : t.play}
                </button>
              </div>

              <div className="rounded-[24px] border-2 border-[#d6d08a] bg-[#ece7b7] p-3">
                <div className="relative">
                  <GameCanvas
                    activeFrame={activeFrame}
                    committedRobot={committedRobot}
                    failurePulse={failurePulse}
                    level={level}
                    litTargets={litTargets}
                    onFrameComplete={settleFrame}
                    onVictorySequenceComplete={() => setIsVictorySequenceComplete(true)}
                    quarterTurns={cameraQuarterTurns}
                    showVictorySequence={showVictorySequence}
                  />
                  {showSuccessPopup ? (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-[rgba(244,239,181,0.58)] backdrop-blur-[2px]">
                      <div className="w-[min(92%,360px)] rounded-[26px] border-2 border-[#8fcf6a] bg-[#f8ffd9] p-6 text-center shadow-[0_12px_0_rgba(126,177,87,0.55)]">
                        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#7ce45a] text-white shadow-[0_6px_0_rgba(88,171,57,0.45)]">
                          <Sparkles className="h-7 w-7" />
                        </div>
                        <h2 className="font-display text-3xl text-slate-700">{t.puzzleSolved}</h2>
                        <p className="mt-3 text-3xl font-black tracking-[0.08em] text-[#4e6580]">
                          {renderStars(result?.score.starsEarned ?? 0)}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {t.successBody}
                        </p>
                        <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                          {t.programSize(result?.score.programLength ?? currentProgramLength)}
                          {level.metadata?.idealSolutionLength ? ` - ${t.idealSize(level.metadata.idealSolutionLength)}` : ""}
                        </p>
                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          <button
                            className="inline-flex items-center justify-center gap-2 rounded-[18px] border-2 border-[#57a8c4] bg-[#4fc3e8] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[0_8px_0_rgba(44,130,160,0.7)] transition hover:translate-y-[1px]"
                            onClick={stopRun}
                            type="button"
                          >
                            {t.replay}
                          </button>
                          <button
                            className="inline-flex items-center justify-center gap-2 rounded-[18px] border-2 border-[#51b53b] bg-[#4fc53f] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[0_8px_0_rgba(63,143,50,0.7)] transition hover:translate-y-[1px] disabled:translate-y-0 disabled:shadow-none"
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
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-4">
                <div className="rounded-[18px] border-2 border-[#c5cb91] bg-white/50 px-4 py-3 shadow-[0_6px_0_rgba(198,202,140,0.6)]">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{t.targets}</p>
                  <p className="mt-1 text-2xl font-black text-slate-700">{litTargets.length} / {totalTargets}</p>
                </div>
                <div className="rounded-[18px] border-2 border-[#c5cb91] bg-white/50 px-4 py-3 shadow-[0_6px_0_rgba(198,202,140,0.6)]">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{t.steps}</p>
                  <p className="mt-1 text-2xl font-black text-slate-700">{committedFrames}</p>
                </div>
                <div className="rounded-[18px] border-2 border-[#c5cb91] bg-white/50 px-4 py-3 shadow-[0_6px_0_rgba(198,202,140,0.6)]">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{t.score}</p>
                  <p className="mt-1 text-2xl font-black text-slate-700">{renderStars(displayedScore.starsEarned)}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {t.sizeSummary(displayedScore.programLength)}
                    {level.metadata?.idealSolutionLength ? ` - ${t.idealSize(level.metadata.idealSolutionLength)}` : ""}
                  </p>
                </div>
                <div className="rounded-[18px] border-2 border-[#c5cb91] bg-white/50 px-4 py-3 shadow-[0_6px_0_rgba(198,202,140,0.6)]">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{t.hint}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{level.metadata?.designerNotes ?? t.defaultHint}</p>
                </div>
              </div>
            </div>
          }
        />
      </div>
    </main>
  );
}
