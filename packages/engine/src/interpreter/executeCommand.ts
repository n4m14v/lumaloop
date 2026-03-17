import type { Command, RobotState, RoutineName, Tile } from "@lumaloop/level-schema";

import {
  rotateLeft,
  rotateRight,
  validateForwardMove,
  validateJumpMove,
} from "../validation/validateMove";
import type { RunStatus } from "../types";

export type CommandExecutionResult =
  | {
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

export function executeCommand(input: {
  command: Command;
  robot: RobotState;
  boardIndex: Map<string, Tile>;
  activatedTargetIds: Set<string>;
}): CommandExecutionResult {
  const { command, robot, boardIndex, activatedTargetIds } = input;

  switch (command) {
    case "TURN_LEFT":
      return {
        ok: true,
        robotAfter: {
          ...robot,
          facing: rotateLeft(robot.facing),
        },
        activatedTargetIds,
      };
    case "TURN_RIGHT":
      return {
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
        ok: true,
        robotAfter: result.nextState,
        activatedTargetIds,
      };
    }
    case "ACTIVATE": {
      const currentTile = boardIndex.get(boardKey(robot.x, robot.y));
      const targetId = getTargetId(currentTile);

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
        ok: true,
        robotAfter: robot,
        activatedTargetIds: nextActivatedTargetIds,
      };
    }
    case "CALL_P1":
      return {
        ok: true,
        robotAfter: robot,
        activatedTargetIds,
        callRoutine: "p1",
      };
    case "CALL_P2":
      return {
        ok: true,
        robotAfter: robot,
        activatedTargetIds,
        callRoutine: "p2",
      };
  }
}
