import { useGame } from '@/store/game';
import { LANGS, type Lang } from '@/i18n';
import { useI18n } from '@/i18n/useI18n';
import { play } from '@/lib/sound';

/** Compact English / Gaeilge switch. */
export function LanguageToggle({ className = '' }: { className?: string }) {
  const { lang, t } = useI18n();
  const set = (l: Lang) => {
    if (l === lang) return;
    play('click');
    useGame.getState().updateSettings({ language: l });
    document.documentElement.lang = l === 'ga' ? 'ga' : 'en-IE';
  };
  return (
    <div role="radiogroup" aria-label={t.common.language} className={`inline-flex rounded-full border border-border bg-surface p-0.5 shadow-soft ${className}`}>
      {LANGS.map((l) => (
        <button
          key={l}
          role="radio"
          aria-checked={lang === l}
          lang={l}
          onClick={() => set(l)}
          className={`rounded-full px-3 py-1 text-sm font-bold transition ${lang === l ? 'bg-primary text-primary-ink' : 'text-muted hover:text-ink'}`}
        >
          {t.common.languageNames[l]}
        </button>
      ))}
    </div>
  );
}
