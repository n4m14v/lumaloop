# Level Design Guide

## Goal

Levels are the teaching surface. Each level should exist to teach or test a single idea. Anything that does not reinforce that idea is noise.

## Required Metadata

Each level must include:

- A single primary concept
- Allowed commands
- Slot limits
- Ideal solution length
- Star thresholds
- Designer notes

## Good Patterns

- Teach one idea at a time
- Include one tempting wrong path that teaches through failure
- Use symmetry and repetition intentionally
- Make procedure-worthy patterns visually obvious
- Keep board size proportional to the concept

## Bad Patterns

- Two new mechanics in one level
- Large empty boards that pad playtime
- Hidden rules or implicit legality changes
- Challenges based only on long input strings
- Boards solvable through blind brute force

## World Progression

1. Basics: sequence and execution order
2. Orientation: turns and path planning
3. Height: topology and jump legality
4. Repetition: repeated patterns and slot pressure
5. Procedures: abstraction and nested calls
6. Optimization: stars and shorter solutions
7. Advanced: new mechanics only after prior contract updates

## Author Checklist

Before accepting a level:

1. Name the primary concept in one sentence.
2. State the obvious wrong approach the level exposes.
3. Confirm the level can be solved with current mechanics.
4. Confirm slot limits reinforce the intended insight.
5. Record a reference solution and ideal length.
6. Add or update a regression test if a defect was fixed.
