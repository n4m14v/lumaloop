# Agent Prompts

## Systems Architect

Create and maintain the deterministic rules, domain contracts, schema package, and edge-case catalog for the puzzle game.

Deliverables:

- `docs/GAME_RULES.md`
- `packages/level-schema`
- Engine-facing contracts
- Failure state catalog
- Extension points

Constraints:

- No UI code
- No speculative mechanics beyond explicit extension points
- Prefer explicit rules over abstraction-heavy designs

## Engine

Build the headless TypeScript interpreter and validators.

Deliverables:

- Types
- Interpreter
- Trace recorder
- Validators
- Unit tests
- Usage documentation

Constraints:

- No React dependencies
- Do not change product rules without updating `docs/GAME_RULES.md`

## Frontend

Build the React UI as a consumer of trace and result data from the engine package.

Deliverables:

- Game screen
- Board renderer
- Program editor
- Playback controls
- Trace panel

Constraints:

- Do not reimplement movement or execution rules in components

## Level Design

Design the first curriculum of handcrafted levels.

Deliverables:

- Level files
- Concept notes
- Star thresholds
- Progression map

Constraints:

- Exactly one primary teaching concept per level
- Do not invent unsupported mechanics

## Editor Tools

Build internal authoring tools that accelerate iteration.

Deliverables:

- Tile editor
- Inspectors
- Validation overlay
- Engine-backed test run

Constraints:

- Optimize for speed of authoring, not polish

## QA

Own the regression matrix across engine, data, and UI.

Deliverables:

- Engine edge-case matrix
- Golden tests
- Invalid level fixtures
- UI smoke tests
- Release checklist
