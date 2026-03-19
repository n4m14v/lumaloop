/**
 * Comments:
 * - LevelScene assembles the extracted 3D scene pieces under one translated group.
 * - It keeps GameCanvas focused on the canvas container and global render configuration.
 */

import { useMemo } from "react";

import type { LevelDefinition, RobotState, TraceFrame } from "@lumaloop/engine";

import type { RobotColorId } from "../../features/game/robotColors";
import { Robot } from "../Robot";
import { getBoardMetrics, getTileKey } from "./sceneMath";
import { GridFloor } from "./GridFloor";
import { TileBlock } from "./TileBlock";
import { VictoryBeam } from "./VictoryBeam";

interface LevelSceneProps {
  activeFrame: TraceFrame | null;
  committedRobot: RobotState;
  failurePulse: boolean;
  failurePulseToken: object | null;
  litTargets: string[];
  level: LevelDefinition;
  onFrameComplete: () => void;
  onVictorySequenceComplete: () => void;
  robotColorId: RobotColorId;
  showVictorySequence: boolean;
  theme: "dark" | "light";
  victoryBeamActive: boolean;
}

export function LevelScene({
  activeFrame,
  committedRobot,
  failurePulse,
  failurePulseToken,
  litTargets,
  level,
  onFrameComplete,
  onVictorySequenceComplete,
  robotColorId,
  showVictorySequence,
  theme,
  victoryBeamActive,
}: LevelSceneProps) {
  const { centerX, centerZ } = getBoardMetrics(level);
  const litTargetIds = useMemo(() => new Set(litTargets), [litTargets]);
  const activeTileKey =
    activeFrame === null ? null : getTileKey(activeFrame.robotAfter.x, activeFrame.robotAfter.y, activeFrame.robotAfter.z);
  const failureTileKey = failurePulse ? getTileKey(committedRobot.x, committedRobot.y, committedRobot.z) : null;
  const victoryTileKey = getTileKey(committedRobot.x, committedRobot.y, committedRobot.z);

  return (
    <group position={[-centerX, 0, -centerZ]}>
      <GridFloor level={level} />
      {level.board.map((tile) => {
        const tileKey = getTileKey(tile.x, tile.y, tile.z);

        return (
          <TileBlock
            failureBlink={tileKey === failureTileKey}
            failurePulseToken={failurePulseToken}
            isActive={tileKey === activeTileKey}
            isLit={tile.kind === "TARGET" && litTargetIds.has(tile.id as string)}
            key={tile.kind === "TARGET" ? tile.id : tileKey}
            tile={tile}
            victoryGlow={showVictorySequence && tileKey === victoryTileKey}
          />
        );
      })}
      <VictoryBeam active={victoryBeamActive} robot={committedRobot} />
      <Robot
        activeFrame={activeFrame}
        colorId={robotColorId}
        failurePulse={failurePulse}
        failurePulseToken={failurePulseToken}
        litTargets={litTargets}
        onFrameComplete={onFrameComplete}
        onVictorySequenceComplete={onVictorySequenceComplete}
        robot={committedRobot}
        theme={theme}
        victorySequenceActive={showVictorySequence}
      />
    </group>
  );
}
