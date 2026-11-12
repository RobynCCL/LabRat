/**
 * Question bank data model. See CONTRIBUTING.md → "Question bank format".
 *
 * The `answer` field always holds the truth; its shape depends on `type`.
 * For `order` and `match`, the game shuffles the items itself, so authors
 * simply write them in the correct order / as correct pairs.
 */

export type QuestionType = 'mcq' | 'multi' | 'numeric' | 'text' | 'order' | 'match';
export type Difficulty = 1 | 2 | 3;

interface QuestionBase {
  /** Unique within its bank. Letters, digits, `-` and `_`. */
  id: string;
  /** Topic id from src/content/topics.ts (topic names are also accepted on import). */
  topic: string;
  subtopic?: string;
  difficulty: Difficulty;
  /** Question text. Chemical notation like H2SO4, Fe^3+, -> and <=> is formatted automatically. */
  question: string;
  /** Shown after the player answers. */
  explanation: string;
  tags?: string[];
}

export interface McqQuestion extends QuestionBase {
  type: 'mcq';
  options: string[];
  /** Index (0-based) of the correct option. */
  answer: number;
}

export interface MultiQuestion extends QuestionBase {
  type: 'multi';
  options: string[];
  /** Indices (0-based) of every correct option. */
  answer: number[];
}

export interface NumericAnswer {
  value: number;
  /** Absolute tolerance (e.g. 0.01). If omitted, 1% of the value is allowed. */
  tolerance?: number;
  /** Displayed next to the input box, e.g. "mol", "cm3", "g mol^-1". */
  unit?: string;
}

export interface NumericQuestion extends QuestionBase {
  type: 'numeric';
  answer: NumericAnswer;
}

export interface TextQuestion extends QuestionBase {
  type: 'text';
  /** Every accepted answer. Compared ignoring spacing and (by default) case. */
  answer: string[];
  /** Set true when case matters, e.g. formulas like Co vs CO. */
  caseSensitive?: boolean;
}

export interface OrderQuestion extends QuestionBase {
  type: 'order';
  /** Items in the CORRECT order. The game shuffles them. */
  answer: string[];
}

export interface MatchQuestion extends QuestionBase {
  type: 'match';
  /** Correct [left, right] pairs. The game shuffles the right-hand column. */
  answer: [string, string][];
}

export type Question =
  | McqQuestion
  | MultiQuestion
  | NumericQuestion
  | TextQuestion
  | OrderQuestion
  | MatchQuestion;

export interface QuestionBank {
  bankId: string;
  name: string;
  version: number;
  description?: string;
  /** Marks built-in sample content so it is easy to spot and disable. */
  sample?: boolean;
  questions: Question[];
}

/** A question as used in-game: carries its bank and a globally unique key. */
export type PoolQuestion = Question & { uid: string; bankId: string };

/** What the player submitted, per question type. */
export type Response =
  | { type: 'mcq'; choice: number | null }
  | { type: 'multi'; choices: number[] }
  | { type: 'numeric'; value: string }
  | { type: 'text'; value: string }
  | { type: 'order'; items: string[] }
  | { type: 'match'; pairs: Record<string, string> };

export interface CheckResult {
  correct: boolean;
  /** 0–1 share of the answer that was right (for multi, order, match). */
  score: number;
  /** Optional hint about what went wrong (e.g. close but outside tolerance). */
  note?: string;
}

export const QUESTION_TYPES: { id: QuestionType; label: string }[] = [
  { id: 'mcq', label: 'Multiple choice' },
  { id: 'multi', label: 'Multi-select' },
  { id: 'numeric', label: 'Numeric' },
  { id: 'text', label: 'Short text' },
  { id: 'order', label: 'Ordering' },
  { id: 'match', label: 'Matching' },
];
