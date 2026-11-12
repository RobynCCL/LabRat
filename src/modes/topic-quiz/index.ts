import { lazy } from 'react';
import type { GameMode } from '../types';

const mode: GameMode = {
  id: 'topic-quiz',
  name: 'Topic Quiz',
  tagline: 'Ten or twenty questions on one topic, or mixed.',
  description: 'Pick a topic (or mix them), answer questions with instant explanations, and earn Moles for accuracy and streaks.',
  icon: 'target',
  colour: '#0f766e',
  status: 'ready',
  component: lazy(() => import('./TopicQuizScreen')),
};

export default mode;
