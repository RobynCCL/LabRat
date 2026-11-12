import { topics } from '@/content/topics';
import { useGame } from '@/store/game';
import { topicMastery } from '@/engine/progress/stats';
import { Icon, ProgressBar, TopicBadge } from '@/components/ui';
import { useI18n } from '@/i18n/useI18n';

/** Grid of topics with question counts and mastery. `mixed` adds an "All topics" tile. */
export function TopicPicker({ value, onChange, mixed = true, requireQuestions = true }: { value: string; onChange: (t: string) => void; mixed?: boolean; requireQuestions?: boolean }) {
  const index = useGame((g) => g.index);
  const save = useGame((g) => g.save);
  const { t: tr, c } = useI18n();
  const total = Object.values(index).reduce((n, l) => n + l.length, 0);
  const tiles = [
    ...(mixed ? [{ id: 'mixed', name: tr.topicPicker.mixed, count: total, mastery: null as number | null }] : []),
    ...topics.map((t) => ({ id: t.id, name: c.topicName(t), count: index[t.id]?.length ?? 0, mastery: topicMastery(save, index[t.id] ?? []) })),
  ];
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" role="radiogroup" aria-label={tr.topicPicker.topic}>
      {tiles.map((t) => {
        const disabled = requireQuestions && t.count === 0;
        const active = value === t.id;
        return (
          <button
            key={t.id}
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(t.id)}
            className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-45 ${active ? 'border-primary bg-primary/5 ring-2 ring-primary/25' : 'border-border bg-surface hover:border-primary/50'}`}
          >
            <TopicBadge topic={t.id} size={38} />
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold">{t.name}</div>
              <div className="text-xs text-muted">{t.count ? tr.common.questions(t.count) : tr.topicPicker.noQuestions}</div>
              {t.mastery !== null && t.count > 0 && <ProgressBar value={t.mastery} height="h-1.5" className="mt-1.5" label={tr.topicPicker.mastery(t.name)} />}
            </div>
            {active && <Icon name="check" className="text-primary" />}
          </button>
        );
      })}
    </div>
  );
}
