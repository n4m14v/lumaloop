import type { Command, RobotState, RoutineName, Tile } from "@lumaloop/level-schema";

import { getResolvedBoardIndex } from "../boardState";
import {
  rotateLeft,
  rotateRight,
  validateForwardMove,
  validateJumpMove,
} from "../validation/validateMove";
import type { RunStatus } from "../types";

export type CommandExecutionResult =
  | {
      activeToggleGroups: Set<string>;
      boardAfter: Map<string, Tile>;
      ok: true;
      robotAfter: RobotState;
      activatedTargetIds: Set<string>;
      callRoutine?: RoutineName;
    }
  | {
      ok: false;
      status: RunStatus;
      reason: string;
    };

function getTargetId(tile: Tile | undefined): string | undefined {
  if (!tile || tile.kind !== "TARGET") {
    return undefined;
  }

  return tile.id;
}

function boardKey(x: number, y: number): string {
  return `${x},${y}`;
}

function toggleGroup(activeToggleGroups: Set<string>, toggleGroupId: string) {
  const nextActiveToggleGroups = new Set(activeToggleGroups);

  if (nextActiveToggleGroups.has(toggleGroupId)) {
    nextActiveToggleGroups.delete(toggleGroupId);
  } else {
    nextActiveToggleGroups.add(toggleGroupId);
  }

  return nextActiveToggleGroups;
}

export function executeCommand(input: {
  activeToggleGroups: Set<string>;
  command: Command;
  robot: RobotState;
  board: Tile[];
  activatedTargetIds: Set<string>;
}): CommandExecutionResult {
  const { activeToggleGroups, command, robot, board, activatedTargetIds } = input;
  const boardIndex = getResolvedBoardIndex(board, activeToggleGroups);

  switch (command) {
    case "TURN_LEFT":
      return {
        activeToggleGroups,
        boardAfter: boardIndex,
        ok: true,
        robotAfter: {
          ...robot,
          facing: rotateLeft(robot.facing),
        },
        activatedTargetIds,
      };
    case "TURN_RIGHT":
      return {
        activeToggleGroups,
        boardAfter: boardIndex,
        ok: true,
        robotAfter: {
          ...robot,
          facing: rotateRight(robot.facing),
        },
        activatedTargetIds,
      };
    case "FORWARD": {
      const result = validateForwardMove(robot, boardIndex);
      if (!result.success || !result.nextState) {
        return {
          ok: false,
          status: "FAILED_INVALID_MOVE",
          reason: "FORWARD requires an adjacent traversable tile at the same height.",
        };
      }

      return {
        activeToggleGroups,
        boardAfter: boardIndex,
        ok: true,
        robotAfter: result.nextState,
        activatedTargetIds,
      };
    }
    case "JUMP": {
      const result = validateJumpMove(robot, boardIndex);
      if (!result.success || !result.nextState) {
        return {
          ok: false,
          status: "FAILED_INVALID_JUMP",
          reason:
            "JUMP requires an adjacent traversable tile that is exactly one level up or any number of levels down.",
        };
      }

      return {
        activeToggleGroups,
        boardAfter: boardIndex,
        ok: true,
        robotAfter: result.nextState,
        activatedTargetIds,
      };
    }
    case "ACTIVATE": {
      const currentTile = boardIndex.get(boardKey(robot.x, robot.y));
      const targetId = currentTile?.kind === "TARGET" ? getTargetId(currentTile) : undefined;

      if (!targetId) {
        return {
          ok: false,
          status: "FAILED_WRONG_LIGHT",
          reason: "ACTIVATE may only be used while standing on a TARGET tile.",
        };
      }

      const nextActivatedTargetIds = new Set(activatedTargetIds);
      nextActivatedTargetIds.add(targetId);

      return {
        activeToggleGroups,
        boardAfter: boardIndex,
        ok: true,
        robotAfter: robot,
        activatedTargetIds: nextActivatedTargetIds,
      };
    }
    case "TOGGLE": {
      const currentTile = boardIndex.get(boardKey(robot.x, robot.y));

      if (!currentTile || currentTile.kind !== "SWITCH" || !currentTile.toggleGroup) {
        return {
          ok: false,
          status: "FAILED_INVALID_TOGGLE",
          reason: "TOGGLE may only be used while standing on a SWITCH tile.",
        };
      }

      return {
        activeToggleGroups: toggleGroup(activeToggleGroups, currentTile.toggleGroup),
        boardAfter: boardIndex,
        ok: true,
        robotAfter: robot,
        activatedTargetIds,
      };
    }
    case "CALL_P1":
      return {
        activeToggleGroups,
        boardAfter: boardIndex,
        ok: true,
        robotAfter: robot,
        activatedTargetIds,
        callRoutine: "p1",
      };
    case "CALL_P2":
      return {
        activeToggleGroups,
        boardAfter: boardIndex,
        ok: true,
        robotAfter: robot,
        activatedTargetIds,
        callRoutine: "p2",
      };
  }
}
