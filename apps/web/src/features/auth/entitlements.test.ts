import { describe, expect, it } from "vitest";

import { canUseCachedFullGameEntitlement, resolveFullGameEntitlement } from "./entitlements";

const activeCache = {
  active: true,
  productKey: "full_game",
  source: "stripe" as const,
  verifiedAt: 1,
};

describe("entitlement availability", () => {
  it("uses cached full-game entitlement while offline", () => {
    expect(canUseCachedFullGameEntitlement({
      cachedEntitlement: activeCache,
      hasSession: true,
      isOnline: false,
    })).toBe(true);
  });

  it("uses cached full-game entitlement when there is no active session to verify", () => {
    expect(canUseCachedFullGameEntitlement({
      cachedEntitlement: activeCache,
      hasSession: false,
      isOnline: true,
    })).toBe(true);
  });

  it("does not use active cache over an online signed-in verification path", () => {
    expect(canUseCachedFullGameEntitlement({
      cachedEntitlement: activeCache,
      hasSession: true,
      isOnline: true,
    })).toBe(false);
  });

  it("lets online server state overwrite stale active cache", () => {
    expect(resolveFullGameEntitlement({
      cachedEntitlement: activeCache,
      hasSession: true,
      isOnline: true,
      serverActive: false,
    })).toBe(false);
  });

  it("keeps premium locked offline without a cached active entitlement", () => {
    expect(resolveFullGameEntitlement({
      cachedEntitlement: null,
      hasSession: true,
      isOnline: false,
    })).toBe(false);
  });
});
