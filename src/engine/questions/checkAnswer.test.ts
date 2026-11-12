import { describe, expect, it } from 'vitest';
import { checkAnswer, parseNumber } from './checkAnswer';
import type { Question } from './types';

const base = { id: 'q', topic: 'stoichiometry', difficulty: 1 as const, question: '?', explanation: '' };

describe('parseNumber', () => {
  it.each([
    ['0.25', 0.25],
    ['0,25', 0.25],
    [' 0.25 mol', 0.25],
    ['1.5e-3', 0.0015],
    ['1.5 x 10^-3', 0.0015],
    ['1.5×10⁻³', 0.0015],
    ['6.02 × 10^23', 6.02e23],
    ['-4', -4],
    ['.5', 0.5],
  ])('%s → %d', (s, n) => {
    expect(parseNumber(s)).toBeCloseTo(n as number, 10);
  });
  it('rejects non-numbers', () => {
    expect(parseNumber('abc')).toBeNull();
    expect(parseNumber('')).toBeNull();
  });
});

describe('checkAnswer', () => {
  it('mcq', () => {
    const q: Question = { ...base, type: 'mcq', options: ['a', 'b', 'c'], answer: 1 };
    expect(checkAnswer(q, { type: 'mcq', choice: 1 }).correct).toBe(true);
    expect(checkAnswer(q, { type: 'mcq', choice: 0 }).correct).toBe(false);
    expect(checkAnswer(q, { type: 'mcq', choice: null }).correct).toBe(false);
  });

  it('multi needs exactly the right set, with partial score', () => {
    const q: Question = { ...base, type: 'multi', options: ['a', 'b', 'c', 'd'], answer: [0, 2] };
    expect(checkAnswer(q, { type: 'multi', choices: [2, 0] }).correct).toBe(true);
    const r = checkAnswer(q, { type: 'multi', choices: [0] });
    expect(r.correct).toBe(false);
    expect(r.score).toBe(0.75);
  });

  it('numeric with absolute tolerance', () => {
    const q: Question = { ...base, type: 'numeric', answer: { value: 0.1, tolerance: 0.005, unit: 'mol' } };
    expect(checkAnswer(q, { type: 'numeric', value: '0.1' }).correct).toBe(true);
    expect(checkAnswer(q, { type: 'numeric', value: '0.104 mol' }).correct).toBe(true);
    expect(checkAnswer(q, { type: 'numeric', value: '0.105' }).correct).toBe(true); // edge, float-safe
    expect(checkAnswer(q, { type: 'numeric', value: '0.11' }).correct).toBe(false);
    expect(checkAnswer(q, { type: 'numeric', value: '1e-1' }).correct).toBe(true);
  });

  it('numeric default 1% tolerance and helpful notes', () => {
    const q: Question = { ...base, type: 'numeric', answer: { value: 22.4 } };
    expect(checkAnswer(q, { type: 'numeric', value: '22.5' }).correct).toBe(true);
    expect(checkAnswer(q, { type: 'numeric', value: '22400' }).note).toBe('powerOfTen');
    expect(checkAnswer(q, { type: 'numeric', value: 'twenty' }).note).toBe('notNumber');
  });

  it('text: case, spacing and chemical notation are forgiving', () => {
    const q: Question = { ...base, type: 'text', answer: ['manganese dioxide', 'MnO2'] };
    expect(checkAnswer(q, { type: 'text', value: '  Manganese  Dioxide. ' }).correct).toBe(true);
    expect(checkAnswer(q, { type: 'text', value: 'MnO₂' }).correct).toBe(true);
    expect(checkAnswer(q, { type: 'text', value: 'mno2' }).correct).toBe(true);
    expect(checkAnswer(q, { type: 'text', value: '' }).correct).toBe(false);
  });

  it('text: Irish fadas are optional', () => {
    const q: Question = { ...base, type: 'text', answer: ['eatánól'] };
    expect(checkAnswer(q, { type: 'text', value: 'eatanol' }).correct).toBe(true);
    expect(checkAnswer(q, { type: 'text', value: 'Eatánól' }).correct).toBe(true);
  });

  it('text: caseSensitive', () => {
    const q: Question = { ...base, type: 'text', answer: ['CH2O'], caseSensitive: true };
    expect(checkAnswer(q, { type: 'text', value: 'CH₂O' }).correct).toBe(true);
    expect(checkAnswer(q, { type: 'text', value: 'ch2o' }).correct).toBe(false);
  });

  it('order', () => {
    const q: Question = { ...base, type: 'order', answer: ['Na', 'Al', 'Mg', 'Si'] };
    expect(checkAnswer(q, { type: 'order', items: ['Na', 'Al', 'Mg', 'Si'] }).correct).toBe(true);
    const r = checkAnswer(q, { type: 'order', items: ['Na', 'Mg', 'Al', 'Si'] });
    expect(r.correct).toBe(false);
    expect(r.score).toBe(0.5);
  });

  it('match', () => {
    const q: Question = { ...base, type: 'match', answer: [['Na', 'sodium'], ['K', 'potassium']] };
    expect(checkAnswer(q, { type: 'match', pairs: { Na: 'sodium', K: 'potassium' } }).correct).toBe(true);
    expect(checkAnswer(q, { type: 'match', pairs: { Na: 'potassium', K: 'sodium' } }).score).toBe(0);
  });

  it('type mismatch is wrong', () => {
    const q: Question = { ...base, type: 'mcq', options: ['a', 'b'], answer: 0 };
    expect(checkAnswer(q, { type: 'text', value: 'a' }).correct).toBe(false);
  });
});
