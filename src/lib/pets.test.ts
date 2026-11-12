import { describe, expect, it } from 'vitest';
import { cleanName, hearts, patsToNextHeart, suggestName, PET_NAMES } from './pets';
import { shopItems } from '@/content/shop/items';

describe('pet helpers', () => {
  it('hearts grow with pats', () => {
    expect(hearts(0)).toBe(0);
    expect(hearts(3)).toBe(1);
    expect(hearts(1000)).toBe(5);
    expect(patsToNextHeart(0)).toBe(3);
    expect(patsToNextHeart(1000)).toBeNull();
  });
  it('names are tidied and suggestions avoid taken names', () => {
    expect(cleanName('  Sir   Fizz-a-lot the Third  ')).toBe('Sir Fizz-a-lot t');
    const taken = PET_NAMES.slice(1);
    expect(suggestName(taken)).toBe(PET_NAMES[0]);
  });
  it('every pet has sayings', () => {
    const pets = shopItems.filter((i) => i.pet);
    expect(pets.length).toBeGreaterThanOrEqual(10);
    for (const p of pets) expect(p.pet!.sayings.length).toBeGreaterThan(0);
  });
  it('catalogue ids are unique and every item has variants', () => {
    const ids = shopItems.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const i of shopItems) expect(i.variants.length).toBeGreaterThan(0);
  });
});
