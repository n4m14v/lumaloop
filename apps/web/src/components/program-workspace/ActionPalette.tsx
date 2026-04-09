import type { Command } from "@lumaloop/engine";

import { ALL_COMMANDS } from "../../features/game/store";
import { useI18n } from "../../i18n/I18nProvider";
import { PaletteActionButton, ProgramActionGlyph } from "./ProgramCommandTile";

interface ActionPaletteProps {
  allowedCommands: Command[];
  onAppendCommand: (command: Command) => void;
  paletteCommands: Command[];
  showAllActions: boolean;
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
  const label = t.commandLabels[command];
  const onboardingId = `palette-${command.toLowerCase().replaceAll("_", "-")}`;

  return (
    <PaletteActionButton
      ariaLabel={label}
      disabled={disabled}
      onboardingId={onboardingId}
      onClick={onClick}
      title={label}
    >
      <ProgramActionGlyph command={command} />
    </PaletteActionButton>
  );
}

export function ActionPalette({
  allowedCommands,
  onAppendCommand,
  paletteCommands,
  showAllActions,
}: ActionPaletteProps) {
  const { t } = useI18n();
  const toggleVisible = paletteCommands.includes("TOGGLE");
  const visibleCommands = showAllActions
    ? ALL_COMMANDS.filter((command) => command !== "TOGGLE" || toggleVisible)
    : paletteCommands;

  return (
    <section className="ui-panel rounded-[16px] p-3.5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[12px] uppercase tracking-[0.08em] text-[var(--text-primary)]">{t.actions}</p>
        </div>
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
  );
}
