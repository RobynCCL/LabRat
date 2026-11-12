/**
 * STUB – "Mock Exam" is not built yet. It shows as "Coming soon" on the Play menu.
 *
 * To build it: create a MockExamScreen.tsx component in this folder, then set
 *   status: 'ready',
 *   component: lazy(() => import('./MockExamScreen')),
 * See CONTRIBUTING.md → "Adding a game mode".
 */
import type { GameMode } from '../types';

const mode: GameMode = {
  id: 'mock-exam',
  name: 'Mock Exam',
  tagline: 'Timed, exam-style paper with marking.',
  description: 'A timed mixed paper modelled on the Leaving Cert layout, with a mark breakdown by topic at the end.',
  icon: 'exam',
  colour: '#5a6fd6',
  status: 'coming-soon',
};

export default mode;
