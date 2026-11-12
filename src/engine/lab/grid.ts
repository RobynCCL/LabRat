/**
 * Pure lab-grid logic: footprints, collisions, carrying tabletop items.
 *
 * Layers:
 *  - rug       lies on the floor; rugs can't overlap each other, furniture may sit on them
 *  - floor     furniture; can't overlap other floor items
 *  - tabletop  small items that must sit on a `surface` floor item (benches)
 *  - wall      hung on the back wall; only x matters (y is always 0)
 */

export type Layer = 'rug' | 'floor' | 'tabletop' | 'wall';
export type Rot = 0 | 1 | 2 | 3;

export interface Placed {
  uid: string;
  x: number;
  y: number;
  rot: Rot;
}

export interface ItemMeta {
  layer: Layer;
  w: number;
  h: number;
  surface?: boolean;
  /** Wall items and some decor can't rotate. */
  rotatable?: boolean;
}

export type MetaFn = (uid: string) => ItemMeta | undefined;

export interface RoomSize {
  cols: number;
  rows: number;
}

export function footprint(meta: ItemMeta, rot: Rot): { w: number; h: number } {
  if (meta.layer === 'wall') return { w: meta.w, h: 1 };
  return rot % 2 === 0 ? { w: meta.w, h: meta.h } : { w: meta.h, h: meta.w };
}

export function tiles(p: Placed, meta: ItemMeta): [number, number][] {
  const { w, h } = footprint(meta, p.rot);
  const out: [number, number][] = [];
  for (let dx = 0; dx < w; dx++) for (let dy = 0; dy < h; dy++) out.push([p.x + dx, p.y + dy]);
  return out;
}

const key = (x: number, y: number) => `${x},${y}`;

export type PlaceProblem = 'out-of-bounds' | 'overlap' | 'needs-surface' | null;

export function placementProblem(
  room: RoomSize,
  placed: Placed[],
  cand: Placed,
  meta: MetaFn,
  ignore: Set<string> = new Set(),
): PlaceProblem {
  const m = meta(cand.uid);
  if (!m) return 'out-of-bounds';
  const { w, h } = footprint(m, cand.rot);
  if (cand.x < 0 || cand.x + w > room.cols) return 'out-of-bounds';
  if (m.layer === 'wall') {
    if (cand.y !== 0) return 'out-of-bounds';
  } else if (cand.y < 0 || cand.y + h > room.rows) return 'out-of-bounds';

  const others = placed.filter((p) => p.uid !== cand.uid && !ignore.has(p.uid));

  if (m.layer === 'wall') {
    for (const o of others) {
      const om = meta(o.uid);
      if (!om || om.layer !== 'wall') continue;
      if (cand.x < o.x + om.w && o.x < cand.x + w) return 'overlap';
    }
    return null;
  }

  const mine = new Set(tiles(cand, m).map(([x, y]) => key(x, y)));
  const surfaceTiles = new Set<string>();
  for (const o of others) {
    const om = meta(o.uid);
    if (!om || om.layer === 'wall') continue;
    const ot = tiles(o, om);
    if (om.layer === m.layer && ot.some(([x, y]) => mine.has(key(x, y)))) return 'overlap';
    if (om.layer === 'floor' && om.surface) ot.forEach(([x, y]) => surfaceTiles.add(key(x, y)));
  }
  if (m.layer === 'tabletop' && ![...mine].every((k) => surfaceTiles.has(k))) return 'needs-surface';
  return null;
}

/** Tabletop items currently resting on the given surface item. */
export function itemsOn(placed: Placed[], surfaceUid: string, meta: MetaFn): string[] {
  const s = placed.find((p) => p.uid === surfaceUid);
  const sm = s && meta(s.uid);
  if (!s || !sm || !sm.surface) return [];
  const st = new Set(tiles(s, sm).map(([x, y]) => key(x, y)));
  return placed
    .filter((p) => meta(p.uid)?.layer === 'tabletop' && st.has(key(p.x, p.y)))
    .map((p) => p.uid);
}

/**
 * Move/rotate an item. Tabletop items on a moved surface travel with it.
 * Returns the new layout, or null if the move is not allowed.
 */
export function moveItem(
  room: RoomSize,
  placed: Placed[],
  uid: string,
  to: { x: number; y: number; rot: Rot },
  meta: MetaFn,
): Placed[] | null {
  const cur = placed.find((p) => p.uid === uid);
  const m = meta(uid);
  if (!cur || !m) return null;
  const riders = m.surface ? itemsOn(placed, uid, meta) : [];
  const riderSet = new Set(riders);
  const cand: Placed = { uid, ...to };
  if (placementProblem(room, placed, cand, meta, riderSet)) return null;

  const old = footprint(m, cur.rot);
  const turns = (to.rot - cur.rot + 4) % 4;
  const moved = placed.map((p) => {
    if (p.uid === uid) return cand;
    if (!riderSet.has(p.uid)) return p;
    let dx = p.x - cur.x;
    let dy = p.y - cur.y;
    let w = old.w;
    let h = old.h;
    for (let i = 0; i < turns; i++) {
      // rotate 90° clockwise inside a w×h box
      [dx, dy] = [h - 1 - dy, dx];
      [w, h] = [h, w];
    }
    return { ...p, x: to.x + dx, y: to.y + dy };
  });
  return moved;
}

/** Add a new item to the layout if it fits. */
export function addItem(room: RoomSize, placed: Placed[], cand: Placed, meta: MetaFn): Placed[] | null {
  if (placementProblem(room, placed, cand, meta)) return null;
  return [...placed, cand];
}

/** Remove an item; tabletop items on it are removed too (returned to storage). */
export function removeItem(placed: Placed[], uid: string, meta: MetaFn): { placed: Placed[]; removed: string[] } {
  const removed = [uid, ...itemsOn(placed, uid, meta)];
  const set = new Set(removed);
  return { placed: placed.filter((p) => !set.has(p.uid)), removed };
}

/** First free spot for an item (scans rows then columns), or null. */
export function findSpot(room: RoomSize, placed: Placed[], uid: string, meta: MetaFn, rot: Rot = 0): Placed | null {
  const m = meta(uid);
  if (!m) return null;
  const rows = m.layer === 'wall' ? 1 : room.rows;
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < room.cols; x++) {
      const cand = { uid, x, y, rot };
      if (!placementProblem(room, placed, cand, meta)) return cand;
    }
  return null;
}
