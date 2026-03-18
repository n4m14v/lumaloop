/**
 * Comments:
 * - Pure scene-math helpers used by multiple canvas modules.
 * - These helpers stay React-free so camera and scene code can share them safely.
 */

import type { LevelDefinition } from "@lumaloop/engine";

import { BLOCK_HEIGHT, TILE_SIZE } from "./constants";

export function getBoardMetrics(level: LevelDefinition) {
  const xs = level.board.map((tile) => tile.x);
  const ys = level.board.map((tile) => tile.y);
  const zs = level.board.map((tile) => tile.z);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const maxZ = Math.max(...zs);

  return {
    minX,
    maxX,
    minY,
    maxY,
    centerX: ((minX + maxX) / 2) * TILE_SIZE,
    centerZ: ((minY + maxY) / 2) * TILE_SIZE,
    maxHeight: (maxZ + 1) * BLOCK_HEIGHT,
    planeSize: Math.max((maxX - minX + 6) * TILE_SIZE, (maxY - minY + 6) * TILE_SIZE, 20),
  };
}

export function getTileKey(x: number, y: number, z: number) {
  return `${x},${y},${z}`;
}
