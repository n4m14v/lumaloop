/**
 * Comments:
 * - LevelScene assembles the extracted 3D scene pieces under one translated group.
 * - It keeps GameCanvas focused on the canvas container and global render configuration.
 */

import { useMemo, useRef, useState } from "react";

import { useFrame } from "@react-three/fiber";
import { getResolvedBoardTiles, type LevelDefinition, type RobotState, type TraceFrame } from "@lumaloop/engine";
import type { Group, Material, Mesh } from "three";

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
  destinationActive: boolean;
  movedTile: LevelDefinition["board"][number];
  sourceActive: boolean;
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
        destinationActive: true,
        movedTile,
        sourceActive: true,
        source: { x: movedTile.x, y: movedTile.y, z: movedTile.z },
        destination: movedTile.moveTo,
      }
    : {
        destinationActive: true,
        movedTile,
        sourceActive: true,
        source: movedTile.moveTo,
        destination: { x: movedTile.x, y: movedTile.y, z: movedTile.z },
      };
}

function ToggleTeleportEffect({
  destination,
  destinationActive,
  playbackSpeed,
  source,
  sourceActive,
  movedTile,
}: ToggleTeleportTransition & { playbackSpeed: number }) {
  const animationStartRef = useRef<number | null>(null);
  const sourceGroupRef = useRef<Group>(null);
  const destinationGroupRef = useRef<Group>(null);
  const pulseRef = useRef<Mesh>(null);
  const originalOpacitiesRef = useRef<Map<string, number>>(new Map());

  const applyTransitionState = (group: Group | null, opacityMultiplier: number, scale: number, lift: number) => {
    if (!group) return;
    if (opacityMultiplier <= 0.01) {
      group.visible = false;
      return;
    }
    group.visible = true;
    group.scale.set(scale, scale, scale);
    group.position.y = lift;
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
          mat.opacity = baseOpacity * opacityMultiplier;
        });
      }
    });
  };

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    if (animationStartRef.current === null) {
      animationStartRef.current = elapsed;
    }

    const duration = getScaledDuration(0.74, playbackSpeed, 0.34);
    const progress = Math.min((elapsed - animationStartRef.current) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const sourceOpacity = Math.max(0, 1 - eased * 1.08);
    const destinationOpacity = Math.min(1, Math.max(0, (eased - 0.18) / 0.82));
    const arc = Math.sin(progress * Math.PI) * 0.16;

    applyTransitionState(sourceGroupRef.current, sourceOpacity, 1 - eased * 0.08, arc);
    applyTransitionState(destinationGroupRef.current, destinationOpacity, 0.92 + destinationOpacity * 0.08, arc);

    if (pulseRef.current) {
      const pulseProgress = Math.min(1, Math.max(0, (progress - 0.08) / 0.58));
      pulseRef.current.visible = pulseProgress < 1;
      pulseRef.current.position.set(
        (source.x + (destination.x - source.x) * pulseProgress) * TILE_SIZE,
        (Math.max(source.z, destination.z) + 1.22) * BLOCK_HEIGHT + Math.sin(pulseProgress * Math.PI) * 0.22,
        (source.y + (destination.y - source.y) * pulseProgress) * TILE_SIZE,
      );
      pulseRef.current.scale.setScalar(0.1 + Math.sin(pulseProgress * Math.PI) * 0.12);
    }
  });

  const sourceTile = { ...movedTile, x: source.x, y: source.y, z: source.z };
  const destTile = { ...movedTile, x: destination.x, y: destination.y, z: destination.z };

  return (
    <>
      <group ref={sourceGroupRef}>
        <TileBlock
          failureBlink={false}
          failurePulseToken={null}
          isActive={false}
          isLit={false}
          isToggleGroupHighlighted={false}
          isToggleGroupActive={sourceActive}
          victoryGlow={false}
          tile={sourceTile}
        />
      </group>
      <group ref={destinationGroupRef}>
        <TileBlock
          failureBlink={false}
          failurePulseToken={null}
          isActive={false}
          isLit={false}
          isToggleGroupHighlighted={false}
          isToggleGroupActive={destinationActive}
          victoryGlow={false}
          tile={destTile}
        />
      </group>
      <mesh ref={pulseRef} visible={false}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#78ff77" transparent opacity={0.5} toneMapped={false} />
      </mesh>
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
  const [hoveredToggleGroup, setHoveredToggleGroup] = useState<string | null>(null);
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
  const focusRobot = activeFrame?.robotAfter ?? committedRobot;

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
            activeCommand={tileKey === activeTileKey ? (activeFrame?.command ?? null) : null}
            dimmed={
              tile.kind === "NORMAL" &&
              !tile.toggleGroup &&
              Math.abs(tile.x - focusRobot.x) + Math.abs(tile.y - focusRobot.y) > 4
            }
            failureBlink={tileKey === failureTileKey}
            failurePulseToken={failurePulseToken}
            isActive={tileKey === activeTileKey}
            isLit={tile.kind === "TARGET" && litTargetIds.has(tile.id as string)}
            isToggleGroupHighlighted={Boolean(tile.toggleGroup && hoveredToggleGroup === tile.toggleGroup)}
            isToggleGroupActive={tile.toggleGroup ? activeToggleGroups.has(tile.toggleGroup) : false}
            key={tile.kind === "TARGET" ? tile.id : tile.toggleGroup ? `${tile.toggleGroup}:${tileKey}` : tileKey}
            onToggleGroupHover={setHoveredToggleGroup}
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
