import Papa from 'papaparse';
import type { Question } from './types';
import { validateBank, type TopicRef, type ValidationResult } from './validate';

/**
 * CSV bank format (one question per row, header row required):
 *
 *   id, topic, subtopic, type, difficulty, question, options, answer, explanation, tags, tolerance, unit, caseSensitive
 *
 * Lists use "|" as separator. `answer` per type:
 *   mcq      letter (A, B…), 1-based number, or the exact option text
 *   multi    letters/numbers/texts separated by "|"       e.g.  A|C
 *   numeric  a number (use the tolerance / unit columns)
 *   text     accepted answers separated by "|"
 *   order    items in the correct order separated by "|" (leave options empty)
 *   match    pairs separated by "|", each written left=right   e.g.  Na=sodium|K=potassium
 */
export const CSV_COLUMNS = [
  'id', 'topic', 'subtopic', 'type', 'difficulty', 'question', 'options', 'answer',
  'explanation', 'tags', 'tolerance', 'unit', 'caseSensitive',
] as const;

const split = (s: string | undefined) =>
  (s ?? '')
    .split('|')
    .map((x) => x.trim())
    .filter(Boolean);

function optionIndex(token: string, options: string[]): number {
  const t = token.trim();
  if (/^[A-Za-z]$/.test(t)) return t.toUpperCase().charCodeAt(0) - 65;
  if (/^\d+$/.test(t)) return parseInt(t, 10) - 1;
  return options.findIndex((o) => o.trim().toLowerCase() === t.toLowerCase());
}

/** Convert one CSV row (object keyed by header) to raw question JSON (validated later). */
export function csvRowToQuestion(row: Record<string, string>): Record<string, unknown> {
  const get = (k: string) => (row[k] ?? '').trim();
  const type = get('type').toLowerCase();
  const options = split(row.options);
  const q: Record<string, unknown> = {
    id: get('id'),
    topic: get('topic'),
    type,
    difficulty: get('difficulty') ? Number(get('difficulty')) : 2,
    question: get('question'),
    explanation: get('explanation'),
  };
  if (get('subtopic')) q.subtopic = get('subtopic');
  if (get('tags')) q.tags = split(row.tags);
  const ans = get('answer');
  switch (type) {
    case 'mcq':
      q.options = options;
      q.answer = ans ? optionIndex(ans, options) : null;
      break;
    case 'multi':
      q.options = options;
      q.answer = split(ans).map((a) => optionIndex(a, options));
      break;
    case 'numeric': {
      const value = ans === '' ? NaN : Number(ans.replace(',', '.'));
      q.answer = {
        value: Number.isFinite(value) ? value : ans,
        ...(get('tolerance') ? { tolerance: Number(get('tolerance')) } : {}),
        ...(get('unit') ? { unit: get('unit') } : {}),
      };
      break;
    }
    case 'text':
      q.answer = split(ans);
      if (/^(true|yes|1)$/i.test(get('caseSensitive'))) q.caseSensitive = true;
      break;
    case 'order':
      q.answer = split(ans).length ? split(ans) : options;
      break;
    case 'match':
      q.answer = split(ans).map((p) => {
        const i = p.indexOf('=');
        return i < 0 ? [p, ''] : [p.slice(0, i).trim(), p.slice(i + 1).trim()];
      });
      break;
    default:
      q.answer = ans;
  }
  return q;
}

export function parseCsvBank(
  text: string,
  meta: { bankId?: string; name: string },
  topics: TopicRef[],
): ValidationResult {
  const parsed = Papa.parse<Record<string, string>>(text.trim(), {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => h.trim().replace(/^﻿/, ''),
  });
  const missing = ['id', 'topic', 'type', 'question', 'answer'].filter((c) => !parsed.meta.fields?.includes(c));
  if (missing.length) {
    return {
      bank: null,
      errors: [{ row: null, message: `CSV is missing column(s): ${missing.join(', ')}. Expected header: ${CSV_COLUMNS.join(',')}` }],
      warnings: [],
      validCount: 0,
      invalidCount: 0,
    };
  }
  const res = validateBank(
    { bankId: meta.bankId, name: meta.name, version: 1, questions: parsed.data.map(csvRowToQuestion) },
    topics,
  );
  for (const e of parsed.errors) {
    res.warnings.push({ row: e.row != null ? e.row + 1 : null, message: `CSV: ${e.message}` });
  }
  return res;
}

/** Export questions to CSV in the same format. */
export function questionsToCsv(questions: Question[]): string {
  const rows = questions.map((q) => {
    const base: Record<string, string> = {
      id: q.id,
      topic: q.topic,
      subtopic: q.subtopic ?? '',
      type: q.type,
      difficulty: String(q.difficulty),
      question: q.question,
      options: '',
      answer: '',
      explanation: q.explanation,
      tags: (q.tags ?? []).join('|'),
      tolerance: '',
      unit: '',
      caseSensitive: '',
    };
    switch (q.type) {
      case 'mcq':
        base.options = q.options.join('|');
        base.answer = String.fromCharCode(65 + q.answer);
        break;
      case 'multi':
        base.options = q.options.join('|');
        base.answer = q.answer.map((i) => String.fromCharCode(65 + i)).join('|');
        break;
      case 'numeric':
        base.answer = String(q.answer.value);
        base.tolerance = q.answer.tolerance != null ? String(q.answer.tolerance) : '';
        base.unit = q.answer.unit ?? '';
        break;
      case 'text':
        base.answer = q.answer.join('|');
        base.caseSensitive = q.caseSensitive ? 'true' : '';
        break;
      case 'order':
        base.answer = q.answer.join('|');
        break;
      case 'match':
        base.answer = q.answer.map(([l, r]) => `${l}=${r}`).join('|');
        break;
    }
    return base;
  });
  return Papa.unparse({ fields: [...CSV_COLUMNS], data: rows.map((r) => CSV_COLUMNS.map((c) => r[c])) });
}
