import { z } from "zod";

export const directionSchema = z.enum(["N", "E", "S", "W"]);

export const commandSchema = z.enum([
  "FORWARD",
  "TURN_LEFT",
  "TURN_RIGHT",
  "JUMP",
  "LIGHT",
  "CALL_P1",
  "CALL_P2",
]);

export const tileKindSchema = z.enum(["NORMAL", "TARGET", "BLOCKED"]);

export const routineNameSchema = z.enum(["main", "p1", "p2"]);

export const robotStateSchema = z.object({
  x: z.number().int(),
  y: z.number().int(),
  z: z.number().int(),
  facing: directionSchema,
});

export const tileSchema = z
  .object({
    id: z.string().min(1).optional(),
    x: z.number().int(),
    y: z.number().int(),
    z: z.number().int().nonnegative(),
    kind: tileKindSchema,
  })
  .superRefine((tile, ctx) => {
    if (tile.kind === "TARGET" && !tile.id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "TARGET tiles must declare an id.",
        path: ["id"],
      });
    }

    if (tile.kind !== "TARGET" && tile.id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Only TARGET tiles may declare an id.",
        path: ["id"],
      });
    }
  });

export const slotLimitsSchema = z.object({
  main: z.number().int().positive(),
  p1: z.number().int().positive().optional(),
  p2: z.number().int().positive().optional(),
});

export const starsSchema = z
  .object({
    one: z.number().int().positive(),
    two: z.number().int().positive(),
    three: z.number().int().positive(),
  })
  .superRefine((stars, ctx) => {
    if (!(stars.three <= stars.two && stars.two <= stars.one)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Stars must satisfy three <= two <= one.",
      });
    }
  });

export const levelMetadataSchema = z.object({
  concept: z.string().min(1),
  designerNotes: z.string().min(1).optional(),
  idealSolutionLength: z.number().int().positive().optional(),
});

export const programSlotsSchema = z.object({
  main: z.array(commandSchema),
  p1: z.array(commandSchema).optional(),
  p2: z.array(commandSchema).optional(),
});

export const levelDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  world: z.string().min(1),
  board: z.array(tileSchema).min(1),
  start: robotStateSchema,
  allowedCommands: z.array(commandSchema).min(1),
  slotLimits: slotLimitsSchema,
  stars: starsSchema.optional(),
  metadata: levelMetadataSchema.optional(),
});

export type Direction = z.infer<typeof directionSchema>;
export type Command = z.infer<typeof commandSchema>;
export type TileKind = z.infer<typeof tileKindSchema>;
export type RoutineName = z.infer<typeof routineNameSchema>;
export type RobotState = z.infer<typeof robotStateSchema>;
export type Tile = z.infer<typeof tileSchema>;
export type SlotLimits = z.infer<typeof slotLimitsSchema>;
export type Stars = z.infer<typeof starsSchema>;
export type LevelMetadata = z.infer<typeof levelMetadataSchema>;
export type ProgramSlots = z.infer<typeof programSlotsSchema>;
export type LevelDefinition = z.infer<typeof levelDefinitionSchema>;
