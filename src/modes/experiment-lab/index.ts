/**
 * STUB – "Experiment Lab" is not built yet. It shows as "Coming soon" on the Play menu.
 *
 * To build it: create a ExperimentLabScreen.tsx component in this folder, then set
 *   status: 'ready',
 *   component: lazy(() => import('./ExperimentLabScreen')),
 * See CONTRIBUTING.md → "Adding a game mode".
 */
import type { GameMode } from '../types';

const mode: GameMode = {
  id: 'experiment-lab',
  name: 'Experiment Lab',
  tagline: 'Run the mandatory experiments step by step.',
  description: 'Walk through each mandatory experiment: set up the apparatus, follow the method, record observations and answer exam-style questions.',
  icon: 'flask',
  colour: '#4c9a3a',
  status: 'coming-soon',
};

export default mode;
