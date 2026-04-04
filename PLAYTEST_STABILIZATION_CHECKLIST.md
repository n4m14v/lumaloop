# Playtest And Stabilization Checklist

## Goal

Validate the game after the onboarding, progression, curriculum, polish, and load-time optimization work.

This milestone is about:

1. catching regressions
2. confirming progression and persistence behavior
3. finding UX friction in real play
4. validating localization and RTL behavior
5. making sure the game feels stable enough before backend work

## Areas To Validate

### 1. First Load

Check:

- app boots without console/runtime errors
- loading shell appears immediately
- game shell transitions in cleanly
- canvas loads without flicker or broken placeholder state
- no visible layout jumps between shell and canvas load

### 2. Progression UI

Check:

- level map opens and closes cleanly
- all worlds render in order
- current level is highlighted correctly
- completed levels show correct stars
- best size and ideal size display correctly
- world summaries match the visible level-card state
- perfected worlds/levels are labeled correctly

### 3. Persistence

Check:

- reload preserves current progression
- stars persist after reload
- best size persists after reload
- world summaries remain correct after reload
- onboarding state persists correctly
- replay tutorial resets onboarding without corrupting progression

### 4. Onboarding

Check:

- first-time onboarding starts at level 1
- level 2 micro-walkthrough appears correctly
- first toggle walkthrough appears at the correct switch level
- skipping onboarding prevents it from auto-showing again
- replay tutorial returns the user to level 1 and restarts the flow

### 5. Run Feedback

Check:

- incomplete runs show the non-blocking feedback card
- hard failures show the correct severity state
- feedback appears with intentional timing
- dismiss behavior works correctly across reruns
- success dialog appears correctly after a solved run
- success dialog values match the actual solved result

### 6. Localization

Check in:

- English
- Russian
- Hebrew

Validate:

- all world names are localized
- all onboarding text is localized
- progression labels are localized
- success/failure feedback is localized
- no fallback English strings appear unexpectedly

### 7. RTL

Check specifically in Hebrew:

- level-card headers
- current badge placement
- world header layout
- snackbar/feedback alignment
- header buttons and menus
- dialogs and overlay copy alignment

### 8. Responsive Layout

Check:

- desktop wide layout
- smaller laptop widths
- tablet-ish widths
- narrow mobile-like widths

Validate:

- right sidebar behavior
- header controls
- level map scrolling
- onboarding overlays
- success dialog sizing
- no clipping or overlap

### 9. Curriculum Flow

Play through key segments in order and note confusion or pacing spikes:

- world 1 basics
- procedures world
- recursion world
- switches world
- transition into later mastery/trickery worlds

Validate:

- mechanic introductions feel intentional
- no world feels too thin or abrupt
- new reinforcement levels are doing real work

### 10. Performance Sanity

Check:

- first page load
- first canvas load
- level map first open
- walkthrough first open
- language switch
- repeated level changes

Validate:

- no obvious new stalls
- no repeated heavy loading behavior that should be cached
- no visual flash during overlay transitions

## Bug Logging Format

When issues are found, record:

1. area
2. exact reproduction steps
3. expected behavior
4. actual behavior
5. locale/device/viewport if relevant
6. severity

Suggested severity levels:

- `P1` blocks basic play or progression
- `P2` major UX or logic issue
- `P3` polish issue

## Suggested Order

1. English desktop full pass
2. Hebrew RTL pass
3. Russian localization spot check
4. narrow-width responsive pass
5. persistence/reload pass
6. final cleanup list

## Exit Criteria

This milestone is done when:

- no `P1` issues remain
- progression and persistence are consistent
- onboarding works as intended
- RTL/localization regressions are addressed
- no major visual or interaction regressions remain from the recent milestones
