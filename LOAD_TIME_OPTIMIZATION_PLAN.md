# Load-Time Optimization Plan

## Goal

Reduce initial load cost for the web game without changing gameplay behavior.

This milestone is about:

1. lowering the amount of JavaScript required before the game becomes interactive
2. deferring non-critical UI and 3D code until it is actually needed
3. improving asset loading strategy for the current game shell
4. making the build output easier to reason about and measure

## Current Baseline

Production build output at the start of this milestone:

- `dist/index.html`: `0.46 kB` (`0.30 kB` gzip)
- `dist/assets/index-CHv159zo.css`: `55.49 kB` (`10.63 kB` gzip)
- `dist/assets/index-DZe-TqnJ.js`: `1,616.03 kB` (`448.03 kB` gzip)

Current static assets in `apps/web/public`:

- `models/RobotExpressive.glb`: `456 kB`
- `draco/draco_decoder.js`: `504 kB`
- `draco/draco_decoder.wasm`: `188 kB`
- `draco/draco_wasm_wrapper.js`: `60 kB`

## Current Status

Completed so far:

1. Bootstrap path split
   - `App.tsx` now lazy-loads the game screen.
   - The entry now boots through a minimal loading shell.

2. Optional UI split
   - `LevelMapBackdrop`
   - `GameWalkthroughDialog`
   - `GameSuccessDialog`
   - `GameOnboardingOverlay`
   are now separate lazy chunks.

3. Locale split
   - locale data now lives in:
     - `apps/web/src/i18n/locales/en.ts`
     - `apps/web/src/i18n/locales/ru.ts`
     - `apps/web/src/i18n/locales/he.ts`
   - only the active locale is loaded at bootstrap
   - other locales load on switch

4. Build measurement
   - `apps/web/scripts/measure-build.mjs`
   - `pnpm --filter @lumaloop/web build:measure`

5. Vendor chunking
   - `react-vendor`
   - `render-vendor`
   - `ui-vendor`
   - `game-data`

6. Dead asset cleanup
   - removed unused Draco decoder assets from `apps/web/public/draco`

7. Postprocessing removal
   - removed the only `@react-three/postprocessing` usage from `GameCanvas.tsx`
   - removed `@react-three/postprocessing` and `postprocessing` from `apps/web/package.json`

8. Canvas deferral
   - `GameCanvas` now loads behind its own lazy boundary from `GameScreen`
   - the shell can paint before the 3D stack initializes

## Current Measured Output

Latest production build:

- `dist/assets/index-D5t6krWc.js`: `4.60 kB` (`2.16 kB` gzip)
- `dist/assets/react-vendor-glK8cWJp.js`: `193.87 kB` (`60.58 kB` gzip)
- `dist/assets/render-vendor-CwOCWXyE.js`: `1,029.34 kB` (`278.09 kB` gzip)
- `dist/assets/game-data-DyX9IB6i.js`: `115.81 kB` (`23.72 kB` gzip)
- `dist/assets/ui-vendor-DI4aO5Z9.js`: `82.61 kB` (`30.55 kB` gzip)
- `dist/assets/GameScreen-CAuWqSCA.js`: `82.10 kB` (`24.38 kB` gzip)
- `dist/assets/en-D4sgYrc9.js`: `8.67 kB` (`3.65 kB` gzip)
- `dist/assets/ru-pJ7stqQ_.js`: `45.39 kB` (`11.71 kB` gzip)
- `dist/assets/he-Csx38ak4.js`: `35.05 kB` (`9.68 kB` gzip)
- `apps/web/public/models/RobotExpressive.glb`: `456 kB` on disk

Summary:

- total JS: `1.54 MB`
- other assets: `454.04 kB`
- the remaining dominant JavaScript cost is now isolated in `render-vendor`
- the remaining dominant binary asset cost is `RobotExpressive.glb`

After removing bloom and deferring the canvas:

- `render-vendor`: `961.05 kB` (`261.42 kB` gzip)
- `GameScreen`: `43.84 kB`
- `GameCanvas`: `39.10 kB`
- total JS: `1.48 MB`

Interpretation:

- the JavaScript graph is now reasonably segmented
- further meaningful wins are unlikely to come from more generic code splitting
- the next high-leverage target is the robot model asset itself

## Main Findings

1. The biggest problem is not a single oversized model asset.
   The biggest problem is one large eager JavaScript bundle.

2. The game currently boots the whole shell eagerly:
   - React app shell
   - game screen
   - 3D scene
   - overlays/dialogs
   - i18n data

3. Several components are only needed on demand, but are bundled into first load:
   - level map backdrop
   - walkthrough dialog
   - success dialog
   - onboarding overlay

4. All locale messages are currently bundled up front.

5. The Three.js stack is part of the initial load path:
   - `three`
   - `@react-three/fiber`
   - `@react-three/drei`
   - `@react-three/postprocessing`

6. In the current codebase, the only `@react-three/postprocessing` usage is:
   - `EffectComposer`
   - `Bloom`
   in `apps/web/src/components/GameCanvas.tsx`

7. The robot model is still an uncompressed startup asset at roughly `456 kB`.

## Revised Next Moves

1. Optimize or replace `RobotExpressive.glb`.
   - This is the largest non-code asset still shipped.

2. Only after that, decide whether deeper render-stack splitting is justified.
   - At this point chunking is already doing its job.
   - The next wins are likely asset-level, not more Rollup surgery.

## Optimization Principles

1. Keep first render cheap.
2. Load the minimum code needed to show the shell.
3. Defer expensive features until the user reaches them.
4. Prefer measurable wins over theoretical micro-optimizations.
5. Do not make the architecture harder to maintain just to shave tiny bytes.

## Milestone Scope

### In Scope

1. code splitting
2. lazy loading of non-critical UI
3. lazy loading of locale message packs
4. Vite manual chunk strategy
5. asset loading review for model/decode path
6. simple preload strategy where justified
7. build measurement before and after each meaningful change

### Out Of Scope

1. backend or CDN work
2. gameplay changes
3. visual redesign
4. analytics infrastructure
5. premature low-level shader or render rewrites

## Work Plan

## Phase 1: Measurement And Guardrails

### Objective

Make optimization work measurable so changes are not based on guesswork.

### Tasks

1. Add a repeatable build-measure routine.
2. Record:
   - total JS output
   - main entry chunk size
   - CSS size
   - number of output chunks
3. Identify which modules dominate the main bundle.
4. Save the baseline numbers in this document or a dedicated build-notes file.

### Deliverable

A stable before/after comparison loop for the web bundle.

## Phase 2: Split The Bootstrap Path

### Objective

Avoid loading the full game screen graph before the app shell is ready.

### Tasks

1. Lazy-load the main game screen from the app entry.
   - `App.tsx` should not eagerly import the entire gameplay tree.
2. Add a minimal loading shell while the game screen chunk loads.
3. Keep the loading shell visually aligned with the game’s established dark style.

### Expected Impact

Reduce the size of the initial entry graph and make the first JS chunk smaller.

## Phase 3: Lazy-Load Non-Critical UI

### Objective

Move rarely used overlays and dialogs out of the initial bundle.

### Candidates

1. `LevelMapBackdrop`
2. `GameWalkthroughDialog`
3. `GameSuccessDialog`
4. `GameOnboardingOverlay`

### Tasks

1. Convert each candidate to `React.lazy` or dynamic import where appropriate.
2. Only mount/load:
   - level map when the user opens it
   - walkthrough dialog when requested
   - success dialog on success
   - onboarding overlay only when onboarding state actually requires it
3. Keep fallbacks minimal and non-blocking.

### Expected Impact

Lower initial UI bundle weight without affecting core run/play interactions.

## Phase 4: Split The 3D Stack Intentionally

### Objective

Prevent the full rendering stack from dominating the first-load chunk.

### Tasks

1. Review whether `GameCanvas` should be lazy-loaded separately from the broader screen.
2. Consider a staged load:
   - shell first
   - canvas second
3. Evaluate manual chunking for:
   - `three`
   - `@react-three/fiber`
   - `@react-three/drei`
   - `@react-three/postprocessing`
4. Keep the chunking strategy explicit in `vite.config.ts`.

### Constraints

1. Do not create many tiny chunks with poor cache behavior.
2. Do not introduce a visible broken state while the canvas loads.

### Expected Impact

Move rendering libraries out of the main entry path or at least isolate them into cacheable vendor chunks.

## Phase 5: Locale Loading

### Objective

Avoid shipping all locale data up front when only one locale is needed immediately.

### Tasks

1. Split `translations.ts` into per-locale modules.
2. Load only the active locale initially.
3. Lazy-load other locales on language switch.
4. Keep the i18n API stable for the rest of the app.

### Expected Impact

Smaller startup bundle and cleaner i18n boundaries.

## Phase 6: Asset And Decoder Strategy

### Objective

Make model loading more deliberate and avoid unnecessary decode cost.

### Tasks

1. Verify whether Draco files are actually used in the current model-loading path.
2. If Draco is unused:
   - remove unused Draco runtime assets from `public`
3. If Draco is used:
   - ensure decoder loading is deferred until model decode is needed
4. Review `RobotExpressive.glb`:
   - mesh count
   - animation count
   - texture payload
   - compression format
5. Decide whether further GLB optimization is worth it.

### Expected Impact

Cleaner asset path and potentially lower model startup cost.

## Phase 7: Preload Strategy

### Objective

Preload only what helps actual perceived performance.

### Tasks

1. Identify assets/code that benefit from preload:
   - the main game screen chunk
   - the robot model, if it is needed immediately after shell render
2. Avoid preloading optional overlays.
3. Validate that preloading improves user-visible startup, not just network activity.

### Expected Impact

Smoother perceived startup without undoing the value of code splitting.

## Phase 8: Post-Optimization Review

### Objective

Validate the changes and stop when the main bottlenecks are solved.

### Tasks

1. Rebuild production output.
2. Compare:
   - main chunk size
   - total JS
   - chunk graph
3. Test:
   - initial load
   - opening level map
   - success flow
   - onboarding
   - locale switch
   - first 3D scene load
4. Ensure there are no new:
   - loading flickers
   - SSR-style hydration assumptions
   - dialog timing regressions
   - race conditions around lazy imports

## Implementation Order

Recommended order of execution:

1. establish measurement
2. lazy-load `GameScreen`
3. lazy-load non-critical overlays/dialogs
4. split locale data
5. add Vite manual chunks for render/vendor code
6. validate Draco/model path
7. add targeted preloads
8. re-measure and stop

## Success Criteria

This milestone is successful if:

1. the single main JS chunk is materially reduced
2. non-critical UI is not in the initial bundle
3. locale data is no longer all eagerly bundled
4. the game still feels seamless on first load
5. no gameplay or onboarding regressions are introduced

## Risks

1. Over-splitting can create too many requests and hurt caching.
2. Lazy-loading overlays can introduce visible delay if fallbacks are poor.
3. Splitting i18n carelessly can cause flashes of untranslated content.
4. Splitting the 3D stack carelessly can cause shell/canvas mismatch during startup.

## Notes For Execution

1. Optimize the largest, clearest bottlenecks first.
2. Rebuild after every meaningful change.
3. Keep each optimization reversible until measured.
4. Prefer a few high-confidence wins over a long tail of tiny tweaks.
