import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Info, Settings, X } from "lucide-react";

import type { LevelDefinition } from "@lumaloop/engine";

import { ROBOT_COLOR_IDS, ROBOT_PALETTES, type RobotColorId } from "../features/game/robotColors";
import { useI18n } from "../i18n/I18nProvider";

export function GameMenu({
  level,
  onSetRobotColorId,
  onSetShowAllActions,
  robotColorId,
  showAllActions,
}: {
  level: LevelDefinition;
  onSetRobotColorId: (value: RobotColorId) => void;
  onSetShowAllActions: (value: boolean) => void;
  robotColorId: RobotColorId;
  showAllActions: boolean;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [isHintOpen, setIsHintOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hintText = level.metadata?.designerNotes ?? t.defaultHint;

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setIsHintOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  useEffect(() => {
    if (!isHintOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsHintOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isHintOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-label={t.menu}
        className="ui-button h-8 w-8 justify-center px-0"
        onClick={() => {
          setOpen((value) => !value);
          setIsHintOpen(false);
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
            </div>
            <button className="ui-button h-8 w-8 justify-center" onClick={() => setOpen(false)} type="button">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2">
            <button
              aria-pressed={showAllActions}
              className="ui-button flex w-full items-center justify-between rounded-[14px] px-4 py-3 text-left"
              onClick={() => onSetShowAllActions(!showAllActions)}
              type="button"
            >
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-primary)]">
                  {showAllActions ? t.allActions : t.levelOnly}
                </p>
                <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                  {showAllActions ? t.showingFullCommandSet : t.showingLevelCommands}
                </p>
              </div>
              <span
                className={[
                  "relative ml-3 inline-flex h-6 w-11 shrink-0 rounded-full border transition-[background-color,border-color] duration-200 ease-out",
                  showAllActions
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-[var(--panel-border)] bg-black/15",
                ].join(" ")}
              >
                <span
                  className={[
                    "absolute top-0.5 left-0.5 h-4.5 w-4.5 rounded-full bg-[var(--text-primary)] shadow-[0_2px_8px_rgba(0,0,0,0.28)] transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    showAllActions ? "translate-x-[22px]" : "translate-x-0",
                  ].join(" ")}
                />
              </span>
            </button>

            <div className="ui-button w-full rounded-[14px] px-4 py-3">
              <div className="flex w-full items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-primary)]">{t.robotColor}</p>
                  <p className="mt-1 text-[11px] text-[var(--text-muted)]">{robotColorId}</p>
                </div>
                <div className="ml-auto flex max-w-[136px] flex-wrap justify-end gap-1.5">
                  {ROBOT_COLOR_IDS.map((colorId) => (
                    <button
                      aria-label={colorId}
                      className={[
                        "h-7 w-7 rounded-full border transition",
                        robotColorId === colorId
                          ? "border-[var(--accent)] shadow-[0_0_0_1px_var(--accent),0_0_10px_var(--accent-shadow)]"
                          : "border-[var(--panel-border)]",
                      ].join(" ")}
                      key={colorId}
                      onClick={() => onSetRobotColorId(colorId)}
                      style={{ backgroundColor: ROBOT_PALETTES[colorId].swatch }}
                      type="button"
                    />
                  ))}
                </div>
              </div>
            </div>

            <button
              className="ui-button flex w-full items-center justify-between rounded-[14px] px-4 py-3 text-left"
              onClick={() => {
                setOpen(false);
                setIsHintOpen(true);
              }}
              type="button"
            >
              <span className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-primary)]">{t.hint}</span>
              <Info className="h-4 w-4 text-[var(--text-muted)]" />
            </button>
          </div>
        </div>
      ) : null}

      {isHintOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4 md:p-6"
              onClick={() => setIsHintOpen(false)}
            >
              <div
                className="ui-panel w-full max-w-[40rem] rounded-[22px] p-5 text-[var(--text-primary)] shadow-[0_24px_90px_rgba(0,0,0,0.42)] md:p-6"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">{t.hint}</p>
                    <h3 className="mt-1 text-xl font-semibold tracking-tight">{level.name}</h3>
                  </div>
                  <button className="ui-button h-8 w-8 justify-center" onClick={() => setIsHintOpen(false)} type="button">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-5 text-[15px] leading-7 text-[var(--text-secondary)]">{hintText}</p>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
