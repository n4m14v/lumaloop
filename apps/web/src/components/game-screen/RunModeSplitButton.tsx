import { useEffect, useRef, useState } from "react";

import { ChevronDown, Pause, Play, SkipForward } from "lucide-react";

export type RunModeId = "normal" | "fast" | "instant" | "pov";

export interface RunModeOption {
  label: string;
  mode: RunModeId;
}

export function RunModeIcon({ mode }: { mode: RunModeId }) {
  if (mode === "pov") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
    );
  }

  if (mode === "instant") {
    return <SkipForward className="h-4 w-4" />;
  }

  if (mode === "fast") {
    return (
      <span className="relative inline-flex h-4 w-5 items-center justify-start">
        <Play className="h-4 w-4 fill-current" />
        <span className="absolute -right-0.5 -bottom-1 text-[8px] font-black leading-none tracking-[-0.04em]">x2</span>
      </span>
    );
  }

  return <Play className="h-4 w-4 fill-current" />;
}

export function RunModeSplitButton({
  canStartRun,
  isRunning,
  labels,
  onRunWithMode,
  onToggleRun,
  options,
  selectedRunMode,
}: {
  canStartRun: boolean;
  isRunning: boolean;
  labels: {
    pause: string;
    runOptions: string;
  };
  onRunWithMode: (mode: RunModeId) => void;
  onToggleRun: () => void;
  options: RunModeOption[];
  selectedRunMode: RunModeId;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectedOption = options.find((option) => option.mode === selectedRunMode) ?? options[0];

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    setIsOpen(false);
  }, [isRunning]);

  if (!selectedOption) {
    return null;
  }

  return (
    <div className="relative" ref={containerRef}>
      <div
        className={[
          "flex overflow-hidden border bg-[linear-gradient(180deg,var(--accent)_0%,var(--accent-strong)_100%)] shadow-[0_0_24px_var(--accent-shadow)]",
          "border-[color-mix(in_srgb,var(--accent-strong)_58%,rgba(255,255,255,0.2))]",
          isOpen ? "rounded-t-[12px] rounded-b-none" : "rounded-[12px]",
        ].join(" ")}
      >
        <button
          aria-label={isRunning ? labels.pause : selectedOption.label}
          className={[
            "inline-flex h-9 min-w-[164px] items-center justify-center gap-2 border-r px-4 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--accent-foreground)] disabled:cursor-not-allowed disabled:opacity-50",
            "border-r-white/28",
            isOpen ? "rounded-tl-[12px]" : "rounded-l-[12px]",
            "max-[980px]:min-w-[52px] max-[980px]:px-3",
          ].join(" ")}
          disabled={!isRunning && !canStartRun}
          onClick={onToggleRun}
          type="button"
        >
          {isRunning ? <Pause className="h-4 w-4" /> : <RunModeIcon mode={selectedOption.mode} />}
          <span className="max-[980px]:hidden">{isRunning ? labels.pause : selectedOption.label}</span>
        </button>
        <button
          aria-expanded={isOpen}
          aria-label={labels.runOptions}
          className={[
            "inline-flex h-9 w-10 items-center justify-center px-0 text-[var(--accent-foreground)] disabled:cursor-not-allowed disabled:opacity-50",
            isOpen ? "rounded-tr-[12px]" : "rounded-r-[12px]",
          ].join(" ")}
          onClick={() => setIsOpen((value) => !value)}
          type="button"
        >
          <ChevronDown className={["h-3.5 w-3.5 transition", isOpen ? "rotate-180" : ""].join(" ")} />
        </button>
      </div>

      {isOpen ? (
        <div className="absolute right-0 top-[calc(100%-1px)] z-30 w-full overflow-hidden rounded-b-[16px] border border-t-0 border-[var(--panel-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--accent)_18%,var(--panel-bg-strong))_0%,var(--panel-bg-strong)_100%)] p-2 text-[var(--text-primary)] shadow-[0_10px_28px_rgba(0,0,0,0.18)] backdrop-blur-[14px] max-[980px]:w-[56px] max-[980px]:p-1.5">
          <div className="space-y-1">
            {options.map((option) => (
              <button
                aria-label={option.label}
                className={[
                  "flex w-full items-center justify-between rounded-[10px] px-3 py-2.5 text-left text-[12px] transition",
                  "max-[980px]:justify-center max-[980px]:px-2 max-[980px]:py-2",
                  option.mode === selectedRunMode
                    ? "bg-[var(--accent-soft)] text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]",
                ].join(" ")}
                key={option.mode}
                onClick={() => {
                  onRunWithMode(option.mode);
                  setIsOpen(false);
                }}
                type="button"
              >
                <span className="flex items-center gap-2.5">
                  <RunModeIcon mode={option.mode} />
                  <span className="max-[980px]:hidden">{option.label}</span>
                </span>
                {option.mode === selectedRunMode ? (
                  <span className="text-sm font-semibold text-[var(--text-primary)] max-[980px]:hidden">✓</span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
