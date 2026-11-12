/**
 * Achievements are pure data. Each one watches a single stat and unlocks when
 * that stat reaches `gte`. Available stats are listed in StatKey
 * (computed in src/engine/progress/stats.ts – add a new stat there if needed).
 */
import type { StatKey } from '@/engine/progress/stats';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  stat: StatKey;
  gte: number;
  /** Moles awarded on unlock. */
  reward: number;
  /** Icon name from src/components/ui/Icon.tsx */
  icon: string;
}

export const achievements: Achievement[] = [
  { id: 'first-correct', name: 'First Reaction', description: 'Answer your first question correctly.', stat: 'correct', gte: 1, reward: 20, icon: 'spark' },
  { id: 'quiz-5', name: 'Quiz Whiz', description: 'Complete 5 topic quizzes.', stat: 'quizzesCompleted', gte: 5, reward: 60, icon: 'flask' },
  { id: 'perfect', name: 'Perfect Yield', description: 'Finish a quiz with 100% accuracy.', stat: 'perfectQuizzes', gte: 1, reward: 50, icon: 'star' },
  { id: 'streak-10', name: 'Chain Reaction', description: 'Get 10 answers right in a row.', stat: 'bestStreak', gte: 10, reward: 60, icon: 'flame' },
  { id: 'focus-1', name: 'In the Zone', description: 'Complete a Focus Timer session.', stat: 'focusSessions', gte: 1, reward: 30, icon: 'timer' },
  { id: 'focus-300', name: 'Deep Study', description: 'Log 5 hours of focused study.', stat: 'focusMinutes', gte: 300, reward: 150, icon: 'book' },
  { id: 'review-3', name: 'Habit Forming', description: 'Reach a 3-day Daily Review streak.', stat: 'reviewStreakBest', gte: 3, reward: 50, icon: 'calendar' },
  { id: 'centurion', name: 'Centurion', description: 'Answer 100 questions correctly.', stat: 'correct', gte: 100, reward: 120, icon: 'trophy' },
  { id: 'collector', name: 'Collector', description: 'Buy 10 items from the shop.', stat: 'itemsBought', gte: 10, reward: 80, icon: 'bag' },
  { id: 'level-5', name: 'Rising Chemist', description: 'Reach level 5.', stat: 'level', gte: 5, reward: 100, icon: 'badge' },
  { id: 'mastery-1', name: 'Topic Master', description: 'Master a topic (80% of its questions correct).', stat: 'topicsMastered', gte: 1, reward: 100, icon: 'crown' },
];
