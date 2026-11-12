import { lazy } from 'react';
import type { GameMode } from '../types';
import { useGame } from '@/store/game';
import { dueCards, toDay } from '@/engine/srs/leitner';
import { dictFor } from '@/i18n';

const mode: GameMode = {
  id: 'daily-review',
  name: 'Daily Review',
  tagline: 'Spaced repetition of the questions you got wrong.',
  description: 'Mistakes go into Leitner boxes and come back just before you forget them. Keep a daily streak going.',
  icon: 'calendar',
  colour: '#7c5cc4',
  status: 'ready',
  component: lazy(() => import('./DailyReviewScreen')),
  useBadge: () => {
    const n = useGame((g) => dueCards(g.save.srs, toDay(), new Set(g.pool.map((q) => q.uid))).length);
    const lang = useGame((g) => g.save.settings.language);
    return n ? dictFor(lang).review.due(n) : null;
  },
};

export default mode;
