/**
 * THE MODE REGISTRY – the single list of game modes.
 * To add a mode: create src/modes/<your-mode>/index.ts exporting a GameMode,
 * then add it to this array. Order here = order on the Play menu.
 */
import type { GameMode } from './types';
import topicQuiz from './topic-quiz';
import focusTimer from './focus-timer';
import dailyReview from './daily-review';
import experimentLab from './experiment-lab';
import equationBalancer from './equation-balancer';
import periodicTable from './periodic-table';
import titration from './titration';
import mockExam from './mock-exam';

export const modes: GameMode[] = [
  topicQuiz,
  dailyReview,
  focusTimer,
  // ── Coming soon (stubs) ──
  experimentLab,
  equationBalancer,
  periodicTable,
  titration,
  mockExam,
];

export const getMode = (id: string) => modes.find((m) => m.id === id);
