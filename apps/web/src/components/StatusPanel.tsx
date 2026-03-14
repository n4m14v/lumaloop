import { ArrowLeft, ArrowRight, Play, RotateCcw, Square, StepForward } from "lucide-react";

import type { LevelDefinition, RunResult } from "@lumaloop/engine";

import type { PlaybackSpeed } from "../features/game/store";
import { useI18n } from "../i18n/I18nProvider";
import { getRunStatusLabel, getRunStatusMessage } from "../i18n/translations";

export function StatusPanel({
  canStep,
  currentLevelIndex,
  level,
  levelCount,
  onLevelChange,
  onPause,
  onRotateLeft,
  onRotateRight,
  onRun,
  onSetSpeed,
  onStep,
  onStop,
  result,
  speed,
  stepCount,
  targetsLit,
  totalTargets,
}: {
  canStep: boolean;
  currentLevelIndex: number;
  level: LevelDefinition;
  levelCount: number;
  onLevelChange: (index: number) => void;
  onPause: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onRun: () => void;
  onSetSpeed: (speed: PlaybackSpeed) => void;
  onStep: () => void;
  onStop: () => void;
  result: RunResult | null;
  speed: PlaybackSpeed;
  stepCount: number;
  targetsLit: number;
  totalTargets: number;
}) {
  const { locale, t } = useI18n();
  const statusMessage = getRunStatusMessage(locale, result, "panel");

  return (
    <aside className="space-y-5">
      <section className="rounded-[28px] border border-white/10 bg-slate-950/60 p-5 shadow-[0_18px_60px_rgba(2,8,20,0.34)]">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-200/70">{t.campaign}</p>
            <h2 className="font-display text-2xl text-white">{level.name}</h2>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
            {currentLevelIndex + 1} / {levelCount}
          </span>
        </div>

        <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.28em] text-white/45">{t.selectLevel}</label>
        <select
          className="w-full rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
          onChange={(event) => onLevelChange(Number(event.target.value))}
          value={currentLevelIndex}
        >
          {Array.from({ length: levelCount }, (_, index) => (
            <option key={index} value={index}>
              {`${t.level} ${index + 1}`}
            </option>
          ))}
        </select>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-slate-950/60 p-5 shadow-[0_18px_60px_rgba(2,8,20,0.34)]">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-200/70">{t.execution}</p>
        <div className="grid grid-cols-2 gap-3">
          <button className="control-btn bg-cyan-300 text-slate-950" onClick={onRun} type="button">
            <Play className="h-4 w-4" /> {t.play}
          </button>
          <button className="control-btn" onClick={onPause} type="button">
            <Square className="h-4 w-4" /> {t.pause}
          </button>
          <button className="control-btn" disabled={!canStep} onClick={onStep} type="button">
            <StepForward className="h-4 w-4" /> {t.step}
          </button>
          <button className="control-btn" onClick={onStop} type="button">
            <RotateCcw className="h-4 w-4" /> {t.reset}
          </button>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/45">{t.speed}</p>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 4].map((option) => (
              <button
                className={[
                  "rounded-2xl border px-3 py-2 text-sm font-semibold transition",
                  speed === option
                    ? "border-cyan-300 bg-cyan-300 text-slate-950"
                    : "border-white/10 bg-slate-900/80 text-white/70 hover:border-white/25 hover:text-white",
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={option}
                onClick={() => onSetSpeed(option as PlaybackSpeed)}
                type="button"
              >
                {option}x
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/45">{t.camera}</p>
          <div className="grid grid-cols-2 gap-2">
            <button className="control-btn" onClick={onRotateLeft} type="button">
              <ArrowLeft className="h-4 w-4" /> {t.left}
            </button>
            <button className="control-btn" onClick={onRotateRight} type="button">
              <ArrowRight className="h-4 w-4" /> {t.right}
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-slate-950/60 p-5 shadow-[0_18px_60px_rgba(2,8,20,0.34)]">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-200/70">{t.debugger}</p>
        <dl className="grid grid-cols-2 gap-3 text-sm text-white/70">
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-3">
            <dt className="mb-1 text-xs uppercase tracking-[0.24em] text-white/40">{t.targets}</dt>
            <dd className="text-lg font-semibold text-white">{targetsLit} / {totalTargets}</dd>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-3">
            <dt className="mb-1 text-xs uppercase tracking-[0.24em] text-white/40">{t.steps}</dt>
            <dd className="text-lg font-semibold text-white">{stepCount}</dd>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-3">
            <dt className="mb-1 text-xs uppercase tracking-[0.24em] text-white/40">{t.concept}</dt>
            <dd>{level.metadata?.concept ?? t.programmingPuzzle}</dd>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-3">
            <dt className="mb-1 text-xs uppercase tracking-[0.24em] text-white/40">{t.status}</dt>
            <dd className={result?.status === "SUCCESS" ? "font-semibold text-emerald-300" : "font-semibold text-white"}>
              {getRunStatusLabel(locale, result)}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-sm leading-6 text-white/65">{statusMessage}</p>
      </section>
    </aside>
  );
}
