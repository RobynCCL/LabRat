import type { Difficulty, Question, QuestionBank, QuestionType } from './types';

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
  const t = topics.find(
    (t) => t.id.toLowerCase() === v || t.name.toLowerCase() === v || t.short?.toLowerCase() === v,
  );
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
  const err = (field: string, message: string) => errors.push({ row, id: idv, field, message });

  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return { question: null, errors: [{ row, message: 'Question must be an object.' }], warnings };
  }
  const q = raw as Record<string, unknown>;
  const idv = typeof q.id === 'string' || typeof q.id === 'number' ? String(q.id).trim() : undefined;

  if (!idv) err('id', 'Missing "id".');
  else if (!ID_RE.test(idv)) err('id', `"${idv}" may only contain letters, digits, "-" and "_".`);

  const topic = resolveTopic(q.topic, topics);
  if (!topic) err('topic', `Unknown topic "${String(q.topic ?? '')}". Use one of: ${topics.map((t) => t.id).join(', ')}.`);

  const type = q.type as QuestionType;
  if (!TYPES.includes(type)) err('type', `"type" must be one of ${TYPES.join(', ')}.`);

  const difficulty = Number(q.difficulty ?? 2);
  if (![1, 2, 3].includes(difficulty)) err('difficulty', '"difficulty" must be 1, 2 or 3.');

  if (!isStr(q.question)) err('question', 'Missing "question" text.');
  if (!isStr(q.explanation)) warnings.push({ row, id: idv, field: 'explanation', message: 'No explanation given.' });
  if (q.subtopic != null && typeof q.subtopic !== 'string') err('subtopic', '"subtopic" must be text.');
  if (q.tags != null && !isStrArr(q.tags)) err('tags', '"tags" must be a list of text.');

  const options = q.options;
  const answer = q.answer;
  let cleanAnswer: unknown = answer;

  switch (type) {
    case 'mcq': {
      if (!isStrArr(options) || options.length < 2) err('options', 'Multiple choice needs at least 2 text options.');
      else if (!Number.isInteger(answer) || (answer as number) < 0 || (answer as number) >= options.length)
        err('answer', `"answer" must be the 0-based index of the correct option (0–${options.length - 1}).`);
      break;
    }
    case 'multi': {
      if (!isStrArr(options) || options.length < 2) err('options', 'Multi-select needs at least 2 text options.');
      else if (
        !Array.isArray(answer) ||
        answer.length === 0 ||
        !answer.every((a) => Number.isInteger(a) && a >= 0 && a < options.length)
      )
        err('answer', `"answer" must be a non-empty list of 0-based option indices (0–${options.length - 1}).`);
      else cleanAnswer = [...new Set(answer as number[])].sort((a, b) => a - b);
      break;
    }
    case 'numeric': {
      const a = (typeof answer === 'number' ? { value: answer } : answer) as Record<string, unknown> | null;
      if (!a || typeof a !== 'object' || typeof a.value !== 'number' || !Number.isFinite(a.value))
        err('answer', '"answer" must be {"value": number, "tolerance"?: number, "unit"?: text}.');
      else if (a.tolerance != null && (typeof a.tolerance !== 'number' || a.tolerance < 0))
        err('answer.tolerance', '"tolerance" must be a positive number.');
      else if (a.unit != null && typeof a.unit !== 'string') err('answer.unit', '"unit" must be text.');
      else {
        cleanAnswer = { value: a.value, ...(a.tolerance != null ? { tolerance: a.tolerance } : {}), ...(a.unit ? { unit: a.unit } : {}) };
        if (a.tolerance == null) warnings.push({ row, id: idv, field: 'answer.tolerance', message: 'No tolerance given – 1% will be allowed.' });
      }
      break;
    }
    case 'text': {
      const list = typeof answer === 'string' ? [answer] : answer;
      if (!isStrArr(list) || list.length === 0) err('answer', '"answer" must be a list of accepted answers.');
      else cleanAnswer = list;
      break;
    }
    case 'order': {
      if (!isStrArr(answer) || answer.length < 2) err('answer', 'Ordering needs "answer": at least 2 items in the correct order.');
      else if (new Set(answer).size !== answer.length) err('answer', 'Ordering items must all be different.');
      break;
    }
    case 'match': {
      const ok =
        Array.isArray(answer) &&
        answer.length >= 2 &&
        answer.every((p) => Array.isArray(p) && p.length === 2 && isStr(p[0]) && isStr(p[1]));
      if (!ok) err('answer', 'Matching needs "answer": at least 2 ["left", "right"] pairs.');
      else {
        const lefts = (answer as string[][]).map((p) => p[0]);
        const rights = (answer as string[][]).map((p) => p[1]);
        if (new Set(lefts).size !== lefts.length || new Set(rights).size !== rights.length)
          err('answer', 'Each left item and each right item in a match must be unique.');
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
export function validateBank(raw: unknown, topics: TopicRef[]): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const fail = (message: string): ValidationResult => ({
    bank: null,
    errors: [{ row: null, message }],
    warnings,
    validCount: 0,
    invalidCount: 0,
  });

  // Accept a bare array of questions too (common when pasting from an AI).
  if (Array.isArray(raw)) raw = { questions: raw };
  if (typeof raw !== 'object' || raw === null) return fail('The file is not a JSON object.');
  const b = raw as Record<string, unknown>;
  if (!Array.isArray(b.questions)) return fail('Missing "questions" list.');

  const name = isStr(b.name) ? b.name.trim() : 'Imported bank';
  let bankId = isStr(b.bankId) ? b.bankId.trim() : slugify(name);
  if (!ID_RE.test(bankId)) {
    warnings.push({ row: null, field: 'bankId', message: `bankId "${bankId}" was cleaned up.` });
    bankId = slugify(bankId) || 'imported';
  }
  const version = typeof b.version === 'number' ? b.version : 1;

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
      errors.push({ row: i + 1, id: res.question.id, field: 'id', message: `Duplicate id "${res.question.id}".` });
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
