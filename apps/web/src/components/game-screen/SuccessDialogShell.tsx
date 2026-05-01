import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { Sparkles } from "lucide-react";

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

export function SuccessDialogShell({
  body,
  hasNextLevel,
  isPremiumGate = false,
  nextLabel,
  onNext,
  onReplay,
  replayLabel,
  scoreDetails,
  starsEarned,
  subtitle,
  summary,
  title,
}: {
  body: ReactNode;
  hasNextLevel: boolean;
  isPremiumGate?: boolean;
  nextLabel: string;
  onNext: () => void;
  onReplay: () => void;
  replayLabel: string;
  scoreDetails?: ReactNode;
  starsEarned: number;
  subtitle?: ReactNode;
  summary: ReactNode;
  title: ReactNode;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Enter" || event.repeat || !hasNextLevel) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      onNext();
    }

    window.addEventListener("keydown", handleKeyDown, { capture: true });

    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [hasNextLevel, onNext]);

  return createPortal(
    <div
      className={[
        "fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(3,7,13,0.7)] p-4 backdrop-blur-[18px] transition-opacity duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
        isVisible ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      <div
        className={[
          "relative w-full overflow-hidden rounded-[32px] p-8 text-center transition-all duration-[320ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
          isPremiumGate ? "max-w-[520px]" : "max-w-[440px]",
          isVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-[0.97] opacity-0",
        ].join(" ")}
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)] shadow-[0_0_32px_var(--accent-shadow)]">
          <Sparkles className="h-8 w-8" />
        </div>
        <h2 className="font-display text-[clamp(1.8rem,2.2vw,2.4rem)] font-semibold tracking-tight text-[var(--text-primary)]">
          {title}
        </h2>
        {subtitle ? (
          <p className="mx-auto mt-3 max-w-[360px] text-[15px] font-semibold leading-relaxed text-emerald-100">
            {subtitle}
          </p>
        ) : null}
        <p className="mt-5 flex justify-center gap-4 text-5xl">
          {renderScoreStars(starsEarned)}
        </p>
        {scoreDetails ? (
          <div className="mt-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            {scoreDetails}
          </div>
        ) : null}
        <div className="mt-6 text-[15px] leading-relaxed text-[var(--text-secondary)]">
          {body}
        </div>
        <div className="mt-5 rounded-2xl bg-white/[0.03] py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          {summary}
        </div>
        {isPremiumGate ? (
          <div className="mx-auto mt-8 grid max-w-[360px] gap-3">
            <button
              className="ui-button-accent h-12 justify-center rounded-[16px] px-5 text-[13px] font-black uppercase tracking-[0.12em] shadow-[0_0_34px_rgba(89,217,87,0.32)] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!hasNextLevel}
              onClick={onNext}
              type="button"
            >
              {nextLabel}
            </button>
            <button
              className="ui-button h-10 justify-center rounded-[14px] border-white/10 bg-white/[0.025] text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]"
              onClick={onReplay}
              type="button"
            >
              {replayLabel}
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <button
              className="ui-button h-11 justify-center rounded-[14px] text-[13px] font-bold uppercase tracking-[0.1em]"
              onClick={onReplay}
              type="button"
            >
              {replayLabel}
            </button>
            <button
              className="ui-button-accent h-11 justify-center rounded-[14px] px-4 text-[13px] font-bold uppercase tracking-[0.1em] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!hasNextLevel}
              onClick={onNext}
              type="button"
            >
              {nextLabel}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
