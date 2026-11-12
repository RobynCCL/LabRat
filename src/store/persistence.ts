import { createStore, del, get, set } from 'idb-keyval';

/** IndexedDB with a localStorage fallback (e.g. private windows that block IDB). */
const KEY = 'lab-rat/save';
let idb: ReturnType<typeof createStore> | null = null;
try {
  if (typeof indexedDB !== 'undefined') idb = createStore('lab-rat', 'kv');
} catch {
  idb = null;
}

export async function loadRaw(): Promise<unknown | null> {
  try {
    if (idb) {
      const v = await get(KEY, idb);
      if (v != null) return v;
    }
  } catch {
    /* fall through */
  }
  try {
    const s = localStorage.getItem(KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export async function saveRaw(data: unknown): Promise<void> {
  try {
    if (idb) {
      await set(KEY, data, idb);
      return;
    }
  } catch {
    /* fall through */
  }
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* storage full or blocked – nothing else we can do */
  }
}

export async function clearRaw(): Promise<void> {
  try {
    if (idb) await del(KEY, idb);
  } catch {
    /* ignore */
  }
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
