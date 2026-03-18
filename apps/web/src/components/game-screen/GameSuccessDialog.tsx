import { Sparkles } from "lucide-react";

import { useI18n } from "../../i18n/I18nProvider";

function renderScoreStars(starCount: number) {
  return Array.from({ length: 3 }, (_, index) => (
    <span
      className={index < starCount ? "text-[#ffd76a] drop-shadow-[0_0_12px_rgba(255,215,106,0.42)]" : "text-white/80"}
      key={index}
    >
      ★
    </span>
  ));
}

interface GameSuccessDialogProps {
  hasNextLevel: boolean;
  idealSolutionLength?: number | undefined;
  onNext: () => void;
  onReplay: () => void;
  programLength: number;
  starsEarned: number;
}

export function GameSuccessDialog({
  hasNextLevel,
  idealSolutionLength,
  onNext,
  onReplay,
  programLength,
  starsEarned,
}: GameSuccessDialogProps) {
  const { t } = useI18n();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
      <div className="ui-panel pointer-events-auto w-[min(92%,400px)] rounded-[24px] p-8 text-center shadow-2xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[var(--panel-border)] bg-[var(--panel-bg-soft)] text-[var(--accent)] shadow-[0_0_32px_var(--accent-shadow)]">
          <Sparkles className="h-8 w-8" />
        </div>
        <h2 className="font-display text-4xl font-semibold tracking-tight">{t.puzzleSolved}</h2>
        <p className="mt-5 flex justify-center gap-4 text-5xl">{renderScoreStars(starsEarned)}</p>
        <p className="mt-6 text-base leading-relaxed text-[var(--text-secondary)]">{t.successBody}</p>
        <p className="mt-4 text-[11px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
          {t.programSize(programLength)}
          {idealSolutionLength ? ` • ${t.idealSize(idealSolutionLength)}` : ""}
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <button
            className="ui-button h-12 justify-center text-sm font-semibold uppercase tracking-[0.1em]"
            onClick={onReplay}
            type="button"
          >
            {t.replay}
          </button>
          <button
            className="ui-button-accent h-12 rounded-[14px] px-4 text-sm font-semibold uppercase tracking-[0.1em] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!hasNextLevel}
            onClick={onNext}
            type="button"
          >
            {t.next}
          </button>
        </div>
      </div>
    </div>
  );
}
