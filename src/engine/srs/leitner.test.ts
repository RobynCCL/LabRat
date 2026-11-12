import { describe, expect, it } from 'vitest';
import { addDays, addMistake, boxCounts, completeReviewDay, currentStreak, daysBetween, dueCards, emptySrs, reviewCard } from './leitner';

const D = '2026-03-10';

describe('dates', () => {
  it('adds days across month ends', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-03-28', 7)).toBe('2026-04-04'); // across DST change
    expect(daysBetween('2026-02-27', '2026-03-01')).toBe(2);
  });
});

describe('Leitner boxes', () => {
  it('mistakes go to box 1 due tomorrow', () => {
    const s = addMistake(emptySrs(), 'q1', D);
    expect(s.cards.q1).toEqual({ box: 1, due: '2026-03-11', lapses: 1 });
    expect(dueCards(s, D)).toEqual([]);
    expect(dueCards(s, '2026-03-11')).toEqual(['q1']);
  });

  it('correct answers climb boxes with growing intervals, then graduate', () => {
    let s = addMistake(emptySrs(), 'q1', D, true);
    let day = D;
    const seen: number[] = [];
    for (let i = 0; i < 5; i++) {
      s = reviewCard(s, 'q1', true, day);
      if (!s.cards.q1) break;
      seen.push(s.cards.q1.box);
      day = s.cards.q1.due;
    }
    expect(seen).toEqual([2, 3, 4, 5]);
    expect(s.cards.q1).toBeUndefined();
    expect(s.graduated).toBe(1);
  });

  it('wrong answer resets to box 1', () => {
    let s = addMistake(emptySrs(), 'q1', D, true);
    s = reviewCard(s, 'q1', true, D);
    s = reviewCard(s, 'q1', true, D);
    expect(s.cards.q1.box).toBe(3);
    s = reviewCard(s, 'q1', false, D);
    expect(s.cards.q1).toMatchObject({ box: 1, due: '2026-03-11', lapses: 2 });
  });

  it('due list is sorted by box and filtered to known questions', () => {
    let s = addMistake(emptySrs(), 'a', D, true);
    s = addMistake(s, 'b', D, true);
    s = reviewCard(s, 'a', true, '2026-03-01'); // box 2, due 03-03
    expect(dueCards(s, D)).toEqual(['b', 'a']);
    expect(dueCards(s, D, new Set(['a']))).toEqual(['a']);
    expect(boxCounts(s)).toEqual([1, 1, 0, 0, 0]);
  });

  it('reviewing an unknown card is a no-op', () => {
    const s = emptySrs();
    expect(reviewCard(s, 'x', true, D)).toBe(s);
  });
});

describe('daily streak', () => {
  it('counts consecutive days and resets after a gap', () => {
    let s = emptySrs();
    s = completeReviewDay(s, '2026-03-10');
    s = completeReviewDay(s, '2026-03-10'); // same day: no change
    s = completeReviewDay(s, '2026-03-11');
    expect(s.streak.count).toBe(2);
    expect(currentStreak(s, '2026-03-12')).toBe(2);
    expect(currentStreak(s, '2026-03-13')).toBe(0);
    s = completeReviewDay(s, '2026-03-14');
    expect(s.streak).toEqual({ count: 1, lastDate: '2026-03-14', best: 2 });
  });
});
