import type { ReactNode } from "react";

import type { Command, RoutineName } from "@lumaloop/engine";

import type { RoutineSlots } from "../features/game/store";
import { useI18n } from "../i18n/I18nProvider";
import { getRoutineLabel } from "../i18n/translations";
import { ActionPalette } from "./program-workspace/ActionPalette";
import { RoutineSection } from "./program-workspace/RoutineSection";

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
  const p1Enabled = showAllActions || allowedCommands.includes("CALL_P1");
  const p2Enabled = showAllActions || allowedCommands.includes("CALL_P2");

  return (
    <section className="relative min-h-[calc(100vh-3rem)]">
      {scene}

      <aside className="pointer-events-auto relative z-20 ml-auto mt-6 w-full max-w-[340px] xl:absolute xl:top-0 xl:right-0 xl:bottom-0 xl:mt-0 xl:max-w-none xl:w-[340px] xl:overflow-y-auto xl:pb-4">
        <div className="space-y-3 xl:min-h-full">
          <ActionPalette
            allowedCommands={allowedCommands}
            onAppendCommand={onAppendCommand}
            showAllActions={showAllActions}
          />

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
        </div>
      </aside>
    </section>
  );
}
