import type { RoutineSlots } from "../game/store";
import type { LevelProgressState } from "../../screens/game-screen/levelProgressStorage";

const DB_NAME = "lumaloop-offline";
const DB_VERSION = 1;

type StoreName = "entitlements" | "premiumLevels" | "programs" | "progress" | "settings" | "syncQueue";

export interface CachedEntitlement {
  active: boolean;
  productKey: string;
  source: "local" | "stripe";
  verifiedAt: number;
}

export interface QueuedSyncOperation {
  createdAt: number;
  id: string;
  payload: unknown;
  retryCount: number;
  type: "progress_updated" | "program_saved";
}

export interface CachedPremiumLevels {
  campaignVersion: string;
  levels: unknown[];
}

export interface CachedProgramRecord {
  levelId: string;
  updatedAt: number;
  value: RoutineSlots;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const storeName of ["entitlements", "premiumLevels", "programs", "progress", "settings", "syncQueue"] satisfies StoreName[]) {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: "id" });
        }
      }
    };
  });
}

async function transact<T>(
  storeName: StoreName,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  if (typeof window === "undefined" || !window.indexedDB) {
    throw new Error("IndexedDB is not available.");
  }

  const db = await openDatabase();

  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      const request = operation(store);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      transaction.onerror = () => reject(transaction.error);
    });
  } finally {
    db.close();
  }
}

export async function readProgressFromIndexedDb(): Promise<LevelProgressState | null> {
  const record = await transact<{ id: string; value: LevelProgressState } | undefined>("progress", "readonly", (store) =>
    store.get("current"),
  );
  return record?.value ?? null;
}

export async function writeProgressToIndexedDb(value: LevelProgressState) {
  await transact("progress", "readwrite", (store) =>
    store.put({
      id: "current",
      updatedAt: Date.now(),
      value,
    }),
  );
}

export async function readProgramFromIndexedDb(levelId: string): Promise<RoutineSlots | null> {
  const record = await readProgramRecordFromIndexedDb(levelId);
  return record?.value ?? null;
}

export async function readProgramRecordFromIndexedDb(levelId: string): Promise<CachedProgramRecord | null> {
  const record = await transact<{ id: string; updatedAt?: number; value: RoutineSlots } | undefined>("programs", "readonly", (store) =>
    store.get(levelId),
  );

  if (!record) {
    return null;
  }

  return {
    levelId,
    updatedAt: record.updatedAt ?? 0,
    value: record.value,
  };
}

export async function readProgramRecordsFromIndexedDb(): Promise<CachedProgramRecord[]> {
  const records = await transact<Array<{ id: string; updatedAt?: number; value: RoutineSlots }>>("programs", "readonly", (store) =>
    store.getAll(),
  );

  return records.map((record) => ({
    levelId: record.id,
    updatedAt: record.updatedAt ?? 0,
    value: record.value,
  }));
}

export async function writeProgramToIndexedDb(levelId: string, value: RoutineSlots, updatedAt = Date.now()) {
  await transact("programs", "readwrite", (store) =>
    store.put({
      id: levelId,
      updatedAt,
      value,
    }),
  );
}

export async function readEntitlementFromIndexedDb(productKey: string): Promise<CachedEntitlement | null> {
  const record = await transact<CachedEntitlement | undefined>("entitlements", "readonly", (store) =>
    store.get(productKey),
  );
  return record ?? null;
}

export async function writeEntitlementToIndexedDb(value: CachedEntitlement) {
  await transact("entitlements", "readwrite", (store) =>
    store.put({
      id: value.productKey,
      ...value,
    }),
  );
}

export async function writePremiumLevelsToIndexedDb(value: CachedPremiumLevels) {
  await transact("premiumLevels", "readwrite", (store) =>
    store.put({
      id: "current",
      updatedAt: Date.now(),
      value,
    }),
  );
}

export async function readPremiumLevelsFromIndexedDb(): Promise<CachedPremiumLevels | null> {
  const record = await transact<{ id: string; value: CachedPremiumLevels } | undefined>("premiumLevels", "readonly", (store) =>
    store.get("current"),
  );
  return record?.value ?? null;
}

export async function enqueueSyncOperation(operation: Omit<QueuedSyncOperation, "createdAt" | "id" | "retryCount">) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await transact("syncQueue", "readwrite", (store) =>
    store.put({
      ...operation,
      createdAt: Date.now(),
      id,
      retryCount: 0,
    }),
  );
}

export async function readSyncQueue(): Promise<QueuedSyncOperation[]> {
  return await transact<QueuedSyncOperation[]>("syncQueue", "readonly", (store) => store.getAll());
}

export async function deleteSyncOperation(id: string) {
  await transact("syncQueue", "readwrite", (store) => store.delete(id));
}
