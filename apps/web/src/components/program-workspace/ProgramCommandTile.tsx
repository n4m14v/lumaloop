import {
  ArrowUp,
  ChevronsUp,
  CornerUpLeft,
  CornerUpRight,
  Power,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { Command } from "@lumaloop/engine";

const ICON_STROKE = 1.7;

const commandMeta: Record<
  Command,
  {
    badge?: string;
    icon: LucideIcon;
  }
> = {
  FORWARD: { icon: ArrowUp },
  TURN_LEFT: { icon: CornerUpLeft },
  TURN_RIGHT: { icon: CornerUpRight },
  JUMP: { icon: ChevronsUp },
  ACTIVATE: { icon: Power },
  CALL_P1: { icon: Workflow, badge: "1" },
  CALL_P2: { icon: Workflow, badge: "2" },
};

function DebossedIcon({
  icon: Icon,
  className,
}: {
  icon: LucideIcon;
  className: string;
}) {
  return (
    <span aria-hidden="true" className={`relative inline-flex ${className}`}>
      <Icon
        absoluteStrokeWidth
        className="absolute inset-0 h-full w-full -translate-x-[1.2px] -translate-y-[1.2px] text-[color:var(--icon-deboss-shadow)]"
        strokeWidth={ICON_STROKE + 0.45}
      />
      <Icon
        absoluteStrokeWidth
        className="absolute inset-0 h-full w-full translate-x-[1.2px] translate-y-[1.2px] text-[color:var(--icon-deboss-highlight)]"
        strokeWidth={ICON_STROKE + 0.2}
      />
      <Icon
        absoluteStrokeWidth
        className="absolute inset-0 h-full w-full text-[color:var(--icon-deboss-base)]"
        strokeWidth={ICON_STROKE + 0.2}
      />
      <Icon
        absoluteStrokeWidth
        className="relative h-full w-full text-[color:var(--icon-deboss-base)] opacity-90"
        strokeWidth={ICON_STROKE + 0.55}
      />
    </span>
  );
}

function CommandGlyph({
  badgeClassName,
  command,
  iconClassName,
}: {
  badgeClassName: string;
  command: Command;
  iconClassName: string;
}) {
  const meta = commandMeta[command];
  const Icon = meta.icon;

  return (
    <>
      <DebossedIcon className={iconClassName} icon={Icon} />
      {meta.badge ? (
        <span className={badgeClassName}>
          {meta.badge}
        </span>
      ) : null}
    </>
  );
}

export function ProgramCommandTile({
  command,
  isActive = false,
}: {
  command: Command;
  isActive?: boolean;
}) {
  return (
    <div
      className={[
        "ui-deboss-surface relative flex h-full w-full items-center justify-center rounded-[10px] border transition",
        isActive
          ? "ui-deboss-surface-active border-[var(--accent)] text-[var(--text-primary)] shadow-[0_0_0_1px_var(--accent),0_0_20px_var(--accent-shadow)]"
          : "border-[var(--panel-border)] text-[var(--text-secondary)]",
      ].join(" ")}
    >
      <CommandGlyph
        badgeClassName="absolute bottom-1 right-1 flex h-4 w-4 items-center justify-center rounded-[4px] border border-[var(--panel-border)] bg-[var(--panel-bg-strong)] text-[8px] font-bold text-[var(--text-secondary)]"
        command={command}
        iconClassName="h-[52%] w-[52%]"
      />
    </div>
  );
}

export function ProgramActionGlyph({ command }: { command: Command }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <CommandGlyph
        badgeClassName="absolute bottom-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-md border border-[var(--panel-border)] bg-[var(--panel-bg-strong)] text-[10px] font-bold text-[var(--text-secondary)]"
        command={command}
        iconClassName="h-[40%] w-[40%]"
      />
    </div>
  );
}
