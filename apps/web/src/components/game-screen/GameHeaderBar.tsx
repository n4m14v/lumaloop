import { Suspense, lazy, useEffect, useRef, useState } from "react";

import { ChevronDown, Pause, Play, SkipForward } from "lucide-react";

import type { LevelDefinition } from "@lumaloop/engine";

import type { RobotColorId } from "../../features/game/robotColors";
import type { LevelProgressState } from "../../screens/game-screen/levelProgressStorage";
import { useI18n } from "../../i18n/I18nProvider";
import { GameMenu } from "../GameMenu";
import { LanguageSelect } from "../LanguageSelect";
import { GameStatusSnackbar, type GameStatusFeedback } from "./GameStatusSnackbar";

const LevelMapBackdrop = lazy(async () => {
  const module = await import("./LevelMapBackdrop");
  return { default: module.LevelMapBackdrop };
});

const GameWalkthroughDialog = lazy(async () => {
  const module = await import("./GameWalkthroughDialog");
  return { default: module.GameWalkthroughDialog };
});

interface GameHeaderBarProps {
  canStartRun: boolean;
  currentLevelIndex: number;
  isAutoRunning: boolean;
  isLevelMapOpen: boolean;
  level: LevelDefinition;
  levelProgress: LevelProgressState;
  localizedLevels: LevelDefinition[];
  onCloseLevelMap: () => void;
  onOpenLevelMap: () => void;
  onRunWithMode: (mode: "normal" | "fast" | "instant" | "pov") => void;
  onReplayTutorial: () => void;
  runFeedback?: GameStatusFeedback | null;
  onSetLevelIndex: (index: number) => void;
  onSetRobotColorId: (value: RobotColorId) => void;
  onSetShowAllActions: (value: boolean) => void;
  onToggleRun: () => void;
  robotColorId: RobotColorId;
  selectedRunMode: "normal" | "fast" | "instant" | "pov";
  showAllActions: boolean;
  unlockedLevels: boolean[];
}

function RunModeIcon({ mode }: { mode: "normal" | "fast" | "instant" | "pov" }) {
  if (mode === "pov") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
    );
  }

  if (mode === "instant") {
    return <SkipForward className="h-4 w-4" />;
  }

  if (mode === "fast") {
    return (
      <span className="relative inline-flex h-4 w-5 items-center justify-start">
        <Play className="h-4 w-4 fill-current" />
        <span className="absolute -right-0.5 -bottom-1 text-[8px] font-black leading-none tracking-[-0.04em]">x2</span>
      </span>
    );
  }

  return <Play className="h-4 w-4 fill-current" />;
}

export function GameHeaderBar({
  canStartRun,
  currentLevelIndex,
  isAutoRunning,
  isLevelMapOpen,
  level,
  levelProgress,
  localizedLevels,
  onCloseLevelMap,
  onOpenLevelMap,
  onRunWithMode,
  onReplayTutorial,
  runFeedback,
  onSetLevelIndex,
  onSetRobotColorId,
  onSetShowAllActions,
  onToggleRun,
  robotColorId,
  selectedRunMode,
  showAllActions,
  unlockedLevels,
}: GameHeaderBarProps) {
  const { t } = useI18n();
  const [isRunMenuOpen, setIsRunMenuOpen] = useState(false);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);
  const [hasOpenedLevelMap, setHasOpenedLevelMap] = useState(false);
  const [hasOpenedWalkthrough, setHasOpenedWalkthrough] = useState(false);
  const runMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isRunMenuOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!runMenuRef.current?.contains(event.target as Node)) {
        setIsRunMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isRunMenuOpen]);

  useEffect(() => {
    if (!isLevelMapOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCloseLevelMap();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isLevelMapOpen, onCloseLevelMap]);

  const selectedRunLabel =
    selectedRunMode === "fast" ? t.fastPlay : selectedRunMode === "instant" ? t.skipToEnd : selectedRunMode === "pov" ? "POV Play" : t.play;

  return (
    <div className="pointer-events-none relative z-10 flex min-h-[calc(100vh-3rem)] flex-col">
      <div className="pointer-events-none relative xl:pr-[364px]">
        <div
          className="ui-gloss-panel pointer-events-auto relative z-20 grid gap-3 px-4 py-2.5 md:grid-cols-[1fr_auto_1fr] md:items-center"
          dir="ltr"
        >
          <div className="flex items-center gap-2 md:justify-self-start">
            <GameMenu
              level={level}
              onSetRobotColorId={onSetRobotColorId}
              onReplayTutorial={onReplayTutorial}
              onSetShowAllActions={onSetShowAllActions}
              robotColorId={robotColorId}
              showAllActions={showAllActions}
            />
            <LanguageSelect />
            <button
              aria-label={t.walkthroughOpen}
              className="ui-button h-8 w-8 justify-center rounded-full px-0 font-display text-sm font-semibold text-[var(--text-primary)]"
              onClick={() => {
                setHasOpenedWalkthrough(true);
                setIsWalkthroughOpen(true);
              }}
              title={t.walkthroughOpen}
              type="button"
            >
              ?
            </button>
          </div>

          <div className="flex items-center justify-center gap-3 text-center md:justify-self-center">
            <h1 className="font-display text-[clamp(1.15rem,1.35vw,1.5rem)] font-semibold tracking-[0.08em] text-[var(--text-primary)]">
              LUMALOOP
            </h1>
            <button
              aria-expanded={isLevelMapOpen}
              className="ui-button pointer-events-auto flex h-9 items-center gap-2 rounded-[12px] px-3 text-left"
              onClick={() => {
                setIsRunMenuOpen(false);
                setHasOpenedLevelMap(true);
                onOpenLevelMap();
              }}
              type="button"
            >
              <span className="max-w-[min(42vw,19rem)] truncate text-[0.72rem] font-medium text-[var(--text-primary)] md:text-[0.78rem]">
                {t.level} {currentLevelIndex + 1}: {level.name}
              </span>
              <ChevronDown
                className={[
                  "h-3.5 w-3.5 shrink-0 text-[var(--text-muted)] transition",
                  isLevelMapOpen ? "rotate-180" : "",
                ].join(" ")}
              />
            </button>
          </div>

          <div className="pointer-events-auto relative z-20 flex items-center justify-end gap-2 md:justify-self-end">
            <div className="relative" ref={runMenuRef}>
              <div
                className={[
                  "flex overflow-hidden border bg-[linear-gradient(180deg,var(--accent)_0%,var(--accent-strong)_100%)] shadow-[0_0_24px_var(--accent-shadow)]",
                  "border-[color-mix(in_srgb,var(--accent-strong)_58%,rgba(255,255,255,0.2))]",
                  isRunMenuOpen ? "rounded-t-[12px] rounded-b-none" : "rounded-[12px]",
                ].join(" ")}
              >
                <button
                  aria-label={isAutoRunning ? t.pause : selectedRunLabel}
                  className={[
                    "inline-flex h-9 min-w-[164px] items-center justify-center gap-2 border-r px-4 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--accent-foreground)] disabled:cursor-not-allowed disabled:opacity-50",
                    "border-r-white/28",
                    "max-[980px]:min-w-[52px] max-[980px]:px-3",
                    isRunMenuOpen ? "rounded-tl-[12px]" : "rounded-l-[12px]",
                  ].join(" ")}
                  data-onboarding="run-button"
                  disabled={!isAutoRunning && !canStartRun}
                  onClick={onToggleRun}
                  type="button"
                >
                  {isAutoRunning ? <Pause className="h-4 w-4" /> : <RunModeIcon mode={selectedRunMode} />}
                  <span className="max-[980px]:hidden">{isAutoRunning ? t.pause : selectedRunLabel}</span>
                </button>
                <button
                  aria-expanded={isRunMenuOpen}
                  aria-label={t.runOptions}
                  className={[
                    "inline-flex h-9 w-10 items-center justify-center px-0 text-[var(--accent-foreground)] disabled:cursor-not-allowed disabled:opacity-50",
                    isRunMenuOpen ? "rounded-tr-[12px]" : "rounded-r-[12px]",
                  ].join(" ")}
                  onClick={() => setIsRunMenuOpen((value) => !value)}
                  type="button"
                >
                  <ChevronDown
                    className={[
                      "h-3.5 w-3.5 transition",
                      isRunMenuOpen ? "rotate-180" : "",
                    ].join(" ")}
                  />
                </button>
              </div>

              {isRunMenuOpen ? (
                <div className="absolute right-0 top-[calc(100%-1px)] z-30 w-full overflow-hidden rounded-b-[16px] border border-t-0 border-[var(--panel-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--accent)_18%,var(--panel-bg-strong))_0%,var(--panel-bg-strong)_100%)] p-2 text-[var(--text-primary)] shadow-[0_10px_28px_rgba(0,0,0,0.18)] backdrop-blur-[14px] max-[980px]:w-[56px] max-[980px]:p-1.5">
                  <div className="space-y-1">
                    {[
                      { label: t.play, mode: "normal" as const },
                      { label: t.fastPlay, mode: "fast" as const },
                      { label: "POV Mode", mode: "pov" as const },
                      { label: t.skipToEnd, mode: "instant" as const },
                    ].map((option) => (
                      <button
                        aria-label={option.label}
                        className={[
                          "flex w-full items-center justify-between rounded-[10px] px-3 py-2.5 text-left text-[12px] transition",
                          "max-[980px]:justify-center max-[980px]:px-2 max-[980px]:py-2",
                          option.mode === selectedRunMode
                            ? "bg-[var(--accent-soft)] text-[var(--text-primary)]"
                            : "text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]",
                        ].join(" ")}
                        key={option.mode}
                        onClick={() => {
                          onRunWithMode(option.mode);
                          setIsRunMenuOpen(false);
                        }}
                        type="button"
                      >
                        <span className="flex items-center gap-2.5">
                          <RunModeIcon mode={option.mode} />
                          <span className="max-[980px]:hidden">{option.label}</span>
                        </span>
                        {option.mode === selectedRunMode ? (
                          <span className="text-sm font-semibold text-[var(--text-primary)] max-[980px]:hidden">✓</span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <GameStatusSnackbar
          className="absolute right-4 xl:right-[380px] top-[calc(100%+20px)] w-[min(24rem,calc(100vw-2rem))] z-10"
          feedback={runFeedback ?? null}
        />
      </div>

      {hasOpenedLevelMap ? (
        <Suspense fallback={null}>
          <LevelMapBackdrop
            currentLevelId={level.id}
            isOpen={isLevelMapOpen}
            localizedLevels={localizedLevels}
            onClose={onCloseLevelMap}
            onSelectLevel={onSetLevelIndex}
            levelProgress={levelProgress}
            unlockedLevels={unlockedLevels}
          />
        </Suspense>
      ) : null}
      {hasOpenedWalkthrough ? (
        <Suspense fallback={null}>
          <GameWalkthroughDialog onClose={() => setIsWalkthroughOpen(false)} open={isWalkthroughOpen} />
        </Suspense>
      ) : null}

      <div className="flex-1" />
    </div>
  );
}
