/**
 * STUB – "Periodic Table Challenge" is not built yet. It shows as "Coming soon" on the Play menu.
 *
 * To build it: create a PeriodicTableScreen.tsx component in this folder, then set
 *   status: 'ready',
 *   component: lazy(() => import('./PeriodicTableScreen')),
 * See CONTRIBUTING.md → "Adding a game mode".
 */
import type { GameMode } from '../types';

const mode: GameMode = {
  id: 'periodic-table',
  name: 'Periodic Table Challenge',
  tagline: 'Find elements, trends and groups fast.',
  description: 'An interactive periodic table: locate elements, compare trends in atomic radius, electronegativity and ionisation energy.',
  icon: 'grid',
  colour: '#3b82c4',
  status: 'coming-soon',
};

export default mode;
