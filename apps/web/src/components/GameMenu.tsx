import { useState } from "react";

import { ChevronDown, Menu, RotateCcw, RotateCw, StepForward, X } from "lucide-react";

import type { LevelDefinition, RunResult } from "@lumaloop/engine";

import type { PlaybackSpeed } from "../features/game/store";
import { useI18n } from "../i18n/I18nProvider";
import { LOCALE_OPTIONS, getRunStatusMessage } from "../i18n/translations";

export function GameMenu({
  level,
  levels,
  levelIndex,
  onLevelChange,
  onReset,
  onRotateLeft,
  onRotateRight,
  onSetShowAllActions,
  onSetSpeed,
  onStep,
  result,
  showAllActions,
  speed,
}: {
  level: LevelDefinition;
  levels: LevelDefinition[];
  levelIndex: number;
  onLevelChange: (index: number) => void;
  onReset: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onSetShowAllActions: (value: boolean) => void;
  onSetSpeed: (speed: PlaybackSpeed) => void;
  onStep: () => void;
  result: RunResult | null;
  showAllActions: boolean;
  speed: PlaybackSpeed;
}) {
  const { isRtl, locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const statusMessage = getRunStatusMessage(locale, result, "menu");

  return (
    <div className="relative">
      <button
        className="inline-flex items-center gap-2 rounded-[18px] border-2 border-[#57a8c4] bg-[#4fc3e8] px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-white shadow-[0_8px_0_rgba(44,130,160,0.7)] transition hover:translate-y-[1px]"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <Menu className="h-4 w-4" />
        {t.menu}
        <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div
          className={[
            "absolute top-[calc(100%+12px)] z-20 w-[320px] rounded-[24px] border-2 border-[#8ca9bf] bg-[#f7f3c5] p-4 text-slate-700 shadow-[0_18px_40px_rgba(100,120,135,0.28)]",
            isRtl ? "right-0" : "left-0",
          ].join(" ")}
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">{t.puzzleMenu}</p>
              <h2 className="font-display text-2xl">{level.name}</h2>
            </div>
            <button
              className="rounded-full bg-white/70 p-2 text-slate-500"
              onClick={() => setOpen(false)}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{t.language}</label>
          <select
            className="mb-4 w-full rounded-[16px] border-2 border-[#9ab0c0] bg-white/80 px-4 py-3 text-sm font-semibold outline-none"
            onChange={(event) => setLocale(event.target.value as typeof locale)}
            value={locale}
          >
            {LOCALE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{t.level}</label>
          <select
            className="mb-4 w-full rounded-[16px] border-2 border-[#9ab0c0] bg-white/80 px-4 py-3 text-sm font-semibold outline-none"
            onChange={(event) => onLevelChange(Number(event.target.value))}
            value={levelIndex}
          >
            {levels.map((levelOption, index) => (
              <option key={levelOption.id} value={index}>
                {t.levelOptionLabel(index + 1, levelOption.name)}
              </option>
            ))}
          </select>

          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{t.speed}</p>
          <div className="mb-4 grid grid-cols-3 gap-2">
            {[1, 2, 4].map((value) => (
              <button
                className={[
                  "rounded-[14px] border-2 px-3 py-2 text-sm font-black transition",
                  speed === value
                    ? "border-[#57a8c4] bg-[#4fc3e8] text-white"
                    : "border-[#b7c6d2] bg-white/80 text-slate-500",
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={value}
                onClick={() => onSetSpeed(value as PlaybackSpeed)}
                type="button"
              >
                {value}x
              </button>
            ))}
          </div>

          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{t.tools}</p>
          <div className="mb-4 grid grid-cols-2 gap-2">
            <button className="control-btn-light" onClick={onStep} type="button">
              <StepForward className="h-4 w-4" /> {t.step}
            </button>
            <button className="control-btn-light" onClick={onReset} type="button">
              <RotateCcw className="h-4 w-4" /> {t.reset}
            </button>
            <button className="control-btn-light" onClick={onRotateLeft} type="button">
              <RotateCcw className="h-4 w-4" /> {t.cameraLeft}
            </button>
            <button className="control-btn-light" onClick={onRotateRight} type="button">
              <RotateCw className="h-4 w-4" /> {t.cameraRight}
            </button>
          </div>

          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{t.actionView}</p>
          <div className="mb-4 grid grid-cols-2 gap-2">
            <button
              className={[
                "rounded-[14px] border-2 px-3 py-2 text-sm font-black transition",
                showAllActions
                  ? "border-[#57a8c4] bg-[#4fc3e8] text-white"
                  : "border-[#b7c6d2] bg-white/80 text-slate-500",
              ].join(" ")}
              onClick={() => onSetShowAllActions(true)}
              type="button"
            >
              {t.allActions}
            </button>
            <button
              className={[
                "rounded-[14px] border-2 px-3 py-2 text-sm font-black transition",
                !showAllActions
                  ? "border-[#57a8c4] bg-[#4fc3e8] text-white"
                  : "border-[#b7c6d2] bg-white/80 text-slate-500",
              ].join(" ")}
              onClick={() => onSetShowAllActions(false)}
              type="button"
            >
              {t.levelOnly}
            </button>
          </div>

          <div className="rounded-[18px] bg-white/65 p-3">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{t.status}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{statusMessage}</p>
            <p className="mt-2 text-xs text-slate-500">{level.metadata?.concept ?? t.programmingPuzzle}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
