# Game Rules

## Design Intent

The rules prioritize deterministic execution, legible failure, and authorable levels. The engine is the product foundation. The renderer and animations are replaceable clients of engine output.

## Board Model

- The board is a finite set of addressable tiles.
- Each tile is identified by `{ x, y }` and has a discrete height `z`.
- Missing coordinates are void and cannot be entered.
- Tile kinds in version 1:
  - `NORMAL`
  - `TARGET`
  - `BLOCKED`
- `VOID` is a semantic absence, not a placed traversable tile.

## Robot State

The robot state contains:

- `x`, `y`, `z`
- `facing` in `N | E | S | W`

Runtime state additionally tracks:

- Activated target ids
- Execution pointer
- Call stack
- Step count

## Routines

- The program contains `main` and optional `p1`, `p2`.
- Execution always starts at `main[0]`.
- Routines execute left to right.
- `CALL_P1` and `CALL_P2` push a new frame and jump to the first instruction of the target routine.
- If a routine ends, control returns to the calling frame.
- If `main` ends and all targets are lit, the run succeeds.
- If `main` ends and at least one target is unlit, the run fails with `FAILED_INCOMPLETE`.

## Command Semantics

### FORWARD

- Compute the adjacent coordinate in the current facing direction.
- The move is legal only if a tile exists at the destination and its height equals the current height.
- Moving into `BLOCKED`, off the board, or onto a different height fails with `FAILED_INVALID_MOVE`.

### TURN_LEFT / TURN_RIGHT

- Rotation is always legal.
- Rotation changes facing without changing coordinates or height.

### JUMP

- Compute the adjacent coordinate in the current facing direction.
- The move is legal only if a tile exists at the destination and one of the following is true:
  - destination height is exactly `current z + 1`
  - destination height is lower than the current height
- Jumping sideways to the same height is illegal.
- Jumping up by more than one level is illegal.
- Jumping into `BLOCKED` or off the board is illegal.
- Illegal jumps fail with `FAILED_INVALID_JUMP`.

### ACTIVATE

- The robot must be standing on a `TARGET` tile.
- Executing `ACTIVATE` on a non-target tile fails with `FAILED_WRONG_LIGHT`.
- Executing `ACTIVATE` on a target marks that target as activated.
- Re-lighting an already activated target is legal and leaves activation unchanged.

### CALL_P1 / CALL_P2

- The called routine must exist and contain at least one command.
- Calling a missing or empty routine fails with `FAILED_EMPTY_PROCEDURE`.
- Calls count toward recursion depth and total step count only when instructions execute, not when frames are pushed.

## Failure States

- `FAILED_INVALID_MOVE`
- `FAILED_INVALID_JUMP`
- `FAILED_WRONG_LIGHT`
- `FAILED_INCOMPLETE`
- `FAILED_MAX_STEPS`
- `FAILED_RECURSION`
- `FAILED_EMPTY_PROCEDURE`
- `FAILED_INVALID_PROGRAM`

## Limits And Determinism

- The interpreter is deterministic for the same level, program, and execution options.
- The interpreter halts when:
  - success is reached
  - a failure state is reached
  - executed instruction count exceeds `maxSteps`
  - call stack depth exceeds `maxCallDepth`

## Validation Rules

Levels must satisfy:

1. Unique level id
2. At least one traversable tile
3. Unique tile coordinates
4. Start position must exist on a traversable tile
5. Start `z` must match the tile at the start coordinate
6. Every target tile must have an id
7. Allowed commands must be unique
8. Slot limits must be positive integers when present
9. Procedures cannot have slot limits unless the command palette includes the matching call command
10. Star thresholds, if present, must be monotonically non-increasing from one star to three stars when treated as maximum command counts:
   - `three <= two <= one`

## Extension Points

Reserved future additions:

- Counted loops
- Tile-condition commands
- Switches and toggles
- Teleports
- One-way tiles
- Fragile tiles

These mechanics must extend the schema and rules documents before engine implementation begins.
