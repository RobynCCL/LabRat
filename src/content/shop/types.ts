import type { ComponentType } from 'react';
import type { Layer } from '@/engine/lab/grid';

export type Category = 'structure' | 'furniture' | 'equipment' | 'decor' | 'fun' | 'pets' | 'avatar';
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
  /** Pets only: 'walk' while moving around the lab. */
  pose?: 'idle' | 'walk';
}

/** Makes an item a nameable pet. */
export interface PetInfo {
  /** Things the pet "says" when you tap it. */
  sayings: string[];
  /** Roaming pets wander the floor; tank pets are placed like furniture. */
  habitat: 'roam' | 'tank';
  /** Tiles per second while walking (roaming pets). */
  speed?: number;
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
  /** Set for pets (adopted with a name). */
  pet?: PetInfo;
}

export interface PlaceableItem extends ItemBase {
  kind: 'placeable';
  layer: Layer;
  /** [width, height] in tiles. Wall items: height is how tall they hang (1–2). */
  size: [number, number];
  /** Tabletop items can sit on it (benches, desks, tables). */
  surface?: boolean;
  /** Top-down furniture can rotate in 90° steps. */
  rotatable?: boolean;
  /** 'front' = drawn as a standing sprite (can be flipped, not rotated). Tabletop items are always front view. */
  view?: 'top' | 'front';
  /** Surfaces only: how many px bench-top items are raised when sitting on it (default 10). */
  surfaceLift?: number;
  /** Tank pets: makes the item nameable and tappable. */
  pet?: PetInfo;
}

/** A pet that wanders around a room instead of sitting on the grid. */
export interface RoamingPetItem extends ItemBase {
  kind: 'pet';
  pet: PetInfo;
}

export interface AppliedItem extends ItemBase {
  kind: 'applied';
  slot: Slot;
}

export type ShopItem = PlaceableItem | AppliedItem | RoamingPetItem;

export const CATEGORIES: { id: Category; label: string; blurb: string }[] = [
  { id: 'structure', label: 'Structure', blurb: 'Floors, walls and lighting' },
  { id: 'furniture', label: 'Furniture', blurb: 'Sofas, shelves and lamps' },
  { id: 'equipment', label: 'Equipment', blurb: 'Benches, glassware and kit' },
  { id: 'decor', label: 'Decor', blurb: 'Posters, plants and rugs' },
  { id: 'fun', label: 'Fun', blurb: 'Gadgets and curiosities' },
  { id: 'pets', label: 'Pets', blurb: 'Adopt and name a friend' },
  { id: 'avatar', label: 'Avatar', blurb: 'Coats, goggles and gloves' },
];

export const RARITIES: { id: Rarity; label: string }[] = [
  { id: 'common', label: 'Common' },
  { id: 'uncommon', label: 'Uncommon' },
  { id: 'rare', label: 'Rare' },
  { id: 'epic', label: 'Epic' },
  { id: 'legendary', label: 'Legendary' },
];
