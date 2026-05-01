import { withBasePath } from "../../app/basePath";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { FULL_GAME_PRODUCT_KEY } from "@lumaloop/level-data";

import {
  deleteSyncOperation,
  readEntitlementFromIndexedDb,
  readProgramRecordsFromIndexedDb,
  readProgressFromIndexedDb,
  readSyncQueue,
  writeEntitlementToIndexedDb,
  writePremiumLevelsToIndexedDb,
  writeProgramToIndexedDb,
  writeProgressToIndexedDb,
} from "../offline/indexedDb";
import { createEmptyLevelProgressState, writeLevelProgress } from "../../screens/game-screen/levelProgressStorage";
import {
  cloudProgramRowToRecord,
  dispatchCloudProgressMerged,
  mergeCloudProgress,
  pickLatestProgramRecord,
  progressStateToCloudRows,
  type CloudProgramRow,
  type CloudProgressRow,
} from "./cloudSync";
import { resolveFullGameEntitlement } from "./entitlements";
import {
  isSupabaseConfigured,
  supabase,
  type AuthSession,
  type AuthUser,
} from "./supabaseClient";

interface AuthContextValue {
  checkoutStatus: "cancelled" | "idle" | "success";
  clearCheckoutStatus: () => void;
  hasFullGame: boolean;
  isAuthConfigured: boolean;
  isLoading: boolean;
  refreshEntitlements: () => Promise<void>;
  session: AuthSession | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  startFullGameCheckout: () => Promise<void>;
  syncStatus: "local" | "offline" | "syncing" | "synced" | "error";
  user: AuthUser | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function isMissingSchemaError(error: unknown) {
  return Boolean(
    error &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code?: unknown }).code === "PGRST205",
  );
}

async function readCheckoutStatus(): Promise<"cancelled" | "idle" | "success"> {
  if (typeof window === "undefined") {
    return "idle";
  }

  const searchParams = new URLSearchParams(window.location.search);
  const checkout = searchParams.get("checkout");
  if (checkout === "success" || checkout === "cancelled") {
    searchParams.delete("checkout");
    const nextSearch = searchParams.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}`);
    return checkout;
  }

  return "idle";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [checkoutStatus, setCheckoutStatus] = useState<"cancelled" | "idle" | "success">("idle");
  const [hasFullGame, setHasFullGame] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [syncStatus, setSyncStatus] = useState<AuthContextValue["syncStatus"]>("local");

  const pullCloudState = useCallback(async () => {
    if (!supabase || !session?.user || !navigator.onLine) {
      return;
    }

    setSyncStatus("syncing");

    const localProgress = await readProgressFromIndexedDb().catch(() => null);
    const { data: cloudProgressRows, error: progressError } = await supabase
      .from("level_progress")
      .select("level_id, completed, best_stars, best_program_size");

    if (progressError) {
      if (isMissingSchemaError(progressError)) {
        setSyncStatus("local");
        return;
      }

      setSyncStatus("error");
      return;
    }

    const mergedProgress = mergeCloudProgress(
      localProgress ?? createEmptyLevelProgressState(),
      (cloudProgressRows ?? []) as CloudProgressRow[],
    );
    await writeProgressToIndexedDb(mergedProgress).catch(() => undefined);
    writeLevelProgress(mergedProgress);
    dispatchCloudProgressMerged();

    const mergedRows = progressStateToCloudRows(mergedProgress, session.user.id);
    if (mergedRows.length > 0) {
      const { error } = await supabase.from("level_progress").upsert(mergedRows);
      if (error) {
        if (isMissingSchemaError(error)) {
          setSyncStatus("local");
          return;
        }

        setSyncStatus("error");
        return;
      }
    }

    const { data: cloudProgramRows, error: programsError } = await supabase
      .from("saved_programs")
      .select("level_id, main, p1, p2, updated_at");

    if (programsError) {
      if (isMissingSchemaError(programsError)) {
        setSyncStatus("local");
        return;
      }

      setSyncStatus("error");
      return;
    }

    const programRowsForUpsert: Array<{
      level_id: string;
      main: unknown[];
      p1: unknown[];
      p2: unknown[];
      updated_at: string;
      user_id: string;
    }> = [];

    const cloudRecords = new Map(
      ((cloudProgramRows ?? []) as CloudProgramRow[])
        .map((row) => [row.level_id, cloudProgramRowToRecord(row)] as const),
    );
    const localRecords = new Map(
      (await readProgramRecordsFromIndexedDb().catch(() => []))
        .map((record) => [record.levelId, record] as const),
    );
    const levelIds = new Set([...cloudRecords.keys(), ...localRecords.keys()]);

    for (const levelId of levelIds) {
      const cloudRecord = cloudRecords.get(levelId) ?? null;
      const localRecord = localRecords.get(levelId) ?? null;
      const latestRecord = pickLatestProgramRecord(localRecord, cloudRecord);

      if (!latestRecord) {
        continue;
      }

      await writeProgramToIndexedDb(latestRecord.levelId, latestRecord.value, latestRecord.updatedAt).catch(() => undefined);

      if (latestRecord === localRecord) {
        programRowsForUpsert.push({
          level_id: latestRecord.levelId,
          main: latestRecord.value.main,
          p1: latestRecord.value.p1,
          p2: latestRecord.value.p2,
          updated_at: new Date(latestRecord.updatedAt).toISOString(),
          user_id: session.user.id,
        });
      }
    }

    if (programRowsForUpsert.length > 0) {
      const { error } = await supabase.from("saved_programs").upsert(programRowsForUpsert);
      if (error) {
        if (isMissingSchemaError(error)) {
          setSyncStatus("local");
          return;
        }

        setSyncStatus("error");
        return;
      }
    }

    setSyncStatus("synced");
  }, [session?.user]);

  const refreshEntitlements = useCallback(async () => {
    const cachedEntitlement = await readEntitlementFromIndexedDb(FULL_GAME_PRODUCT_KEY).catch(() => null);
    const isOnline = navigator.onLine;
    const hasSession = Boolean(session?.access_token);
    setHasFullGame(resolveFullGameEntitlement({
      cachedEntitlement,
      hasSession,
      isOnline,
    }));

    if (!supabase || !session?.access_token) {
      setSyncStatus(isOnline ? "local" : "offline");
      return;
    }

    if (!isOnline) {
      setSyncStatus("offline");
      return;
    }

    setSyncStatus("syncing");
    const { data, error } = await supabase
      .from("entitlements")
      .select("active")
      .eq("product_key", FULL_GAME_PRODUCT_KEY)
      .eq("active", true)
      .maybeSingle();

    if (error) {
      if (isMissingSchemaError(error)) {
        setSyncStatus("local");
        return;
      }

      setSyncStatus("error");
      return;
    }

    const isActive = data?.active === true;
    setHasFullGame(resolveFullGameEntitlement({
      cachedEntitlement,
      hasSession: true,
      isOnline: true,
      serverActive: isActive,
    }));
    setSyncStatus("synced");
    await writeEntitlementToIndexedDb({
      active: isActive,
      productKey: FULL_GAME_PRODUCT_KEY,
      source: "stripe",
      verifiedAt: Date.now(),
    }).catch(() => undefined);

    if (isActive) {
      const response = await fetch(withBasePath("/api/premium-levels"), {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }).catch(() => null);

      if (response?.ok) {
        const premiumLevels = await response.json() as { campaignVersion: string; levels: unknown[] };
        await writePremiumLevelsToIndexedDb(premiumLevels).catch(() => undefined);
      }
    }
  }, [session?.access_token]);

  const flushSyncQueue = useCallback(async () => {
    if (!supabase || !session?.user || !navigator.onLine) {
      return;
    }

    const operations = await readSyncQueue().catch(() => []);
    if (operations.length === 0) {
      return;
    }

    const latestOperationByKey = new Map<string, (typeof operations)[number]>();
    for (const operation of operations) {
      const payload = operation.payload as Record<string, unknown>;
      const levelId = typeof payload.levelId === "string" ? payload.levelId : "unknown";
      const operationKey = `${operation.type}:${levelId}`;
      const existingOperation = latestOperationByKey.get(operationKey);

      if (!existingOperation || existingOperation.createdAt < operation.createdAt) {
        latestOperationByKey.set(operationKey, operation);
      }
    }

    const compactedOperations = new Set(latestOperationByKey.values());
    for (const operation of operations) {
      if (!compactedOperations.has(operation)) {
        await deleteSyncOperation(operation.id).catch(() => undefined);
      }
    }

    setSyncStatus("syncing");

    for (const operation of compactedOperations) {
      const payload = operation.payload as Record<string, unknown>;
      let error: { message: string } | null = null;

      if (operation.type === "progress_updated") {
        if (typeof payload.levelId !== "string" || typeof payload.starsEarned !== "number") {
          await deleteSyncOperation(operation.id).catch(() => undefined);
          continue;
        }

        const result = await supabase.from("level_progress").upsert({
          best_program_size: typeof payload.programLength === "number" ? payload.programLength : null,
          best_stars: payload.starsEarned,
          completed: true,
          level_id: payload.levelId,
          updated_at: new Date(operation.createdAt).toISOString(),
          user_id: session.user.id,
        });
        error = result.error;
      }

      if (operation.type === "program_saved") {
        if (typeof payload.levelId !== "string") {
          await deleteSyncOperation(operation.id).catch(() => undefined);
          continue;
        }

        const result = await supabase.from("saved_programs").upsert({
          level_id: payload.levelId,
          main: payload.main ?? [],
          p1: payload.p1 ?? [],
          p2: payload.p2 ?? [],
          updated_at: new Date(operation.createdAt).toISOString(),
          user_id: session.user.id,
        });
        error = result.error;
      }

      if (error) {
        if (isMissingSchemaError(error)) {
          setSyncStatus("local");
          return;
        }

        setSyncStatus("error");
        return;
      }

      await deleteSyncOperation(operation.id).catch(() => undefined);
    }

    setSyncStatus("synced");
  }, [session?.user]);

  useEffect(() => {
    let isActive = true;

    async function bootstrap() {
      const status = await readCheckoutStatus();
      if (isActive) {
        setCheckoutStatus(status);
      }

      const cachedEntitlement = await readEntitlementFromIndexedDb(FULL_GAME_PRODUCT_KEY).catch(() => null);
      if (isActive) {
        setHasFullGame(resolveFullGameEntitlement({
          cachedEntitlement,
          hasSession: false,
          isOnline: navigator.onLine,
        }));
      }

      if (!supabase) {
        if (isActive) {
          setIsLoading(false);
          setSyncStatus(navigator.onLine ? "local" : "offline");
        }
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!isActive) {
        return;
      }

      setSession(data.session);
      setIsLoading(false);
    }

    void bootstrap();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!supabase) {
      return undefined;
    }

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    void pullCloudState();
    void refreshEntitlements();
    void flushSyncQueue();
  }, [flushSyncQueue, pullCloudState, refreshEntitlements]);

  useEffect(() => {
    function handleOnlineState() {
      void pullCloudState();
      void refreshEntitlements();
      void flushSyncQueue();
    }

    window.addEventListener("online", handleOnlineState);
    window.addEventListener("offline", handleOnlineState);

    return () => {
      window.removeEventListener("online", handleOnlineState);
      window.removeEventListener("offline", handleOnlineState);
    };
  }, [flushSyncQueue, pullCloudState, refreshEntitlements]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const emailRedirectTo =
      typeof window === "undefined"
        ? undefined
        : `${window.location.origin}/play?auth=confirmed`;

    const { error } = await supabase.auth.signUp({
      email,
      options: {
        ...(emailRedirectTo ? { emailRedirectTo } : {}),
      },
      password,
    });
    if (error) {
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setSession(null);
  }, []);

  const startFullGameCheckout = useCallback(async () => {
    if (!session?.access_token) {
      throw new Error("Sign in before checkout.");
    }

    const response = await fetch(withBasePath("/api/checkout/full-game"), {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const payload = await response.json() as { url?: string };
    if (!payload.url) {
      throw new Error("Checkout URL missing.");
    }

    window.location.assign(payload.url);
  }, [session?.access_token]);

  const value = useMemo<AuthContextValue>(() => ({
    checkoutStatus,
    clearCheckoutStatus: () => setCheckoutStatus("idle"),
    hasFullGame,
    isAuthConfigured: isSupabaseConfigured,
    isLoading,
    refreshEntitlements,
    session,
    signIn,
    signOut,
    signUp,
    startFullGameCheckout,
    syncStatus,
    user: session?.user ?? null,
  }), [
    checkoutStatus,
    hasFullGame,
    isLoading,
    refreshEntitlements,
    session,
    signIn,
    signOut,
    signUp,
    startFullGameCheckout,
    syncStatus,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return value;
}
