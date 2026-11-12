import type { Difficulty, Question, QuestionBank, QuestionType } from './types';
import { en } from '@/i18n/en';
import { ga as contentGa } from '@/content/translations';

type V = typeof en.validation;
/** A validation message: a key into the `validation` text (en.ts / ga.ts) plus its parameters. */
export type IssueCode = keyof V;
type ParamsOf<K extends IssueCode> = V[K] extends (...a: infer P) => string ? P : [];

function msg<K extends IssueCode>(code: K, ...params: ParamsOf<K>): { code: K; params: (string | number)[]; message: string } {
  const v = en.validation[code] as string | ((...a: unknown[]) => string);
  return { code, params: params as (string | number)[], message: typeof v === 'function' ? v(...params) : v };
}

export interface TopicRef {
  id: string;
  name: string;
  short?: string;
}

export interface ValidationIssue {
  /** 1-based position in the questions array / CSV data row (null = bank-level). */
  row: number | null;
  id?: string;
  field?: string;
  /** Key into the `validation` text, so the UI can show it in any language. */
  code: IssueCode;
  params: (string | number)[];
  /** English text of the problem. */
  message: string;
}

export interface ValidationResult {
  /** Bank containing only the valid questions (null when the bank itself is unusable). */
  bank: QuestionBank | null;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  validCount: number;
  invalidCount: number;
}

const TYPES: QuestionType[] = ['mcq', 'multi', 'numeric', 'text', 'order', 'match'];
const ID_RE = /^[A-Za-z0-9_-]+$/;

const isStr = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
const isStrArr = (v: unknown): v is string[] => Array.isArray(v) && v.every(isStr);

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

/** Map a topic id OR name (case-insensitive) to a topic id. */
export function resolveTopic(value: unknown, topics: TopicRef[]): string | null {
  if (!isStr(value)) return null;
  const v = value.trim().toLowerCase();
  const t = topics.find((t) => {
    const irish = contentGa.topics[t.id];
    return [t.id, t.name, t.short, irish?.name, irish?.short].some((n) => n?.toLowerCase() === v);
  });
  return t ? t.id : null;
}

/**
 * Validate one question. Returns the cleaned question or a list of problems.
 * Unknown extra fields are dropped.
 */
export function validateQuestion(
  raw: unknown,
  topics: TopicRef[],
  row: number | null = null,
): { question: Question | null; errors: ValidationIssue[]; warnings: ValidationIssue[] } {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const err = (field: string, m: ReturnType<typeof msg>) => errors.push({ row, id: idv, field, ...m });

  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return { question: null, errors: [{ row, ...msg('notObject') }], warnings };
  }
  const q = raw as Record<string, unknown>;
  const idv = typeof q.id === 'string' || typeof q.id === 'number' ? String(q.id).trim() : undefined;

  if (!idv) err('id', msg('missingId'));
  else if (!ID_RE.test(idv)) err('id', msg('badId', idv));

  const topic = resolveTopic(q.topic, topics);
  if (!topic) err('topic', msg('unknownTopic', String(q.topic ?? ''), topics.map((t) => t.id).join(', ')));

  const type = q.type as QuestionType;
  if (!TYPES.includes(type)) err('type', msg('badType', TYPES.join(', ')));

  const difficulty = Number(q.difficulty ?? 2);
  if (![1, 2, 3].includes(difficulty)) err('difficulty', msg('badDifficulty'));

  if (!isStr(q.question)) err('question', msg('missingQuestion'));
  if (!isStr(q.explanation)) warnings.push({ row, id: idv, field: 'explanation', ...msg('noExplanation') });
  if (q.subtopic != null && typeof q.subtopic !== 'string') err('subtopic', msg('subtopicText'));
  if (q.tags != null && !isStrArr(q.tags)) err('tags', msg('tagsList'));

  const options = q.options;
  const answer = q.answer;
  let cleanAnswer: unknown = answer;

  switch (type) {
    case 'mcq': {
      if (!isStrArr(options) || options.length < 2) err('options', msg('mcqOptions'));
      else if (!Number.isInteger(answer) || (answer as number) < 0 || (answer as number) >= options.length)
        err('answer', msg('mcqAnswer', options.length - 1));
      break;
    }
    case 'multi': {
      if (!isStrArr(options) || options.length < 2) err('options', msg('multiOptions'));
      else if (
        !Array.isArray(answer) ||
        answer.length === 0 ||
        !answer.every((a) => Number.isInteger(a) && a >= 0 && a < options.length)
      )
        err('answer', msg('multiAnswer', options.length - 1));
      else cleanAnswer = [...new Set(answer as number[])].sort((a, b) => a - b);
      break;
    }
    case 'numeric': {
      const a = (typeof answer === 'number' ? { value: answer } : answer) as Record<string, unknown> | null;
      if (!a || typeof a !== 'object' || typeof a.value !== 'number' || !Number.isFinite(a.value))
        err('answer', msg('numericAnswer'));
      else if (a.tolerance != null && (typeof a.tolerance !== 'number' || a.tolerance < 0))
        err('answer.tolerance', msg('tolerance'));
      else if (a.unit != null && typeof a.unit !== 'string') err('answer.unit', msg('unitText'));
      else {
        cleanAnswer = { value: a.value, ...(a.tolerance != null ? { tolerance: a.tolerance } : {}), ...(a.unit ? { unit: a.unit } : {}) };
        if (a.tolerance == null) warnings.push({ row, id: idv, field: 'answer.tolerance', ...msg('noTolerance') });
      }
      break;
    }
    case 'text': {
      const list = typeof answer === 'string' ? [answer] : answer;
      if (!isStrArr(list) || list.length === 0) err('answer', msg('textAnswer'));
      else cleanAnswer = list;
      break;
    }
    case 'order': {
      if (!isStrArr(answer) || answer.length < 2) err('answer', msg('orderAnswer'));
      else if (new Set(answer).size !== answer.length) err('answer', msg('orderUnique'));
      break;
    }
    case 'match': {
      const ok =
        Array.isArray(answer) &&
        answer.length >= 2 &&
        answer.every((p) => Array.isArray(p) && p.length === 2 && isStr(p[0]) && isStr(p[1]));
      if (!ok) err('answer', msg('matchAnswer'));
      else {
        const lefts = (answer as string[][]).map((p) => p[0]);
        const rights = (answer as string[][]).map((p) => p[1]);
        if (new Set(lefts).size !== lefts.length || new Set(rights).size !== rights.length)
          err('answer', msg('matchUnique'));
      }
      break;
    }
  }

  if (errors.length) return { question: null, errors, warnings };

  const base = {
    id: idv!,
    topic: topic!,
    ...(isStr(q.subtopic) ? { subtopic: q.subtopic.trim() } : {}),
    type,
    difficulty: difficulty as Difficulty,
    question: (q.question as string).trim(),
    explanation: isStr(q.explanation) ? q.explanation.trim() : '',
    ...(isStrArr(q.tags) && q.tags.length ? { tags: q.tags } : {}),
  };
  let question: Question;
  if (type === 'mcq' || type === 'multi') question = { ...base, options: options as string[], answer: cleanAnswer } as Question;
  else if (type === 'text') question = { ...base, answer: cleanAnswer, ...(q.caseSensitive ? { caseSensitive: true } : {}) } as Question;
  else question = { ...base, answer: cleanAnswer } as Question;
  return { question, errors, warnings };
}

/** Validate a whole bank. Bad questions are reported and skipped; good ones are kept. */
export { msg as validationMessage };

export function validateBank(raw: unknown, topics: TopicRef[]): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const fail = (m: ReturnType<typeof msg>): ValidationResult => ({
    bank: null,
    errors: [{ row: null, ...m }],
    warnings,
    validCount: 0,
    invalidCount: 0,
  });

  // Accept a bare array of questions too (common when pasting from an AI).
  if (Array.isArray(raw)) raw = { questions: raw };
  if (typeof raw !== 'object' || raw === null) return fail(msg('notJsonObject'));
  const b = raw as Record<string, unknown>;
  if (!Array.isArray(b.questions)) return fail(msg('missingQuestions'));

  const name = isStr(b.name) ? b.name.trim() : 'Imported bank';
  let bankId = isStr(b.bankId) ? b.bankId.trim() : slugify(name);
  if (!ID_RE.test(bankId)) {
    warnings.push({ row: null, field: 'bankId', ...msg('bankIdCleaned', bankId) });
    bankId = slugify(bankId) || 'imported';
  }
  const version = typeof b.version === 'number' ? b.version : 1;
  let language: 'en' | 'ga' | undefined;
  if (b.language === 'ga' || b.language === 'en') language = b.language;
  else if (b.language != null) warnings.push({ row: null, field: 'language', ...msg('badLanguage') });

  const questions: Question[] = [];
  const seen = new Set<string>();
  b.questions.forEach((rq, i) => {
    const res = validateQuestion(rq, topics, i + 1);
    warnings.push(...res.warnings);
    if (!res.question) {
      errors.push(...res.errors);
      return;
    }
    if (seen.has(res.question.id)) {
      errors.push({ row: i + 1, id: res.question.id, field: 'id', ...msg('duplicateId', res.question.id) });
      return;
    }
    seen.add(res.question.id);
    questions.push(res.question);
  });

  return {
    bank: {
      bankId,
      name,
      version,
      ...(isStr(b.description) ? { description: b.description } : {}),
      ...(b.sample ? { sample: true } : {}),
      ...(language ? { language } : {}),
      questions,
    },
    errors,
    warnings,
    validCount: questions.length,
    invalidCount: b.questions.length - questions.length,
  };
}

/** Parse pasted text as JSON, tolerating ```json fences and leading chatter. */
export function parseJsonLoose(text: string): unknown {
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) t = fence[1].trim();
  else {
    const start = t.search(/[[{]/);
    if (start > 0) t = t.slice(start);
  }
  return JSON.parse(t);
}
