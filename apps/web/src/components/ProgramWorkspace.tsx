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

const ICON_STROKE = 2.5;

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
        "flex h-full w-full items-center justify-center rounded-[14px] border-2 transition",
        isActive
          ? "border-[#6ea8ff] bg-[#eef6ff] text-[#1677ff]"
          : "border-[#7d8691] bg-[#d8dde3] text-[#374151]",
      ].join(" ")}
    >
      <Icon
        absoluteStrokeWidth
        aria-hidden="true"
        className="h-[60%] w-[60%]"
        strokeWidth={ICON_STROKE}
      />
      {meta.badge ? (
        <span className="absolute bottom-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-[#7b848f] bg-[#f7fafc] text-[10px] font-black leading-none text-[#374151]">
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
        "relative aspect-square rounded-[16px] border-2 p-1 transition",
        isCurrent ? "border-[#6ea8ff] bg-[#edf6ff]" : "border-[#8d949d] bg-[#cdd2d8]",
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
            "flex h-full w-full items-center justify-center rounded-[12px] border-2 border-dashed text-[11px] font-black uppercase tracking-[0.18em]",
            disabled
              ? "border-[#c2c8cf] bg-[#f2f4f6] text-[#b0b6bf]"
              : "border-[#a4abb3] bg-[#eef1f4] text-[#8b95a0]",
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
        "rounded-[18px] border-2 p-3",
        isActive ? "border-[#6ea8ff] bg-[#f6fbff]" : "border-[#7b848f] bg-[#d2d7dd]",
        isLocked ? "opacity-70" : "",
      ].join(" ")}
      onClick={() => {
        if (!isLocked) {
          onSelect();
        }
      }}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <button className="text-start" disabled={isLocked} type="button">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#445062]">{label}</p>
          <p className="text-xs font-semibold text-[#667180]">
            {isLocked ? t.lockedForLevel : t.routineSlots(slots.filter(Boolean).length, slots.length)}
          </p>
        </button>
        <button
          className="rounded-full border border-[#aab2bc] bg-[#eef1f4] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#596373]"
          disabled={isLocked}
          onClick={onClear}
          type="button"
        >
          {t.clear}
        </button>
      </div>
      {slots.length > 0 ? (
        <div className="grid grid-cols-4 gap-2">
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
        <div className="flex h-[74px] items-center justify-center rounded-[14px] border-2 border-dashed border-[#a4abb3] bg-[#eceff2] text-[11px] font-black uppercase tracking-[0.18em] text-[#8b95a0]">
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
        "aspect-square w-[64px] rounded-[16px] border-2 p-1 transition",
        disabled
          ? "border-[#a8afb7] bg-[#e6e9ed] text-[#9aa2ac]"
          : "border-[#7d8691] bg-[#d8dde3] text-[#374151] hover:bg-[#e4e8ed]",
      ].join(" ")}
      disabled={disabled}
      onClick={onClick}
      title={label}
      type="button"
    >
      <div
        className={[
          "relative flex h-full w-full items-center justify-center rounded-[12px] border",
          disabled ? "border-[#c3cad2] bg-[#f2f4f7]" : "border-[#adb5be] bg-[#eef1f4]",
        ].join(" ")}
      >
        <Icon
          absoluteStrokeWidth
          aria-hidden="true"
          className="h-[60%] w-[60%]"
          strokeWidth={ICON_STROKE}
        />
        {meta.badge ? (
          <span className="absolute bottom-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-[#7b848f] bg-[#f7fafc] text-[10px] font-black leading-none text-[#374151]">
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

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_356px] xl:items-start">
      <div>{scene}</div>

      <aside className="space-y-4 xl:sticky xl:top-4">
        <section className="rounded-[18px] border-2 border-[#7b848f] bg-[#d2d7dd] p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#445062]">{t.actions}</p>
              <p className="text-xs font-semibold text-[#667180]">
                {showAllActions ? t.showingFullCommandSet : t.showingLevelCommands}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
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
