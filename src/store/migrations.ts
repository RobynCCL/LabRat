import { createNewSave } from './defaults';
import { getItem } from '@/content/shop/items';
import { SAVE_VERSION, type SaveData } from './saveTypes';

/**
 * Save migrations. When you change the SaveData shape:
 *   1. bump SAVE_VERSION in saveTypes.ts
 *   2. add an entry here keyed by the OLD version that upgrades it by one step.
 * New *optional-ish* fields don't need a migration: `migrate` deep-fills
 * anything missing from a fresh save's defaults.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySave = any;
const migrations: Record<number, (s: AnySave) => AnySave> = {
  // 1: (s) => ({ ...s, version: 2, newThing: ... }),
};

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Fill in keys missing from `value` using `defaults` (objects only; arrays/records are kept as-is). */
export function fillDefaults<T>(value: unknown, defaults: T): T {
  if (!isPlainObject(defaults)) return (value === undefined ? defaults : value) as T;
  if (!isPlainObject(value)) return defaults;
  const out: Record<string, unknown> = { ...value };
  for (const [k, dv] of Object.entries(defaults)) {
    if (!(k in value)) out[k] = dv;
    else if (isPlainObject(dv) && isPlainObject(value[k]) && Object.keys(dv).length > 0) out[k] = fillDefaults(value[k], dv);
  }
  return out as T;
}

export class SaveFormatError extends Error {}

export function migrate(raw: unknown): SaveData {
  if (!isPlainObject(raw) || typeof raw.version !== 'number' || !isPlainObject(raw.profile)) {
    throw new SaveFormatError('This does not look like a Lab Rat save file.');
  }
  let s: AnySave = raw;
  if (s.version > SAVE_VERSION) throw new SaveFormatError('This save was made by a newer version of Lab Rat.');
  while (s.version < SAVE_VERSION) {
    const step = migrations[s.version];
    if (!step) throw new SaveFormatError(`No migration from save version ${s.version}.`);
    s = step(s);
  }
  return normalize(fillDefaults<SaveData>(s, createNewSave(s.createdAt ?? Date.now())));
}

/**
 * Fix-ups that don't need a version bump, run on every load:
 * - roaming pets (e.g. the lab rat, which used to be a placed item) get a name
 *   and a home room, and are removed from room grids.
 */
export function normalize(save: SaveData): SaveData {
  const roaming = new Set(save.inventory.filter((o) => getItem(o.itemId)?.kind === 'pet').map((o) => o.uid));
  if (!roaming.size) return save;
  for (const o of save.inventory) {
    if (!roaming.has(o.uid)) continue;
    const item = getItem(o.itemId);
    const home = Object.entries(save.lab.rooms).find(([, r]) => r.placed.some((p) => p.uid === o.uid))?.[0];
    if (o.name === undefined) o.name = o.itemId === 'pet-rat' ? 'Pip' : (item?.name ?? 'Pet');
    if (o.adoptedAt === undefined) o.adoptedAt = Date.now();
    if (o.pats === undefined) o.pats = 0;
    if (!o.room) o.room = home ?? save.lab.current;
  }
  for (const r of Object.values(save.lab.rooms)) r.placed = r.placed.filter((p) => !roaming.has(p.uid));
  return save;
}
