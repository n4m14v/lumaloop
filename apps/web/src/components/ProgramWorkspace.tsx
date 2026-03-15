import {
  ArrowBigUpDash,
  ChevronUp,
  Lightbulb,
  RotateCcw,
  RotateCw,
  SquareFunction,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { Command, RoutineName } from "@lumaloop/engine";

import { ALL_COMMANDS, type RoutineSlots } from "../features/game/store";
import { useI18n } from "../i18n/I18nProvider";
import { getRoutineLabel } from "../i18n/translations";

const ICON_STROKE = 1.7;

const commandMeta: Record<
  Command,
  {
    badge?: string;
    icon: LucideIcon;
  }
> = {
  FORWARD: { icon: ChevronUp },
  TURN_LEFT: { icon: RotateCcw },
  TURN_RIGHT: { icon: RotateCw },
  JUMP: { icon: ArrowBigUpDash },
  LIGHT: { icon: Lightbulb },
  CALL_P1: { icon: SquareFunction, badge: "1" },
  CALL_P2: { icon: SquareFunction, badge: "2" },
};

function CommandTile({
  command,
  isActive = false,
}: {
  command: Command;
  isActive?: boolean;
}) {
  const meta = commandMeta[command];
  const Icon = meta.icon;

  return (
    <div
      className={[
        "relative flex h-full w-full items-center justify-center rounded-[10px] border transition",
        isActive
          ? "border-[var(--accent)] bg-[var(--panel-bg-soft)] text-[var(--text-primary)] shadow-[0_0_0_1px_var(--accent),0_0_20px_var(--accent-shadow)]"
          : "border-[var(--panel-border)] bg-[var(--panel-bg)] text-[var(--text-secondary)]",
      ].join(" ")}
    >
      <Icon absoluteStrokeWidth aria-hidden="true" className="h-[52%] w-[52%]" strokeWidth={ICON_STROKE} />
      {meta.badge ? (
        <span className="absolute bottom-1 right-1 flex h-4 w-4 items-center justify-center rounded-[4px] border border-[var(--panel-border)] bg-[var(--panel-bg-strong)] text-[8px] font-bold text-[var(--text-secondary)]">
          {meta.badge}
        </span>
      ) : null}
    </div>
  );
}

function Slot({
  command,
  currentPointer,
  disabled,
  index,
  onRemove,
  routine,
  routineLabel,
}: {
  command: Command | null;
  currentPointer: { index: number; routine: RoutineName } | undefined;
  disabled: boolean;
  index: number;
  onRemove: () => void;
  routine: RoutineName;
  routineLabel: string;
}) {
  const { t } = useI18n();
  const isCurrent = currentPointer?.routine === routine && currentPointer.index === index;

  return (
    <div
      className={[
        "relative aspect-square rounded-[12px] border p-1.5 transition",
        isCurrent
          ? "border-[var(--accent)] bg-[var(--panel-bg-soft)] shadow-[0_0_0_1px_var(--accent),0_0_18px_var(--accent-shadow)]"
          : "border-[var(--panel-border)] bg-[rgba(255,255,255,0.03)] dark:bg-[rgba(0,0,0,0.1)]",
      ].join(" ")}
    >
      {command ? (
        <button
          aria-label={t.removeCommandFromSlot(routineLabel, index + 1)}
          className="h-full w-full"
          disabled={disabled}
          onClick={onRemove}
          type="button"
        >
          <CommandTile command={command} isActive={isCurrent} />
        </button>
      ) : (
        <button
          aria-label={t.addCommandToSlot(routineLabel, index + 1)}
          className={[
            "flex h-full w-full items-center justify-center rounded-[8px] border border-dashed text-[10px] uppercase tracking-[0.12em]",
            disabled
              ? "border-[var(--panel-border)] text-[var(--text-muted)]"
              : "border-[var(--panel-border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--text-secondary)]",
          ].join(" ")}
          disabled={disabled}
          type="button"
        >
          {index + 1}
        </button>
      )}
    </div>
  );
}

function RoutineSection({
  currentPointer,
  isActive,
  isLocked,
  label,
  onClear,
  onRemove,
  onSelect,
  routine,
  slots,
}: {
  currentPointer: { index: number; routine: RoutineName } | undefined;
  isActive: boolean;
  isLocked: boolean;
  label: string;
  onClear: () => void;
  onRemove: (index: number) => void;
  onSelect: () => void;
  routine: RoutineName;
  slots: (Command | null)[];
}) {
  const { t } = useI18n();

  return (
    <section
      className={[
        "ui-panel relative rounded-[16px] p-3 transition",
        isActive ? "ui-panel-active" : "",
        isLocked ? "opacity-60" : "",
      ].join(" ")}
      onClick={() => {
        if (!isLocked) {
          onSelect();
        }
      }}
    >
      {/* Removed vertical selection line */}

      <div className="mb-3.5 flex items-center justify-between gap-2.5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-primary)]">{label.toUpperCase()}</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {isLocked ? t.lockedForLevel : `[${t.routineSlots(slots.filter(Boolean).length, slots.length)}]`}
          </p>
        </div>
        <button
          className="ui-button h-8 rounded-[8px] px-3 py-1.5 text-xs uppercase tracking-[0.06em]"
          disabled={isLocked}
          onClick={(event) => {
            event.stopPropagation();
            onClear();
          }}
          type="button"
        >
          {t.clear}
        </button>
      </div>

      {slots.length > 0 ? (
        <div className="grid grid-cols-4 gap-2.5">
          {slots.map((command, index) => (
            <Slot
              command={command}
              currentPointer={currentPointer}
              disabled={isLocked}
              index={index}
              key={`${routine}-${index}`}
              onRemove={() => onRemove(index)}
              routine={routine}
              routineLabel={label}
            />
          ))}
        </div>
      ) : (
        <div className="flex h-[72px] items-center justify-center rounded-[12px] border border-dashed border-[var(--panel-border)] text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
          {t.noSlots}
        </div>
      )}
    </section>
  );
}

function ActionButton({
  command,
  disabled,
  onClick,
}: {
  command: Command;
  disabled: boolean;
  onClick: () => void;
}) {
  const { t } = useI18n();
  const meta = commandMeta[command];
  const Icon = meta.icon;
  const label = t.commandLabels[command];

  return (
    <button
      aria-label={label}
      className={[
        "relative aspect-square rounded-[12px] border transition",
        disabled
          ? "border-[var(--panel-border)] bg-[rgba(27,32,42,0.34)] text-[var(--text-muted)]"
          : "border-[var(--panel-border)] bg-[var(--panel-bg)] text-[var(--text-primary)] hover:border-[var(--accent)] hover:shadow-[0_0_18px_var(--accent-shadow)]",
      ].join(" ")}
      disabled={disabled}
      onClick={onClick}
      title={label}
      type="button"
    >
      <div className="relative flex h-full w-full items-center justify-center">
        <Icon absoluteStrokeWidth aria-hidden="true" className="h-[40%] w-[40%]" strokeWidth={ICON_STROKE} />
        {meta.badge ? (
          <span className="absolute bottom-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-md border border-[var(--panel-border)] bg-[var(--panel-bg-strong)] text-[10px] font-bold text-[var(--text-secondary)]">
            {meta.badge}
          </span>
        ) : null}
      </div>
    </button>
  );
}

export function ProgramWorkspace({
  activeRoutine,
  allowedCommands,
  currentPointer,
  onAppendCommand,
  onClearRoutine,
  onRemoveCommand,
  onSelectRoutine,
  routines,
  scene,
  showAllActions,
}: {
  activeRoutine: RoutineName;
  allowedCommands: Command[];
  currentPointer: { index: number; routine: RoutineName } | undefined;
  onAppendCommand: (command: Command) => void;
  onClearRoutine: (routine: RoutineName) => void;
  onRemoveCommand: (routine: RoutineName, index: number) => void;
  onSelectRoutine: (routine: RoutineName) => void;
  routines: RoutineSlots;
  scene: ReactNode;
  showAllActions: boolean;
}) {
  const { locale, t } = useI18n();
  const visibleCommands = showAllActions ? ALL_COMMANDS : allowedCommands;
  const p1Enabled = showAllActions || allowedCommands.includes("CALL_P1");
  const p2Enabled = showAllActions || allowedCommands.includes("CALL_P2");
  const visibleCount = showAllActions ? ALL_COMMANDS.length : allowedCommands.length;

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
      <div>{scene}</div>

      <aside className="space-y-3 xl:sticky xl:top-6">
        <section className="ui-panel rounded-[16px] p-3.5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[12px] uppercase tracking-[0.08em] text-[var(--text-primary)]">{t.actions}</p>
            </div>
            <span className="text-sm text-[var(--text-muted)]">[{visibleCount}/{ALL_COMMANDS.length}]</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {visibleCommands.map((command) => (
              <ActionButton
                command={command}
                disabled={!showAllActions && !allowedCommands.includes(command)}
                key={command}
                onClick={() => onAppendCommand(command)}
              />
            ))}
          </div>
        </section>

        <div className="px-1">
          <p className="text-[12px] uppercase tracking-[0.06em] text-[var(--text-primary)]">{t.proceduralHierarchy}</p>
        </div>

        <RoutineSection
          currentPointer={currentPointer}
          isActive={activeRoutine === "main"}
          isLocked={false}
          label={getRoutineLabel(locale, "main")}
          onClear={() => onClearRoutine("main")}
          onRemove={(index) => onRemoveCommand("main", index)}
          onSelect={() => onSelectRoutine("main")}
          routine="main"
          slots={routines.main}
        />

        <RoutineSection
          currentPointer={currentPointer}
          isActive={activeRoutine === "p1"}
          isLocked={!p1Enabled}
          label={getRoutineLabel(locale, "p1")}
          onClear={() => onClearRoutine("p1")}
          onRemove={(index) => onRemoveCommand("p1", index)}
          onSelect={() => onSelectRoutine("p1")}
          routine="p1"
          slots={routines.p1}
        />

        <RoutineSection
          currentPointer={currentPointer}
          isActive={activeRoutine === "p2"}
          isLocked={!p2Enabled}
          label={getRoutineLabel(locale, "p2")}
          onClear={() => onClearRoutine("p2")}
          onRemove={(index) => onRemoveCommand("p2", index)}
          onSelect={() => onSelectRoutine("p2")}
          routine="p2"
          slots={routines.p2}
        />
      </aside>
    </section>
  );
}
