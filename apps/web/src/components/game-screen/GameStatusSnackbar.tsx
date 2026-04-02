import { useEffect, useRef, useState } from "react";

import { AlertTriangle, Info, TriangleAlert, X } from "lucide-react";

const EXIT_DURATION_MS = 195;

export interface GameStatusFeedback {
  body: string;
  onDismiss: () => void;
  severity: "error" | "info" | "warning";
  title: string;
}

function getFeedbackKey(feedback: GameStatusFeedback | null) {
  if (!feedback) {
    return null;
  }

  return `${feedback.severity}:${feedback.title}:${feedback.body}`;
}

export function GameStatusSnackbar({
  className,
  feedback,
}: {
  className?: string;
  feedback: GameStatusFeedback | null;
}) {
  const [renderedFeedback, setRenderedFeedback] = useState<GameStatusFeedback | null>(null);
  const [animationState, setAnimationState] = useState<"entering" | "exiting" | "idle">("idle");
  const renderedFeedbackRef = useRef<GameStatusFeedback | null>(null);
  const pendingFeedbackRef = useRef<GameStatusFeedback | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const animationTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    renderedFeedbackRef.current = renderedFeedback;
  }, [renderedFeedback]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }

      if (animationTimeoutRef.current !== null) {
        window.clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  function clearAnimationHandles() {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (animationTimeoutRef.current !== null) {
      window.clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
  }

  function startEnter(nextFeedback: GameStatusFeedback) {
    clearAnimationHandles();
    setRenderedFeedback(nextFeedback);
    setAnimationState("entering");
    animationTimeoutRef.current = window.setTimeout(() => {
      animationTimeoutRef.current = null;
      setAnimationState("idle");
    }, 20);
  }

  function startExit(onExited: () => void) {
    clearAnimationHandles();
    setAnimationState("exiting");
    animationTimeoutRef.current = window.setTimeout(() => {
      animationTimeoutRef.current = null;
      onExited();
    }, EXIT_DURATION_MS);
  }

  useEffect(() => {
    const nextKey = getFeedbackKey(feedback);
    const currentKey = getFeedbackKey(renderedFeedbackRef.current);

    if (!feedback) {
      pendingFeedbackRef.current = null;

      if (!renderedFeedbackRef.current) {
        return;
      }

      startExit(() => {
        setRenderedFeedback(null);
        setAnimationState("idle");
      });
      return;
    }

    if (!renderedFeedbackRef.current) {
      startEnter(feedback);
      return;
    }

    if (nextKey === currentKey) {
      setRenderedFeedback(feedback);
      return;
    }

    pendingFeedbackRef.current = feedback;
    startExit(() => {
      const queuedFeedback = pendingFeedbackRef.current;
      pendingFeedbackRef.current = null;

      if (!queuedFeedback) {
        setRenderedFeedback(null);
        setAnimationState("idle");
        return;
      }

      startEnter(queuedFeedback);
    });
  }, [feedback]);

  function handleDismiss() {
    if (!renderedFeedbackRef.current || animationState === "exiting") {
      return;
    }

    pendingFeedbackRef.current = null;
    const dismissedFeedback = renderedFeedbackRef.current;

    startExit(() => {
      setRenderedFeedback(null);
      setAnimationState("idle");
      dismissedFeedback.onDismiss();
    });
  }

  if (!renderedFeedback) {
    return null;
  }

  const accentClass =
    renderedFeedback.severity === "error"
      ? "text-[#ffb27d]"
      : renderedFeedback.severity === "warning"
        ? "text-[#ffd36b]"
        : "text-[var(--accent)]";
  const badgeClass =
    renderedFeedback.severity === "error"
      ? "border-[rgba(255,160,107,0.28)] bg-[rgba(255,160,107,0.1)]"
      : renderedFeedback.severity === "warning"
        ? "border-[rgba(255,211,107,0.28)] bg-[rgba(255,211,107,0.1)]"
        : "border-[var(--panel-border)] bg-[var(--panel-bg-soft)]";
  const titleClass =
    renderedFeedback.severity === "error"
      ? "text-[#ffc59d]"
      : renderedFeedback.severity === "warning"
        ? "text-[#ffe08b]"
        : "text-[var(--accent)]";
  const Icon =
    renderedFeedback.severity === "error"
      ? AlertTriangle
      : renderedFeedback.severity === "warning"
        ? TriangleAlert
        : Info;
  const motionClass =
    animationState === "exiting"
      ? "opacity-0 -translate-y-[120%] transition-all duration-[195ms] ease-[cubic-bezier(0.4,0,0.6,1)]"
      : animationState === "entering"
        ? "opacity-0 -translate-y-[120%] transition-all duration-[225ms] ease-[cubic-bezier(0,0,0.2,1)]"
        : "translate-y-0 opacity-100 transition-all duration-[225ms] ease-[cubic-bezier(0,0,0.2,1)]";

  return (
    <div className={["pointer-events-none flex", className ?? "justify-center"].join(" ")}>
      <div
        className={[
          "ui-panel pointer-events-auto flex w-[min(100%,26rem)] items-start gap-3 rounded-[18px] px-4 py-3 shadow-[0_18px_48px_rgba(0,0,0,0.32)]",
          motionClass,
        ].join(" ")}
      >
        <div className={["mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border", badgeClass, accentClass].join(" ")}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className={["text-[11px] font-semibold uppercase tracking-[0.12em]", titleClass].join(" ")}>
            {renderedFeedback.title}
          </p>
          <p className="mt-1 text-[14px] leading-6 text-[var(--text-secondary)]">
            {renderedFeedback.body}
          </p>
        </div>
        <button
          aria-label="Dismiss"
          className="ui-button h-8 w-8 shrink-0 justify-center rounded-full px-0"
          onClick={handleDismiss}
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
