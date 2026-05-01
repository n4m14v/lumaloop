# Monetization Implementation Plan

## Summary

V1 monetization uses Vercel Functions, Supabase Auth/Postgres, Stripe Checkout, and IndexedDB local-first storage. The product is a one-time `full_game` unlock. Anonymous players can play the free preview path; paid players unlock the full campaign and continue at the first newly unlocked premium level.

## Campaign Access

Free levels are explicit by id:

```ts
[
  "world-01-level-01",
  "world-01-level-02",
  "world-01-level-03",
  "world-01-level-04",
  "world-01-level-05",
  "world-01-level-06",
  "world-01-level-07",
  "world-01-level-08",
  "world-01-level-09",
  "world-01-level-10",
  "world-01-level-11",
]
```

Free users progress through this free sequence only. Premium levels remain visible but locked. Paid users progress through the full campaign. Admin mode bypasses all locks. Lock reasons are explicit: `available`, `free_progression_locked`, `premium_locked`, and `premium_progression_locked`.

After purchase, send the player to the earliest premium level in full campaign order that was locked before payment. With the current campaign, this is `world-03-level-01`.

## Backend, Auth, and Payments

Supabase tables:

- `profiles(user_id, email, stripe_customer_id, created_at, updated_at)`
- `entitlements(user_id, product_key, active, source, stripe_customer_id, stripe_checkout_session_id, created_at)`
- `level_progress(user_id, level_id, completed, best_stars, best_program_size, updated_at)`
- `saved_programs(user_id, level_id, main, p1, p2, updated_at)`
- `stripe_events(event_id, type, processed_at)`

RLS:

- Users read/write their own progress and saved programs.
- Users read their own entitlements.
- Only service role writes entitlements and Stripe events.

Vercel Functions:

- `POST /api/checkout/full-game`: requires Supabase auth, creates Stripe Checkout Session.
- `POST /api/stripe/webhook`: verifies Stripe signature, idempotently grants `full_game`.
- `GET /api/premium-levels`: requires `full_game`, returns premium level definitions and campaign version/hash.

Environment:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_FULL_GAME_PRICE_ID=
PUBLIC_SITE_URL=
```

## Offline and Sync

IndexedDB stores progress, saved programs, sync queue, entitlements, premium levels, and settings. Existing localStorage progress migrates into IndexedDB on first run.

Merge rules:

- `completed: true` wins.
- `bestStars`: max wins.
- `bestProgramSize`: lower positive value wins.
- Saved program conflict: latest `updated_at` wins.

Free levels always work offline. Paid users can play cached premium levels offline after one successful online entitlement check. A fresh device requires an online entitlement check before premium unlock.

## Implementation Phases

1. Add this plan document.
2. Add access helpers and explicit free preview sequence.
3. Add IndexedDB persistence and localStorage migration.
4. Add Supabase auth UI/state and anonymous play.
5. Add cloud sync schema/API wiring.
6. Add Stripe checkout, webhook, entitlement grant, and restore.
7. Add premium-level API and IndexedDB premium cache.
8. Polish offline/sync status.
9. Add launch docs, Stripe test checklist, privacy/terms, and basic analytics.

## Test Plan

- Free config marks the redesigned World 1 preview levels free.
- Free users progress through `freeLevelIds`.
- Paid users use full campaign order.
- Admin can access all levels.
- Premium/progression lock reasons are distinguishable.
- Post-purchase route points to `world-03-level-01`.
- IndexedDB migrates legacy progress.
- Webhook rejects invalid signatures and is idempotent.
- Checkout requires auth and grants entitlement only through webhook.
