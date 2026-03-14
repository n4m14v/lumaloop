import type { Command, ProgramSlots, Tile } from "@lumaloop/level-schema";

import { createTraceFrame } from "../trace/createTraceFrame";
import { validateLevel, validateProgram } from "../validation/validateLevel";
import { executeCommand } from "./executeCommand";
import type {
  RunProgramInput,
  RunResult,
  RuntimeFrame,
  ScoreDetails,
  TraceFrame,
} from "../types";

const DEFAULT_MAX_STEPS = 1000;
const DEFAULT_MAX_CALL_DEPTH = 100;

function toBoardIndex(board: Tile[]): Map<string, Tile> {
  return new Map(board.map((tile) => [`${tile.x},${tile.y}`, tile]));
}

function countProgramLength(program: ProgramSlots): number {
  return program.main.length + (program.p1?.length ?? 0) + (program.p2?.length ?? 0);
}

function calculateStars(scoreBudget: number, thresholds?: { one: number; two: number; three: number }): 0 | 1 | 2 | 3 {
  if (!thresholds) {
    return 0;
  }

  if (scoreBudget <= thresholds.three) {
    return 3;
  }

  if (scoreBudget <= thresholds.two) {
    return 2;
  }

  if (scoreBudget <= thresholds.one) {
    return 1;
  }

  return 0;
}

function createScoreDetails(
  executedInstructions: number,
  programLength: number,
  thresholds?: { one: number; two: number; three: number },
): ScoreDetails {
  return {
    executedInstructions,
    programLength,
    starsEarned: calculateStars(programLength, thresholds),
  };
}

function createFailureResult(input: {
  status: RunResult["status"];
  reason: string;
  robot: RunResult["finalRobotState"];
  trace: RunResult["trace"];
  stepCount: number;
  activatedTargetIds: Iterable<string>;
  score: ScoreDetails;
}): RunResult {
  return {
    status: input.status,
    failureReason: input.reason,
    finalRobotState: input.robot,
    trace: input.trace,
    stepCount: input.stepCount,
    activatedTargetIds: [...input.activatedTargetIds].sort(),
    score: input.score,
  };
}

function isSuccessState(requiredTargetIds: string[], activatedTargetIds: Set<string>) {
  return requiredTargetIds.length > 0 && requiredTargetIds.every((targetId) => activatedTargetIds.has(targetId));
}

export function runProgram({ level, program, options }: RunProgramInput): RunResult {
  const levelValidation = validateLevel(level);
  const programValidation = validateProgram(level, program);
  const maxSteps = options?.maxSteps ?? DEFAULT_MAX_STEPS;
  const maxCallDepth = options?.maxCallDepth ?? DEFAULT_MAX_CALL_DEPTH;
  const trace: TraceFrame[] = [];
  const boardIndex = toBoardIndex(level.board);
  const activatedTargetIds = new Set<string>();
  const programLength = countProgramLength(program);
  const requiredTargetIds = level.board
    .filter((tile) => tile.kind === "TARGET")
    .map((tile) => tile.id as string);
  const score = createScoreDetails(0, programLength, level.stars);
  let robot = { ...level.start };
  let stepCount = 0;

  if (!levelValidation.success) {
    return createFailureResult({
      status: "FAILED_INVALID_PROGRAM",
      reason: levelValidation.issues.map((issue) => issue.message).join(" "),
      robot,
      trace,
      stepCount,
      activatedTargetIds,
      score,
    });
  }

  if (!programValidation.success) {
    return createFailureResult({
      status: "FAILED_INVALID_PROGRAM",
      reason: programValidation.issues.map((issue) => issue.message).join(" "),
      robot,
      trace,
      stepCount,
      activatedTargetIds,
      score,
    });
  }

  const routines: Record<"main" | "p1" | "p2", Command[]> = {
    main: program.main,
    p1: program.p1 ?? [],
    p2: program.p2 ?? [],
  };
  const frames: RuntimeFrame[] = [{ routine: "main", index: 0 }];

  while (frames.length > 0) {
    const currentFrame = frames[frames.length - 1];
    if (!currentFrame) {
      break;
    }

    const routine = routines[currentFrame.routine];

    if (currentFrame.index >= routine.length) {
      frames.pop();

      if (frames.length === 0) {
        const finalScore = createScoreDetails(
          stepCount,
          programLength,
          level.stars,
        );

        if (isSuccessState(requiredTargetIds, activatedTargetIds)) {
          return {
            status: "SUCCESS",
            trace,
            stepCount,
            activatedTargetIds: [...activatedTargetIds].sort(),
            finalRobotState: robot,
            score: finalScore,
          };
        }

        return createFailureResult({
          status: "FAILED_INCOMPLETE",
          reason: "Program ended before all targets were activated.",
          robot,
          trace,
          stepCount,
          activatedTargetIds,
          score: finalScore,
        });
      }

      const callerFrame = frames[frames.length - 1];
      if (callerFrame) {
        callerFrame.index += 1;
      }
      continue;
    }

    if (stepCount >= maxSteps) {
      return createFailureResult({
        status: "FAILED_MAX_STEPS",
        reason: `Execution exceeded the max step limit of ${maxSteps}.`,
        robot,
        trace,
        stepCount,
        activatedTargetIds,
        score: createScoreDetails(stepCount, programLength, level.stars),
      });
    }

    const pointer = { routine: currentFrame.routine, index: currentFrame.index } as const;
    const command = routine[currentFrame.index];
    if (!command) {
      return createFailureResult({
        status: "FAILED_INVALID_PROGRAM",
        reason: `Routine ${currentFrame.routine} has no command at index ${currentFrame.index}.`,
        robot,
        trace,
        stepCount,
        activatedTargetIds,
        score: createScoreDetails(stepCount, programLength, level.stars),
      });
    }

    const robotBefore = { ...robot };
    const result = executeCommand({
      command,
      robot,
      boardIndex,
      activatedTargetIds,
    });

    stepCount += 1;

    if (!result.ok) {
      return createFailureResult({
        status: result.status,
        reason: result.reason,
        robot,
        trace,
        stepCount,
        activatedTargetIds,
        score: createScoreDetails(stepCount, programLength, level.stars),
      });
    }

    robot = result.robotAfter;
    trace.push(
      createTraceFrame({
        command,
        pointer,
        robotBefore,
        robotAfter: robot,
        activatedTargetIds: result.activatedTargetIds,
        callStackDepth: frames.length,
      }),
    );

    const nextActivatedTargetIds = new Set(result.activatedTargetIds);
    activatedTargetIds.clear();
    for (const id of nextActivatedTargetIds) {
      activatedTargetIds.add(id);
    }

    if (isSuccessState(requiredTargetIds, activatedTargetIds)) {
      return {
        status: "SUCCESS",
        trace,
        stepCount,
        activatedTargetIds: [...activatedTargetIds].sort(),
        finalRobotState: robot,
        score: createScoreDetails(stepCount, programLength, level.stars),
      };
    }

    if (result.callRoutine) {
      const calledRoutine = routines[result.callRoutine];

      if (calledRoutine.length === 0) {
        return createFailureResult({
          status: "FAILED_EMPTY_PROCEDURE",
          reason: `${result.callRoutine.toUpperCase()} was called but has no commands.`,
          robot,
          trace,
          stepCount,
          activatedTargetIds,
          score: createScoreDetails(stepCount, programLength, level.stars),
        });
      }

      if (frames.length + 1 > maxCallDepth) {
        return createFailureResult({
          status: "FAILED_RECURSION",
          reason: `Call depth exceeded the limit of ${maxCallDepth}.`,
          robot,
          trace,
          stepCount,
          activatedTargetIds,
          score: createScoreDetails(stepCount, programLength, level.stars),
        });
      }

      frames.push({
        routine: result.callRoutine,
        index: 0,
      });
      continue;
    }

    currentFrame.index += 1;
  }

  return createFailureResult({
    status: "FAILED_INCOMPLETE",
    reason: "Execution ended unexpectedly.",
    robot,
    trace,
    stepCount,
    activatedTargetIds,
    score: createScoreDetails(stepCount, programLength, level.stars),
  });
}
