/**
 * Lightweight i18n: typed dictionaries (en.ts / ga.ts) for interface text,
 * plus helpers that translate game content (src/content/translations.ts).
 * React components use the useI18n() hook from ./useI18n.
 */
import { en, type Dict } from './en';
import { ga } from './ga';
import { ga as contentGa } from '@/content/translations';
import type { ShopItem, Category, Rarity } from '@/content/shop/types';
import type { Topic } from '@/content/topics';
import type { Achievement } from '@/content/achievements';

export type Lang = 'en' | 'ga';
export const LANGS: Lang[] = ['en', 'ga'];
export type { Dict };

const dicts: Record<Lang, Dict> = { en, ga };
export const dictFor = (lang: Lang | undefined): Dict => dicts[lang ?? 'en'] ?? en;

/** Helpers for translating game content into the chosen language. */
export function contentFor(lang: Lang) {
  const g = lang === 'ga' ? contentGa : null;
  return {
    itemName: (item: ShopItem) => g?.items[item.id]?.name ?? item.name,
    itemDesc: (item: ShopItem) => g?.items[item.id]?.description ?? item.description,
    variantName: (item: ShopItem, variant: string) => {
      const name = item.variants.find((v) => v.id === variant)?.name ?? variant;
      return g?.variants[name] ?? name;
    },
    sayings: (item: ShopItem) => g?.sayings[item.id] ?? item.pet?.sayings ?? [],
    topicName: (t: Topic | undefined, fallback = '') => (t ? (g?.topics[t.id]?.name ?? t.name) : fallback),
    topicShort: (t: Topic | undefined, fallback = '') => (t ? (g?.topics[t.id]?.short ?? t.short) : fallback),
    subtopic: (s: string) => g?.subtopics[s] ?? s,
    achievementName: (a: Achievement) => g?.achievements[a.id]?.name ?? a.name,
    achievementDesc: (a: Achievement) => g?.achievements[a.id]?.description ?? a.description,
    mode: (m: { id: string; name: string; tagline: string; description: string }) => g?.modes[m.id] ?? m,
    category: (c: { id: Category; label: string; blurb: string }) => g?.categories[c.id] ?? c,
    rarity: (r: Rarity) => g?.rarities[r] ?? r,
    room: (r: { id: string; name: string }) => g?.rooms[r.id] ?? r.name,
  };
}
export type Content = ReturnType<typeof contentFor>;

/** Remove fadas and other accents, for forgiving answer comparison. */
export function stripAccents(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').normalize('NFC');
}

/** Show a validation problem (from the question validator) in the current language. */
export function formatIssue(t: Dict, issue: { code: keyof Dict['validation']; params: (string | number)[] }): string {
  const v = t.validation[issue.code] as string | ((...a: (string | number)[]) => string);
  return typeof v === 'function' ? v(...issue.params) : v;
}

/** Which question-bank languages to use for the given settings. */
export function questionLangs(settings: { language: Lang; questionLanguage: 'auto' | 'en' | 'ga' | 'both' }): Lang[] {
  if (settings.questionLanguage === 'both') return ['en', 'ga'];
  if (settings.questionLanguage === 'auto') return [settings.language];
  return [settings.questionLanguage];
}
