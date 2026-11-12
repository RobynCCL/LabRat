import { topics } from '@/content/topics';
import template from '@/content/banks/_template.json';
import type { QuestionType } from '@/engine/questions/types';

export interface BankRequest {
  topic: string;
  subtopic: string;
  count: number;
  difficulty: 'mixed' | '1' | '2' | '3';
  types: QuestionType[];
  bankId: string;
  bankName: string;
  notes: string;
}

const TYPE_DOCS: Record<QuestionType, string> = {
  mcq: '"mcq" – multiple choice. "options": 4 strings; "answer": 0-based index of the correct option.',
  multi: '"multi" – select all that apply. "options": 4–6 strings; "answer": array of 0-based indices of ALL correct options.',
  numeric: '"numeric" – calculation. "answer": {"value": number, "tolerance": number (absolute), "unit": "string, optional"}. No "options".',
  text: '"text" – short typed answer. "answer": array of every acceptable answer (synonyms, formula and name). Add "caseSensitive": true only for formulas where case matters. No "options".',
  order: '"order" – put items in order. "answer": the items in the CORRECT order (the game shuffles them). No "options".',
  match: '"match" – match pairs. "answer": array of ["left", "right"] pairs (3–5 pairs, each side unique). No "options".',
};

/** Builds a copy-ready prompt asking Claude for a question bank in Lab Rat's JSON format. */
export function buildBankPrompt(r: BankRequest): string {
  const topic = topics.find((t) => t.id === r.topic);
  const diff =
    r.difficulty === 'mixed'
      ? 'a mix of difficulties: roughly 30% difficulty 1 (foundation recall), 50% difficulty 2 (standard exam questions), 20% difficulty 3 (challenging, multi-step)'
      : `difficulty ${r.difficulty} (${r.difficulty === '1' ? 'foundation recall' : r.difficulty === '2' ? 'standard exam level' : 'challenging, multi-step'})`;
  const types = r.types.length ? r.types : (Object.keys(TYPE_DOCS) as QuestionType[]);
  const example = {
    bankId: r.bankId || 'my-bank',
    name: r.bankName || 'My bank',
    version: 1,
    questions: template.questions.filter((q) => types.includes(q.type as QuestionType)).slice(0, 3),
  };

  return `You are an expert Irish Leaving Certificate Chemistry teacher writing revision questions for the "Lab Rat" study game.

Write ${r.count} original, accurate questions on:
- Topic: ${topic?.name ?? r.topic} (topic id: "${r.topic}")${r.subtopic ? `\n- Subtopic: ${r.subtopic}` : ''}
- Level: Leaving Certificate (Higher Level syllabus), using Irish conventions (e.g. s.t.p. molar volume 22.4 L, "mol L-1", "Mr", mandatory experiments as named in the syllabus).
- Difficulty: ${diff}.
- Question types to use (spread them evenly): ${types.join(', ')}.${r.notes.trim() ? `\n- Extra instructions: ${r.notes.trim()}` : ''}

OUTPUT FORMAT – return ONLY one JSON object in a single \`\`\`json code block, no other text:
{
  "bankId": "${r.bankId || 'my-bank'}",       // lowercase letters, digits and hyphens
  "name": "${r.bankName || 'My bank'}",
  "version": 1,
  "questions": [ ... ]
}

Every question object has:
- "id": unique short id within this bank, e.g. "${(r.subtopic || r.topic).toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 12)}-01" (letters, digits, - and _ only)
- "topic": "${r.topic}"
- "subtopic": "${r.subtopic || 'a suitable subtopic'}"
- "type": one of the types below
- "difficulty": 1, 2 or 3
- "question": the question text
- "explanation": 1–3 sentences explaining WHY the answer is correct, as a teacher would (show working for calculations)
- "tags": optional array of short keywords

Type-specific fields:
${types.map((t) => '- ' + TYPE_DOCS[t]).join('\n')}

Chemical notation: write formulas in plain text and the game formats them: H2SO4 → H₂SO₄, Fe^3+ → Fe³⁺, SO4^2- → SO₄²⁻, -> for →, <=> for ⇌, cm3 / dm-3 / mol-1 for units, 10^-3 for powers.

Quality rules:
- Every fact, value and calculation must be correct for the Leaving Cert syllabus. Double-check arithmetic.
- Wrong options in mcq/multi should be plausible misconceptions, not jokes.
- Don't use "all of the above" (options are shuffled).
- Numeric tolerances should allow sensible rounding (e.g. 0.01 for answers to 2 decimal places).

Example of the exact format:
\`\`\`json
${JSON.stringify(example, null, 2)}
\`\`\``;
}
