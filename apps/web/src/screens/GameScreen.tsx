import { DarkThemeNebula } from "../components/DarkThemeNebula";
import { GameCanvas } from "../components/GameCanvas";
import { LightThemeClouds } from "../components/LightThemeClouds";
import { ProgramWorkspace } from "../components/ProgramWorkspace";
import { GameHeaderBar } from "../components/game-screen/GameHeaderBar";
import { GameSuccessDialog } from "../components/game-screen/GameSuccessDialog";
import { useGameScreenController } from "./game-screen/useGameScreenController";

export function GameScreen() {
  const controller = useGameScreenController();

  if (!controller.level) {
    return null;
  }

  return (
    <main className="relative isolate min-h-screen px-4 py-3 text-[var(--text-primary)] md:px-6 md:py-4">
      {controller.theme === "dark" ? <DarkThemeNebula /> : null}
      {controller.theme === "light" ? <LightThemeClouds /> : null}
      <div className="relative z-10 mx-auto max-w-[1920px]">
        <ProgramWorkspace
          activeRoutine={controller.workspace.activeRoutine}
          allowedCommands={controller.workspace.allowedCommands}
          currentPointer={controller.workspace.currentPointer}
          onAppendCommand={controller.workspace.onAppendCommand}
          onClearRoutine={controller.workspace.onClearRoutine}
          onRemoveCommand={controller.workspace.onRemoveCommand}
          onSelectRoutine={controller.workspace.onSelectRoutine}
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
            </>
          }
        />
      </div>
    </main>
  );
}
