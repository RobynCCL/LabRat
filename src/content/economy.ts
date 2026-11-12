/**
 * ONE place for every number in the game economy.
 * Change values here – nothing else needs editing.
 */
export const economy = {
  currency: { name: 'Moles', symbol: 'mol' },

  /** Moles a brand-new player starts with (enough for a first purchase). */
  startingMoles: 120,

  quiz: {
    /** Moles per correct answer, by difficulty 1/2/3. */
    correct: { 1: 4, 2: 6, 3: 9 } as Record<1 | 2 | 3, number>,
    /** XP per correct answer, by difficulty. */
    xpCorrect: { 1: 8, 2: 12, 3: 16 } as Record<1 | 2 | 3, number>,
    /** XP for trying, even if wrong (keeps effort rewarding). */
    xpAttempt: 2,
    /** Every N answers in a row adds a streak bonus. */
    streakEvery: 5,
    streakBonusMoles: 10,
    streakBonusXp: 15,
    /** Completion bonus by accuracy band (fraction correct ≥ minAccuracy). `label` is a key into the quiz.bands text. */
    completion: [
      { minAccuracy: 1, moles: 40, xp: 60, label: 'perfect' },
      { minAccuracy: 0.8, moles: 20, xp: 30, label: 'great' },
      { minAccuracy: 0.5, moles: 8, xp: 15, label: 'good' },
      { minAccuracy: 0, moles: 0, xp: 5, label: 'keep' },
    ],
    /** 20-question quizzes earn this multiplier on the completion bonus. */
    longQuizMultiplier: 1.5,
  },

  focus: {
    defaultWorkMinutes: 25,
    defaultBreakMinutes: 5,
    minWorkMinutes: 5,
    maxWorkMinutes: 90,
    molesPerMinute: 2,
    xpPerMinute: 3,
    /** Seconds the tab may be hidden before the session is cancelled. */
    leaveGraceSeconds: 20,
  },

  review: {
    molesCorrect: 5,
    xpCorrect: 12,
    xpAttempt: 2,
    /** Bonus for finishing the day's review. */
    completionMoles: 15,
    completionXp: 25,
    /** Extra completion Moles per day of streak (capped). */
    streakMolesPerDay: 3,
    streakMolesCap: 30,
    /** Max cards in one Daily Review session. */
    maxCards: 20,
  },

  /** Moles for the first pat of each pet each day. */
  dailyPatMoles: 5,

  /** Fraction of the price refunded when selling a placed/stored item. */
  sellRefund: 0.5,

  levels: {
    /** XP needed to go from level 1 → 2. */
    base: 100,
    /** Each level needs this much more XP than the previous (multiplicative). */
    growth: 1.22,
    maxLevel: 50,
  },

  /** Moles given on reaching a new level (level × perLevel). */
  levelUpMolesPerLevel: 10,

  rooms: [
    { id: 'starter', name: 'Starter Lab', cols: 10, rows: 7, unlockLevel: 1, price: 0 },
    { id: 'grand', name: 'Grand Laboratory', cols: 14, rows: 9, unlockLevel: 6, price: 600 },
  ],

  /** Topic mastery (share of a topic's questions whose latest answer was correct) counted as "mastered". */
  masteredThreshold: 0.8,
} as const;

export type Economy = typeof economy;
export type RoomDef = (typeof economy.rooms)[number];
