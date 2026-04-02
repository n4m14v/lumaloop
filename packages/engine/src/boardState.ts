import type { Tile } from "@lumaloop/level-schema";

function hasActiveToggleGroup(
  activeToggleGroups: ReadonlySet<string> | readonly string[],
  toggleGroup: string,
) {
  return Array.isArray(activeToggleGroups)
    ? activeToggleGroups.includes(toggleGroup)
    : (activeToggleGroups as ReadonlySet<string>).has(toggleGroup);
}

function boardKey(x: number, y: number) {
  return `${x},${y}`;
}

function resolveTile(
  tile: Tile,
  activeToggleGroups: ReadonlySet<string> | readonly string[],
): Tile {
  if (tile.kind === "NORMAL" && tile.toggleGroup && tile.moveTo && hasActiveToggleGroup(activeToggleGroups, tile.toggleGroup)) {
    return {
      ...tile,
      x: tile.moveTo.x,
      y: tile.moveTo.y,
      z: tile.moveTo.z,
    };
  }

  return tile;
}

export function getResolvedBoardTiles(
  board: readonly Tile[],
  activeToggleGroups: ReadonlySet<string> | readonly string[],
): Tile[] {
  return board.map((tile) => resolveTile(tile, activeToggleGroups));
}

export function getResolvedBoardIndex(
  board: readonly Tile[],
  activeToggleGroups: ReadonlySet<string> | readonly string[],
): Map<string, Tile> {
  return new Map(
    getResolvedBoardTiles(board, activeToggleGroups).map((tile) => [boardKey(tile.x, tile.y), tile]),
  );
}

export function getSortedActiveToggleGroups(activeToggleGroups: Iterable<string>) {
  return [...new Set(activeToggleGroups)].sort();
}
