# Game Revision Plan

## Goal

Revise the current game around stronger playable decisions, not more abstract solver logic.
The existing engine is solid enough to support the current loop. The weak point is campaign
shape: late levels lean too hard on finding the intended repeated phrase, while extra board
noise often increases confusion without creating better gameplay.

## Current Assumptions

- The game is a deterministic programming puzzle.
- The player wins by activating every target.
- The main learning loop is inspect, program, run, observe, revise.
- Slot limits are the main pressure tool.
- Procedures and recursion are the core algorithmic ideas.
- Switches are already implemented and are the most promising state-changing mechanic.
- Visual themes are not a priority for this revision.

## Current Gameplay Problems

1. Normal gameplay exposed the full command set by default.
   This weakens level teaching because the palette stops matching the intended concept.

2. Late worlds repeat the same kind of challenge.
   Many hard, mastery, trickery, and phantom levels ask the player to discover a compact
   recursive motion phrase. That is a valid advanced puzzle, but it becomes stale when it
   carries too much of the campaign.

3. Misdirection is overused as difficulty.
   Extra walkable tiles and false paths make boards harder to parse, but they do not always
   create a more interesting decision.

4. Switches arrive as a mechanic but are under-leveraged.
   They change board state and create phases, which is a better gameplay foundation than
   simply adding larger recursive boards.

5. The docs lagged behind implementation.
   The rules and level guide still described an earlier scope and did not fully document
   switches.

## Implemented In This Pass

- Level-specific commands are now the default gameplay mode.
- The full command palette is reserved for `?admin`.
- Non-admin sessions are forced back to level-only commands if they inherit an admin state.
- Rules documentation now includes `SWITCH`, `TOGGLE`, movable tiles, and toggle failure.
- The level design guide now describes the actual campaign order and the desired revision.
- The app now consumes a centralized curated campaign from `@lumaloop/level-data`.
- The playable campaign was reduced from 66 authored levels to 46 current campaign levels, then extended to 51 with an advanced switchback chapter.
- `docs/CAMPAIGN_AUDIT.md` records keep, cut, and revise-later decisions for every authored level.
- The separate gate mechanic was removed after playtesting because it duplicated switches. The final chapter now uses familiar switches with more interesting state tradeoffs.
- A large-board landscape chapter was added to make the campaign feel broader and more premium without adding new rules.

## Campaign Revision

### Keep

- Basics, because the early teaching ramp is clear.
- Height, because jump legality adds a genuinely spatial rule.
- Procedures, because slot pressure and helper routines are the identity of the game.
- Switches, because they add board state and phase planning.
- A smaller set of recursion/mastery levels, because recursion should remain an advanced
  payoff.

### Compress Or Redesign

- Hard
- Very Hard
- Mastery
- Misdirection
- False Paths

These worlds have now been audited level by level. Cut levels remain in source as authored
content and regression coverage, but they no longer define the first complete playthrough.
Keep levels where the player makes a distinct planning decision. Redesign or remove levels
where the main difficulty is recognizing the same recursive sentence through added noise.

## New Level Design Rules

1. Every level must introduce, practice, or combine one named decision.
2. A false path is useful only if it teaches why the correct abstraction is better.
3. A bigger board is not a harder puzzle unless it creates a new planning tradeoff.
4. Switch levels should be phase-based: before toggle, after toggle, and sometimes after
   toggling back.
5. Recursion levels should be rare and memorable, not the default late-game filler.
6. Ideal solutions should remain short enough that the player can mentally simulate them.

## Recommended New Mechanics

Do not add these until the campaign audit is done.

### One-Way Tiles

Tiles that can only be entered from one direction or exited in one direction.

Why it helps:
- Adds route planning without adding a new command.
- Creates readable constraints.
- Works well with existing procedures.

Risk:
- Can become invisible or frustrating if the direction indicator is unclear.

### Fragile Tiles

Tiles that disappear or become blocked after one use.

Why it helps:
- Adds irreversible planning.
- Makes revisiting paths meaningful.
- Creates a strong reason to plan the whole route.

Risk:
- Requires clear failure feedback and trace visualization.

### Advanced Switchbacks

Switch-controlled moving bridges that make one path available while removing another.

Why it helps:
- Extends the existing switch model.
- Reuses the switch visual and rule language players already know.
- Creates good phase-based levels.

Status:
- Implemented as movable `NORMAL` tiles in `world-12-switchbacks`.

### Rotator Tiles

Tiles that rotate the robot automatically after entry.

Why it helps:
- Creates interesting compression opportunities.
- Reduces reliance on explicit turn commands.

Risk:
- Can make execution harder to predict if overused.

## Immediate Next Implementation Steps

1. Playtest the 51-level curated campaign and record drop-off, confusion, and repeated failure points.
2. Keep future stateful levels grounded in switches unless a new mechanic creates a genuinely new decision.
3. Continue adding large landscapes where visual route complexity is compressed by functions rather than by long main programs.
3. Decide whether `Revise later` levels from `docs/CAMPAIGN_AUDIT.md` deserve redesign or removal.
4. Add one new stateful mechanic only after the switch chapter feels good.
5. Add tests for every redesigned level's reference solution.

## Definition Of Better Gameplay

A revised level is better when:

- The player can explain the intended idea in one sentence after solving it.
- The first failed attempt reveals something specific.
- The best solution is shorter because of insight, not because of obscure command ordering.
- The board shape helps the player see the abstraction.
- The level would still be interesting with visual decoration removed.
