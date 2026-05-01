# Agent Rules

This app must work in both modes:

- Standalone root: `https://lumaloop.vercel.app/`
- We3dfy hub subpath: `https://we3dfy.com/lumaloop`

Before editing routing, assets, auth, payment redirects, API paths, or public file references, read `PRODUCT_SUBPATH_RULES.md`.

Do not add root-based paths like `/play`, `/assets/*`, `/models/*`, `/api/*`, or `/auth/*` directly in app code. Use the shared base-path convention from `PRODUCT_SUBPATH_RULES.md`.

This Vite app defaults to standalone root mode. For hub builds, set `VITE_BASE_PATH=/lumaloop/` or use the `build:web:hub` / `dev:web:hub` scripts.
