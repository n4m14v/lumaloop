import type { ReactNode } from "react";

import { SuccessDialogShell } from "./SuccessDialogShell";

interface GameSuccessDialogProps {
  body: ReactNode;
  hasNextLevel: boolean;
  idealSizeLabel?: string | undefined;
  idealSizeLevelOnlyNote: string;
  idealSolutionLength?: number | undefined;
  nextLabel: string;
  onNext: () => void;
  onReplay: () => void;
  programSizeLabel: string;
  programLength: number;
  replayLabel: string;
  showLevelOnlyIdealNote?: boolean;
  starsEarned: number;
  title: ReactNode;
}

export function GameSuccessDialog({
  body,
  hasNextLevel,
  idealSizeLabel,
  idealSizeLevelOnlyNote,
  idealSolutionLength,
  nextLabel,
  onNext,
  onReplay,
  programSizeLabel,
  replayLabel,
  showLevelOnlyIdealNote,
  starsEarned,
  title,
}: GameSuccessDialogProps) {
  return (
    <SuccessDialogShell
      body={body}
      hasNextLevel={hasNextLevel}
      nextLabel={nextLabel}
      onNext={onNext}
      onReplay={onReplay}
      replayLabel={replayLabel}
      starsEarned={starsEarned}
      summary={(
        <>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            {programSizeLabel}
            {idealSizeLabel ? ` • ${idealSizeLabel}` : ""}
          </p>
          {showLevelOnlyIdealNote && idealSolutionLength ? (
            <p className="mt-1.5 px-4 text-[11px] leading-relaxed text-[var(--text-muted)] opacity-80">
              {idealSizeLevelOnlyNote}
            </p>
          ) : null}
        </>
      )}
      title={title}
    />
  );
}
