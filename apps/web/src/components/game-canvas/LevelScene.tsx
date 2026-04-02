/**
 * Comments:
 * - LevelScene assembles the extracted 3D scene pieces under one translated group.
 * - It keeps GameCanvas focused on the canvas container and global render configuration.
 */

import { useMemo, useRef } from "react";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { getResolvedBoardTiles, type LevelDefinition, type RobotState, type TraceFrame } from "@lumaloop/engine";
import type { Group, Material, MeshBasicMaterial } from "three";

import type { RobotColorId } from "../../features/game/robotColors";
import { Robot } from "../Robot";
import { BLOCK_HEIGHT, TILE_SIZE } from "./constants";
import { getBoardMetrics, getTileKey } from "./sceneMath";
import { GridFloor } from "./GridFloor";
import { TileBlock } from "./TileBlock";
import { VictoryBeam } from "./VictoryBeam";

interface LevelSceneProps {
  activeFrame: TraceFrame | null;
  committedActiveToggleGroups: string[];
  committedRobot: RobotState;
  failurePulse: boolean;
  failurePulseToken: object | null;
  litTargets: string[];
  level: LevelDefinition;
  onFrameComplete: () => void;
  onVictorySequenceComplete: () => void;
  playbackSpeed: number;
  robotColorId: RobotColorId;
  victoryExpressionActive: boolean;
  showVictorySequence: boolean;
  victoryBeamActive: boolean;
  robotRootRef?: React.RefObject<import("three").Group | null>;
  robotModelRef?: React.RefObject<import("three").Group | null>;
  isAutoRunning: boolean;
}

interface ToggleTeleportTransition {
  movedTile: LevelDefinition["board"][number];
  destination: { x: number; y: number; z: number };
  source: { x: number; y: number; z: number };
}

function getScaledDuration(baseDuration: number, playbackSpeed: number, minimumDuration: number) {
  return Math.max(minimumDuration, baseDuration / Math.max(playbackSpeed, 1));
}

function getToggleTeleportTransition(
  activeFrame: TraceFrame | null,
  previousActiveToggleGroups: readonly string[],
  level: LevelDefinition,
): ToggleTeleportTransition | null {
  if (!activeFrame || activeFrame.command !== "TOGGLE") {
    return null;
  }

  const previousGroups = new Set(previousActiveToggleGroups);
  const nextGroups = new Set(activeFrame.activeToggleGroups);
  const changedGroups = [...new Set([...previousGroups, ...nextGroups])].filter(
    (group) => previousGroups.has(group) !== nextGroups.has(group),
  );
  const toggledGroup = changedGroups[0];

  if (!toggledGroup) {
    return null;
  }

  const movedTile = level.board.find(
    (candidate) => candidate.kind === "NORMAL" && candidate.toggleGroup === toggledGroup && candidate.moveTo,
  );

  if (!movedTile?.moveTo) {
    return null;
  }

  const isActivated = nextGroups.has(toggledGroup);
  return isActivated
    ? {
        movedTile,
        source: { x: movedTile.x, y: movedTile.y, z: movedTile.z },
        destination: movedTile.moveTo,
      }
    : {
        movedTile,
        source: movedTile.moveTo,
        destination: { x: movedTile.x, y: movedTile.y, z: movedTile.z },
      };
}

function ToggleTeleportEffect({
  destination,
  playbackSpeed,
  source,
  movedTile,
}: ToggleTeleportTransition & { playbackSpeed: number }) {
  const animationStartRef = useRef<number | null>(null);
  const sourceGroupRef = useRef<Group>(null);
  const destinationGroupRef = useRef<Group>(null);
  const originalOpacitiesRef = useRef<Map<string, number>>(new Map());

  const applyOpacity = (group: Group | null, multiplier: number) => {
    if (!group) return;
    if (multiplier <= 0.01) {
      group.visible = false;
      return;
    }
    group.visible = true;
    group.traverse((child: any) => {
      if (child.isMesh && child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((mat: Material) => {
          if (!mat.isMaterial) return;
          if (!originalOpacitiesRef.current.has(mat.uuid)) {
            originalOpacitiesRef.current.set(mat.uuid, mat.opacity);
          }
          const baseOpacity = originalOpacitiesRef.current.get(mat.uuid) || 1;
          mat.transparent = true;
          mat.opacity = baseOpacity * multiplier;
        });
      }
    });
  };

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    if (animationStartRef.current === null) {
      animationStartRef.current = elapsed;
    }

    const duration = getScaledDuration(0.56, playbackSpeed, 0.26);
    const progress = Math.min((elapsed - animationStartRef.current) / duration, 1);

    if (progress <= 0.5) {
      // First half: strict fade out
      const localProgress = progress * 2;
      applyOpacity(sourceGroupRef.current, 1 - localProgress);
      applyOpacity(destinationGroupRef.current, 0);
    } else {
      // Second half: strict fade in
      const localProgress = (progress - 0.5) * 2;
      applyOpacity(sourceGroupRef.current, 0);
      applyOpacity(destinationGroupRef.current, localProgress);
    }
  });

  const sourceTile = { ...movedTile, x: source.x, y: source.y, z: source.z };
  const destTile = { ...movedTile, x: destination.x, y: destination.y, z: destination.z };

  return (
    <>
      <group ref={sourceGroupRef}>
        <TileBlock failureBlink={false} failurePulseToken={null} isActive={false} isLit={false} victoryGlow={false} tile={sourceTile} />
      </group>
      <group ref={destinationGroupRef}>
        <TileBlock failureBlink={false} failurePulseToken={null} isActive={false} isLit={false} victoryGlow={false} tile={destTile} />
      </group>
    </>
  );
}

export function LevelScene({
  activeFrame,
  committedActiveToggleGroups,
  committedRobot,
  failurePulse,
  failurePulseToken,
  litTargets,
  level,
  onFrameComplete,
  onVictorySequenceComplete,
  playbackSpeed,
  robotColorId,
  victoryExpressionActive,
  showVictorySequence,
  victoryBeamActive,
  robotRootRef,
  robotModelRef,
  isAutoRunning,
}: LevelSceneProps) {
  const { centerX, centerZ } = getBoardMetrics(level);
  const litTargetIds = useMemo(() => new Set(litTargets), [litTargets]);
  const activeToggleGroups = useMemo(
    () => new Set(activeFrame?.activeToggleGroups ?? committedActiveToggleGroups),
    [activeFrame?.activeToggleGroups, committedActiveToggleGroups],
  );
  const resolvedBoard = useMemo(
    () => getResolvedBoardTiles(level.board, activeToggleGroups),
    [activeToggleGroups, level.board],
  );
  const toggleTeleportTransition = useMemo(
    () => getToggleTeleportTransition(activeFrame, committedActiveToggleGroups, level),
    [activeFrame, committedActiveToggleGroups, level],
  );
  const activeTileKey =
    activeFrame === null ? null : getTileKey(activeFrame.robotAfter.x, activeFrame.robotAfter.y, activeFrame.robotAfter.z);
  const failureTileKey = failurePulse ? getTileKey(committedRobot.x, committedRobot.y, committedRobot.z) : null;
  const victoryTileKey = getTileKey(committedRobot.x, committedRobot.y, committedRobot.z);

  return (
    <group position={[-centerX, 0, -centerZ]}>
      <GridFloor level={level} />
      {toggleTeleportTransition ? <ToggleTeleportEffect {...toggleTeleportTransition} playbackSpeed={playbackSpeed} /> : null}
      {resolvedBoard.map((tile) => {
        const tileKey = getTileKey(tile.x, tile.y, tile.z);

        if (toggleTeleportTransition) {
          const destKey = getTileKey(toggleTeleportTransition.destination.x, toggleTeleportTransition.destination.y, toggleTeleportTransition.destination.z);
          if (tileKey === destKey) {
            return null; // Let the transition effect render the fading tile
          }
        }

        return (
          <TileBlock
            failureBlink={tileKey === failureTileKey}
            failurePulseToken={failurePulseToken}
            isActive={tileKey === activeTileKey}
            isLit={tile.kind === "TARGET" && litTargetIds.has(tile.id as string)}
            key={tile.kind === "TARGET" ? tile.id : tile.toggleGroup ? `${tile.toggleGroup}:${tileKey}` : tileKey}
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
        playbackSpeed={playbackSpeed}
        robot={committedRobot}
        victoryExpressionActive={victoryExpressionActive}
        victorySequenceActive={showVictorySequence}
        externalRootRef={robotRootRef}
        externalModelRef={robotModelRef}
        isAutoRunning={isAutoRunning}
      />
    </group>
  );
}
