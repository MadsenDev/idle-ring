import { SAVE_KEY } from "../game/config";

const DB_NAME = "idle-ring";
const STORE_NAME = "saves";
const ENTRY_KEY = "game";

const supportsIndexedDB = () => typeof window !== "undefined" && "indexedDB" in window && window.indexedDB !== null;

const openDB = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB"));
  });

const wrapTx = <T>(db: IDBDatabase, mode: IDBTransactionMode, runner: (store: IDBObjectStore) => IDBRequest<T>) =>
  new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const request = runner(tx.objectStore(STORE_NAME));
    request.onsuccess = () => resolve(request.result as T);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB transaction failed"));
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB transaction aborted"));
  }).finally(() => {
    db.close();
  });

const parsePayload = <T>(raw: string | null, source: string): T | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`${source} parse failed`, err);
    return null;
  }
};

export async function saveGameState(snapshot: unknown): Promise<void> {
  const payload = JSON.stringify(snapshot);
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SAVE_KEY, payload);
    }
  } catch (err) {
    console.error("localStorage persist failed", err);
  }

  if (!supportsIndexedDB()) return;

  try {
    const db = await openDB();
    await wrapTx(db, "readwrite", store => store.put(payload, ENTRY_KEY));
  } catch (err) {
    console.error("IndexedDB persist failed", err);
  }
}

export async function loadGameState<T>(): Promise<T | null> {
  if (supportsIndexedDB()) {
    try {
      const db = await openDB();
      const raw = await wrapTx<string | undefined>(db, "readonly", store => store.get(ENTRY_KEY));
      const parsed = parsePayload<T>(raw ?? null, "IndexedDB");
      if (parsed !== null) return parsed;
    } catch (err) {
      console.error("IndexedDB load failed", err);
    }
  }

  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(SAVE_KEY) : null;
    return parsePayload<T>(raw, "localStorage");
  } catch (err) {
    console.error("localStorage load failed", err);
    return null;
  }
}

export function loadGameStateSync<T>(): T | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(SAVE_KEY);
    return parsePayload<T>(raw, "localStorage");
  } catch (err) {
    console.error("localStorage sync load failed", err);
    return null;
  }
}

