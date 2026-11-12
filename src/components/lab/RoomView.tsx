import { forwardRef, type ReactNode } from 'react';
import { Move } from '@/content/shop/art/kit';
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
  return { layer: item.layer, w: item.size[0], h: item.size[1], surface: item.surface, rotatable: !!item.rotatable && item.view !== 'front' };
}

/** Pixel rect where a wall item hangs. */
export function wallRect(p: Placed, item: PlaceableItem) {
  const w = item.size[0] * T;
  const h = Math.min(item.size[1] * T * 0.95, WALL_H - 28);
  return { x: PAD + p.x * T, y: PAD + (WALL_H - 10 - h) / 2 + 4, w, h };
}

/** Front-view sprites: tabletop items and items marked view: 'front'. They flip instead of rotating. */
export const isStanding = (item: PlaceableItem) => item.layer === 'tabletop' || item.view === 'front';

/** How far (px) a bench-top item is raised when sitting on a given surface. */
const DEFAULT_LIFT = 10;

/** A roaming pet as drawn in the room (positions in tiles; can be fractional). */
export interface PetSprite {
  uid: string;
  itemId: string;
  variant: string;
  name: string;
  x: number;
  y: number;
  facing: 1 | -1;
  walking: boolean;
  /** Seconds the current walk takes (drives the CSS transition). */
  dur: number;
}

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
  /** Roaming pets in this room. */
  pets?: PetSprite[];
  /** Interactive props for each pet (tap to pat). */
  petProps?: (uid: string) => React.SVGProps<SVGGElement>;
  /** Speech bubble shown above a pet or a named tank pet. */
  bubble?: { uid: string; text: string; key: number } | null;
  className?: string;
  title?: string;
}

export const RoomView = forwardRef<SVGSVGElement, RoomViewProps>(function RoomView(
  { cols, rows, room, inventory, anim, preview, showGrid, selected, itemProps, overlay, className, title = 'Your laboratory', pets = [], petProps, bubble },
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
  type Drawable = { kind: 'item'; r: (typeof resolved)[number]; key: number } | { kind: 'pet'; pet: PetSprite; key: number };
  const rugs = resolved.filter((r) => r.item.layer === 'rug');
  const drawables: Drawable[] = [
    ...resolved
      .filter((r) => r.item.layer === 'floor' || r.item.layer === 'tabletop')
      .map((r) => ({ kind: 'item' as const, r, key: r.p.y + footprint(metaFor(r.item)!, r.p.rot).h + (r.item.layer === 'tabletop' ? 0.01 : 0) + r.p.x * 0.0001 })),
    ...pets.map((pet) => ({ kind: 'pet' as const, pet, key: pet.y + 1 + 0.005 })),
  ].sort((a, b) => a.key - b.key);
  void layerOrder;

  // Bench-top items sit higher on tall front-view surfaces (desks, tables).
  const liftAt = new Map<string, number>();
  for (const r of resolved) {
    if (!r.item.surface) continue;
    const fp = footprint(metaFor(r.item)!, r.p.rot);
    for (let dx = 0; dx < fp.w; dx++) for (let dy = 0; dy < fp.h; dy++) liftAt.set(`${r.p.x + dx},${r.p.y + dy}`, r.item.surfaceLift ?? DEFAULT_LIFT);
  }

  const wallItems = resolved.filter((r) => r.item.layer === 'wall');


  function renderItem({ p, own, item }: (typeof resolved)[number]) {
    const meta = metaFor(item)!;
    const fp = footprint(meta, p.rot);
    const x = PAD + p.x * T;
    const y = floorTop + p.y * T;
    const wPx = item.size[0] * T;
    const hPx = item.size[1] * T;
    const Art = item.Art;
    const standing = isStanding(item);
    const lift = item.layer === 'tabletop' ? -(liftAt.get(`${p.x},${p.y}`) ?? DEFAULT_LIFT) : 0;
    const transform = standing
      ? `translate(${x + (p.flip ? wPx : 0)} ${y + lift})${p.flip ? ' scale(-1 1)' : ''}`
      : `translate(${x + (fp.w * T) / 2} ${y + (fp.h * T) / 2}) rotate(${p.rot * 90}) translate(${-wPx / 2} ${-hPx / 2})`;
    return (
      <g key={p.uid} data-uid={p.uid} {...itemProps?.(p.uid)}>
        <g transform={transform} filter={item.layer === 'rug' ? undefined : 'url(#lab-soft)'}>
          <Art w={wPx} h={hPx} c={variantColors(item, own.variant)} anim={anim} />
        </g>
        {own.name && bubble?.uid === p.uid && <Bubble key={bubble.key} text={bubble.text} cx={x + T / 2} top={y + lift - 18} minX={PAD} maxX={PAD + fw} />}
        {selected === p.uid && <rect x={x - 2} y={y - 2} width={fp.w * T + 4} height={fp.h * T + 4} rx={8} fill="none" stroke="rgb(var(--primary))" strokeWidth={3} strokeDasharray="6 4" data-export-ignore />}
      </g>
    );
  }

  function renderPet(pet: PetSprite) {
    const item = getItem(pet.itemId);
    if (!item) return null;
    const Art = item.Art;
    const px = PAD + pet.x * T;
    const py = floorTop + pet.y * T;
    return (
      <g key={pet.uid} data-pet={pet.uid} style={{ transform: `translate(${px}px, ${py}px)`, transition: anim ? `transform ${pet.dur}s linear` : undefined }}>
        <g {...petProps?.(pet.uid)}>
          <rect width={T} height={T} fill="transparent" />
          <g transform={pet.facing === -1 ? `translate(${T} 0) scale(-1 1)` : undefined} filter="url(#lab-soft)">
            <g>
              {pet.walking && <Move on={anim} values="0 0; 0 -2.5; 0 0" dur="0.32s" />}
              <Art w={T} h={T} c={variantColors(item, pet.variant)} anim={anim} pose={pet.walking ? 'walk' : 'idle'} />
            </g>
          </g>
        </g>
        {bubble?.uid === pet.uid && <Bubble key={bubble.key} text={bubble.text} cx={T / 2} top={-10} minX={PAD - px} maxX={PAD + fw - px} hearts />}
      </g>
    );
  }

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
        {/* rugs */}
        {rugs.map((r) => renderItem(r))}
        {/* floor items, bench-top items and pets, painter-sorted by their bottom edge */}
        {drawables.map((d) => (d.kind === 'item' ? renderItem(d.r) : renderPet(d.pet)))}
        {/* lighting tint + vignette */}
        <rect x={PAD} y={PAD} width={fw} height={WALL_H + fh} fill={light.tint ?? '#fff'} opacity={Number(light.tintOpacity ?? 0)} style={{ mixBlendMode: 'multiply' }} pointerEvents="none" />
        <rect x={PAD} y={PAD} width={fw} height={WALL_H + fh} fill="url(#lab-vignette)" pointerEvents="none" />
      </g>
      <rect x={PAD} y={PAD} width={fw} height={WALL_H + fh} rx={14} fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth={2} pointerEvents="none" />
      {overlay}
    </svg>
  );
});

/** Speech bubble with optional floating hearts, kept inside the room's edges. */
function Bubble({ text, cx, top, minX, maxX, hearts }: { text: string; cx: number; top: number; minX: number; maxX: number; hearts?: boolean }) {
  const lines = wrap(text, 26);
  const bw = Math.min(200, Math.max(...lines.map((l) => l.length)) * 6.1 + 18);
  const bh = lines.length * 13 + 10;
  const left = Math.max(minX + 4, Math.min(cx - bw / 2, maxX - bw - 4));
  const tail = Math.max(left + 10, Math.min(cx, left + bw - 10));
  return (
    <g pointerEvents="none" data-export-ignore>
      {hearts &&
        [0, 1, 2].map((i) => (
          <path key={i} d={`M ${cx - 8 + i * 8} ${top + 14} c -2 -3 -7 -1 -5 3 l 5 5 l 5 -5 c 2 -4 -3 -6 -5 -3 Z`} fill="#ef476f" opacity={0}>
            <animate attributeName="opacity" values="0;1;0" dur="1.4s" begin={`${i * 0.15}s`} fill="freeze" />
            <animateTransform attributeName="transform" type="translate" values="0 0; 0 -18" dur="1.4s" begin={`${i * 0.15}s`} fill="freeze" />
          </path>
        ))}
      <g transform={`translate(0 ${top - bh - 6})`}>
        <rect x={left} y={0} width={bw} height={bh} rx={8} fill="#fffdf7" stroke="rgba(24,28,44,0.35)" strokeWidth={1.2} />
        <path d={`M ${tail - 5} ${bh - 0.5} L ${tail} ${bh + 6} L ${tail + 5} ${bh - 0.5}`} fill="#fffdf7" stroke="rgba(24,28,44,0.35)" strokeWidth={1.2} />
        <rect x={tail - 5} y={bh - 2} width={10} height={2.5} fill="#fffdf7" />
        {lines.map((l, i) => (
          <text key={i} x={left + bw / 2} y={15 + i * 13} textAnchor="middle" fontSize={11} fontWeight={i === 0 ? 800 : 600} fill="#1e2330" fontFamily="'Nunito Variable', system-ui, sans-serif">
            {l}
          </text>
        ))}
      </g>
    </g>
  );
}

function wrap(text: string, max: number): string[] {
  const out: string[] = [];
  for (const para of text.split('\n')) {
    let line = '';
    for (const word of para.split(' ')) {
      if ((line + ' ' + word).trim().length > max && line) {
        out.push(line);
        line = word;
      } else line = (line + ' ' + word).trim();
    }
    if (line) out.push(line);
  }
  return out.slice(0, 4);
}
