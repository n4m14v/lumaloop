import { levelDefinitionSchema, type LevelDefinition } from "./schema";

export interface ValidationIssue {
  path: string;
  message: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  issues: ValidationIssue[];
}

function issuePathToString(path: (string | number)[]): string {
  if (path.length === 0) {
    return "root";
  }

  return path
    .map((segment) =>
      typeof segment === "number" ? `[${segment}]` : `${segment}`,
    )
    .join(".");
}

export function validateLevelDefinition(
  input: unknown,
): ValidationResult<LevelDefinition> {
  const parsed = levelDefinitionSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      issues: parsed.error.issues.map((issue) => ({
        path: issuePathToString(issue.path),
        message: issue.message,
      })),
    };
  }

  return {
    success: true,
    data: parsed.data,
    issues: [],
  };
}
