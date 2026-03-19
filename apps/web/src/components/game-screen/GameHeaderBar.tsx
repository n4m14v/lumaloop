import { useEffect, useRef, useState } from "react";

import { ChevronDown, Play } from "lucide-react";

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
  onSetLevelIndex: (index: number) => void;
  onSetRobotColorId: (value: RobotColorId) => void;
  onSetShowAllActions: (value: boolean) => void;
  onToggleRun: () => void;
  onToggleTheme: () => void;
  robotColorId: RobotColorId;
  showAllActions: boolean;
  theme: "dark" | "light";
  unlockedLevels: boolean[];
}

export function GameHeaderBar({
  canStartRun,
  currentLevelIndex,
  isAutoRunning,
  level,
  localizedLevels,
  onSetLevelIndex,
  onSetRobotColorId,
  onSetShowAllActions,
  onToggleRun,
  onToggleTheme,
  robotColorId,
  showAllActions,
  theme,
  unlockedLevels,
}: GameHeaderBarProps) {
  const { t } = useI18n();
  const [isLevelMenuOpen, setIsLevelMenuOpen] = useState(false);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);
  const levelMenuRef = useRef<HTMLDivElement | null>(null);

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

  return (
    <div className="pointer-events-none relative z-10 flex min-h-[calc(100vh-3rem)] flex-col">
      <div className="pointer-events-none relative xl:pr-[364px]">
        <div
          className="ui-gloss-panel pointer-events-auto grid gap-3 px-4 py-2.5 md:grid-cols-[auto_1fr_auto] md:items-center xl:pr-20"
          dir="ltr"
        >
          <div className="flex items-center gap-2">
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

          <div className="flex items-center justify-center gap-3 text-center">
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

          <div className="flex items-center justify-start gap-2 md:justify-end">
            <button
              className="ui-button-accent inline-flex h-9 min-w-[120px] items-center justify-center gap-2 rounded-[12px] px-4 text-xs font-semibold uppercase tracking-[0.08em] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!isAutoRunning && !canStartRun}
              onClick={onToggleRun}
              type="button"
            >
              <Play className="h-4 w-4 fill-current" />
              {isAutoRunning ? t.pause : t.play}
            </button>
          </div>
        </div>
      </div>

      <GameWalkthroughDialog onClose={() => setIsWalkthroughOpen(false)} open={isWalkthroughOpen} />

      <div className="flex-1" />
    </div>
  );
}
