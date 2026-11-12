import { describe, expect, it } from 'vitest';
import { economy } from '@/content/economy';
import {
  applyXp, focusReward, levelFromXp, quizAnswerReward, quizCompletionReward,
  reviewCompletionReward, sellPrice, xpForLevel,
} from './economy';

describe('levels', () => {
  it('level 1 starts at 0 and thresholds increase', () => {
    expect(xpForLevel(1)).toBe(0);
    expect(xpForLevel(2)).toBe(economy.levels.base);
    for (let l = 2; l < 20; l++) {
      const step = xpForLevel(l + 1) - xpForLevel(l);
      const prev = xpForLevel(l) - xpForLevel(l - 1);
      expect(step).toBeGreaterThanOrEqual(prev);
    }
  });

  it('levelFromXp is consistent with thresholds', () => {
    expect(levelFromXp(0)).toMatchObject({ level: 1, into: 0, progress: 0 });
    expect(levelFromXp(economy.levels.base - 1).level).toBe(1);
    expect(levelFromXp(economy.levels.base).level).toBe(2);
    const info = levelFromXp(xpForLevel(5) + 10);
    expect(info.level).toBe(5);
    expect(info.into).toBe(10);
  });

  it('caps at max level', () => {
    expect(levelFromXp(1e12).level).toBe(economy.levels.maxLevel);
  });

  it('applyXp reports level ups', () => {
    expect(applyXp(90, 20)).toEqual({ xp: 110, from: 1, to: 2 });
    expect(applyXp(0, -50).xp).toBe(0);
  });
});

describe('rewards', () => {
  it('quiz answers scale with difficulty and streaks', () => {
    expect(quizAnswerReward(1, false, 0).moles).toBe(0);
    expect(quizAnswerReward(1, false, 0).xp).toBe(economy.quiz.xpAttempt);
    expect(quizAnswerReward(3, true, 1).moles).toBeGreaterThan(quizAnswerReward(1, true, 1).moles);
    const s = quizAnswerReward(1, true, economy.quiz.streakEvery);
    expect(s.streakBonus).toBe(true);
    expect(s.moles).toBe(economy.quiz.correct[1] + economy.quiz.streakBonusMoles);
  });

  it('completion bonus uses accuracy bands and long-quiz multiplier', () => {
    expect(quizCompletionReward(10, 10).label).toBe('Perfect run!');
    expect(quizCompletionReward(8, 10).moles).toBe(20);
    expect(quizCompletionReward(0, 10).moles).toBe(0);
    expect(quizCompletionReward(20, 20).moles).toBe(Math.round(40 * economy.quiz.longQuizMultiplier));
    expect(quizCompletionReward(0, 0).accuracy).toBe(0);
  });

  it('focus reward requires minimum time and is capped', () => {
    expect(focusReward(economy.focus.minWorkMinutes - 1).moles).toBe(0);
    expect(focusReward(25).moles).toBe(25 * economy.focus.molesPerMinute);
    expect(focusReward(1000).moles).toBe(economy.focus.maxWorkMinutes * economy.focus.molesPerMinute);
  });

  it('review completion grows with streak up to a cap', () => {
    expect(reviewCompletionReward(1).moles).toBe(economy.review.completionMoles);
    expect(reviewCompletionReward(3).moles).toBe(economy.review.completionMoles + 2 * economy.review.streakMolesPerDay);
    expect(reviewCompletionReward(999).moles).toBe(economy.review.completionMoles + economy.review.streakMolesCap);
  });

  it('sell refund', () => {
    expect(sellPrice(101)).toBe(50);
  });
});
