import { economy as defaultEconomy } from '@/content/economy';

type Eco = typeof defaultEconomy;
export interface Reward {
  moles: number;
  xp: number;
}

/** Total XP needed to *reach* `level` (level 1 = 0). */
export function xpForLevel(level: number, eco: Eco = defaultEconomy): number {
  let total = 0;
  for (let l = 1; l < level; l++) total += Math.round(eco.levels.base * Math.pow(eco.levels.growth, l - 1));
  return total;
}

export interface LevelInfo {
  level: number;
  /** XP earned inside the current level. */
  into: number;
  /** XP needed to finish the current level. */
  needed: number;
  progress: number;
}

export function levelFromXp(xp: number, eco: Eco = defaultEconomy): LevelInfo {
  let level = 1;
  while (level < eco.levels.maxLevel && xp >= xpForLevel(level + 1, eco)) level++;
  const start = xpForLevel(level, eco);
  const end = xpForLevel(level + 1, eco);
  const needed = Math.max(1, end - start);
  const into = Math.max(0, xp - start);
  return { level, into, needed, progress: level >= eco.levels.maxLevel ? 1 : Math.min(1, into / needed) };
}

export function quizAnswerReward(
  difficulty: 1 | 2 | 3,
  correct: boolean,
  streakAfter: number,
  eco: Eco = defaultEconomy,
): Reward & { streakBonus: boolean } {
  if (!correct) return { moles: 0, xp: eco.quiz.xpAttempt, streakBonus: false };
  let moles = eco.quiz.correct[difficulty];
  let xp = eco.quiz.xpCorrect[difficulty];
  const streakBonus = streakAfter > 0 && streakAfter % eco.quiz.streakEvery === 0;
  if (streakBonus) {
    moles += eco.quiz.streakBonusMoles;
    xp += eco.quiz.streakBonusXp;
  }
  return { moles, xp, streakBonus };
}

export function quizCompletionReward(
  correct: number,
  total: number,
  eco: Eco = defaultEconomy,
): Reward & { label: string; accuracy: number } {
  const accuracy = total ? correct / total : 0;
  const band = eco.quiz.completion.find((b) => accuracy >= b.minAccuracy) ?? eco.quiz.completion[eco.quiz.completion.length - 1];
  const mult = total >= 20 ? eco.quiz.longQuizMultiplier : 1;
  return { moles: Math.round(band.moles * mult), xp: Math.round(band.xp * mult), label: band.label, accuracy };
}

export function focusReward(workMinutes: number, eco: Eco = defaultEconomy): Reward {
  const m = Math.max(0, Math.min(workMinutes, eco.focus.maxWorkMinutes));
  if (m < eco.focus.minWorkMinutes) return { moles: 0, xp: 0 };
  return { moles: Math.round(m * eco.focus.molesPerMinute), xp: Math.round(m * eco.focus.xpPerMinute) };
}

export function reviewAnswerReward(correct: boolean, eco: Eco = defaultEconomy): Reward {
  return correct ? { moles: eco.review.molesCorrect, xp: eco.review.xpCorrect } : { moles: 0, xp: eco.review.xpAttempt };
}

export function reviewCompletionReward(streak: number, eco: Eco = defaultEconomy): Reward {
  const bonus = Math.min(eco.review.streakMolesCap, Math.max(0, streak - 1) * eco.review.streakMolesPerDay);
  return { moles: eco.review.completionMoles + bonus, xp: eco.review.completionXp };
}

export function sellPrice(price: number, eco: Eco = defaultEconomy): number {
  return Math.floor(price * eco.sellRefund);
}

export function levelUpReward(level: number, eco: Eco = defaultEconomy): number {
  return level * eco.levelUpMolesPerLevel;
}

/** Apply XP gain and report any level-ups. */
export function applyXp(xp: number, gain: number, eco: Eco = defaultEconomy): { xp: number; from: number; to: number } {
  const from = levelFromXp(xp, eco).level;
  const next = xp + Math.max(0, gain);
  return { xp: next, from, to: levelFromXp(next, eco).level };
}

export function canAfford(moles: number, price: number): boolean {
  return moles >= price;
}
