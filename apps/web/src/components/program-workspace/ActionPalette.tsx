import type { Command } from "@lumaloop/engine";

import { ALL_COMMANDS } from "../../features/game/store";
import { useI18n } from "../../i18n/I18nProvider";
import { ProgramActionGlyph } from "./ProgramCommandTile";

interface ActionPaletteProps {
  allowedCommands: Command[];
  onAppendCommand: (command: Command) => void;
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

  return (
    <button
      aria-label={label}
      className={[
        "ui-deboss-surface relative aspect-square rounded-[12px] border transition",
        disabled
          ? "border-[var(--panel-border)] text-[var(--text-muted)] opacity-70"
          : "border-[var(--panel-border)] text-[var(--text-primary)] hover:border-[var(--accent)] hover:shadow-[0_0_18px_var(--accent-shadow)]",
      ].join(" ")}
      disabled={disabled}
      onClick={onClick}
      title={label}
      type="button"
    >
      <ProgramActionGlyph command={command} />
    </button>
  );
}

export function ActionPalette({
  allowedCommands,
  onAppendCommand,
  showAllActions,
}: ActionPaletteProps) {
  const { t } = useI18n();
  const visibleCommands = showAllActions ? ALL_COMMANDS : allowedCommands;

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
