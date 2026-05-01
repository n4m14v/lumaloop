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

## Current Campaign Progression

1. Basics: sequence, turns, route planning, complete-target planning, early process reuse, and one switch-state teaser
2. Height: topology, jump legality, and height rhythm
3. Procedures: reusable phrases, nested helpers, and slot pressure
4. Switches: board-state changes, phase planning, and toggled paths
5. Recursion: self-calling procedures and repeated motion sentences
6. Hard / Very Hard / Mastery: harder recursive composition and optimization
7. Misdirection / False Paths: decoys that test whether the player can identify the real repeated phrase
8. Switchbacks: advanced movable-tile switches, complementary paths, backtracking, recursion, and height
9. Landscapes: larger boards that use functions and recursion to compress long visual paths

## Revision Target

The next campaign pass should compress worlds 6-10. Keep the strongest recursive
and mastery levels, but cut or redesign levels where difficulty comes mainly from visual
noise. A level should add a new decision, not merely hide the same decision behind more
walkable tiles.

## Author Checklist

Before accepting a level:

1. Name the primary concept in one sentence.
2. State the obvious wrong approach the level exposes.
3. Confirm the level can be solved with current mechanics.
4. Confirm slot limits reinforce the intended insight.
5. Record a reference solution and ideal length.
6. Add or update a regression test if a defect was fixed.
