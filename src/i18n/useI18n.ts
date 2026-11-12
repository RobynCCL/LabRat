import { useMemo } from 'react';
import { useGame } from '@/store/game';
import { contentFor, dictFor, type Lang } from './index';

/** Current language, interface text (t) and content helpers (c). */
export function useI18n() {
  const lang = useGame((g) => g.save.settings.language) as Lang;
  return useMemo(() => ({ lang, t: dictFor(lang), c: contentFor(lang) }), [lang]);
}
