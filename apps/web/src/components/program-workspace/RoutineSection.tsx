import type { Command, RoutineName } from "@lumaloop/engine";

import { useI18n } from "../../i18n/I18nProvider";
import { ProgramCommandTile } from "./ProgramCommandTile";

function ProgramSlot({
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
          <div className="ui-action-pop h-full w-full" key={command}>
            <ProgramCommandTile command={command} isActive={isCurrent} />
          </div>
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

interface RoutineSectionProps {
  currentPointer: { index: number; routine: RoutineName } | undefined;
  isActive: boolean;
  isLocked: boolean;
  label: string;
  onClear: () => void;
  onRemove: (index: number) => void;
  onSelect: () => void;
  routine: RoutineName;
  slots: (Command | null)[];
}

export function RoutineSection({
  currentPointer,
  isActive,
  isLocked,
  label,
  onClear,
  onRemove,
  onSelect,
  routine,
  slots,
}: RoutineSectionProps) {
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
      <div className="mb-3.5 flex items-center justify-between gap-2.5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-primary)]">{label.toUpperCase()}</p>
          {isLocked ? <p className="mt-1 text-xs text-[var(--text-muted)]">{t.lockedForLevel}</p> : null}
        </div>
        <button
          className="ui-button h-7 rounded-[7px] px-2 py-1 !text-[9px] uppercase tracking-[0.05em]"
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
            <ProgramSlot
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
