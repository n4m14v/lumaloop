import {
  validateLevelDefinition,
  type Command,
  type LevelDefinition,
  type Tile,
} from "@lumaloop/level-schema";

import type {
  LevelValidationIssue,
  LevelValidationResult,
  ProgramValidationResult,
} from "../types";

function keyForTile(tile: Pick<Tile, "x" | "y">): string {
  return `${tile.x},${tile.y}`;
}

function hasDuplicates(values: string[]): boolean {
  return new Set(values).size !== values.length;
}

export function validateLevel(level: unknown): LevelValidationResult {
  const base = validateLevelDefinition(level);

  if (!base.success || !base.data) {
    return {
      success: false,
      issues: base.issues,
    };
  }

  const definition = base.data;
  const issues: LevelValidationIssue[] = [];
  const coordinateKeys = definition.board.map((tile) => keyForTile(tile));
  const targetIds = definition.board
    .filter((tile) => tile.kind === "TARGET")
    .map((tile) => tile.id as string);

  if (hasDuplicates(coordinateKeys)) {
    issues.push({
      path: "board",
      message: "Board coordinates must be unique.",
    });
  }

  if (hasDuplicates(targetIds)) {
    issues.push({
      path: "board",
      message: "Target ids must be unique.",
    });
  }

  if (new Set(definition.allowedCommands).size !== definition.allowedCommands.length) {
    issues.push({
      path: "allowedCommands",
      message: "Allowed commands must be unique.",
    });
  }

  const startTile = definition.board.find(
    (tile) => tile.x === definition.start.x && tile.y === definition.start.y,
  );

  if (!startTile || startTile.kind === "BLOCKED") {
    issues.push({
      path: "start",
      message: "Start position must be on a traversable tile.",
    });
  } else if (startTile.z !== definition.start.z) {
    issues.push({
      path: "start.z",
      message: "Start height must match the tile at the start coordinate.",
    });
  }

  if (definition.slotLimits.p1 && !definition.allowedCommands.includes("CALL_P1")) {
    issues.push({
      path: "slotLimits.p1",
      message: "PROC1 slot limit requires CALL_P1 in allowedCommands.",
    });
  }

  if (definition.slotLimits.p2 && !definition.allowedCommands.includes("CALL_P2")) {
    issues.push({
      path: "slotLimits.p2",
      message: "PROC2 slot limit requires CALL_P2 in allowedCommands.",
    });
  }

  return {
    success: issues.length === 0,
    issues,
  };
}

function validateRoutineCommands(
  level: LevelDefinition,
  routineName: "main" | "p1" | "p2",
  commands: Command[] | undefined,
  issues: LevelValidationIssue[],
): void {
  if (!commands) {
    return;
  }

  for (const [index, command] of commands.entries()) {
    if (!level.allowedCommands.includes(command)) {
      issues.push({
        path: `${routineName}[${index}]`,
        message: `${command} is not allowed in this level.`,
      });
    }
  }

  const limit = level.slotLimits[routineName];
  if (limit && commands.length > limit) {
    issues.push({
      path: routineName,
      message: `${routineName} exceeds its slot limit of ${limit}.`,
    });
  }
}

export function validateProgram(
  level: LevelDefinition,
  program: { main: Command[]; p1?: Command[] | undefined; p2?: Command[] | undefined },
): ProgramValidationResult {
  const issues: LevelValidationIssue[] = [];

  validateRoutineCommands(level, "main", program.main, issues);
  validateRoutineCommands(level, "p1", program.p1, issues);
  validateRoutineCommands(level, "p2", program.p2, issues);

  return {
    success: issues.length === 0,
    issues,
  };
}
