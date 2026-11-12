import { forwardRef, type ReactNode } from 'react';
import { getItem } from '@/content/shop/items';
import type { PlaceableItem, ShopItem } from '@/content/shop/types';
import { footprint, type ItemMeta, type Placed } from '@/engine/lab/grid';
import type { OwnedItem, RoomState } from '@/store/saveTypes';
import { shade } from '@/lib/color';

/** Lab geometry (SVG units). */
export const T = 48;
export const WALL_H = 120;
export const PAD = 16;
export const SLAB = 14;

export const roomPixelSize = (cols: number, rows: number) => ({ w: cols * T + PAD * 2, h: PAD + WALL_H + rows * T + SLAB + PAD });
export const floorTop = PAD + WALL_H;

export function variantColors(item: ShopItem | undefined, variant: string): Record<string, string> {
  if (!item) return {};
  return (item.variants.find((v) => v.id === variant) ?? item.variants[0]).colors;
}

export function metaFor(item: ShopItem | undefined): ItemMeta | undefined {
  if (!item || item.kind !== 'placeable') return undefined;
  return { layer: item.layer, w: item.size[0], h: item.size[1], surface: item.surface, rotatable: item.rotatable };
}

/** Pixel rect where a wall item hangs. */
export function wallRect(p: Placed, item: PlaceableItem) {
  const w = item.size[0] * T;
  const h = Math.min(item.size[1] * T * 0.95, WALL_H - 28);
  return { x: PAD + p.x * T, y: PAD + (WALL_H - 10 - h) / 2 + 4, w, h };
}

/** Front-view sprites: tabletop items and non-rotatable small floor items that stand up. */
const STANDING = new Set(['extinguisher', 'pet-rat', 'tesla-coil']);
export const isStanding = (item: PlaceableItem) => item.layer === 'tabletop' || STANDING.has(item.id);

export interface RoomViewProps {
  cols: number;
  rows: number;
  room: RoomState;
  inventory: Map<string, OwnedItem>;
  anim: boolean;
  /** Overrides positions while dragging (uid → placed). */
  preview?: Placed[];
  showGrid?: boolean;
  selected?: string | null;
  /** Interactive props for each item (decorate mode). */
  itemProps?: (uid: string) => React.SVGProps<SVGGElement>;
  /** Extra overlay drawn on top (ghosts, highlights). */
  overlay?: ReactNode;
  className?: string;
  title?: string;
}

export const RoomView = forwardRef<SVGSVGElement, RoomViewProps>(function RoomView(
  { cols, rows, room, inventory, anim, preview, showGrid, selected, itemProps, overlay, className, title = 'Your laboratory' },
  ref,
) {
  const { w: W, h: H } = roomPixelSize(cols, rows);
  const placed = preview ?? room.placed;
  const floorItem = getItem(room.floor.itemId);
  const wallItem = getItem(room.wall.itemId);
  const lightItem = getItem(room.lighting.itemId);
  const FloorArt = floorItem?.Art;
  const WallArt = wallItem?.Art;
  const LightArt = lightItem?.Art;
  const light = variantColors(lightItem, room.lighting.variant);
  const floorC = variantColors(floorItem, room.floor.variant);
  const fw = cols * T;
  const fh = rows * T;

  const resolved = placed
    .map((p) => {
      const own = inventory.get(p.uid);
      const item = own && getItem(own.itemId);
      return own && item && item.kind === 'placeable' ? { p, own, item } : null;
    })
    .filter(Boolean) as { p: Placed; own: OwnedItem; item: PlaceableItem }[];

  const layerOrder = { rug: 0, floor: 1, tabletop: 2, wall: 3 } as const;
  const floorLike = resolved
    .filter((r) => r.item.layer !== 'wall')
    .sort((a, b) => {
      if (a.item.layer === 'rug' || b.item.layer === 'rug') return layerOrder[a.item.layer] - layerOrder[b.item.layer];
      const fa = footprint(metaFor(a.item)!, a.p.rot);
      const fb = footprint(metaFor(b.item)!, b.p.rot);
      const ba = a.p.y + fa.h + (a.item.layer === 'tabletop' ? 0.01 : 0);
      const bb = b.p.y + fb.h + (b.item.layer === 'tabletop' ? 0.01 : 0);
      return ba - bb || a.p.x - b.p.x;
    });
  const wallItems = resolved.filter((r) => r.item.layer === 'wall');

  const slabColour = shade(floorC.base ?? floorC.a ?? floorC.grout ?? '#cfcfcf', -0.35);

  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} width={W} height={H} className={className} role="img" aria-label={title} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="lab-soft" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.2" floodColor="#1a1f2e" floodOpacity="0.28" />
        </filter>
        <linearGradient id="lab-floorshade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.2" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="lab-vignette" cx="0.5" cy="0.45" r="0.75">
          <stop offset="0.6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.18" />
        </radialGradient>
        <clipPath id="lab-clip">
          <rect x={PAD} y={PAD} width={fw} height={WALL_H + fh} rx={14} />
        </clipPath>
      </defs>

      {/* diorama base */}
      <rect x={PAD - 2} y={PAD + 6} width={fw + 4} height={WALL_H + fh + SLAB} rx={16} fill={slabColour} />
      <g clipPath="url(#lab-clip)">
        {/* wall */}
        <g transform={`translate(${PAD} ${PAD})`}>{WallArt && <WallArt w={fw} h={WALL_H} c={variantColors(wallItem, room.wall.variant)} anim={anim} />}</g>
        {/* lighting fixtures */}
        <g transform={`translate(${PAD} ${PAD})`}>{LightArt && <LightArt w={fw} h={WALL_H} c={light} anim={anim} />}</g>
        {/* wall items */}
        {wallItems.map(({ p, own, item }) => {
          const r = wallRect(p, item);
          const Art = item.Art;
          return (
            <g key={p.uid} data-uid={p.uid} transform={`translate(${r.x} ${r.y})`} {...itemProps?.(p.uid)}>
              <Art w={r.w} h={r.h} c={variantColors(item, own.variant)} anim={anim} />
              {selected === p.uid && <rect x={-3} y={-3} width={r.w + 6} height={r.h + 6} rx={8} fill="none" stroke="rgb(var(--primary))" strokeWidth={3} strokeDasharray="6 4" data-export-ignore />}
            </g>
          );
        })}
        {/* floor */}
        <g transform={`translate(${PAD} ${floorTop})`}>
          {FloorArt && <FloorArt w={fw} h={fh} c={floorC} anim={anim} />}
          <rect width={fw} height={16} fill="url(#lab-floorshade)" />
          {showGrid && (
            <g data-export-ignore opacity={0.35}>
              {Array.from({ length: cols + 1 }, (_, i) => (
                <line key={'v' + i} x1={i * T} x2={i * T} y1={0} y2={fh} stroke="rgb(var(--ink))" strokeWidth={0.6} strokeDasharray="3 3" />
              ))}
              {Array.from({ length: rows + 1 }, (_, i) => (
                <line key={'h' + i} y1={i * T} y2={i * T} x1={0} x2={fw} stroke="rgb(var(--ink))" strokeWidth={0.6} strokeDasharray="3 3" />
              ))}
            </g>
          )}
        </g>
        {/* floor & tabletop items, painter-sorted */}
        {floorLike.map(({ p, own, item }) => {
          const meta = metaFor(item)!;
          const fp = footprint(meta, p.rot);
          const x = PAD + p.x * T;
          const y = floorTop + p.y * T;
          const wPx = item.size[0] * T;
          const hPx = item.size[1] * T;
          const Art = item.Art;
          const standing = isStanding(item);
          const lift = item.layer === 'tabletop' ? -10 : 0;
          const transform = standing
            ? `translate(${x} ${y + lift})`
            : `translate(${x + (fp.w * T) / 2} ${y + (fp.h * T) / 2}) rotate(${p.rot * 90}) translate(${-wPx / 2} ${-hPx / 2})`;
          return (
            <g key={p.uid} data-uid={p.uid} {...itemProps?.(p.uid)}>
              <g transform={transform} filter={item.layer === 'rug' ? undefined : 'url(#lab-soft)'}>
                <Art w={wPx} h={hPx} c={variantColors(item, own.variant)} anim={anim} />
              </g>
              {selected === p.uid && <rect x={x - 2} y={y - 2} width={fp.w * T + 4} height={fp.h * T + 4} rx={8} fill="none" stroke="rgb(var(--primary))" strokeWidth={3} strokeDasharray="6 4" data-export-ignore />}
            </g>
          );
        })}
        {/* lighting tint + vignette */}
        <rect x={PAD} y={PAD} width={fw} height={WALL_H + fh} fill={light.tint ?? '#fff'} opacity={Number(light.tintOpacity ?? 0)} style={{ mixBlendMode: 'multiply' }} pointerEvents="none" />
        <rect x={PAD} y={PAD} width={fw} height={WALL_H + fh} fill="url(#lab-vignette)" pointerEvents="none" />
      </g>
      <rect x={PAD} y={PAD} width={fw} height={WALL_H + fh} rx={14} fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth={2} pointerEvents="none" />
      {overlay}
    </svg>
  );
});
