# Curriculum Audit

## Scope

This audit covers the first 20 campaign levels in the current order:

1. `world-01-level-01` to `world-01-level-05`
2. `world-03-level-01` to `world-03-level-07`
3. `world-04-level-01` to `world-04-level-06`
4. `world-11-level-01` to `world-11-level-02`

## Current Campaign Read

### Levels 1-5: Basics

This section is strong.

- `Straight Line` cleanly introduces sequence + activate.
- `Face The Lamp` introduces turning in a controlled way.
- `Right Angle` reinforces order and corner planning.
- `Two Lamps` teaches that partial success is not completion.
- `Cross Check` closes the opening arc with full-route planning.

Assessment:

- good introduction
- good reinforcement
- good escalation
- no immediate curriculum issue here

### Levels 6-12: Height

This section is also strong.

- `First Step Up` and `Step Down` clearly isolate jump semantics.
- `Plateau Bend` combines jump with orientation.
- `Up Then Down`, `Stair Turn`, `Split Plateau`, and `Mountain Switch` reinforce jump timing across more varied terrain.

Assessment:

- the mechanic gets a proper introduction and reinforcement sequence
- the climb/descend distinction is taught clearly
- the final levels in this world feel like mastery rather than random difficulty

### Levels 13-18: Procedures

This section works, but it becomes dense quickly.

- `Twin March` is a good first `CALL_P1` level.
- `Nested Corner` introduces `CALL_P2` immediately in the very next level.
- `Signal Line`, `Stair Pair`, and `Spiral Signals` continue abstraction and composition well.
- `Lift Rhythm` is a good transfer test because it reuses procedures in a height-based pattern.

Assessment:

- `CALL_P1` introduction is good
- nested procedures arrive too quickly after the very first procedure lesson
- the world assumes abstraction fluency very fast

Main issue:

- `world-04-level-02` is likely too early for `CALL_P2`
- there is only one simple single-procedure introduction before the player is asked to think in nested helpers

### Levels 19-20: Switches

This is the sharpest pacing issue in the first 20 levels.

- `First Switch` introduces `TOGGLE`, board mutation, and `CALL_P1` in the same level
- `Open Then Turn` expands that immediately into switching plus turning plus both procedures

Assessment:

- the current switch intro is conceptually understandable
- it is not clean as a teaching beat
- the player is learning two ideas at once:
  - the board can change
  - procedures should structure the post-switch route

Main issue:

- `TOGGLE` does not get a pure introduction level
- the first switch lesson is already a combination lesson

## Beat-by-Beat Assessment

### Forward / Activate

- introduction: yes
- reinforcement: yes
- combination: yes
- mastery: yes

Status: healthy

### Turning

- introduction: yes
- reinforcement: yes
- combination: yes
- mastery: yes

Status: healthy

### Multi-target completion

- introduction: yes
- reinforcement: light but sufficient in early game
- combination: yes
- mastery: acceptable

Status: acceptable

### Jump / Height

- introduction: yes
- reinforcement: yes
- combination: yes
- mastery: yes

Status: healthy

### Procedures (`CALL_P1`)

- introduction: yes
- reinforcement: limited before nested abstraction begins
- combination: yes
- mastery: yes

Status: slightly compressed

### Procedures (`CALL_P2` / nested helpers)

- introduction: technically yes
- reinforcement: yes
- combination: yes
- mastery: yes

Status: introduced too quickly after `CALL_P1`

### Toggle

- introduction: not clean
- reinforcement: starts immediately as combination
- combination: yes
- mastery: too soon to judge

Status: weak introduction

## Main Findings

1. Basics and height are in good shape.
2. Procedures compress too much learning into the second level of the procedures world.
3. Switches are introduced too late as a mechanic and too early as a combination problem.
4. The first switch level should teach board mutation first, not board mutation plus helper-routine structure at the same time.

## Recommended Changes

### Priority 1: Add a cleaner toggle introduction

Add a new switch level before current `world-11-level-01` that:

- introduces `TOGGLE`
- does not require procedures
- does not require nested planning
- clearly demonstrates:
  - switch
  - board changes
  - path opens
  - move and activate

Desired command set:

- `TOGGLE`
- `FORWARD`
- `ACTIVATE`

Avoid:

- `CALL_P1`
- `CALL_P2`

Then move current `world-11-level-01` to become the second switch level.

### Priority 2: Slow down the procedure ramp

Options:

1. Add a second pure `CALL_P1` reinforcement level before `Nested Corner`
2. Or simplify `world-04-level-02` so it still uses procedures, but not nested helper composition yet

Preferred option:

- add one more `CALL_P1` reinforcement level

Reason:

- it preserves the current level designs
- it creates a clearer teaching beat
- it makes `CALL_P2` feel earned instead of abrupt

### Priority 3: Re-check switch world placement

Current campaign order is:

- basics
- height
- procedures
- switches
- recursion

This is defensible because switches already lean on procedures. The ordering itself is not the problem. The problem is the first switch lesson being too composite.

Recommendation:

- keep switches after procedures
- do not move the world yet
- fix the introduction level first

## Suggested Next Edits

1. Design one new pre-switch intro level.
2. Design one new single-procedure reinforcement level.
3. Re-run this audit after those two insertions.
4. Then review levels 21-40 before changing later worlds.

## Follow-Up Audit: Levels 21-40

This follow-up reflects the current campaign after:

- adding `world-11-level-toggle-intro`
- moving `Signal Line` ahead of `Nested Corner`

The next 20 levels are:

1. `world-05-level-01` to `world-05-level-06`
2. `world-06-level-01` to `world-06-level-05`
3. `world-07-level-01` to `world-07-level-05`
4. `world-08-level-01` to `world-08-level-04`

### Recursion World

This section is structurally solid.

- `Recursive Lamps` is a clean recursion introduction.
- `Recursive Stair` is a good reinforcement beat on terrain.
- `Corner Relay` and `Diamond Spin` introduce mutual recursion clearly.
- `Ridge Relay` and `Spiral Ascent` extend recursion into longer terrain and orientation phrases.

Assessment:

- recursion introduction: good
- mutual recursion introduction: good
- reinforcement: good
- mastery handoff: good

Status: healthy

### World 06 and World 07

These sections are not weak as puzzles, but they are weak as chapter identities.

- `world-06-hard` is really "advanced recursion and macro decomposition"
- `world-07-very-hard` is really "long-form composition and recursive macro phrases"

The problem is not the levels. The problem is the framing.

Current world labels communicate difficulty instead of learning value:

- `Hard`
- `Very Hard`

That is weaker curriculum design than the earlier mechanic-based worlds.

Assessment:

- level content: strong
- chapter identity: weak
- teaching value exists, but the world naming does not expose it

### Early Mastery World

The first mastery levels feel like a proper capstone:

- they combine earlier abstractions
- they ask for transfer, not just repetition
- they feel like "use what you know" rather than "learn a new rule"

Status: healthy

## Updated Findings

1. Early campaign pacing is now in better shape after the procedures reorder and clean toggle intro.
2. Recursion is introduced more cleanly than switches were.
3. The next curriculum weakness is not a missing level. It is world framing.
4. Difficulty-named worlds (`Hard`, `Very Hard`) are weaker teaching chapters than mechanic- or idea-named worlds.

## Recommended Next Changes

### Priority 4: Rename world display chapters

Do not change level ids yet. But the player-facing world titles should stop using raw slug-derived names for:

- `world-06-hard`
- `world-07-very-hard`

Recommended direction:

- rename by learning idea, not by difficulty
- examples:
  - world 06: advanced relays / recursive patterns / macro routes
  - world 07: composite routes / deep patterns / advanced composition

The exact labels can be decided later, but the important shift is:

- from difficulty framing
- to curriculum framing

### Priority 5: Audit levels 41-62 next

The remaining campaign still needs the same review:

- mastery back half
- trickery
- phantoms

Those are likely the next place where chapter identity and teaching clarity matter more than raw solvability.

## Final Audit: Levels 41-62

This final pass covers:

1. `world-08-level-05` to `world-08-level-10`
2. `world-09-level-01` to `world-09-level-05`
3. `world-10-level-01` to `world-10-level-08`
4. `world-11-level-toggle-intro` to `world-11-level-04`

### Back-Half Mastery

The rest of the mastery world holds up.

- the levels ask for transfer of previously learned abstractions
- the combinations are demanding, but the teaching identity is still clear
- the chapter earns the word "mastery"

Status: healthy

### Trickery World

The levels are coherent.

- they are about false affordances
- they tempt the player into storing the wrong repeated unit
- they test abstraction discipline rather than new mechanics

The issue is the title.

- `Trickery` is serviceable, but still reads like mood before curriculum
- the real chapter identity is misdirection and false abstractions

Status:

- level content: strong
- chapter framing: acceptable but improvable

### Phantoms World

This section is also coherent.

- it extends the false-affordance idea into denser boards
- it is about filtering noise and preserving the right abstraction under visual pressure
- it feels like an escalation of trickery, not a separate mechanical chapter

Again, the issue is the title.

- `Phantoms` is atmospheric
- but it does not tell the player what thinking skill is being tested

Status:

- level content: strong
- chapter framing: weaker than the underlying design

### Switch World Recheck

After the new intro level, the switch chapter is much healthier.

- `world-11-level-toggle-intro` is a clean first lesson
- `world-11-level-01` now works as the first composition beat
- later switch levels escalate in a sensible way

Status: healthy after revision

## Final Findings

1. The campaign no longer has an obvious early-teaching break.
2. The strongest remaining curriculum weakness is player-facing world framing.
3. Worlds 06, 07, 09, and 10 are better described by learning goals than by raw slug names.
4. The underlying level content is mostly stronger than the current chapter naming suggests.

## Recommended World Display Names

- `world-06-hard` → `Recursive Patterns`
- `world-07-very-hard` → `Advanced Composition`
- `world-09-trickery` → `Misdirection`
- `world-10-phantoms` → `False Paths`
