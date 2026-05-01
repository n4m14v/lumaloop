import type { ReactNode } from "react";

import { PremiumProgressBlock } from "./PremiumProgressBlock";
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
  premiumNextWorldName: string;
  premiumPerfectNote: string;
  premiumProgressCompleted: number;
  premiumProgressLabel?: string | undefined;
  premiumProgressTotal: number;
  programSizeLabel: string;
  programLength: number;
  replayLabel: string;
  showLevelOnlyIdealNote?: boolean;
  showPremiumPreviewGate?: boolean;
  starsEarned: number;
  subtitle?: ReactNode;
  title: ReactNode;
}

function PremiumPreviewSummary({
  premiumPerfectNote,
  premiumNextWorldName,
  premiumProgressCompleted,
  premiumProgressLabel,
  premiumProgressTotal,
  starsEarned,
}: {
  premiumPerfectNote: string;
  premiumNextWorldName: string;
  premiumProgressCompleted: number;
  premiumProgressLabel?: string | undefined;
  premiumProgressTotal: number;
  starsEarned: number;
}) {
  return (
    <div className="px-4 py-1 text-left">
      <PremiumProgressBlock
        className="mx-auto mb-4 max-w-[380px]"
        completed={premiumProgressCompleted}
        nextLabel={`Next: ${premiumNextWorldName}`}
        progressLabel={premiumProgressLabel}
        total={premiumProgressTotal}
      />
      {starsEarned >= 3 ? (
        <p className="mt-3 text-center text-[12px] font-semibold text-[#ffe08a]">
          {premiumPerfectNote}
        </p>
      ) : null}
    </div>
  );
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
  premiumNextWorldName = "Rising Paths",
  premiumPerfectNote,
  premiumProgressCompleted = 0,
  premiumProgressLabel,
  premiumProgressTotal = 1,
  programSizeLabel,
  replayLabel,
  showLevelOnlyIdealNote,
  showPremiumPreviewGate = false,
  starsEarned,
  subtitle,
  title,
}: GameSuccessDialogProps) {
  const scoreDetails = showPremiumPreviewGate ? (
    <>
      {programSizeLabel}
      {idealSizeLabel ? ` • ${idealSizeLabel}` : ""}
    </>
  ) : null;
  const summary = showPremiumPreviewGate ? (
    <PremiumPreviewSummary
      premiumPerfectNote={premiumPerfectNote}
      premiumNextWorldName={premiumNextWorldName}
      premiumProgressCompleted={premiumProgressCompleted}
      premiumProgressLabel={premiumProgressLabel}
      premiumProgressTotal={premiumProgressTotal}
      starsEarned={starsEarned}
    />
  ) : (
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
  );

  return (
    <SuccessDialogShell
      body={body}
      hasNextLevel={hasNextLevel}
      isPremiumGate={showPremiumPreviewGate}
      nextLabel={nextLabel}
      onNext={onNext}
      onReplay={onReplay}
      replayLabel={replayLabel}
      scoreDetails={scoreDetails}
      starsEarned={starsEarned}
      subtitle={subtitle}
      summary={summary}
      title={title}
    />
  );
}
