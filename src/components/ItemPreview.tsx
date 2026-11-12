import type { ShopItem } from '@/content/shop/types';
import { variantColors, T, isStanding } from './lab/RoomView';

/** Renders an item's art centred in a square box (shop cards, storage list). */
export function ItemPreview({ item, variant, size = 96, anim = false }: { item: ShopItem; variant: string; size?: number; anim?: boolean }) {
  const c = variantColors(item, variant);
  const Art = item.Art;
  if (item.kind === 'applied') {
    if (item.slot === 'coat' || item.slot === 'goggles' || item.slot === 'gloves') {
      return (
        <svg width={size} height={size} viewBox="0 0 120 140" aria-hidden>
          <Art w={120} h={140} c={c} anim={anim} />
        </svg>
      );
    }
    const w = 160;
    const h = item.slot === 'floor' ? 160 : 120;
    return (
      <svg width={size} height={size} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" aria-hidden style={{ borderRadius: 12 }}>
        {item.slot === 'lighting' && <rect width={w} height={h} fill="#e8e4da" />}
        <Art w={w} h={h} c={c} anim={anim} />
      </svg>
    );
  }
  const wPx = item.size[0] * T;
  const hPx = item.layer === 'wall' ? Math.min(item.size[1] * T * 0.95, 92) : item.size[1] * T;
  const standing = isStanding(item);
  const pad = standing ? 30 : 8;
  const vbW = Math.max(wPx, hPx) + 16;
  const vbH = vbW;
  const ox = (vbW - wPx) / 2;
  const oy = (vbH - hPx) / 2 + (standing ? pad / 2 : 0);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${vbW} ${vbH}`} aria-hidden>
      <g transform={`translate(${ox} ${oy})`}>
        <Art w={wPx} h={hPx} c={c} anim={anim} />
      </g>
    </svg>
  );
}
