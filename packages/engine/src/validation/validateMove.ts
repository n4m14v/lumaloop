import type { Direction, RobotState, Tile } from "@lumaloop/level-schema";

export interface MoveValidationResult {
  success: boolean;
  tile?: Tile;
  nextState?: RobotState;
  reason?: "FAILED_INVALID_MOVE" | "FAILED_INVALID_JUMP";
}

const directionDelta: Record<Direction, { dx: number; dy: number }> = {
  N: { dx: 0, dy: -1 },
  E: { dx: 1, dy: 0 },
  S: { dx: 0, dy: 1 },
  W: { dx: -1, dy: 0 },
};

function getCoordinateKey(x: number, y: number): string {
  return `${x},${y}`;
}

function getDestination(
  robot: RobotState,
  boardIndex: Map<string, Tile>,
): Tile | undefined {
  const delta = directionDelta[robot.facing];
  return boardIndex.get(getCoordinateKey(robot.x + delta.dx, robot.y + delta.dy));
}

function isTraversableTile(tile: Tile | undefined): tile is Tile {
  return Boolean(tile && tile.kind !== "BLOCKED");
}

export function validateForwardMove(
  robot: RobotState,
  boardIndex: Map<string, Tile>,
): MoveValidationResult {
  const tile = getDestination(robot, boardIndex);

  if (!isTraversableTile(tile) || tile.z !== robot.z) {
    return {
      success: false,
      reason: "FAILED_INVALID_MOVE",
    };
  }

  return {
    success: true,
    tile,
    nextState: {
      ...robot,
      x: tile.x,
      y: tile.y,
      z: tile.z,
    },
  };
}

export function validateJumpMove(
  robot: RobotState,
  boardIndex: Map<string, Tile>,
): MoveValidationResult {
  const tile = getDestination(robot, boardIndex);

  if (!isTraversableTile(tile)) {
    return {
      success: false,
      reason: "FAILED_INVALID_JUMP",
    };
  }

  const heightDelta = tile.z - robot.z;
  const isLegalJump = heightDelta === 1 || heightDelta < 0;

  if (!isLegalJump) {
    return {
      success: false,
      reason: "FAILED_INVALID_JUMP",
    };
  }

  return {
    success: true,
    tile,
    nextState: {
      ...robot,
      x: tile.x,
      y: tile.y,
      z: tile.z,
    },
  };
}

export function rotateLeft(facing: Direction): Direction {
  switch (facing) {
    case "N":
      return "W";
    case "W":
      return "S";
    case "S":
      return "E";
    case "E":
      return "N";
  }
}

export function rotateRight(facing: Direction): Direction {
  switch (facing) {
    case "N":
      return "E";
    case "E":
      return "S";
    case "S":
      return "W";
    case "W":
      return "N";
  }
}
