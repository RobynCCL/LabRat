import { useEffect, useMemo, useRef, useState } from 'react';
import { getItem } from '@/content/shop/items';
import { footprint } from '@/engine/lab/grid';
import type { OwnedItem, RoomState } from '@/store/saveTypes';
import { metaFor, type PetSprite } from './RoomView';

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Tiles covered by floor furniture (rugs don't block pets). */
export function blockedTiles(room: RoomState, inventory: Map<string, OwnedItem>): Set<string> {
  const out = new Set<string>();
  for (const p of room.placed) {
    const m = metaFor(getItem(inventory.get(p.uid)?.itemId ?? ''));
    if (!m || m.layer !== 'floor') continue;
    const fp = footprint(m, p.rot);
    for (let dx = 0; dx < fp.w; dx++) for (let dy = 0; dy < fp.h; dy++) out.add(`${p.x + dx},${p.y + dy}`);
  }
  return out;
}

/**
 * Animates roaming pets around the free floor tiles of a room.
 * Each pet walks in straight lines (so it never crosses furniture), pauses, and repeats.
 * When `active` is false (reduced motion, static previews) pets sit still.
 */
export function usePetWander(
  roomId: string,
  size: { cols: number; rows: number },
  room: RoomState,
  inventory: OwnedItem[],
  active: boolean,
  frozen?: string | null,
): PetSprite[] {
  const invMap = useMemo(() => new Map(inventory.map((o) => [o.uid, o])), [inventory]);
  const pets = useMemo(() => inventory.filter((o) => o.room === roomId && getItem(o.itemId)?.kind === 'pet'), [inventory, roomId]);
  const blocked = useMemo(() => blockedTiles(room, invMap), [room, invMap]);
  const blockedKey = [...blocked].sort().join('|');

  const free = useMemo(() => {
    const list: [number, number][] = [];
    for (let y = 0; y < size.rows; y++) for (let x = 0; x < size.cols; x++) if (!blocked.has(`${x},${y}`)) list.push([x, y]);
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockedKey, size.cols, size.rows]);

  const [pos, setPos] = useState<Record<string, PetSprite>>({});
  const frozenRef = useRef(frozen);
  frozenRef.current = frozen;

  // Place new pets / rescue pets standing on furniture.
  useEffect(() => {
    setPos((prev) => {
      const next: Record<string, PetSprite> = {};
      const taken = new Set<string>();
      for (const o of pets) {
        const old = prev[o.uid];
        const ok = old && !blocked.has(`${Math.round(old.x)},${Math.round(old.y)}`) && Math.round(old.x) < size.cols && Math.round(old.y) < size.rows;
        let x: number;
        let y: number;
        if (ok) {
          x = Math.round(old.x);
          y = Math.round(old.y);
        } else {
          const options = free.filter(([fx, fy]) => !taken.has(`${fx},${fy}`));
          const pick = options.length ? options[hash(o.uid) % options.length] : [0, size.rows - 1];
          [x, y] = pick;
        }
        taken.add(`${x},${y}`);
        next[o.uid] = { uid: o.uid, itemId: o.itemId, variant: o.variant, name: o.name ?? '', x, y, facing: old?.facing ?? 1, walking: false, dur: 0 };
      }
      return next;
    });
  }, [pets, blocked, free, size.cols, size.rows]);

  // Wander loop
  useEffect(() => {
    if (!active || !pets.length) return;
    const timers = new Map<string, ReturnType<typeof setTimeout>>();
    const schedule = (uid: string, delay: number) => {
      timers.set(uid, setTimeout(() => step(uid), delay));
    };
    const step = (uid: string) => {
      const own = invMap.get(uid);
      const speed = getItem(own?.itemId ?? '')?.pet?.speed ?? 1;
      if (frozenRef.current === uid) return schedule(uid, 1500);
      setPos((prev) => {
        const cur = prev[uid];
        if (!cur) return prev;
        const occupied = new Set(Object.values(prev).filter((p) => p.uid !== uid).map((p) => `${p.x},${p.y}`));
        const dirs: [number, number][] = [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ];
        const [dx, dy] = dirs[Math.floor(Math.random() * 4)];
        const max = 1 + Math.floor(Math.random() * 3);
        let n = 0;
        while (n < max) {
          const nx = cur.x + dx * (n + 1);
          const ny = cur.y + dy * (n + 1);
          if (nx < 0 || ny < 0 || nx >= size.cols || ny >= size.rows || blocked.has(`${nx},${ny}`) || occupied.has(`${nx},${ny}`)) break;
          n++;
        }
        if (!n) return prev;
        const dur = n / Math.max(0.2, speed);
        setTimeout(() => setPos((p) => (p[uid] ? { ...p, [uid]: { ...p[uid], walking: false } } : p)), dur * 1000);
        return { ...prev, [uid]: { ...cur, x: cur.x + dx * n, y: cur.y + dy * n, facing: dx ? (dx > 0 ? 1 : -1) : cur.facing, walking: true, dur } };
      });
      schedule(uid, 2200 + Math.random() * 3800);
    };
    for (const o of pets) schedule(o.uid, 600 + (hash(o.uid) % 2500));
    return () => timers.forEach((t) => clearTimeout(t));
  }, [active, pets, blocked, invMap, size.cols, size.rows]);

  return pets.map((o) => pos[o.uid]).filter(Boolean).map((p) => ({ ...p, name: invMap.get(p.uid)?.name ?? p.name }));
}
