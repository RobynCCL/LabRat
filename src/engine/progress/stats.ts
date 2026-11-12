import type { SaveData } from '@/store/saveTypes';
import { levelFromXp } from '@/engine/economy/economy';
import { economy } from '@/content/economy';

/** Numbers achievements can watch. Add a key here + compute it below to unlock new achievement types. */
export type StatKey =
  | 'answered'
  | 'correct'
  | 'bestStreak'
  | 'quizzesCompleted'
  | 'perfectQuizzes'
  | 'focusSessions'
  | 'focusMinutes'
  | 'reviewsCompleted'
  | 'reviewStreakBest'
  | 'itemsBought'
  | 'molesEarned'
  | 'level'
  | 'topicsMastered'
  | 'petsAdopted'
  | 'petPats';

/** uid lists per topic, from the enabled question pool. */
export type TopicIndex = Record<string, string[]>;

export function topicMastery(save: Pick<SaveData, 'history'>, uids: string[]): number {
  if (!uids.length) return 0;
  let ok = 0;
  for (const u of uids) if (save.history[u]?.last) ok++;
  return ok / uids.length;
}

export function computeStats(save: SaveData, index: TopicIndex): Record<StatKey, number> {
  const mastered = Object.values(index).filter((uids) => uids.length >= 3 && topicMastery(save, uids) >= economy.masteredThreshold).length;
  return {
    answered: save.stats.answered,
    correct: save.stats.correct,
    bestStreak: save.stats.bestStreak,
    quizzesCompleted: save.stats.quizzesCompleted,
    perfectQuizzes: save.stats.perfectQuizzes,
    focusSessions: save.stats.focusSessions,
    focusMinutes: save.stats.focusMinutes,
    reviewsCompleted: save.stats.reviewsCompleted,
    reviewStreakBest: save.srs.streak.best,
    itemsBought: save.stats.itemsBought,
    molesEarned: save.profile.molesEarned,
    level: levelFromXp(save.profile.xp).level,
    topicsMastered: mastered,
    petsAdopted: save.inventory.filter((i) => i.name !== undefined && i.adoptedAt !== undefined).length,
    petPats: save.inventory.reduce((n, i) => n + (i.pats ?? 0), 0),
  };
}

export interface TopicSummary {
  topic: string;
  answered: number;
  correct: number;
  accuracy: number | null;
  mastery: number;
  studyMinutes: number;
  questionCount: number;
}

export function topicSummaries(save: SaveData, index: TopicIndex, topicIds: string[]): TopicSummary[] {
  return topicIds.map((t) => {
    const s = save.stats.topics[t] ?? { answered: 0, correct: 0, studyMinutes: 0 };
    return {
      topic: t,
      answered: s.answered,
      correct: s.correct,
      accuracy: s.answered ? s.correct / s.answered : null,
      mastery: topicMastery(save, index[t] ?? []),
      studyMinutes: s.studyMinutes,
      questionCount: (index[t] ?? []).length,
    };
  });
}

/** Weakest topics: lowest accuracy among topics with at least `min` answers. */
export function weakestTopics(summaries: TopicSummary[], min = 3, n = 3): TopicSummary[] {
  return summaries
    .filter((s) => s.answered >= min && s.accuracy !== null)
    .sort((a, b) => a.accuracy! - b.accuracy! || b.answered - a.answered)
    .slice(0, n);
}
