import { DarkBackdropNebula } from "../components/DarkBackdropNebula";
import { GameCanvas } from "../components/GameCanvas";
import { ProgramWorkspace } from "../components/ProgramWorkspace";
import { GameHeaderBar } from "../components/game-screen/GameHeaderBar";
import { GameOnboardingOverlay } from "../components/game-screen/GameOnboardingOverlay";
import { GameSuccessDialog } from "../components/game-screen/GameSuccessDialog";
import { useGameOnboarding } from "./game-screen/useGameOnboarding";
import { useGameScreenController } from "./game-screen/useGameScreenController";

export function GameScreen() {
  const controller = useGameScreenController();
  const onboarding = useGameOnboarding({
    hasRunStarted: controller.isAutoRunning ?? false,
    levelId: controller.level?.id ?? "",
    mainSlots: controller.level ? controller.slots.main : [],
    result: controller.result ?? null,
  });

  if (!controller.level) {
    return null;
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
                className="fixed inset-0 h-screen w-screen overflow-hidden xl:-translate-x-[182px]"
                {...controller.canvas}
              />

              <GameHeaderBar
                {...controller.header}
              />

              {controller.successDialog ? <GameSuccessDialog {...controller.successDialog} /> : null}
              {onboarding ? <GameOnboardingOverlay {...onboarding} /> : null}
            </>
          }
        />
      </div>
    </main>
  );
}
