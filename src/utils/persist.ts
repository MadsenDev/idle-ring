import { SAVE_KEY } from "../game/config";

const DB_NAME = "idle-ring";
const STORE_NAME = "saves";
const ENTRY_KEY = "game";

const supportsIndexedDB = () => typeof window !== "undefined" && "indexedDB" in window && window.indexedDB !== null;

let dbPromise: Promise<IDBDatabase> | null = null;

const openDB = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => {
        db.close();
        dbPromise = null;
      };
      resolve(db);
    };
    request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB"));
  });

const getDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB().catch(err => {
      dbPromise = null;
      throw err;
    });
  }
  return dbPromise;
};

const runTransaction = async <T>(mode: IDBTransactionMode, runner: (store: IDBObjectStore) => IDBRequest<T>) => {
  const db = await getDB();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, mode);
      const store = tx.objectStore(STORE_NAME);
      const request = runner(store);
      request.onsuccess = () => resolve(request.result as T);
      request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
      tx.onabort = () => reject(tx.error ?? new Error("IndexedDB transaction aborted"));
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "InvalidStateError") {
      db.close();
      dbPromise = null;
    }
    throw err;
  }
};

const parsePayload = <T>(raw: string | null, source: string): T | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`${source} parse failed`, err);
    return null;
  }
};

const readLocalStorage = <T>(): T | null => {
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(SAVE_KEY) : null;
    return parsePayload<T>(raw, "localStorage");
  } catch (err) {
    console.error("localStorage load failed", err);
    return null;
  }
};

type SaveOptions = {
  forceLocal?: boolean;
};

export async function saveGameState(snapshot: unknown, options: SaveOptions = {}): Promise<void> {
  const payload = typeof snapshot === "string" ? snapshot : JSON.stringify(snapshot);
  const hasIndexedDB = supportsIndexedDB();
  const shouldWriteLocal = options.forceLocal || !hasIndexedDB;
  let localWritten = false;

  const writeLocal = () => {
    if (localWritten || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(SAVE_KEY, payload);
      localWritten = true;
    } catch (err) {
      console.error("localStorage persist failed", err);
    }
  };

  if (hasIndexedDB) {
    try {
      await runTransaction("readwrite", store => store.put(payload, ENTRY_KEY));
    } catch (err) {
      console.error("IndexedDB persist failed", err);
      writeLocal();
      return;
    }
  }

  if (shouldWriteLocal) {
    writeLocal();
  }
}

export async function loadGameState<T>(): Promise<T | null> {
  if (supportsIndexedDB()) {
    try {
      const raw = await runTransaction<string | undefined>("readonly", store => store.get(ENTRY_KEY));
      const parsed = parsePayload<T>(raw ?? null, "IndexedDB");
      if (parsed !== null) return parsed;
    } catch (err) {
      console.error("IndexedDB load failed", err);
    }
  }

  return readLocalStorage<T>();
}

export function loadGameStateSync<T>(): T | null {
  if (!supportsIndexedDB()) {
    return readLocalStorage<T>();
  }
  return null;
}

