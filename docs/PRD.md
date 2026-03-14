# Product Requirements Document

## Summary

Build a deterministic programming puzzle game inspired by the teaching loop popularized by Lightbot:

1. Inspect a level
2. Assemble a small visual program
3. Execute it step by step
4. Observe deterministic success or failure
5. Revise and compress the solution

Version 1 is a polished single-player web game built around a reusable engine, a level curriculum, and authoring tools. The product goal is not to clone Lightbot's presentation. It is to preserve the learning loop while creating original infrastructure that can support future mechanics, themes, and community-authored content.

## Core Promise

The game teaches algorithmic thinking by making execution visible, constrained, and testable.

## Version 1 Scope

- Deterministic execution engine
- 20 to 30 handcrafted levels
- Visual programming UI
- Procedures/functions
- Replay and debug visibility
- Internal level editor

## Version 2 Directions

- Harder adult-oriented puzzle mechanics
- Kid-friendly educational theme
- Community level sharing
- Music or rhythm adaptation

## Audience

Primary:

- Kids 8 to 14 learning programming logic
- Parents and teachers seeking puzzle-based coding games
- Casual puzzle players who enjoy optimization and deterministic systems

Secondary:

- Older players who enjoy symbolic compression puzzles
- Educators seeking curriculum-aligned logic content

## Design Principles

1. Engine first, visuals second
2. Every level teaches one thing
3. Failure must be legible
4. Constraints create learning
5. Determinism over spectacle
6. Level design is the real product
7. Authoring tools arrive early

## Success Metrics

Product metrics:

- Level completion rate
- Average retries per level
- Drop-off by level
- Run-to-edit ratio
- Average use of step mode
- Star completion rate

Learning metrics:

- Whether players adopt procedures after introduction
- Whether retry count drops after concept mastery
- Whether players converge to shorter solutions over time

## Risks

1. Weak level design
2. Agent overlap and architecture drift
3. UI reimplementation of engine rules
4. Too many mechanics too early

## Non-Negotiable Rules

1. The engine remains framework-agnostic.
2. All level content validates against the schema.
3. Every level bug becomes a regression test.
4. The UI consumes trace data instead of inventing logic.
5. No new mechanic ships without at least three supporting levels.
6. Performance is secondary until the core loop is stable.
7. Avoid 3D in version 1.
