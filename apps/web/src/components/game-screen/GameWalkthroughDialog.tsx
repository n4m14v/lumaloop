import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { useI18n } from "../../i18n/I18nProvider";

function clampIndex(value: number, max: number) {
  return Math.max(0, Math.min(value, max));
}

export function GameWalkthroughDialog({
  onClose,
  open,
}: {
  onClose: () => void;
  open: boolean;
}) {
  const { isRtl, t } = useI18n();
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = t.walkthroughSlides;
  const totalSlides = slides.length;
  const activeSlide = slides[activeIndex] ?? slides[0];
  const isLastSlide = activeIndex === totalSlides - 1;
  const showPrevious = activeIndex > 0;

  useEffect(() => {
    if (!open) {
      return;
    }

    setActiveIndex(0);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "ArrowLeft") {
        setActiveIndex((current) => clampIndex(current + (isRtl ? 1 : -1), totalSlides - 1));
      }

      if (event.key === "ArrowRight") {
        setActiveIndex((current) => clampIndex(current + (isRtl ? -1 : 1), totalSlides - 1));
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isRtl, onClose, open, totalSlides]);

  if (!open) {
    return null;
  }

  if (!activeSlide) {
    return null;
  }

  function moveTo(index: number) {
    setActiveIndex(clampIndex(index, totalSlides - 1));
  }

  function handleLogicalStep(delta: number) {
    moveTo(activeIndex + delta);
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4 md:p-6"
      onClick={onClose}
    >
      <div
        className="ui-panel relative w-full max-w-[52rem] overflow-hidden rounded-[26px] border-white/10 p-4 shadow-[0_24px_90px_rgba(0,0,0,0.42)] md:p-5"
        dir={isRtl ? "rtl" : "ltr"}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_40%)]" />

        <div className="relative flex items-start justify-between gap-4">
          <div className="max-w-[38rem]">
            <h2 className="font-display text-[clamp(1.2rem,1.8vw,1.8rem)] font-semibold tracking-[0.02em] text-[var(--text-primary)] leading-tight">
              {t.walkthroughTitle}
            </h2>
            <p className="mt-1 text-[13px] leading-5 text-[var(--text-secondary)] md:text-[14px] md:leading-6">
              {t.walkthroughSubtitle}
            </p>
          </div>

          <button
            aria-label={t.walkthroughClose}
            className="ui-button relative h-9 w-9 shrink-0 justify-center rounded-full px-0"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative mt-4 grid gap-4 md:grid-cols-[10rem_minmax(0,1fr)]">
          <div className="overflow-x-auto md:overflow-visible">
            <div className="flex gap-2 pr-2 md:flex-col">
              {slides.map((slide, index) => {
                const isActive = index === activeIndex;

                return (
                  <button
                    aria-current={isActive ? "step" : undefined}
                    className={[
                      "group relative flex shrink-0 items-center justify-between rounded-[12px] px-3 py-2.5 text-start transition-all duration-300 md:w-full",
                      isActive
                        ? "bg-[linear-gradient(90deg,var(--accent-soft),transparent)] text-[var(--text-primary)]"
                        : "text-[var(--text-secondary)] hover:bg-white/5",
                    ].join(" ")}
                    key={`${slide.eyebrow}-${index}`}
                    onClick={() => moveTo(index)}
                    type="button"
                  >
                    <span className={["relative z-10 text-[11px] font-bold uppercase tracking-[0.16em] transition-colors", isActive ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]"].join(" ")}>
                      {slide.eyebrow}
                    </span>
                    {isActive && (
                      <span className="absolute inset-y-1.5 left-0 w-1 rounded-r-md bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative flex min-h-[16rem] flex-col overflow-hidden rounded-[24px] border border-[var(--panel-border-strong)] bg-[linear-gradient(145deg,var(--panel-bg-strong),var(--panel-bg-soft))] p-5 shadow-2xl md:min-h-[18rem] md:p-6">
            <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-[var(--accent)] opacity-[0.12] blur-[80px]" />
            <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-[var(--accent-strong)] opacity-[0.12] blur-[80px]" />

            <div className="relative flex h-full flex-col gap-5">
              <div className="max-w-[42rem] space-y-2">
                <h3 className="font-display text-[clamp(1.2rem,1.6vw,1.6rem)] font-bold leading-tight tracking-tight text-[var(--text-primary)]">
                  {activeSlide.title}
                </h3>
                <p className="text-[14px] leading-relaxed text-[var(--text-secondary)]">{activeSlide.body}</p>
              </div>

              <div className="mt-auto flex flex-col gap-2">
                {activeSlide.bullets.map((bullet) => (
                  <div
                    className="flex w-full items-start gap-3 rounded-[12px] border border-[var(--panel-border)] bg-[var(--panel-bg-soft)] p-3 text-[13px] leading-relaxed text-[var(--text-primary)] shadow-sm backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-[var(--panel-bg)] md:text-[14px]"
                    key={bullet}
                  >
                    <div className="mt-1.5 flex h-2 w-2 shrink-0 rounded-[4px] bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-4 flex items-center justify-end gap-2 border-t border-white/8 pt-4">
            <button
              className="ui-button h-10 min-w-[104px] rounded-[14px] px-4 text-sm"
              disabled={!showPrevious}
              onClick={() => handleLogicalStep(-1)}
              type="button"
            >
              {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              {t.walkthroughPrevious}
            </button>
            <button
              className="ui-button-accent inline-flex h-10 min-w-[132px] items-center justify-center rounded-[14px] px-4 text-sm font-semibold"
              onClick={() => {
                if (isLastSlide) {
                  onClose();
                  return;
                }

                handleLogicalStep(1);
              }}
              type="button"
            >
              {isLastSlide ? t.walkthroughDone : t.walkthroughNext}
              {isLastSlide ? null : isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
