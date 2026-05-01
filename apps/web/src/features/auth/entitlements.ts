import type { CachedEntitlement } from "../offline/indexedDb";

export function canUseCachedFullGameEntitlement({
  cachedEntitlement,
  hasSession,
  isOnline,
}: {
  cachedEntitlement: CachedEntitlement | null;
  hasSession: boolean;
  isOnline: boolean;
}) {
  if (cachedEntitlement?.active !== true) {
    return false;
  }

  return !isOnline || !hasSession;
}

export function resolveFullGameEntitlement({
  cachedEntitlement,
  hasSession,
  isOnline,
  serverActive,
}: {
  cachedEntitlement: CachedEntitlement | null;
  hasSession: boolean;
  isOnline: boolean;
  serverActive?: boolean;
}) {
  if (serverActive !== undefined && isOnline && hasSession) {
    return serverActive;
  }

  return canUseCachedFullGameEntitlement({ cachedEntitlement, hasSession, isOnline });
}
