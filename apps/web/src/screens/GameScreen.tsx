import { useState, type ComponentProps } from "react";

import { DarkBackdropNebula } from "../components/DarkBackdropNebula";
import { GameCanvas } from "../components/GameCanvas";
import { ProgramWorkspace } from "../components/ProgramWorkspace";
import { useI18n } from "../i18n/I18nProvider";
import { GameHeaderBar } from "../components/game-screen/GameHeaderBar";
import { GameOnboardingOverlay } from "../components/game-screen/GameOnboardingOverlay";
import { GameSuccessDialog } from "../components/game-screen/GameSuccessDialog";
import { clearOnboardingProgress } from "./game-screen/onboardingStorage";
import { useGameOnboarding } from "./game-screen/useGameOnboarding";
import { useGameScreenController } from "./game-screen/useGameScreenController";

export function GameScreen() {
  const { t } = useI18n();
  const controller = useGameScreenController();
  const [isLevelMapOpen, setIsLevelMapOpen] = useState(false);
  const [onboardingRefreshToken, setOnboardingRefreshToken] = useState(0);
  const [dismissedResult, setDismissedResult] = useState<object | null>(null);
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
  const showRunFeedback = Boolean(
    (isIncompleteResult || isHardFailureResult) &&
    controller.result !== (controller.result ? dismissedResult : null),
  );
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
              <GameCanvas
                className={[
                  "fixed inset-0 h-screen w-screen overflow-hidden xl:-translate-x-[182px]",
                  isLevelMapOpen ? "invisible opacity-0" : "visible opacity-100",
                ].join(" ")}
                {...controller.canvas}
              />

              <GameHeaderBar
                {...controller.header}
                isLevelMapOpen={isLevelMapOpen}
                onCloseLevelMap={() => setIsLevelMapOpen(false)}
                onOpenLevelMap={() => setIsLevelMapOpen(true)}
                runFeedback={runFeedback}
                onReplayTutorial={() => {
                  clearOnboardingProgress();
                  controller.stopRun();
                  controller.setLevelIndex(0);
                  setOnboardingRefreshToken((current) => current + 1);
                }}
              />

              {controller.successDialog ? (
                <GameSuccessDialog
                  {...controller.successDialog}
                />
              ) : null}
              {onboarding ? <GameOnboardingOverlay {...onboarding} /> : null}
            </>
          }
        />
      </div>
    </main>
  );
}
