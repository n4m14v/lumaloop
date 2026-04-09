import { Suspense, lazy, useEffect, useRef, useState, type ComponentProps } from "react";

import { DarkBackdropNebula } from "../components/DarkBackdropNebula";
import { ProgramWorkspace } from "../components/ProgramWorkspace";
import { useI18n } from "../i18n/I18nProvider";
import { GameHeaderBar } from "../components/game-screen/GameHeaderBar";
import { FULL_BLEED_GAME_SCENE_CLASS_NAME } from "../components/game-screen/sceneLayout";
import { clearOnboardingProgress } from "./game-screen/onboardingStorage";
import { useGameOnboarding } from "./game-screen/useGameOnboarding";
import { useGameScreenController } from "./game-screen/useGameScreenController";

const GameOnboardingOverlay = lazy(async () => {
  const module = await import("../components/game-screen/GameOnboardingOverlay");
  return { default: module.GameOnboardingOverlay };
});

const GameSuccessDialog = lazy(async () => {
  const module = await import("../components/game-screen/GameSuccessDialog");
  return { default: module.GameSuccessDialog };
});

const GameCanvas = lazy(async () => {
  const module = await import("../components/GameCanvas");
  return { default: module.GameCanvas };
});

function GameCanvasLoadingLayer({ className }: { className: string }) {
  return (
    <div
      aria-hidden="true"
      className={className}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(97,129,180,0.14),transparent_26%),radial-gradient(circle_at_50%_72%,rgba(255,214,113,0.04),transparent_18%)]" />
      <div className="absolute inset-x-[12%] top-[14%] h-[56%] rounded-[48px] border border-white/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] shadow-[0_30px_120px_rgba(0,0,0,0.24)]" />
    </div>
  );
}

export function GameScreen({ onSceneReady }: { onSceneReady?: () => void }) {
  const { t } = useI18n();
  const controller = useGameScreenController();
  const [isLevelMapOpen, setIsLevelMapOpen] = useState(false);
  const [onboardingRefreshToken, setOnboardingRefreshToken] = useState(0);
  const [dismissedResult, setDismissedResult] = useState<object | null>(null);
  const [visibleFeedbackResult, setVisibleFeedbackResult] = useState<object | null>(null);
  const feedbackTimeoutRef = useRef<number | null>(null);
  const onboarding = useGameOnboarding({
    hasRunStarted: controller.isAutoRunning ?? false,
    levelId: controller.level?.id ?? "",
    mainSlots: controller.level ? controller.slots.main : [],
    refreshToken: onboardingRefreshToken,
    result: controller.result ?? null,
  });

  if (!controller.level) {
    return null;
  }

  const isResolved = Boolean(
    controller.result &&
    controller.committedFrames >= controller.result.trace.length,
  );
  const isIncompleteResult = Boolean(
    controller.result &&
    isResolved &&
    controller.result.status === "FAILED_INCOMPLETE",
  );
  const isHardFailureResult = Boolean(
    controller.result &&
    isResolved &&
    controller.result.status !== "SUCCESS" &&
    controller.result.status !== "FAILED_INCOMPLETE",
  );
  useEffect(() => {
    if (feedbackTimeoutRef.current !== null) {
      window.clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = null;
    }

    if (!controller.result || !isResolved || controller.result.status === "SUCCESS") {
      setVisibleFeedbackResult(null);
      return;
    }

    setVisibleFeedbackResult(null);

    const feedbackDelayMs =
      controller.result.status === "FAILED_INCOMPLETE" ? 180 : 320;

    feedbackTimeoutRef.current = window.setTimeout(() => {
      feedbackTimeoutRef.current = null;
      setVisibleFeedbackResult(controller.result);
    }, feedbackDelayMs);

    return () => {
      if (feedbackTimeoutRef.current !== null) {
        window.clearTimeout(feedbackTimeoutRef.current);
        feedbackTimeoutRef.current = null;
      }
    };
  }, [controller.result, isResolved]);

  const showRunFeedback = Boolean(
    (isIncompleteResult || isHardFailureResult) &&
    controller.result === visibleFeedbackResult &&
    controller.result !== (controller.result ? dismissedResult : null),
  );
  const canvasClassName = [
    FULL_BLEED_GAME_SCENE_CLASS_NAME,
    isLevelMapOpen ? "invisible opacity-0" : "visible opacity-100",
  ].join(" ");
  let runFeedback: ComponentProps<typeof GameHeaderBar>["runFeedback"] = null;

  if (showRunFeedback && controller.result) {
    runFeedback = {
      body: t.failureBodies[controller.result.status] ?? t.failureBodies.FAILED_INVALID_PROGRAM,
      onDismiss: () => setDismissedResult(controller.result),
      severity:
        controller.result.status === "FAILED_INCOMPLETE"
          ? "info"
          : controller.result.status === "FAILED_WRONG_LIGHT"
            ? "warning"
            : "error",
      title: t.failureTitles[controller.result.status] ?? t.failureTitles.FAILED_INVALID_PROGRAM,
    };

  }

  return (
    <main className="relative isolate min-h-screen px-4 py-3 text-[var(--text-primary)] md:px-6 md:py-4">
      <DarkBackdropNebula />
      <div className="relative z-10 mx-auto max-w-[1920px]">
        <ProgramWorkspace
          activeRoutine={controller.workspace.activeRoutine}
          allowedCommands={controller.workspace.allowedCommands}
          currentPointer={controller.workspace.currentPointer}
          onAppendCommand={controller.workspace.onAppendCommand}
          onClearRoutine={controller.workspace.onClearRoutine}
          onRemoveCommand={controller.workspace.onRemoveCommand}
          onSelectRoutine={controller.workspace.onSelectRoutine}
          paletteCommands={controller.workspace.paletteCommands}
          routines={controller.workspace.routines}
          showAllActions={controller.workspace.showAllActions}
          scene={
            <>
              <Suspense fallback={<GameCanvasLoadingLayer className={canvasClassName} />}>
                <GameCanvas
                  className={canvasClassName}
                  {...(onSceneReady ? { onSceneReady } : {})}
                  {...controller.canvas}
                />
              </Suspense>

              <GameHeaderBar
                {...controller.header}
                isLevelMapOpen={isLevelMapOpen}
                onCloseLevelMap={() => setIsLevelMapOpen(false)}
                onOpenLevelMap={() => setIsLevelMapOpen(true)}
                menu={{
                  ...controller.header.menu,
                  onReplayTutorial: () => {
                    clearOnboardingProgress();
                    controller.stopRun();
                    controller.setLevelIndex(0);
                    setOnboardingRefreshToken((current) => current + 1);
                  },
                }}
                runFeedback={runFeedback}
              />

              {controller.successDialog ? (
                <Suspense fallback={null}>
                  <GameSuccessDialog
                    {...controller.successDialog}
                  />
                </Suspense>
              ) : null}
              {onboarding ? (
                <Suspense fallback={null}>
                  <GameOnboardingOverlay {...onboarding} />
                </Suspense>
              ) : null}
            </>
          }
        />
      </div>
    </main>
  );
}
