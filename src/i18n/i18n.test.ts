import { describe, expect, it } from 'vitest';
import { en } from './en';
import { ga, count } from './ga';
import { contentFor, formatIssue, questionLangs, stripAccents } from './index';
import { ga as contentGa } from '@/content/translations';
import { shopItems } from '@/content/shop/items';
import { topics } from '@/content/topics';
import { achievements } from '@/content/achievements';
import { modes } from '@/modes/registry';
import { CATEGORIES, RARITIES } from '@/content/shop/types';
import { economy } from '@/content/economy';
import { validateBank, validateQuestion } from '@/engine/questions/validate';
import sampleGa from '@/content/banks/sample-ga.json';
import sample from '@/content/banks/sample.json';

/** Collect every leaf key path in a dictionary. */
function paths(o: unknown, pre = ''): string[] {
  if (typeof o !== 'object' || o === null || Array.isArray(o)) return [pre];
  return Object.entries(o).flatMap(([k, v]) => paths(v, pre ? `${pre}.${k}` : k));
}

describe('interface dictionaries', () => {
  it('Irish has exactly the same keys as English', () => {
    expect(paths(ga).sort()).toEqual(paths(en).sort());
  });
  it('no Irish string is left identical to a long English one by mistake', () => {
    const same = paths(en).filter((p) => {
      const get = (d: unknown) => p.split('.').reduce((o: any, k) => o?.[k], d);
      const a = get(en);
      const b = get(ga);
      return typeof a === 'string' && a.length > 12 && a === b && !/^[A-Z0-9 :,.()/-]+$/i.test(a.replace(/[a-z]/g, '')) && !p.includes('csvColumns') && !p.includes('unitPlaceholder');
    });
    expect(same).toEqual([]);
  });
  it('quiz completion bands exist for every economy band', () => {
    for (const b of economy.quiz.completion) {
      expect(en.quiz.bands[b.label as keyof typeof en.quiz.bands]).toBeTruthy();
      expect(ga.quiz.bands[b.label as keyof typeof ga.quiz.bands]).toBeTruthy();
    }
  });
});

describe('Irish counting', () => {
  it.each([
    [1, 'ceist', 'ceist amháin'],
    [2, 'ceist', '2 cheist'],
    [5, 'ceist', '5 cheist'],
    [7, 'ceist', '7 gceist'],
    [10, 'ceist', '10 gceist'],
    [20, 'ceist', '20 ceist'],
    [3, 'lá', '3 lá'],
    [8, 'peata', '8 bpeata'],
    [4, 'fadhb', '4 fhadhb'],
    [9, 'aonad', '9 n-aonad'],
  ])('%i %s → %s', (n, noun, out) => {
    expect(count(n, noun)).toBe(out);
  });
});

describe('content translations', () => {
  it('every shop item has an Irish name and description', () => {
    const missing = shopItems.filter((i) => !contentGa.items[i.id]?.name || !contentGa.items[i.id]?.description).map((i) => i.id);
    expect(missing).toEqual([]);
  });
  it('every variant name has Irish', () => {
    const names = new Set(shopItems.flatMap((i) => i.variants.map((v) => v.name)));
    expect([...names].filter((n) => !contentGa.variants[n])).toEqual([]);
  });
  it('every pet has Irish sayings', () => {
    const pets = shopItems.filter((i) => i.pet);
    expect(pets.filter((p) => !(contentGa.sayings[p.id]?.length > 0)).map((p) => p.id)).toEqual([]);
  });
  it('topics, subtopics, achievements, modes, categories, rarities and rooms are translated', () => {
    expect(topics.filter((t) => !contentGa.topics[t.id]).map((t) => t.id)).toEqual([]);
    expect(topics.flatMap((t) => t.subtopics).filter((s) => !contentGa.subtopics[s])).toEqual([]);
    expect(achievements.filter((a) => !contentGa.achievements[a.id]).map((a) => a.id)).toEqual([]);
    expect(modes.filter((m) => !contentGa.modes[m.id]).map((m) => m.id)).toEqual([]);
    expect(CATEGORIES.filter((c) => !contentGa.categories[c.id]).map((c) => c.id)).toEqual([]);
    expect(RARITIES.filter((r) => !contentGa.rarities[r.id]).map((r) => r.id)).toEqual([]);
    expect(economy.rooms.filter((r) => !contentGa.rooms[r.id]).map((r) => r.id)).toEqual([]);
  });
  it('contentFor falls back to English for en', () => {
    const bench = shopItems.find((i) => i.id === 'bench')!;
    expect(contentFor('en').itemName(bench)).toBe('Lab bench');
    expect(contentFor('ga').itemName(bench)).toBe('Binse saotharlainne');
    expect(contentFor('ga').variantName(bench, 'grey')).toBe('Roisín liath');
  });
});

describe('questions in Irish', () => {
  it('the Irish sample bank is valid, tagged ga and mirrors the English one', () => {
    const r = validateBank(sampleGa, topics);
    expect(r.errors).toEqual([]);
    expect(r.bank!.language).toBe('ga');
    const enTypes = (sample as { questions: { id: string; type: string }[] }).questions.map((q) => `${q.id}:${q.type}`);
    expect(r.bank!.questions.map((q) => `${q.id}:${q.type}`)).toEqual(enTypes);
  });
  it('Irish topic names are accepted on import', () => {
    const r = validateQuestion({ id: 'x', topic: 'Ceimic orgánach', type: 'text', difficulty: 1, question: '?', answer: ['eatánól'], explanation: '.' }, topics);
    expect(r.question?.topic).toBe('organic');
  });
  it('validation messages translate', () => {
    const r = validateQuestion({ id: 'x', topic: 'organic', type: 'mcq', difficulty: 9, question: '?', options: ['a', 'b'], answer: 0 }, topics);
    const issue = r.errors.find((e) => e.field === 'difficulty')!;
    expect(formatIssue(en, issue)).toBe(issue.message);
    expect(formatIssue(ga, issue)).toMatch(/Caithfidh "difficulty"/);
  });
  it('question language setting picks banks', () => {
    expect(questionLangs({ language: 'ga', questionLanguage: 'auto' })).toEqual(['ga']);
    expect(questionLangs({ language: 'ga', questionLanguage: 'en' })).toEqual(['en']);
    expect(questionLangs({ language: 'en', questionLanguage: 'both' })).toEqual(['en', 'ga']);
  });
  it('accents are stripped for comparison', () => {
    expect(stripAccents('Dé-ocsaíd mhangainéise')).toBe('De-ocsaid mhangaineise');
  });
});
