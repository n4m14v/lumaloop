import { useEffect, useRef, useState } from "react";

import { ChevronDown, Pause, Play, SkipForward } from "lucide-react";

import type { LevelDefinition } from "@lumaloop/engine";

import type { RobotColorId } from "../../features/game/robotColors";
import { useI18n } from "../../i18n/I18nProvider";
import { GameMenu } from "../GameMenu";
import { LanguageSelect } from "../LanguageSelect";
import { ThemeToggle } from "../ThemeToggle";
import { GameWalkthroughDialog } from "./GameWalkthroughDialog";

interface GameHeaderBarProps {
  canStartRun: boolean;
  currentLevelIndex: number;
  isAutoRunning: boolean;
  level: LevelDefinition;
  localizedLevels: LevelDefinition[];
  onRunWithMode: (mode: "normal" | "fast" | "instant") => void;
  onSetLevelIndex: (index: number) => void;
  onSetRobotColorId: (value: RobotColorId) => void;
  onSetShowAllActions: (value: boolean) => void;
  onToggleRun: () => void;
  onToggleTheme: () => void;
  robotColorId: RobotColorId;
  selectedRunMode: "normal" | "fast" | "instant";
  showAllActions: boolean;
  theme: "dark" | "light";
  unlockedLevels: boolean[];
}

function RunModeIcon({ mode }: { mode: "normal" | "fast" | "instant" }) {
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
  level,
  localizedLevels,
  onRunWithMode,
  onSetLevelIndex,
  onSetRobotColorId,
  onSetShowAllActions,
  onToggleRun,
  onToggleTheme,
  robotColorId,
  selectedRunMode,
  showAllActions,
  theme,
  unlockedLevels,
}: GameHeaderBarProps) {
  const { t } = useI18n();
  const [isLevelMenuOpen, setIsLevelMenuOpen] = useState(false);
  const [isRunMenuOpen, setIsRunMenuOpen] = useState(false);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);
  const levelMenuRef = useRef<HTMLDivElement | null>(null);
  const runMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isLevelMenuOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!levelMenuRef.current?.contains(event.target as Node)) {
        setIsLevelMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isLevelMenuOpen]);

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

  const selectedRunLabel =
    selectedRunMode === "fast" ? t.fastPlay : selectedRunMode === "instant" ? t.skipToEnd : t.play;

  return (
    <div className="pointer-events-none relative z-10 flex min-h-[calc(100vh-3rem)] flex-col">
      <div className="pointer-events-none relative xl:pr-[364px]">
        <div
          className="ui-gloss-panel pointer-events-auto grid gap-3 px-4 py-2.5 md:grid-cols-[1fr_auto_1fr] md:items-center"
          dir="ltr"
        >
          <div className="flex items-center gap-2 md:justify-self-start">
            <GameMenu
              level={level}
              onSetRobotColorId={onSetRobotColorId}
              onSetShowAllActions={onSetShowAllActions}
              robotColorId={robotColorId}
              showAllActions={showAllActions}
            />
            <LanguageSelect />
            <ThemeToggle onToggle={onToggleTheme} theme={theme} />
            <button
              aria-label={t.walkthroughOpen}
              className="ui-button h-8 w-8 justify-center rounded-full px-0 font-display text-sm font-semibold text-[var(--text-primary)]"
              onClick={() => setIsWalkthroughOpen(true)}
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
            <div className="relative pointer-events-auto" ref={levelMenuRef}>
              <button
                aria-expanded={isLevelMenuOpen}
                className="ui-button flex h-9 items-center gap-2 rounded-[12px] px-3 text-left"
                onClick={() => setIsLevelMenuOpen((value) => !value)}
                type="button"
              >
                <span className="max-w-[min(42vw,19rem)] truncate text-[0.72rem] font-medium text-[var(--text-primary)] md:text-[0.78rem]">
                  {t.level} {currentLevelIndex + 1}: {level.name}
                </span>
                <ChevronDown
                  className={[
                    "h-3.5 w-3.5 shrink-0 text-[var(--text-muted)] transition",
                    isLevelMenuOpen ? "rotate-180" : "",
                  ].join(" ")}
                />
              </button>

              {isLevelMenuOpen ? (
                <div className="ui-panel absolute left-0 top-[calc(100%+10px)] z-30 max-h-[min(26rem,calc(100vh-10rem))] w-[min(26rem,78vw)] overflow-y-auto rounded-[16px] p-2.5 text-[var(--text-primary)]">
                  <div className="space-y-1">
                    {localizedLevels.map((levelOption, index) => (
                      <button
                        className={[
                          "flex w-full items-center justify-between rounded-[10px] px-3 py-2 text-left text-[12px] transition",
                          index === currentLevelIndex
                            ? "bg-[var(--accent-soft)] text-[var(--text-primary)]"
                            : unlockedLevels[index]
                              ? "text-[var(--text-secondary)] hover:bg-white/5"
                              : "cursor-not-allowed text-[var(--text-muted)] opacity-45",
                        ].join(" ")}
                        disabled={!unlockedLevels[index]}
                        key={levelOption.id}
                        onClick={() => {
                          onSetLevelIndex(index);
                          setIsLevelMenuOpen(false);
                        }}
                        type="button"
                      >
                        <span className="truncate">{t.levelOptionLabel(index + 1, levelOption.name)}</span>
                        <span className="ml-3 text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)]">
                          {index === currentLevelIndex ? "•" : ""}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
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
      </div>

      <GameWalkthroughDialog onClose={() => setIsWalkthroughOpen(false)} open={isWalkthroughOpen} />

      <div className="flex-1" />
    </div>
  );
}
