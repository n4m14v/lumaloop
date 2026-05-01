# We3dfy Product Hosting Rules

Copy this file into every product repo that will be listed in the We3dfy hub.

## Required Convention

Every product must support two hosting modes from the same codebase:

```txt
Standalone root mode:
https://product-name.vercel.app/

We3dfy hub mode:
https://we3dfy.com/<product-slug>
```

Examples:

```txt
https://lumaloop.vercel.app/
https://we3dfy.com/lumaloop
https://we3dfy.com/lumaloop/play
```

Do not hardcode the hub subpath directly throughout the app. The product must
derive URLs from a single base-path helper or framework base-path setting.

## Core Rule

Do not assume the product always lives at `/`.

All routes, assets, links, redirects, fetches, auth callbacks, payment URLs, and
router navigation must be base-path aware.

Bad:

```ts
navigate("/play");
fetch("/api/state");
const model = "/models/RobotExpressive.glb";
const splash = "/splash.webp";
```

Good:

```ts
navigate(withBasePath("/play"));
fetch(withBasePath("/api/state"));
const model = withBasePath("/models/RobotExpressive.glb");
const splash = withBasePath("/splash.webp");
```

## Shared Helper Pattern

Each product should define one helper module for base-path handling.

For Vite products:

```ts
// src/app/basePath.ts
export const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, "");

export function withBasePath(path: string) {
  if (!path.startsWith("/")) {
    return BASE_PATH ? `${BASE_PATH}/${path}` : `/${path}`;
  }

  return `${BASE_PATH}${path}`;
}

export function withoutBasePath(pathname: string) {
  if (BASE_PATH && pathname === BASE_PATH) {
    return "/";
  }

  if (BASE_PATH && pathname.startsWith(`${BASE_PATH}/`)) {
    return pathname.slice(BASE_PATH.length) || "/";
  }

  return pathname;
}
```

For Next.js products:

```ts
// src/app/basePath.ts
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function withBasePath(path: string) {
  if (!path.startsWith("/")) {
    return BASE_PATH ? `${BASE_PATH}/${path}` : `/${path}`;
  }

  return `${BASE_PATH}${path}`;
}

export function withoutBasePath(pathname: string) {
  if (BASE_PATH && pathname === BASE_PATH) {
    return "/";
  }

  if (BASE_PATH && pathname.startsWith(`${BASE_PATH}/`)) {
    return pathname.slice(BASE_PATH.length) || "/";
  }

  return pathname;
}
```

Use the helper for app-authored URLs. Let the framework/bundler handle generated
asset URLs where possible.

When the hub temporarily proxies a root-built product, the browser may still
show `/lumaloop/*` even though the product was built with `/` as its base. In
that migration phase, the helper can infer the product hub path at runtime:

```ts
const PRODUCT_HUB_PATH = (import.meta.env.VITE_HUB_PATH ?? "/lumaloop").replace(/\/$/, "");

function runtimeBasePath() {
  if (BASE_PATH) {
    return BASE_PATH;
  }

  if (typeof window === "undefined" || !PRODUCT_HUB_PATH) {
    return "";
  }

  const { pathname } = window.location;

  if (pathname === PRODUCT_HUB_PATH || pathname.startsWith(`${PRODUCT_HUB_PATH}/`)) {
    return PRODUCT_HUB_PATH;
  }

  return "";
}
```

Use `runtimeBasePath()` inside `withBasePath` and `withoutBasePath` while the
product is in migration mode. Once the product is deployed with a real hub base
path, the build-time base path should take precedence.

## Vite Products

Vite `base` is build-time configuration. Default to standalone root mode and add
a separate hub build/dev command.

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const basePath = process.env.VITE_BASE_PATH ?? "/";

export default defineConfig({
  base: basePath,
  plugins: [react()],
});
```

Recommended scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -p tsconfig.json && vite build",
    "dev:hub": "VITE_BASE_PATH=/lumaloop/ pnpm run dev",
    "build:hub": "VITE_BASE_PATH=/lumaloop/ pnpm run build"
  }
}
```

Expected output:

```txt
Standalone build:
/assets/index.js
/favicon.svg

Hub build:
/lumaloop/assets/index.js
/lumaloop/favicon.svg
```

For public assets:

```ts
const modelUrl = withBasePath("/models/RobotExpressive.glb");
const splashUrl = withBasePath("/splash.webp");
```

For source-imported assets, prefer bundler-managed URLs:

```ts
import splashUrl from "./assets/splash.webp";
```

Vite products with client-side routes also need an SPA fallback in their Vercel
config so direct visits and hub rewrites to deep routes serve the app shell:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## Next.js Products

Next.js `basePath` is also build-time configuration. Default to standalone root
mode and add a separate hub build/dev command.

```ts
// next.config.ts
import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  ...(basePath ? { basePath } : {}),
};

export default nextConfig;
```

Recommended scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "dev:hub": "NEXT_PUBLIC_BASE_PATH=/lumaloop next dev",
    "build:hub": "NEXT_PUBLIC_BASE_PATH=/lumaloop next build"
  }
}
```

For public assets:

```tsx
<img src={withBasePath("/splash.webp")} alt="" />
```

## React Router Products

If the product uses React Router, configure the router basename from the base
path.

```tsx
import { BrowserRouter } from "react-router-dom";
import { BASE_PATH } from "./basePath";

export function App() {
  return (
    <BrowserRouter basename={BASE_PATH || undefined}>
      {/* routes */}
    </BrowserRouter>
  );
}
```

Then route links can remain product-relative:

```tsx
<Link to="/play">Play</Link>
```

In hub mode, that becomes:

```txt
/lumaloop/play
```

## Internal Navigation

Avoid raw root navigation.

Bad:

```ts
window.history.pushState(null, "", "/play");
window.location.href = "/account";
location.assign("/pricing");
```

Good:

```ts
window.history.pushState(null, "", withBasePath("/play"));
window.location.href = withBasePath("/account");
location.assign(withBasePath("/pricing"));
```

When reading `window.location.pathname`, strip the base path before matching
application routes:

```ts
const route = withoutBasePath(window.location.pathname);
```

## Entry-Only Routes

If a route must only be opened from an in-app flow, enforce that rule inside the
product, not only in the hub. For example, Lumaloop allows the game at
`/lumaloop/play`, but a direct visit should show the splash first. The splash
sets a short-lived `sessionStorage` flag before navigating to `/play`; the app
router clears or ignores direct `/play` visits without that flag.

Do not add an unconditional hub redirect from `/lumaloop/play` back to
`/lumaloop`, because that would also block the legitimate splash-to-play
navigation. The hub can redirect old root paths such as `/play` into the product
subpath, but the product decides whether the route is currently allowed.

## API Routes

Product-owned API calls must be base-path aware.

Bad:

```ts
fetch("/api/checkout");
```

Good:

```ts
fetch(withBasePath("/api/checkout"));
```

This keeps calls working in both modes:

```txt
Standalone: /api/checkout
Hub:        /lumaloop/api/checkout
```

## Auth and Payment Redirects

All product-owned auth/payment redirects must include the product path in hub
mode.

Examples:

```txt
Standalone:
https://lumaloop.vercel.app/auth/callback
https://lumaloop.vercel.app/account

Hub:
https://we3dfy.com/lumaloop/auth/callback
https://we3dfy.com/lumaloop/account
https://we3dfy.com/lumaloop/pricing
```

Do not configure providers with hub-root callbacks such as:

```txt
https://we3dfy.com/auth/callback
```

unless the product intentionally uses a shared hub-level auth system.

## We3dfy Hub Registry

Temporary compatibility mode for an existing root-built product:

```json
{
  "routeMode": "root",
  "needsSubpathMigration": true,
  "legacyRootPaths": ["/play"]
}
```

After the product supports the shared convention:

```json
{
  "routeMode": "basePath",
  "needsSubpathMigration": false
}
```

Remove temporary `legacyRootPaths` once the product no longer emits or navigates
to root paths like `/play`.

## Verification Checklist

Verify standalone mode:

- Run the normal dev/build command.
- Generated asset URLs are root URLs such as `/assets/*`.
- Visiting `/` works.
- Navigating to app routes such as `/play` works.
- Public assets such as `/splash.webp` and `/models/*` load.
- Product API calls use `/api/*`.

Verify hub mode:

- Run the hub dev/build command with the product base path.
- Generated asset URLs include the product path, such as `/lumaloop/assets/*`.
- Visiting `/lumaloop` works through the hub.
- Refreshing `/lumaloop/deep-route` works.
- Browser navigation stays under `/lumaloop/*`.
- No product-owned request goes to hub root paths like `/assets/*`, `/models/*`,
  `/play`, or `/api/*`.
- Static assets return the correct MIME type.
- Auth callbacks include `/lumaloop`.
- Payment success/cancel URLs include `/lumaloop`.

## Product Goal

Every product should remain portable:

```txt
Standalone:
https://product-name.vercel.app

Hub-hosted:
https://we3dfy.com/product-name

Future standalone domain:
https://product-name.com
```

The code should not need route rewrites or root-asset proxy hacks to work under
the hub. Compatibility routes in the hub are temporary migration aids only.
