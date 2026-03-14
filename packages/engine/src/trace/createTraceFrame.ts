import type {
  Command,
  ExecutionPointer,
  RobotState,
  TraceFrame,
} from "../types";

export function createTraceFrame(input: {
  command: Command;
  pointer: ExecutionPointer;
  robotBefore: RobotState;
  robotAfter: RobotState;
  activatedTargetIds: Iterable<string>;
  callStackDepth: number;
}): TraceFrame {
  return {
    command: input.command,
    pointer: input.pointer,
    robotBefore: input.robotBefore,
    robotAfter: input.robotAfter,
    activatedTargetIds: [...input.activatedTargetIds].sort(),
    callStackDepth: input.callStackDepth,
  };
}
