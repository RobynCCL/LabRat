import { getItem } from '@/content/shop/items';
import { AvatarFigure, type AvatarLook } from '@/content/shop/art/avatar';
import type { ItemRef } from '@/store/saveTypes';
import { useGame } from '@/store/game';

export function colorsOf(ref: ItemRef | null): Record<string, string> | null {
  if (!ref) return null;
  const item = getItem(ref.itemId);
  return item?.variants.find((v) => v.id === ref.variant)?.colors ?? item?.variants[0]?.colors ?? null;
}

export function useAvatarLook(): AvatarLook {
  const a = useGame((g) => g.save.avatar);
  return {
    coat: colorsOf(a.coat) ?? { base: '#f7f8fa', trim: '#9aa6b2' },
    goggles: colorsOf(a.goggles),
    gloves: colorsOf(a.gloves),
  };
}

export function Avatar({ size = 120, wave, look }: { size?: number; wave?: boolean; look?: AvatarLook }) {
  const mine = useAvatarLook();
  return (
    <svg width={size} height={(size * 140) / 120} viewBox="0 0 120 140" role="img" aria-label="Your lab rat avatar">
      <AvatarFigure look={look ?? mine} wave={wave} />
    </svg>
  );
}
