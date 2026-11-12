import { describe, expect, it } from 'vitest';
import { parseJsonLoose, validateBank, validateQuestion } from './validate';
import { parseCsvBank, questionsToCsv } from './csv';
import { topics } from '@/content/topics';
import sample from '@/content/banks/sample.json';
import template from '@/content/banks/_template.json';

const good = {
  id: 'q1',
  topic: 'stoichiometry',
  type: 'mcq',
  difficulty: 1,
  question: 'Avogadro constant?',
  options: ['6.0 × 10^23', '3.0 × 10^8'],
  answer: 0,
  explanation: 'L = 6.0 × 10^23 mol^-1',
};

describe('validateQuestion', () => {
  it('accepts a valid mcq', () => {
    const r = validateQuestion(good, topics, 1);
    expect(r.errors).toEqual([]);
    expect(r.question?.id).toBe('q1');
  });

  it('maps topic names to ids', () => {
    const r = validateQuestion({ ...good, topic: 'Rates of reaction' }, topics);
    expect(r.question?.topic).toBe('rates');
  });

  it('reports precise errors', () => {
    const r = validateQuestion({ ...good, topic: 'alchemy', answer: 5, difficulty: 7 }, topics, 3);
    const fields = r.errors.map((e) => e.field);
    expect(fields).toContain('topic');
    expect(fields).toContain('answer');
    expect(fields).toContain('difficulty');
    expect(r.errors.every((e) => e.row === 3)).toBe(true);
  });

  it('validates every type shape', () => {
    const t = (o: object) => validateQuestion({ ...good, ...o }, topics).errors.length;
    expect(t({ type: 'multi', answer: [0, 1] })).toBe(0);
    expect(t({ type: 'multi', answer: [] })).toBe(1);
    expect(t({ type: 'numeric', answer: { value: 2, tolerance: 0.1 } })).toBe(0);
    expect(t({ type: 'numeric', answer: 2 })).toBe(0);
    expect(t({ type: 'numeric', answer: { value: 'x' } })).toBe(1);
    expect(t({ type: 'text', answer: 'ethanol' })).toBe(0);
    expect(t({ type: 'order', answer: ['a', 'b'] })).toBe(0);
    expect(t({ type: 'order', answer: ['a', 'a'] })).toBe(1);
    expect(t({ type: 'match', answer: [['a', '1'], ['b', '2']] })).toBe(0);
    expect(t({ type: 'match', answer: [['a', '1']] })).toBe(1);
    expect(t({ type: 'essay' })).toBeGreaterThan(0);
  });
});

describe('validateBank', () => {
  it('keeps good rows and reports bad ones', () => {
    const r = validateBank(
      { bankId: 'b', name: 'B', version: 1, questions: [good, { ...good, id: 'q2', topic: 'nope' }, good] },
      topics,
    );
    expect(r.validCount).toBe(1);
    expect(r.invalidCount).toBe(2);
    expect(r.errors.map((e) => e.row)).toEqual([2, 3]);
    expect(r.errors[1].message).toMatch(/Duplicate/);
  });

  it('accepts a bare array of questions', () => {
    const r = validateBank([good], topics);
    expect(r.bank?.questions).toHaveLength(1);
  });

  it('rejects non-banks', () => {
    expect(validateBank('hello', topics).bank).toBeNull();
    expect(validateBank({ name: 'x' }, topics).bank).toBeNull();
  });

  it('shipped sample and template banks are valid', () => {
    for (const b of [sample, template]) {
      const r = validateBank(b, topics);
      expect(r.errors).toEqual([]);
      expect(r.invalidCount).toBe(0);
    }
  });

  it('sample bank covers every question type', () => {
    const types = new Set((sample as { questions: { type: string }[] }).questions.map((q) => q.type));
    expect([...types].sort()).toEqual(['match', 'mcq', 'multi', 'numeric', 'order', 'text']);
  });
});

describe('parseJsonLoose', () => {
  it('handles fenced output with chatter', () => {
    const v = parseJsonLoose('Here you go:\n```json\n{"a": 1}\n```\nEnjoy');
    expect(v).toEqual({ a: 1 });
  });
  it('handles leading text', () => {
    expect(parseJsonLoose('Sure! [1,2]')).toEqual([1, 2]);
  });
});

describe('CSV import', () => {
  const header = 'id,topic,subtopic,type,difficulty,question,options,answer,explanation,tags,tolerance,unit,caseSensitive';
  it('parses every type', () => {
    const csv = [
      header,
      'a,stoichiometry,,mcq,1,Q?,x|y|z,B,because,,,,',
      'b,stoichiometry,,multi,2,Q?,x|y|z,A|C,because,t1|t2,,,',
      'c,stoichiometry,,numeric,2,Q?,,0.25,because,,0.01,mol,',
      'd,organic,,text,1,Q?,,ethanol|ethyl alcohol,because,,,,',
      'e,organic,,order,1,Q?,,a|b|c,because,,,,',
      'f,organic,,match,1,Q?,,Na=sodium|K=potassium,because,,,,',
      'g,Organic chemistry,,text,1,Q?,,CH2O,because,,,,true',
    ].join('\n');
    const r = parseCsvBank(csv, { name: 'CSV' }, topics);
    expect(r.errors).toEqual([]);
    const qs = r.bank!.questions;
    expect(qs).toHaveLength(7);
    expect(qs[0]).toMatchObject({ type: 'mcq', answer: 1 });
    expect(qs[1]).toMatchObject({ type: 'multi', answer: [0, 2], tags: ['t1', 't2'] });
    expect(qs[2]).toMatchObject({ answer: { value: 0.25, tolerance: 0.01, unit: 'mol' } });
    expect(qs[5]).toMatchObject({ answer: [['Na', 'sodium'], ['K', 'potassium']] });
    expect(qs[6]).toMatchObject({ topic: 'organic', caseSensitive: true });
  });

  it('reports bad rows by row number', () => {
    const csv = [header, 'a,stoichiometry,,mcq,1,Q?,x|y,Z,e,,,,', 'b,stoichiometry,,numeric,1,Q?,,abc,e,,,,'].join('\n');
    const r = parseCsvBank(csv, { name: 'CSV' }, topics);
    expect(r.validCount).toBe(0);
    expect(r.errors.map((e) => e.row)).toEqual([1, 2]);
  });

  it('reports missing columns', () => {
    const r = parseCsvBank('id,question\n1,x', { name: 'CSV' }, topics);
    expect(r.bank).toBeNull();
    expect(r.errors[0].message).toMatch(/missing column/);
  });

  it('round-trips through export', () => {
    const r1 = validateBank(sample, topics);
    const csv = questionsToCsv(r1.bank!.questions);
    const r2 = parseCsvBank(csv, { name: 'x' }, topics);
    expect(r2.errors).toEqual([]);
    expect(r2.bank!.questions).toEqual(r1.bank!.questions);
  });
});
