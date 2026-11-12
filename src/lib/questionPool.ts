import { topics } from '@/content/topics';
import { validateBank } from '@/engine/questions/validate';
import type { PoolQuestion, QuestionBank } from '@/engine/questions/types';
import type { TopicIndex } from '@/engine/progress/stats';

/**
 * Built-in banks: every *.json in src/content/banks (files starting with "_" are ignored).
 * They are validated at load; invalid questions are skipped with a console warning.
 */
const files = import.meta.glob<{ default: unknown }>('../content/banks/*.json', { eager: true });

export const builtInBanks: QuestionBank[] = Object.entries(files)
  .filter(([path]) => !path.split('/').pop()!.startsWith('_'))
  .map(([path, mod]) => {
    const res = validateBank(mod.default, topics);
    if (res.errors.length) console.warn(`[Lab Rat] Problems in ${path}:`, res.errors);
    return res.bank;
  })
  .filter((b): b is QuestionBank => !!b);

export const uidOf = (bankId: string, qid: string) => `${bankId}/${qid}`;

export interface BankEntry {
  bank: QuestionBank;
  builtIn: boolean;
  enabled: boolean;
}

export function allBanks(userBanks: QuestionBank[], disabled: string[]): BankEntry[] {
  const off = new Set(disabled);
  const userIds = new Set(userBanks.map((b) => b.bankId));
  return [
    // A user bank with the same id as a built-in one overrides it.
    ...builtInBanks.filter((b) => !userIds.has(b.bankId)).map((bank) => ({ bank, builtIn: true, enabled: !off.has(bank.bankId) })),
    ...userBanks.map((bank) => ({ bank, builtIn: false, enabled: !off.has(bank.bankId) })),
  ];
}

export function buildPool(userBanks: QuestionBank[], disabled: string[]): PoolQuestion[] {
  return allBanks(userBanks, disabled)
    .filter((e) => e.enabled)
    .flatMap((e) => e.bank.questions.map((q) => ({ ...q, bankId: e.bank.bankId, uid: uidOf(e.bank.bankId, q.id) })));
}

export function topicIndex(pool: PoolQuestion[]): TopicIndex {
  const idx: TopicIndex = {};
  for (const q of pool) (idx[q.topic] ??= []).push(q.uid);
  return idx;
}

export function shuffle<T>(arr: T[], rnd: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
