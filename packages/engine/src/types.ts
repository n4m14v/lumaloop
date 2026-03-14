import type {
  Command,
  LevelDefinition,
  ProgramSlots,
  RobotState,
  RoutineName,
  Tile,
} from "@lumaloop/level-schema";

export type {
  Command,
  LevelDefinition,
  ProgramSlots,
  RobotState,
  RoutineName,
  Tile,
} from "@lumaloop/level-schema";

export type RunStatus =
  | "SUCCESS"
  | "FAILED_INVALID_MOVE"
  | "FAILED_INVALID_JUMP"
  | "FAILED_WRONG_LIGHT"
  | "FAILED_INCOMPLETE"
  | "FAILED_MAX_STEPS"
  | "FAILED_RECURSION"
  | "FAILED_EMPTY_PROCEDURE"
  | "FAILED_INVALID_PROGRAM";

export interface ExecutionPointer {
  routine: RoutineName;
  index: number;
}

export interface TraceFrame {
  command: Command;
  pointer: ExecutionPointer;
  robotBefore: RobotState;
  robotAfter: RobotState;
  activatedTargetIds: string[];
  callStackDepth: number;
}

export interface ScoreDetails {
  executedInstructions: number;
  programLength: number;
  starsEarned: 0 | 1 | 2 | 3;
}

export interface RunResult {
  status: RunStatus;
  trace: TraceFrame[];
  stepCount: number;
  activatedTargetIds: string[];
  finalRobotState: RobotState;
  score: ScoreDetails;
  failureReason?: string;
}

export interface ExecutionOptions {
  maxSteps?: number;
  maxCallDepth?: number;
}

export interface RuntimeFrame {
  routine: RoutineName;
  index: number;
}

export interface LevelValidationIssue {
  path: string;
  message: string;
}

export interface LevelValidationResult {
  success: boolean;
  issues: LevelValidationIssue[];
}

export interface ProgramValidationResult {
  success: boolean;
  issues: LevelValidationIssue[];
}

export interface BoardIndex {
  byCoordinate: Map<string, Tile>;
  targets: Tile[];
}

export interface RunProgramInput {
  level: LevelDefinition;
  program: ProgramSlots;
  options?: ExecutionOptions;
}
