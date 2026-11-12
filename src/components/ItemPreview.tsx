import { useLayoutEffect, useRef, useState } from 'react';
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
  const isPet = item.kind === 'pet';
  const wPx = isPet ? T : item.size[0] * T;
  const hPx = isPet ? T : item.layer === 'wall' ? Math.min(item.size[1] * T * 0.95, 92) : item.size[1] * T;
  return <FittedArt size={size} w={wPx} h={hPx} wide={!isPet && item.kind === 'placeable' && !isStanding(item)}>{<Art w={wPx} h={hPx} c={c} anim={anim} />}</FittedArt>;
}

/**
 * Sprites can poke outside their box (tall shelves, flames), so measure the
 * drawing once mounted and fit the viewBox around it.
 */
function FittedArt({ size, w, h, children }: { size: number; w: number; h: number; wide: boolean; children: React.ReactNode }) {
  const ref = useRef<SVGGElement>(null);
  const [vb, setVb] = useState(() => {
    const s = Math.max(w, h) + 16;
    return { x: (w - s) / 2, y: (h - s) / 2, s };
  });
  useLayoutEffect(() => {
    const g = ref.current;
    if (!g || typeof g.getBBox !== 'function') return;
    try {
      const b = g.getBBox();
      if (!b.width || !b.height) return;
      const s = Math.max(b.width, b.height) + 10;
      setVb({ x: b.x + b.width / 2 - s / 2, y: b.y + b.height / 2 - s / 2, s });
    } catch {
      /* not rendered yet */
    }
  }, [w, h]);
  return (
    <svg width={size} height={size} viewBox={`${vb.x} ${vb.y} ${vb.s} ${vb.s}`} aria-hidden>
      <g ref={ref}>{children}</g>
    </svg>
  );
}
