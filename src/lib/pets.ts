import { getItem } from '@/content/shop/items';
import type { PetInfo, ShopItem } from '@/content/shop/types';
import type { OwnedItem } from '@/store/saveTypes';

/** Chemistry-flavoured name ideas for the "suggest a name" button. */
export const PET_NAMES = [
  'Pip', 'Boron', 'Neon', 'Fizz', 'Bunsen', 'Mendel', 'Curie', 'Radon', 'Zinc', 'Kelvin', 'Mol',
  'Beaker', 'Pipette', 'Litmus', 'Ion', 'Argon', 'Atom', 'Quark', 'Titan', 'Cobalt', 'Ruby',
  'Indigo', 'Sodium', 'Helium', 'Pixel', 'Nova', 'Ember', 'Biscuit', 'Fennel', 'Muffin', 'Sprout',
  'Crumpet', 'Noodle', 'Pickle', 'Waffle', 'Dalton', 'Avogadro', 'Isotope', 'Catalyst', 'Buffer',
];

export function suggestName(taken: string[] = []): string {
  const free = PET_NAMES.filter((n) => !taken.includes(n));
  const list = free.length ? free : PET_NAMES;
  return list[Math.floor(Math.random() * list.length)];
}

export const petInfo = (item: ShopItem | undefined): PetInfo | undefined => item?.pet;
export const isPetItem = (item: ShopItem | undefined) => !!item?.pet;
export const isRoamingPet = (item: ShopItem | undefined) => item?.kind === 'pet';

export function isPet(own: OwnedItem): boolean {
  return isPetItem(getItem(own.itemId));
}

/** Hearts (0–5) from the number of pats. */
export const HEART_STEPS = [3, 10, 25, 50, 100];
export function hearts(pats = 0): number {
  return HEART_STEPS.filter((n) => pats >= n).length;
}
export function patsToNextHeart(pats = 0): number | null {
  const next = HEART_STEPS.find((n) => pats < n);
  return next == null ? null : next - pats;
}

export function cleanName(name: string): string {
  return name.replace(/\s+/g, ' ').trim().slice(0, 16);
}
