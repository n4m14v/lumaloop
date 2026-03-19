/**
 * Comments:
 * - Floating floor tiles live in a dedicated module to keep the main canvas shell small.
 * - This module owns only decorative ground geometry and its lightweight animation.
 */

import { memo, useMemo, useRef } from "react";

import { Edges } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

import type { LevelDefinition } from "@lumaloop/engine";

import {
  LOW_TILE_FLOAT_AMPLITUDE,
  LOW_TILE_FLOAT_BASE_LIFT,
  LOW_TILE_FLOAT_SPEED,
  TILE_SIZE,
} from "./constants";
import { getBoardMetrics } from "./sceneMath";

const FloatingFloorTile = memo(function FloatingFloorTile({
  animated,
  x,
  y,
}: {
  animated: boolean;
  x: number;
  y: number;
}) {
  const groupRef = useRef<Group>(null);
  const phase = x * 0.45 + y * 0.6;

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) {
      return;
    }

    group.position.y = animated
      ? 0.05 +
        LOW_TILE_FLOAT_BASE_LIFT +
        Math.sin(clock.getElapsedTime() * LOW_TILE_FLOAT_SPEED + phase) * LOW_TILE_FLOAT_AMPLITUDE
      : 0.05;
  });

  return (
    <group position={[x * TILE_SIZE, 0.05, y * TILE_SIZE]} ref={groupRef}>
      <mesh>
        <boxGeometry args={[2, 0.1, 2]} />
        <meshStandardMaterial color="#d0d6de" />
        <meshStandardMaterial color="#d0d6de" />
        <meshStandardMaterial color="#edf1f5" />
        <meshStandardMaterial color="#b3bdc8" />
        <meshStandardMaterial color="#d0d6de" />
        <meshStandardMaterial color="#d0d6de" />
        <Edges color="#707985" scale={1} threshold={15} />
      </mesh>
    </group>
  );
});

function GridFloorInner({ level }: { level: LevelDefinition }) {
  const { minX, maxX, minY, maxY } = getBoardMetrics(level);
  const padding = 2;
  const tiles = useMemo(() => {
    const floorTiles = [];
    const occupiedTiles = new Set(level.board.map((tile) => `${tile.x},${tile.y}`));

    for (let x = minX - padding; x <= maxX + padding; x += 1) {
      for (let y = minY - padding; y <= maxY + padding; y += 1) {
        floorTiles.push(
          <FloatingFloorTile animated={!occupiedTiles.has(`${x},${y}`)} key={`${x},${y}`} x={x} y={y} />,
        );
      }
    }

    return floorTiles;
  }, [level.board, maxX, maxY, minX, minY]);

  return <group>{tiles}</group>;
}

export const GridFloor = memo(GridFloorInner, (previousProps, nextProps) => previousProps.level === nextProps.level);
