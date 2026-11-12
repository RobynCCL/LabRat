import { createNewSave } from './defaults';
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
  return fillDefaults<SaveData>(s, createNewSave(s.createdAt ?? Date.now()));
}
