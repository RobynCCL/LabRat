import type { ComponentType } from 'react';
import type { Layer } from '@/engine/lab/grid';

export type Category = 'structure' | 'equipment' | 'decor' | 'fun' | 'avatar';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
/** Applied items replace the room's floor / wall / lighting, or the avatar's outfit. */
export type Slot = 'floor' | 'wall' | 'lighting' | 'coat' | 'goggles' | 'gloves';

export interface Variant {
  id: string;
  name: string;
  /** Colour roles used by the item's Art component (e.g. { top: '#…', edge: '#…' }). */
  colors: Record<string, string>;
}

export interface ArtProps {
  /** Pixel width/height of the unrotated drawing box. */
  w: number;
  h: number;
  /** Colours of the chosen variant. */
  c: Record<string, string>;
  /** False when reduced motion is on or for static previews. */
  anim: boolean;
}

interface ItemBase {
  id: string;
  name: string;
  description: string;
  category: Category;
  rarity: Rarity;
  price: number;
  variants: Variant[];
  Art: ComponentType<ArtProps>;
  animated?: boolean;
  /** Player level needed before it can be bought. */
  unlockLevel?: number;
}

export interface PlaceableItem extends ItemBase {
  kind: 'placeable';
  layer: Layer;
  /** [width, height] in tiles. Wall items: height is how tall they hang (1–2). */
  size: [number, number];
  /** Tabletop items can sit on it (benches). */
  surface?: boolean;
  rotatable?: boolean;
}

export interface AppliedItem extends ItemBase {
  kind: 'applied';
  slot: Slot;
}

export type ShopItem = PlaceableItem | AppliedItem;

export const CATEGORIES: { id: Category; label: string; blurb: string }[] = [
  { id: 'structure', label: 'Structure', blurb: 'Floors, walls and lighting' },
  { id: 'equipment', label: 'Equipment', blurb: 'Benches, glassware and kit' },
  { id: 'decor', label: 'Decor', blurb: 'Posters, plants and rugs' },
  { id: 'fun', label: 'Fun', blurb: 'Pets and curiosities' },
  { id: 'avatar', label: 'Avatar', blurb: 'Coats, goggles and gloves' },
];

export const RARITIES: { id: Rarity; label: string }[] = [
  { id: 'common', label: 'Common' },
  { id: 'uncommon', label: 'Uncommon' },
  { id: 'rare', label: 'Rare' },
  { id: 'epic', label: 'Epic' },
  { id: 'legendary', label: 'Legendary' },
];
