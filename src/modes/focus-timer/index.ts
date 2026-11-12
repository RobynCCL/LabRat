import { lazy } from 'react';
import type { GameMode } from '../types';

const mode: GameMode = {
  id: 'focus-timer',
  name: 'Focus Timer',
  tagline: 'Pomodoro study sessions that pay out in Moles.',
  description: 'Pick a topic and study with your notes for a set time. Finish the session to earn Moles. Leave the tab for too long and the reaction is quenched!',
  icon: 'timer',
  colour: '#d1603d',
  status: 'ready',
  component: lazy(() => import('./FocusTimerScreen')),
};

export default mode;
