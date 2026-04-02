import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

type SpotlightTarget =
  | "game-board"
  | "palette-activate"
  | "palette-forward"
  | "palette-toggle"
  | "palette-turn-right"
  | "routine-main"
  | "run-button";

type Rect = {
  height: number;
  left: number;
  top: number;
  width: number;
};

const TARGET_SELECTOR_PREFIX = "[data-onboarding='";
const SPOTLIGHT_PADDING = 10;

function getSpotlightRect(target: SpotlightTarget): Rect | null {
  if (typeof document === "undefined") {
    return null;
  }

  const element = document.querySelector<HTMLElement>(`${TARGET_SELECTOR_PREFIX}${target}']`);
  if (!element) {
    return null;
  }

  const bounds = element.getBoundingClientRect();
  return {
    height: bounds.height,
    left: bounds.left,
    top: bounds.top,
    width: bounds.width,
  };
}

function getBubblePosition(rect: Rect | null) {
  if (!rect || typeof window === "undefined") {
    return {
      left: "50%",
      top: "5.5rem",
      transform: "translateX(-50%)",
    };
  }

  const bubbleWidth = Math.min(360, window.innerWidth - 32);
  const preferredLeft = Math.min(
    window.innerWidth - bubbleWidth - 16,
    Math.max(16, rect.left + rect.width / 2 - bubbleWidth / 2),
  );
  const belowTop = rect.top + rect.height + 24;
  const aboveTop = rect.top - 196;
  const top = belowTop + 180 <= window.innerHeight ? belowTop : Math.max(16, aboveTop);

  return {
    left: `${preferredLeft}px`,
    top: `${top}px`,
    transform: "none",
  };
}

export function GameOnboardingOverlay({
  body,
  continueLabel,
  onContinue,
  onSkip,
  skipLabel,
  target,
  title,
  type,
}: {
  body: string;
  continueLabel: string;
  onContinue: (() => void) | undefined;
  onSkip: () => void;
  skipLabel: string;
  target: SpotlightTarget | undefined;
  title: string;
  type: "action" | "manual";
}) {
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    if (!target) {
      setRect(null);
      return;
    }

    const activeTarget = target;

    function updateRect() {
      setRect(getSpotlightRect(activeTarget));
    }

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [target]);

  const bubblePosition = useMemo(() => getBubblePosition(rect), [rect]);

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[110]">
      <div className="absolute inset-0 bg-[rgba(4,8,14,0.5)]" />

      {rect ? (
        <div
          className="absolute rounded-[18px] border border-[var(--accent)] shadow-[0_0_0_1px_var(--accent),0_0_0_9999px_rgba(4,8,14,0.58),0_0_32px_var(--accent-shadow)]"
          style={{
            height: rect.height + SPOTLIGHT_PADDING * 2,
            left: rect.left - SPOTLIGHT_PADDING,
            top: rect.top - SPOTLIGHT_PADDING,
            width: rect.width + SPOTLIGHT_PADDING * 2,
          }}
        />
      ) : null}

      <div
        className="pointer-events-auto absolute w-[min(22.5rem,calc(100vw-2rem))] rounded-[20px] border border-[var(--panel-border-strong)] bg-[linear-gradient(180deg,var(--panel-bg-strong),var(--panel-bg))] p-4 text-[var(--text-primary)] shadow-[0_24px_70px_rgba(0,0,0,0.4)]"
        dir="ltr"
        style={bubblePosition}
      >
        <h2 className="font-display text-lg font-semibold tracking-[0.01em]">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
          {body}
        </p>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            className="ui-button h-9 rounded-[12px] px-3 text-sm"
            onClick={onSkip}
            type="button"
          >
            {skipLabel}
          </button>
          {onContinue ? (
            <button
              className="ui-button-accent h-9 rounded-[12px] px-3 text-sm font-semibold"
              onClick={onContinue}
              type="button"
            >
              {continueLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
