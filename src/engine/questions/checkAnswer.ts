import { plainChem } from './formatChem';
import type { CheckResult, Question, Response } from './types';

/**
 * Parse a number the way students type it:
 *   "0.25", "0,25", " 0.25 mol", "1.5e-3", "1.5 x 10^-3", "1.5×10⁻³", "1.5 * 10-3", "-4"
 * Returns null when no number can be read.
 */
export function parseNumber(raw: string): number | null {
  if (raw == null) return null;
  let s = plainChem(String(raw)).trim().toLowerCase();
  if (!s) return null;
  s = s.replace(/(\d),(\d)/g, '$1.$2').replace(/\s+/g, ' ');
  // scientific notation written with ×10
  const sci = s.match(/^([+-]?\d*\.?\d+)\s*(?:x|×|\*)\s*10\s*\^?\s*([+-]?\d+)/);
  if (sci) return parseFloat(`${sci[1]}e${parseInt(sci[2], 10)}`);
  const plain = s.match(/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/);
  if (!plain) return null;
  const n = parseFloat(plain[0]);
  return Number.isFinite(n) ? n : null;
}

/** Normalise free text for comparison. */
export function normaliseText(s: string, caseSensitive = false): string {
  let t = plainChem(s)
    .normalize('NFKC')
    .replace(/[‘’`]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, '')
    .replace(/[.!]+$/, '');
  if (!caseSensitive) t = t.toLowerCase();
  return t;
}

export function numericTolerance(value: number, tolerance?: number): number {
  if (tolerance != null && tolerance >= 0) return tolerance;
  return Math.abs(value) * 0.01;
}

const score = (correct: boolean, s?: number): CheckResult => ({ correct, score: s ?? (correct ? 1 : 0) });

export function checkAnswer(q: Question, r: Response): CheckResult {
  if (q.type !== r.type) return score(false);
  switch (q.type) {
    case 'mcq': {
      const choice = (r as Extract<Response, { type: 'mcq' }>).choice;
      return score(choice === q.answer);
    }
    case 'multi': {
      const chosen = new Set((r as Extract<Response, { type: 'multi' }>).choices);
      const truth = new Set(q.answer);
      let right = 0;
      for (let i = 0; i < q.options.length; i++) if (chosen.has(i) === truth.has(i)) right++;
      return score(right === q.options.length, right / q.options.length);
    }
    case 'numeric': {
      const v = parseNumber((r as Extract<Response, { type: 'numeric' }>).value);
      if (v === null) return { correct: false, score: 0, note: 'That doesn’t look like a number.' };
      const tol = numericTolerance(q.answer.value, q.answer.tolerance);
      const diff = Math.abs(v - q.answer.value);
      // Float-safe comparison
      const ok = diff <= tol + 1e-9 * Math.max(1, Math.abs(q.answer.value));
      if (ok) return score(true);
      if (diff <= tol * 5) return { correct: false, score: 0, note: 'Close, but outside the allowed tolerance. Check your rounding.' };
      const ratio = v / q.answer.value;
      if (q.answer.value !== 0 && [10, 100, 1000, 0.1, 0.01, 0.001].some((k) => Math.abs(ratio - k) < 0.01 * k))
        return { correct: false, score: 0, note: 'Out by a power of ten. Check your unit conversions (e.g. cm³ → L).' };
      return score(false);
    }
    case 'text': {
      const typed = normaliseText((r as Extract<Response, { type: 'text' }>).value, q.caseSensitive);
      if (!typed) return score(false);
      return score(q.answer.some((a) => normaliseText(a, q.caseSensitive) === typed));
    }
    case 'order': {
      const items = (r as Extract<Response, { type: 'order' }>).items;
      let right = 0;
      q.answer.forEach((a, i) => {
        if (items[i] === a) right++;
      });
      return score(right === q.answer.length && items.length === q.answer.length, right / q.answer.length);
    }
    case 'match': {
      const pairs = (r as Extract<Response, { type: 'match' }>).pairs;
      let right = 0;
      for (const [l, rt] of q.answer) if (pairs[l] === rt) right++;
      return score(right === q.answer.length, right / q.answer.length);
    }
  }
}

/** Human-readable correct answer, used in feedback panels. */
export function describeAnswer(q: Question): string {
  switch (q.type) {
    case 'mcq':
      return q.options[q.answer];
    case 'multi':
      return q.answer.map((i) => q.options[i]).join('; ');
    case 'numeric':
      return `${q.answer.value}${q.answer.unit ? ' ' + q.answer.unit : ''}`;
    case 'text':
      return q.answer[0];
    case 'order':
      return q.answer.join(' → ');
    case 'match':
      return q.answer.map(([l, r]) => `${l} = ${r}`).join('; ');
  }
}
