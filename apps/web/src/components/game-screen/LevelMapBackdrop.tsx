import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";

import { ArrowLeft, LockKeyhole, Sparkles, Star } from "lucide-react";

import type { Command, LevelDefinition } from "@lumaloop/engine";

import { useI18n } from "../../i18n/I18nProvider";
import type { LevelStarProgress } from "../../screens/game-screen/levelProgressStorage";

interface LevelMapBackdropProps {
  currentLevelId: string;
  isOpen: boolean;
  localizedLevels: LevelDefinition[];
  onClose: () => void;
  onSelectLevel: (index: number) => void;
  progressByLevelId: LevelStarProgress;
  unlockedLevels: boolean[];
}

function titleCase(value: string) {
  return value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function parseWorldName(worldId: string) {
  const [, , ...rest] = worldId.split("-");

  return titleCase(rest.join(" "));
}

function renderStars(count: number, activeClassName: string, idleClassName: string) {
  return Array.from({ length: 3 }, (_, index) => (
    <Star
      className={[
        "h-3.5 w-3.5 transition",
        index < count ? `${activeClassName} fill-current` : idleClassName,
      ].join(" ")}
      key={index}
    />
  ));
}

export function LevelMapBackdrop({
  currentLevelId,
  isOpen,
  localizedLevels,
  onClose,
  onSelectLevel,
  progressByLevelId,
  unlockedLevels,
}: LevelMapBackdropProps) {
  const { t } = useI18n();
  const currentLevelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && currentLevelRef.current) {
      currentLevelRef.current.scrollIntoView({ behavior: "instant", block: "center" });
    }
  }, [isOpen]);

  const worldGroups = useMemo(() => {
    const seenCommands = new Set<Command>();
    const groups = new Map<string, {
      focusLabels: string[];
      levels: Array<{
        badgeLabel: string | null;
        index: number;
        isCurrent: boolean;
        isLocked: boolean;
        level: LevelDefinition;
        stars: number;
      }>;
      totalStars: number;
    }>();

    localizedLevels.forEach((level, index) => {
      const levelStars = progressByLevelId[level.id] ?? 0;
      const newCommands = level.allowedCommands.filter((command) => !seenCommands.has(command));

      for (const command of level.allowedCommands) {
        seenCommands.add(command);
      }

      const group = groups.get(level.world) ?? {
        focusLabels: [],
        levels: [],
        totalStars: 0,
      };

      const newCommandLabels = newCommands.map((command) => t.commandLabels[command]);
      for (const label of newCommandLabels) {
        if (!group.focusLabels.includes(label)) {
          group.focusLabels.push(label);
        }
      }

      group.levels.push({
        badgeLabel: newCommandLabels[0] ? t.newMechanic(newCommandLabels[0]) : null,
        index,
        isCurrent: level.id === currentLevelId,
        isLocked: !unlockedLevels[index],
        level,
        stars: levelStars,
      });
      group.totalStars += levelStars;
      groups.set(level.world, group);
    });

    return Array.from(groups.entries()).map(([worldId, group], worldOrderIndex) => {
      const worldName = parseWorldName(worldId);

      return {
        completedCount: group.levels.filter((levelEntry) => levelEntry.stars > 0).length,
        focusLine:
          group.focusLabels.length > 0
            ? group.focusLabels.join(" · ")
            : group.levels[0]?.level.metadata?.concept ?? group.levels[0]?.level.name ?? "",
        id: worldId,
        levels: group.levels,
        maxStars: group.levels.length * 3,
        title: t.worldLabel(worldOrderIndex + 1, worldName),
        totalStars: group.totalStars,
      };
    });
  }, [currentLevelId, localizedLevels, progressByLevelId, t, unlockedLevels]);

  return createPortal(
    <div
      aria-hidden={!isOpen}
      className={[
        "fixed inset-0 z-[90] overflow-hidden bg-[rgba(3,7,13,0.7)] backdrop-blur-[18px] transition-all duration-300 ease-out",
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
      ].join(" ")}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(31,229,239,0.12),transparent_28%),radial-gradient(circle_at_84%_24%,rgba(255,156,84,0.08),transparent_24%),radial-gradient(circle_at_50%_78%,rgba(108,147,255,0.08),transparent_26%)]" />

      <div className="relative flex h-full flex-col px-4 py-4 md:px-6 md:py-5">
        <div
          className={[
            "relative mx-auto flex w-full max-w-[1920px] flex-1 flex-col overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            isOpen ? "translate-y-0 scale-100 opacity-100 delay-75" : "translate-y-4 scale-[0.98] opacity-0",
          ].join(" ")}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-5 py-4 md:px-7">
            <button
              className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
              onClick={onClose}
              type="button"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t.backToPuzzle}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 pb-10 pt-5 md:px-7">
            <div className="space-y-7">
              {worldGroups.map((world) => {
                const isWorldReached = world.levels.some(level => !level.isLocked);

                return (
                  <section
                    className={[
                      "relative overflow-hidden rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.02)_100%)] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
                      !isWorldReached ? "grayscale" : ""
                    ].join(" ")}
                    key={world.id}
                  >
                    <div className="relative">
                      <div className={["flex flex-col gap-2 md:flex-row md:items-end md:justify-between", !isWorldReached ? "opacity-40" : ""].join(" ")}>
                        <div>
                          <h2 className="font-display text-[clamp(1.15rem,1.35vw,1.5rem)] font-semibold tracking-[0.01em] text-[var(--text-primary)]">
                            {world.title}
                          </h2>
                          <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                            {t.worldTheme(world.focusLine)}
                          </p>
                        </div>
                        <div className="text-[11px] font-medium text-[var(--text-secondary)] md:text-right md:text-xs">
                          {t.worldProgressSummary(
                            world.completedCount,
                            world.levels.length,
                            world.totalStars,
                            world.maxStars,
                          )}
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(9.5rem,10.25rem))] justify-center gap-4 lg:justify-start">
                        {world.levels.map((levelEntry) => {
                          const isCurrent = levelEntry.isCurrent;
                          const isCompleted = levelEntry.stars > 0;

                          return (
                            <button
                              ref={isCurrent ? currentLevelRef : null}
                              className={[
                                "group relative flex h-[11rem] w-full max-w-[10.25rem] flex-col overflow-hidden rounded-[24px] p-4 text-left transition-all duration-300 ease-out will-change-transform",
                                "before:absolute before:inset-0 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.12),transparent_40%)] before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100 before:content-['']",
                                "after:absolute after:inset-0 after:bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent_50%)] after:content-['']",
                                isCurrent
                                  ? "border-2 border-[#00f2ff] bg-[rgba(0,242,255,0.05)] text-[#00f2ff] scale-[1.02] -translate-y-1 shadow-[0_0_15px_rgba(0,242,255,0.2)]"
                                  : levelEntry.isLocked
                                    ? "pointer-events-none border border-white/5 bg-[rgba(255,255,255,0.03)] text-white/50"
                                    : isCompleted
                                      ? "border border-[#ffd700] bg-[linear-gradient(180deg,rgba(40,50,65,0.6)_0%,rgba(15,20,30,0.7)_100%)] text-[var(--text-primary)] shadow-[0_0_10px_#ffd70044] hover:-translate-y-1.5 hover:shadow-[0_0_15px_#ffd70066]"
                                      : "border border-[#444] bg-[linear-gradient(180deg,rgba(45,52,65,0.5)_0%,rgba(18,22,32,0.6)_100%)] text-[var(--text-secondary)] opacity-100 hover:-translate-y-1.5 hover:border-[#666]",
                              ].join(" ")}
                              disabled={levelEntry.isLocked}
                              key={levelEntry.level.id}
                              onClick={() => {
                                onSelectLevel(levelEntry.index);
                                onClose();
                              }}
                              type="button"
                            >
                              <div className="relative z-10 flex h-full flex-col">
                                <div className="text-[0.72rem] uppercase tracking-[0.08em] opacity-80">
                                  {t.level} {String(levelEntry.index + 1).padStart(2, "0")}
                                </div>
                                <h3 className="mt-2 line-clamp-3 text-[0.92rem] font-semibold leading-5">
                                  {levelEntry.level.name}
                                </h3>

                                <div className="mt-auto">
                                  {levelEntry.badgeLabel ? (
                                    <div
                                      className={[
                                        "mb-2.5 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] backdrop-blur-sm",
                                        isCurrent
                                          ? "border-[#00f2ff]/50 bg-[#00f2ff]/10 text-[#00f2ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]"
                                          : "border-white/20 bg-white/5 text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]",
                                      ].join(" ")}
                                    >
                                      <Sparkles className="h-3 w-3" />
                                      {levelEntry.badgeLabel}
                                    </div>
                                  ) : (
                                    <div className="mb-2.5 h-[22px]" />
                                  )}

                                  {levelEntry.isLocked ? (
                                    <div className="flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.1em] text-white/45">
                                      <LockKeyhole className="h-3.5 w-3.5" />
                                      {t.locked}
                                    </div>
                                  ) : (
                                    <>
                                      <p className={["text-[0.72rem]", isCurrent ? "text-[#00f2ff]/80" : "text-[var(--text-muted)]"].join(" ")}>
                                        {t.starsProgress(levelEntry.stars, 3)}
                                      </p>
                                      <div className={["mt-1.5 flex gap-1", isCurrent ? "text-[#00f2ff]" : ""].join(" ")}>
                                        {renderStars(
                                          levelEntry.stars,
                                          isCurrent ? "text-[#00f2ff]" : "text-[#ffd700]",
                                          isCurrent ? "text-[#00f2ff]/35" : "text-[#ffd700]/18",
                                        )}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
