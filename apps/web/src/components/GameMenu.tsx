import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { Check, ChevronRight, Settings, X } from "lucide-react";

import type { LevelDefinition, RunResult } from "@lumaloop/engine";

import { ROBOT_COLOR_IDS, ROBOT_PALETTES, type RobotColorId } from "../features/game/robotColors";
import type { PlaybackSpeed } from "../features/game/store";
import { useI18n } from "../i18n/I18nProvider";
import { LOCALE_OPTIONS, getRunStatusMessage } from "../i18n/translations";

type SubmenuId = "level" | "actions" | "robot" | "status" | "hint";

function SegmentButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center rounded-[12px] px-3 py-2 text-[11px] font-medium transition",
        active
          ? "ui-button-accent"
          : "ui-button border-[var(--panel-border)] bg-transparent text-[var(--text-secondary)]",
      ].join(" ")}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function OptionList({
  className,
  options,
}: {
  className?: string;
  options: Array<{
    active: boolean;
    label: string;
    onClick: () => void;
  }>;
}) {
  return (
    <div className={["space-y-1", className ?? ""].join(" ").trim()}>
      {options.map((option) => (
        <button
          className={[
            "flex w-full items-center justify-between rounded-[10px] px-3 py-2 text-left text-[13px] transition",
            option.active
              ? "bg-[var(--accent-soft)] text-[var(--text-primary)]"
              : "text-[var(--text-secondary)] hover:bg-white/5",
          ].join(" ")}
          key={option.label}
          onClick={option.onClick}
          type="button"
        >
          <span>{option.label}</span>
          {option.active ? <Check className="h-4 w-4 text-[var(--accent)]" /> : null}
        </button>
      ))}
    </div>
  );
}

function SubmenuRow({
  active,
  children,
  id,
  isRtl,
  label,
  onCancelClose,
  onScheduleClose,
  onOpen,
  value,
}: {
  active: boolean;
  children: ReactNode;
  id: SubmenuId;
  isRtl: boolean;
  label: string;
  onCancelClose: () => void;
  onScheduleClose: () => void;
  onOpen: (id: SubmenuId) => void;
  value?: string;
}) {
  return (
    <div
      className="relative"
      onMouseEnter={() => {
        onCancelClose();
        onOpen(id);
      }}
      onMouseLeave={onScheduleClose}
    >
      <button
        className={[
          "ui-button flex w-full items-center justify-between px-4 py-2.5 text-left text-[10px] uppercase tracking-[0.08em]",
          active ? "border-[var(--accent)]" : "",
        ].join(" ")}
        onClick={() => onOpen(id)}
        onFocus={() => onOpen(id)}
        type="button"
      >
        <span className="text-[var(--text-primary)]">{label}</span>
        <span className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
          {value ? <span className="max-w-[118px] truncate normal-case tracking-normal">{value}</span> : null}
          <ChevronRight className={`h-4 w-4 transition ${active ? (isRtl ? "-rotate-180" : "rotate-90") : ""}`} />
        </span>
      </button>

      {active ? (
        <div
          className="ui-panel absolute top-[calc(100%+8px)] left-0 z-30 w-[280px] rounded-[16px] p-3.5 sm:left-[calc(100%+10px)] sm:top-0"
          onMouseEnter={onCancelClose}
          onMouseLeave={onScheduleClose}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function GameMenu({
  level,
  levels,
  levelIndex,
  onLevelChange,
  onSetRobotColorId,
  onSetShowAllActions,
  scoreStars,
  result,
  robotColorId,
  showAllActions,
  stepsTaken,
  targetsSummary,
}: {
  cameraRotationLocked: boolean;
  level: LevelDefinition;
  levels: LevelDefinition[];
  levelIndex: number;
  onLevelChange: (index: number) => void;
  onReset: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onSetRobotColorId: (value: RobotColorId) => void;
  onSetShowAllActions: (value: boolean) => void;
  onSetSpeed: (speed: PlaybackSpeed) => void;
  onStep: () => void;
  scoreStars: number;
  result: RunResult | null;
  robotColorId: RobotColorId;
  showAllActions: boolean;
  speed: PlaybackSpeed;
  stepsTaken: number;
  targetsSummary: string;
}) {
  const { isRtl, locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<SubmenuId | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const statusMessage = getRunStatusMessage(locale, result, "menu");
  const hintText = level.metadata?.designerNotes ?? t.defaultHint;



  function openSubmenu(id: SubmenuId) {
    setActiveSubmenu(id);
  }

  function cancelScheduledClose() {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function scheduleClose() {
    cancelScheduledClose();
    closeTimerRef.current = window.setTimeout(() => {
      setActiveSubmenu(null);
      closeTimerRef.current = null;
    }, 140);
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setActiveSubmenu(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-label={t.menu}
        className="ui-button h-8 w-8 justify-center px-0"
        onClick={() => {
          setOpen((value) => !value);
          setActiveSubmenu(null);
        }}
        title={t.menu}
        type="button"
      >
        <Settings className="h-4 w-4" />
      </button>

      {open ? (
        <div
          className="ui-panel absolute left-0 top-[calc(100%+10px)] z-20 max-h-[calc(100vh-96px)] w-[264px] overflow-visible rounded-[16px] p-3.5 text-[var(--text-primary)]"
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">{t.puzzleMenu}</p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight">{level.name}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] uppercase tracking-[0.1em] text-[var(--text-muted)]">
                <span>
                  {t.targets} <span className="text-[var(--text-primary)]">{targetsSummary}</span>
                </span>
                <span>
                  {t.steps} <span className="text-[var(--text-primary)]">[{stepsTaken}]</span>
                </span>
                <span>
                  {t.score}{" "}
                  <span className="tracking-[0.16em] text-[#ffd76a]">
                    {Array.from({ length: 3 }, (_, index) => (index < scoreStars ? "★" : "☆")).join("")}
                  </span>
                </span>
              </div>
            </div>
            <button className="ui-button h-8 w-8 justify-center" onClick={() => setOpen(false)} type="button">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2">


            <SubmenuRow
              active={activeSubmenu === "level"}
              id="level"
              isRtl={isRtl}
              label={t.level}
              onCancelClose={cancelScheduledClose}
              onScheduleClose={scheduleClose}
              onOpen={openSubmenu}
              value={`${levelIndex + 1}`}
            >
              <OptionList
                className="max-h-[min(26rem,calc(100vh-10rem))] overflow-y-auto pr-1"
                options={levels.map((levelOption, index) => ({
                  active: index === levelIndex,
                  label: t.levelOptionLabel(index + 1, levelOption.name),
                  onClick: () => onLevelChange(index),
                }))}
              />
            </SubmenuRow>

            <SubmenuRow
              active={activeSubmenu === "actions"}
              id="actions"
              isRtl={isRtl}
              label={t.actionView}
              onCancelClose={cancelScheduledClose}
              onScheduleClose={scheduleClose}
              onOpen={openSubmenu}
              value={showAllActions ? t.allActions : t.levelOnly}
            >
              <div className="grid grid-cols-2 gap-2">
                <SegmentButton active={showAllActions} label={t.allActions} onClick={() => onSetShowAllActions(true)} />
                <SegmentButton active={!showAllActions} label={t.levelOnly} onClick={() => onSetShowAllActions(false)} />
              </div>
            </SubmenuRow>

            <SubmenuRow
              active={activeSubmenu === "robot"}
              id="robot"
              isRtl={isRtl}
              label={t.robotColor}
              onCancelClose={cancelScheduledClose}
              onScheduleClose={scheduleClose}
              onOpen={openSubmenu}
              value={robotColorId}
            >
              <div className="grid grid-cols-3 gap-2">
                {ROBOT_COLOR_IDS.map((colorId) => (
                  <button
                    aria-label={colorId}
                    className={[
                      "h-10 rounded-[10px] border transition",
                      robotColorId === colorId
                        ? "border-[var(--accent)] shadow-[0_0_0_1px_var(--accent),0_0_18px_var(--accent-shadow)]"
                        : "border-[var(--panel-border)]",
                    ].join(" ")}
                    key={colorId}
                    onClick={() => onSetRobotColorId(colorId)}
                    style={{ backgroundColor: ROBOT_PALETTES[colorId].swatch }}
                    type="button"
                  />
                ))}
              </div>
            </SubmenuRow>

            <SubmenuRow
              active={activeSubmenu === "status"}
              id="status"
              isRtl={isRtl}
              label={t.status}
              onCancelClose={cancelScheduledClose}
              onScheduleClose={scheduleClose}
              onOpen={openSubmenu}
            >
              <div>
                <p className="text-[13px] leading-5 text-[var(--text-secondary)]">{statusMessage}</p>
                <p className="mt-2 text-xs text-[var(--text-muted)]">{level.metadata?.concept ?? t.programmingPuzzle}</p>
              </div>
            </SubmenuRow>

            <SubmenuRow
              active={activeSubmenu === "hint"}
              id="hint"
              isRtl={isRtl}
              label={t.hint}
              onCancelClose={cancelScheduledClose}
              onScheduleClose={scheduleClose}
              onOpen={openSubmenu}
            >
              <p className="text-[13px] leading-5 text-[var(--text-secondary)]">{hintText}</p>
            </SubmenuRow>
          </div>
        </div>
      ) : null}
    </div>
  );
}
