import { useI18n } from "../../i18n/I18nProvider";
import { SuccessDialogShell } from "./SuccessDialogShell";

interface GameSuccessDialogProps {
  hasNextLevel: boolean;
  idealSolutionLength?: number | undefined;
  onNext: () => void;
  onReplay: () => void;
  programLength: number;
  showLevelOnlyIdealNote?: boolean;
  starsEarned: number;
}

export function GameSuccessDialog({
  hasNextLevel,
  idealSolutionLength,
  onNext,
  onReplay,
  programLength,
  showLevelOnlyIdealNote,
  starsEarned,
}: GameSuccessDialogProps) {
  const { t } = useI18n();
  return (
    <SuccessDialogShell
      body={t.successBody}
      hasNextLevel={hasNextLevel}
      nextLabel={t.next}
      onNext={onNext}
      onReplay={onReplay}
      replayLabel={t.replay}
      starsEarned={starsEarned}
      summary={(
        <>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            {t.programSize(programLength)}
            {idealSolutionLength ? ` • ${t.idealSize(idealSolutionLength)}` : ""}
          </p>
          {showLevelOnlyIdealNote && idealSolutionLength ? (
            <p className="mt-1.5 px-4 text-[11px] leading-relaxed text-[var(--text-muted)] opacity-80">
              {t.idealSizeLevelOnlyNote}
            </p>
          ) : null}
        </>
      )}
      title={t.puzzleSolved}
    />
  );
}
