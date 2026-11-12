/**
 * STUB – "Titration Simulator" is not built yet. It shows as "Coming soon" on the Play menu.
 *
 * To build it: create a TitrationScreen.tsx component in this folder, then set
 *   status: 'ready',
 *   component: lazy(() => import('./TitrationScreen')),
 * See CONTRIBUTING.md → "Adding a game mode".
 */
import type { GameMode } from '../types';

const mode: GameMode = {
  id: 'titration',
  name: 'Titration Simulator',
  tagline: 'Fill the burette and hit the end point.',
  description: 'A virtual titration: rinse, fill, swirl and add titrant drop by drop, then calculate the concentration from your titre.',
  icon: 'drop',
  colour: '#c4486b',
  status: 'coming-soon',
};

export default mode;
