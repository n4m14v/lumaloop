import { createPortal } from "react-dom";
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
  isOpen: boolean;
  onNext: () => void;
  onReplay: () => void;
  programLength: number;
  showLevelOnlyIdealNote?: boolean;
  starsEarned: number;
}

export function GameSuccessDialog({
  hasNextLevel,
  idealSolutionLength,
  isOpen,
  onNext,
  onReplay,
  programLength,
  showLevelOnlyIdealNote,
  starsEarned,
}: GameSuccessDialogProps) {
  const { t } = useI18n();

  return createPortal(
    <div
      aria-hidden={!isOpen}
      className={[
        "fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(3,7,13,0.7)] p-4 backdrop-blur-[18px] transition-all duration-300 ease-out",
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
      ].join(" ")}
    >
      <div
        className={[
          "relative w-full max-w-[440px] overflow-hidden rounded-[32px] p-8 text-center transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isOpen ? "translate-y-0 scale-100 opacity-100 delay-75" : "translate-y-4 scale-[0.98] opacity-0",
        ].join(" ")}
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)] shadow-[0_0_32px_var(--accent-shadow)]">
          <Sparkles className="h-8 w-8" />
        </div>
        <h2 className="font-display text-[clamp(1.8rem,2.2vw,2.4rem)] font-semibold tracking-tight text-[var(--text-primary)]">
          {t.puzzleSolved}
        </h2>
        <p className="mt-5 flex justify-center gap-4 text-5xl">
          {renderScoreStars(starsEarned)}
        </p>
        <p className="mt-6 text-[15px] leading-relaxed text-[var(--text-secondary)]">
          {t.successBody}
        </p>
        <div className="mt-5 rounded-2xl bg-white/[0.03] py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            {t.programSize(programLength)}
            {idealSolutionLength ? ` • ${t.idealSize(idealSolutionLength)}` : ""}
          </p>
          {showLevelOnlyIdealNote && idealSolutionLength ? (
            <p className="mt-1.5 px-4 text-[11px] leading-relaxed text-[var(--text-muted)] opacity-80">
              {t.idealSizeLevelOnlyNote}
            </p>
          ) : null}
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <button
            className="ui-button h-11 justify-center rounded-[14px] text-[13px] font-bold uppercase tracking-[0.1em]"
            onClick={onReplay}
            type="button"
          >
            {t.replay}
          </button>
          <button
            className="ui-button-accent h-11 justify-center rounded-[14px] px-4 text-[13px] font-bold uppercase tracking-[0.1em] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!hasNextLevel}
            onClick={onNext}
            type="button"
          >
            {t.next}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
