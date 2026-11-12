/**
 * STUB – "Equation Balancer" is not built yet. It shows as "Coming soon" on the Play menu.
 *
 * To build it: create a EquationBalancerScreen.tsx component in this folder, then set
 *   status: 'ready',
 *   component: lazy(() => import('./EquationBalancerScreen')),
 * See CONTRIBUTING.md → "Adding a game mode".
 */
import type { GameMode } from '../types';

const mode: GameMode = {
  id: 'equation-balancer',
  name: 'Equation Balancer',
  tagline: 'Balance equations against the clock.',
  description: 'Adjust coefficients to balance chemical and ionic equations, from simple combustion to redox half-equations.',
  icon: 'scale',
  colour: '#d4882a',
  status: 'coming-soon',
};

export default mode;
