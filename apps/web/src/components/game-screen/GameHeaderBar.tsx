import { Suspense, lazy, useEffect, useRef, useState } from "react";

import { CircleHelp, ChevronDown } from "lucide-react";

import type { LevelDefinition } from "@lumaloop/engine";

import type { RobotColorId } from "../../features/game/robotColors";
import type { LevelProgressState } from "../../screens/game-screen/levelProgressStorage";
import { useI18n } from "../../i18n/I18nProvider";
import { BrandLogo } from "../BrandLogo";
import { GameMenu } from "../GameMenu";
import { LanguageSelect } from "../LanguageSelect";
import { GameStatusSnackbar, type GameStatusFeedback } from "./GameStatusSnackbar";
import { LevelMapBackdrop, type LevelMapSection } from "./LevelMapBackdrop";
import { RunModeSplitButton } from "./RunModeSplitButton";

const GameWalkthroughDialog = lazy(async () => {
  const module = await import("./GameWalkthroughDialog");
  return { default: module.GameWalkthroughDialog };
});

type HeaderHelpTone = "info" | "success" | "warning" | "error" | "invalid";

interface HeaderHelpPopover {
  controlsBody?: string;
  feedback?: { body: string; title: string; tone: HeaderHelpTone } | null;
  goalLabel: string;
  guideBody: string;
  guideHint: string;
  guideTitle: string;
}

interface HeaderObjectivePopover {
  objectiveBody: string;
  objectiveLabel: string;
  objectiveTitle: string;
}

interface HeaderMenuConfig {
  extraActions?: Array<{ label: string; onSelect: () => void }>;
  onReplayTutorial?: () => void;
  onSetRobotColorId?: (value: RobotColorId) => void;
  onSetShowAllActions?: (value: boolean) => void;
  robotColorId?: RobotColorId;
  showAllActions?: boolean;
  titleEyebrow?: string;
}

interface GameHeaderBarProps {
  canStartRun: boolean;
  currentLevelIndex: number;
  isAutoRunning: boolean;
  isLevelMapOpen: boolean;
  levelId: string;
  levelName: string;
  levelProgress: LevelProgressState;
  localizedLevels?: LevelDefinition[];
  levelMapSections?: LevelMapSection[];
  menu?: HeaderMenuConfig;
  objectivePopover?: HeaderObjectivePopover;
  onCloseLevelMap: () => void;
  onOpenLevelMap: () => void;
  onRunWithMode: (mode: "normal" | "fast" | "instant" | "pov") => void;
  runFeedback?: GameStatusFeedback | null;
  onSetLevelIndex: (index: number) => void;
  onToggleRun: () => void;
  selectedRunMode: "normal" | "fast" | "instant" | "pov";
  unlockedLevels: boolean[];
  helpPopover?: HeaderHelpPopover;
}

function cx(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

function getHelpToneClass(tone: HeaderHelpTone) {
  switch (tone) {
    case "success":
      return "border-emerald-300/55 bg-emerald-300/12 text-emerald-50";
    case "warning":
      return "border-amber-300/55 bg-amber-300/12 text-amber-50";
    case "error":
      return "border-rose-300/55 bg-rose-300/12 text-rose-50";
    case "invalid":
      return "border-rose-300/65 bg-rose-300/14 text-rose-50";
    default:
      return "border-sky-200/45 bg-sky-200/10 text-slate-100";
  }
}

export function GameHeaderBar({
  canStartRun,
  currentLevelIndex,
  isAutoRunning,
  isLevelMapOpen,
  levelId,
  levelName,
  levelProgress,
  localizedLevels,
  levelMapSections,
  menu,
  objectivePopover,
  onCloseLevelMap,
  onOpenLevelMap,
  onRunWithMode,
  runFeedback,
  onSetLevelIndex,
  onToggleRun,
  selectedRunMode,
  unlockedLevels,
  helpPopover,
}: GameHeaderBarProps) {
  const { t } = useI18n();
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isObjectiveOpen, setIsObjectiveOpen] = useState(false);
  const [hasOpenedLevelMap, setHasOpenedLevelMap] = useState(false);
  const [hasOpenedWalkthrough, setHasOpenedWalkthrough] = useState(false);
  const helpRef = useRef<HTMLDivElement | null>(null);
  const objectiveRef = useRef<HTMLDivElement | null>(null);
  const menuProps = {
    title: levelName,
    ...(menu?.extraActions !== undefined ? { extraActions: menu.extraActions } : {}),
    ...(menu?.onReplayTutorial !== undefined ? { onReplayTutorial: menu.onReplayTutorial } : {}),
    ...(menu?.onSetRobotColorId !== undefined ? { onSetRobotColorId: menu.onSetRobotColorId } : {}),
    ...(menu?.onSetShowAllActions !== undefined ? { onSetShowAllActions: menu.onSetShowAllActions } : {}),
    ...(menu?.robotColorId !== undefined ? { robotColorId: menu.robotColorId } : {}),
    ...(menu?.showAllActions !== undefined ? { showAllActions: menu.showAllActions } : {}),
    ...(menu?.titleEyebrow !== undefined ? { titleEyebrow: menu.titleEyebrow } : {}),
  };
  const levelMapProps = {
    currentLevelId: levelId,
    isOpen: isLevelMapOpen,
    levelProgress,
    onClose: onCloseLevelMap,
    onSelectLevel: onSetLevelIndex,
    unlockedLevels,
    ...(localizedLevels !== undefined ? { localizedLevels } : {}),
    ...(levelMapSections !== undefined ? { sections: levelMapSections } : {}),
  };

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

  useEffect(() => {
    if (!helpPopover || !isHelpOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!helpRef.current?.contains(event.target as Node)) {
        setIsHelpOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsHelpOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [helpPopover, isHelpOpen]);

  useEffect(() => {
    if (!objectivePopover || !isObjectiveOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!objectiveRef.current?.contains(event.target as Node)) {
        setIsObjectiveOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsObjectiveOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isObjectiveOpen, objectivePopover]);

  useEffect(() => {
    setIsHelpOpen(false);
    setIsObjectiveOpen(false);
    setIsWalkthroughOpen(false);
  }, [currentLevelIndex, isAutoRunning]);

  return (
    <div className="pointer-events-none relative z-10 flex min-h-[calc(100vh-3rem)] flex-col">
      <div className="pointer-events-none relative xl:pr-[364px]">
        <div
          className="ui-gloss-panel pointer-events-auto relative z-20 grid gap-3 px-4 py-2.5 md:grid-cols-[1fr_auto_1fr] md:items-center"
          dir="ltr"
        >
          <div className="flex items-center gap-2 md:justify-self-start">
            <GameMenu {...menuProps} />
            <LanguageSelect />
            <div className="relative" ref={helpRef}>
              <button
                aria-label={helpPopover ? "Help" : t.walkthroughOpen}
                className="ui-button h-8 w-8 justify-center rounded-full px-0 font-display text-sm font-semibold text-[var(--text-primary)]"
                onClick={() => {
                  if (helpPopover) {
                    setIsHelpOpen((value) => !value);
                    return;
                  }

                  setHasOpenedWalkthrough(true);
                  setIsWalkthroughOpen(true);
                }}
                title={helpPopover ? "Help" : t.walkthroughOpen}
                type="button"
              >
                ?
              </button>

              {helpPopover && isHelpOpen ? (
                <div className="ui-panel absolute left-0 top-[calc(100%+10px)] z-30 w-[min(24rem,calc(100vw-2rem))] rounded-[16px] p-3.5 text-[var(--text-primary)]">
                  {helpPopover.feedback ? (
                    <div className={cx("rounded-[12px] border px-3 py-3", getHelpToneClass(helpPopover.feedback.tone))}>
                      <p className="text-[10px] uppercase tracking-[0.16em] opacity-75">Latest feedback</p>
                      <p className="mt-1 text-sm font-semibold">{helpPopover.feedback.title}</p>
                      <p className="mt-1 text-sm leading-6 opacity-90">{helpPopover.feedback.body}</p>
                    </div>
                  ) : null}
                  <div className={cx("rounded-[12px] border border-white/8 bg-white/4 px-3 py-3", helpPopover.feedback && "mt-3")}>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">Goal</p>
                    <p className="mt-1 text-sm text-[var(--text-primary)]">{helpPopover.goalLabel}</p>
                  </div>
                  <div className="mt-3 rounded-[12px] border border-white/8 bg-white/4 px-3 py-3">
                    <h2 className="font-display text-lg text-white">{helpPopover.guideTitle}</h2>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{helpPopover.guideBody}</p>
                    <p className="mt-3 rounded-[10px] border border-[var(--accent-soft)] bg-[var(--accent-soft)] px-3 py-2 text-sm leading-6 text-white/90">
                      {helpPopover.guideHint}
                    </p>
                  </div>
                  <div className="mt-3 rounded-[12px] border border-white/8 bg-white/4 px-3 py-3">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">Controls</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                      {helpPopover.controlsBody ?? "Enter toggles the run button. Drag the scene to orbit the camera."}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 text-center md:justify-self-center">
            <h1>
              <BrandLogo className="text-[clamp(1.15rem,1.35vw,1.5rem)] font-semibold tracking-[0.08em]" strokeWidth={0.85} />
            </h1>
            <div className="pointer-events-auto relative flex items-center gap-2" ref={objectiveRef}>
              <button
                aria-expanded={isLevelMapOpen}
                className="ui-button flex h-9 items-center gap-2 rounded-[12px] px-3 text-left"
                onClick={() => {
                  setHasOpenedLevelMap(true);
                  onOpenLevelMap();
                }}
                type="button"
              >
                <span className="max-w-[min(42vw,19rem)] truncate text-[0.72rem] font-medium text-[var(--text-primary)] md:text-[0.78rem]">
                  {t.level} {currentLevelIndex + 1}: {levelName}
                </span>
                <ChevronDown
                  className={[
                    "h-3.5 w-3.5 shrink-0 text-[var(--text-muted)] transition",
                    isLevelMapOpen ? "rotate-180" : "",
                  ].join(" ")}
                />
              </button>
              {objectivePopover ? (
                <>
                  <button
                    aria-expanded={isObjectiveOpen}
                    aria-label={objectivePopover.objectiveTitle}
                    className="ui-button flex h-9 w-9 items-center justify-center rounded-[12px] px-0"
                    onClick={() => {
                      setIsObjectiveOpen((value) => !value);
                    }}
                    title={objectivePopover.objectiveTitle}
                    type="button"
                  >
                    <CircleHelp className="h-4 w-4" />
                  </button>
                  {isObjectiveOpen ? (
                    <div className="ui-panel absolute left-1/2 top-[calc(100%+10px)] z-30 w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 rounded-[16px] p-3.5 text-left text-[var(--text-primary)]">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">{objectivePopover.objectiveTitle}</p>
                      <div className="mt-3 rounded-[12px] border border-white/8 bg-white/4 px-3 py-3">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">Objective</p>
                        <p className="mt-1 text-sm text-[var(--text-primary)]">{objectivePopover.objectiveLabel}</p>
                      </div>
                      <div className="mt-3 rounded-[12px] border border-white/8 bg-white/4 px-3 py-3">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">Mission Brief</p>
                        <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{objectivePopover.objectiveBody}</p>
                      </div>
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          </div>

          <div className="pointer-events-auto relative z-20 flex items-center justify-end gap-2 md:justify-self-end">
            <div data-onboarding="run-button">
              <RunModeSplitButton
                canStartRun={canStartRun}
                isRunning={isAutoRunning}
                labels={{ pause: t.pause, runOptions: t.runOptions }}
                onRunWithMode={onRunWithMode}
                onToggleRun={onToggleRun}
                options={[
                  { label: t.play, mode: "normal" },
                  { label: t.fastPlay, mode: "fast" },
                  { label: t.povMode, mode: "pov" },
                  { label: t.skipToEnd, mode: "instant" },
                ]}
                selectedRunMode={selectedRunMode}
              />
            </div>
          </div>
        </div>

        <GameStatusSnackbar
          className="absolute right-4 top-[calc(100%+20px)] z-10 w-[min(24rem,calc(100vw-2rem))] xl:right-[380px]"
          feedback={runFeedback ?? null}
        />
      </div>

      {hasOpenedLevelMap ? (
        <LevelMapBackdrop {...levelMapProps} />
      ) : null}
      {!helpPopover && hasOpenedWalkthrough ? (
        <Suspense fallback={null}>
          <GameWalkthroughDialog onClose={() => setIsWalkthroughOpen(false)} open={isWalkthroughOpen} />
        </Suspense>
      ) : null}

      <div className="flex-1" />
    </div>
  );
}
