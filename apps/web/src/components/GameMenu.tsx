import { useState, type ChangeEventHandler, type ReactNode } from "react";

import { ChevronDown, Menu, Moon, SunMedium, X } from "lucide-react";

import type { LevelDefinition, RunResult } from "@lumaloop/engine";

import { ROBOT_COLOR_IDS, ROBOT_PALETTES, type RobotColorId } from "../features/game/robotColors";
import type { PlaybackSpeed } from "../features/game/store";
import { useI18n } from "../i18n/I18nProvider";
import { LOCALE_OPTIONS, getRunStatusMessage } from "../i18n/translations";

type ThemeMode = "dark" | "light";

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
        "inline-flex items-center justify-center rounded-[12px] px-3 py-2 text-xs font-medium transition",
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

function ThemeSwitch({
  checked,
  labelOff,
  labelOn,
  onChange,
}: {
  checked: boolean;
  labelOff: string;
  labelOn: string;
  onChange: () => void;
}) {
  return (
    <div className="ui-panel-soft flex items-center justify-between rounded-[18px] px-4 py-3">
      <div className="flex items-center gap-2 text-sm">
        <SunMedium className={`h-4 w-4 ${checked ? "text-[var(--text-muted)]" : "text-[var(--text-primary)]"}`} />
        <span className={checked ? "text-[var(--text-muted)]" : "text-[var(--text-primary)]"}>{labelOff}</span>
      </div>

      <button
        aria-checked={checked}
        className={[
          "relative inline-flex h-8 w-14 items-center rounded-full border transition",
          checked
            ? "border-[var(--accent)] bg-[var(--accent-soft)] shadow-[0_0_16px_var(--accent-shadow)]"
            : "border-[var(--panel-border)] bg-[var(--panel-bg)]",
        ].join(" ")}
        onClick={onChange}
        role="switch"
        type="button"
      >
        <span
          className={[
            "absolute h-6 w-6 rounded-full border transition-all",
            checked
              ? "left-[1.65rem] border-[var(--accent)] bg-[var(--accent)]"
              : "left-1 border-[var(--panel-border)] bg-[var(--panel-bg-strong)]",
          ].join(" ")}
        />
      </button>

      <div className="flex items-center gap-2 text-sm">
        <Moon className={`h-4 w-4 ${checked ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`} />
        <span className={checked ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}>{labelOn}</span>
      </div>
    </div>
  );
}

function SelectField({
  isRtl,
  label,
  onChange,
  value,
  children,
}: {
  isRtl: boolean;
  label: string;
  onChange: ChangeEventHandler<HTMLSelectElement>;
  value: string | number;
  children: ReactNode;
}) {
  return (
    <section>
      <label className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">{label}</label>
      <div className="relative">
        <select
          className={`ui-input appearance-none py-2.5 text-xs ${isRtl ? "pl-12 pr-4" : "pr-12 pl-4"}`}
          onChange={onChange}
          value={value}
        >
          {children}
        </select>
        <ChevronDown
          className={`pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)] ${isRtl ? "left-4" : "right-4"}`}
          strokeWidth={1.9}
        />
      </div>
    </section>
  );
}

export function GameMenu({
  level,
  levels,
  levelIndex,
  onLevelChange,
  onSetRobotColorId,
  onSetShowAllActions,
  onSetTheme,
  result,
  robotColorId,
  showAllActions,
  theme,
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
  onSetTheme: (theme: ThemeMode) => void;
  onStep: () => void;
  result: RunResult | null;
  robotColorId: RobotColorId;
  showAllActions: boolean;
  speed: PlaybackSpeed;
  theme: ThemeMode;
}) {
  const { isRtl, locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const statusMessage = getRunStatusMessage(locale, result, "menu");

  return (
    <div className="relative">
      <button
        className="ui-button h-11 px-4 text-xs uppercase tracking-[0.08em]"
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
            "ui-panel absolute top-[calc(100%+10px)] z-20 w-[320px] rounded-[16px] p-4 text-[var(--text-primary)]",
            isRtl ? "right-0" : "left-0",
          ].join(" ")}
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">{t.puzzleMenu}</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">{level.name}</h2>
            </div>
            <button className="ui-button h-8 w-8 justify-center" onClick={() => setOpen(false)} type="button">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            <section>
              <label className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">{t.theme}</label>
              <ThemeSwitch
                checked={theme === "dark"}
                labelOff={t.lightMode}
                labelOn={t.darkMode}
                onChange={() => onSetTheme(theme === "dark" ? "light" : "dark")}
              />
            </section>

            <SelectField
              isRtl={isRtl}
              label={t.language}
              onChange={(event) => setLocale(event.target.value as typeof locale)}
              value={locale}
            >
              {LOCALE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>

            <SelectField
              isRtl={isRtl}
              label={t.level}
              onChange={(event) => onLevelChange(Number(event.target.value))}
              value={levelIndex}
            >
              {levels.map((levelOption, index) => (
                <option key={levelOption.id} value={index}>
                  {t.levelOptionLabel(index + 1, levelOption.name)}
                </option>
              ))}
            </SelectField>

            <section>
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">{t.actionView}</p>
              <div className="grid grid-cols-2 gap-2">
                <SegmentButton active={showAllActions} label={t.allActions} onClick={() => onSetShowAllActions(true)} />
                <SegmentButton active={!showAllActions} label={t.levelOnly} onClick={() => onSetShowAllActions(false)} />
              </div>
            </section>

            <section>
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">{t.robotColor}</p>
              <div className="grid grid-cols-4 gap-2">
                {ROBOT_COLOR_IDS.map((colorId) => (
                  <button
                    aria-label={colorId}
                    className={[
                      "h-9 rounded-[10px] border transition",
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
            </section>

            <section className="ui-panel-soft rounded-[18px] p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">{t.status}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{statusMessage}</p>
              <p className="mt-2 text-xs text-[var(--text-muted)]">{level.metadata?.concept ?? t.programmingPuzzle}</p>
            </section>
          </div>
        </div>
      ) : null}
    </div>
  );
}
