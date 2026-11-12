import { describe, expect, it } from 'vitest';
import { addItem, findSpot, footprint, itemsOn, moveItem, placementProblem, removeItem, type ItemMeta, type Placed } from './grid';

const metas: Record<string, ItemMeta> = {
  bench: { layer: 'floor', w: 2, h: 1, surface: true },
  stool: { layer: 'floor', w: 1, h: 1 },
  rug: { layer: 'rug', w: 2, h: 2 },
  flask: { layer: 'tabletop', w: 1, h: 1 },
  poster: { layer: 'wall', w: 2, h: 2 },
  poster2: { layer: 'wall', w: 1, h: 1 },
};
const meta = (uid: string) => metas[uid];
const room = { cols: 6, rows: 4 };

describe('lab grid', () => {
  it('footprint swaps on rotation', () => {
    expect(footprint(metas.bench, 1)).toEqual({ w: 1, h: 2 });
    expect(footprint(metas.poster, 1)).toEqual({ w: 2, h: 1 });
  });

  it('detects bounds and overlaps per layer', () => {
    const placed: Placed[] = [{ uid: 'bench', x: 0, y: 0, rot: 0 }];
    expect(placementProblem(room, placed, { uid: 'stool', x: 1, y: 0, rot: 0 }, meta)).toBe('overlap');
    expect(placementProblem(room, placed, { uid: 'stool', x: 2, y: 0, rot: 0 }, meta)).toBeNull();
    expect(placementProblem(room, placed, { uid: 'stool', x: 6, y: 0, rot: 0 }, meta)).toBe('out-of-bounds');
    // rugs go under furniture
    expect(placementProblem(room, placed, { uid: 'rug', x: 0, y: 0, rot: 0 }, meta)).toBeNull();
  });

  it('tabletop items need a surface', () => {
    const placed: Placed[] = [{ uid: 'bench', x: 0, y: 0, rot: 0 }];
    expect(placementProblem(room, placed, { uid: 'flask', x: 1, y: 0, rot: 0 }, meta)).toBeNull();
    expect(placementProblem(room, placed, { uid: 'flask', x: 3, y: 0, rot: 0 }, meta)).toBe('needs-surface');
  });

  it('wall items only collide along x', () => {
    const placed: Placed[] = [{ uid: 'poster', x: 0, y: 0, rot: 0 }];
    expect(placementProblem(room, placed, { uid: 'poster2', x: 1, y: 0, rot: 0 }, meta)).toBe('overlap');
    expect(placementProblem(room, placed, { uid: 'poster2', x: 2, y: 0, rot: 0 }, meta)).toBeNull();
    expect(placementProblem(room, placed, { uid: 'poster2', x: 2, y: 1, rot: 0 }, meta)).toBe('out-of-bounds');
  });

  it('moving a bench carries its tabletop items', () => {
    let placed: Placed[] = [{ uid: 'bench', x: 0, y: 0, rot: 0 }];
    placed = addItem(room, placed, { uid: 'flask', x: 1, y: 0, rot: 0 }, meta)!;
    expect(itemsOn(placed, 'bench', meta)).toEqual(['flask']);
    const moved = moveItem(room, placed, 'bench', { x: 3, y: 2, rot: 0 }, meta)!;
    expect(moved.find((p) => p.uid === 'flask')).toMatchObject({ x: 4, y: 2 });
  });

  it('rotating a bench rotates riders with it', () => {
    let placed: Placed[] = [{ uid: 'bench', x: 0, y: 0, rot: 0 }];
    placed = addItem(room, placed, { uid: 'flask', x: 1, y: 0, rot: 0 }, meta)!;
    const turned = moveItem(room, placed, 'bench', { x: 0, y: 0, rot: 1 }, meta)!;
    // bench now occupies (0,0),(0,1); flask was at the right end → now bottom
    expect(turned.find((p) => p.uid === 'flask')).toMatchObject({ x: 0, y: 1 });
    expect(placementProblem(room, turned, turned.find((p) => p.uid === 'flask')!, meta)).toBeNull();
  });

  it('rejects invalid moves', () => {
    const placed: Placed[] = [
      { uid: 'bench', x: 0, y: 0, rot: 0 },
      { uid: 'stool', x: 3, y: 0, rot: 0 },
    ];
    expect(moveItem(room, placed, 'bench', { x: 2, y: 0, rot: 0 }, meta)).toBeNull();
  });

  it('removing a bench also removes items on it', () => {
    const placed: Placed[] = [
      { uid: 'bench', x: 0, y: 0, rot: 0 },
      { uid: 'flask', x: 0, y: 0, rot: 0 },
    ];
    const r = removeItem(placed, 'bench', meta);
    expect(r.placed).toEqual([]);
    expect(r.removed.sort()).toEqual(['bench', 'flask']);
  });

  it('finds a free spot', () => {
    const placed: Placed[] = [{ uid: 'bench', x: 0, y: 0, rot: 0 }];
    expect(findSpot(room, placed, 'stool', meta)).toMatchObject({ x: 2, y: 0 });
    expect(findSpot(room, placed, 'flask', meta)).toMatchObject({ x: 0, y: 0 });
  });
});
