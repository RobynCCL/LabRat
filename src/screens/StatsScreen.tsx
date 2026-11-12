import { useMemo } from 'react';
import { useGame, useLevel } from '@/store/game';
import { topics } from '@/content/topics';
import { achievements } from '@/content/achievements';
import { addDays, toDay } from '@/engine/srs/leitner';
import { computeStats, topicSummaries, weakestTopics } from '@/engine/progress/stats';
import { Card, EmptyState, Icon, Moles, PageHeader, ProgressBar, TopicBadge } from '@/components/ui';
import { Link } from 'react-router-dom';

const pct = (v: number | null) => (v === null ? '–' : `${Math.round(v * 100)}%`);

export default function StatsScreen() {
  const save = useGame((g) => g.save);
  const index = useGame((g) => g.index);
  const lvl = useLevel();
  const summaries = useMemo(() => topicSummaries(save, index, topics.map((t) => t.id)), [save, index]);
  const weakest = weakestTopics(summaries);
  const stats = computeStats(save, index);
  const accuracy = save.stats.answered ? save.stats.correct / save.stats.answered : null;
  const totalMinutes = summaries.reduce((n, s) => n + s.studyMinutes, 0);
  const days = Array.from({ length: 14 }, (_, i) => addDays(toDay(), i - 13));
  const maxDay = Math.max(1, ...days.map((d) => save.stats.daily[d]?.answered ?? 0));
  const maxMin = Math.max(1, ...summaries.map((s) => s.studyMinutes));

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Stats" icon="chart" subtitle="How you're doing, and where to focus next." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          { label: 'Questions answered', value: save.stats.answered.toLocaleString('en-IE') },
          { label: 'Overall accuracy', value: pct(accuracy) },
          { label: 'Best streak', value: save.stats.bestStreak },
          { label: 'Focus time', value: `${Math.floor(save.stats.focusMinutes / 60)}h ${save.stats.focusMinutes % 60}m` },
          { label: 'Level', value: lvl.level },
        ].map((k) => (
          <Card key={k.label} className="p-4">
            <div className="font-display text-3xl font-semibold num">{k.value}</div>
            <div className="text-xs font-bold uppercase tracking-wide text-muted">{k.label}</div>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-4 font-semibold">Accuracy by topic</h2>
          <div className="grid gap-3">
            {summaries.map((s) => {
              const t = topics.find((x) => x.id === s.topic)!;
              return (
                <div key={s.topic} className="grid grid-cols-[2rem_1fr_auto] items-center gap-3">
                  <TopicBadge topic={s.topic} size={30} />
                  <div className="min-w-0">
                    <div className="flex justify-between gap-2 text-sm">
                      <span className="truncate font-semibold">{t.name}</span>
                      <span className="shrink-0 text-muted num">
                        {s.correct}/{s.answered}
                      </span>
                    </div>
                    <ProgressBar value={s.accuracy ?? 0} colour={t.colour} className="mt-1" height="h-2.5" label={`${t.name} accuracy`} />
                    <div className="mt-0.5 text-xs text-muted">
                      Mastery {Math.round(s.mastery * 100)}% of {s.questionCount} question{s.questionCount === 1 ? '' : 's'}
                    </div>
                  </div>
                  <span className="w-12 text-right font-display text-lg font-semibold num">{pct(s.accuracy)}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="grid content-start gap-4">
          <Card className="p-5">
            <h2 className="mb-3 font-semibold">Weakest topics</h2>
            {weakest.length ? (
              <ol className="grid gap-2">
                {weakest.map((s, i) => (
                  <li key={s.topic} className="flex items-center gap-2">
                    <span className="w-5 font-bold text-muted">{i + 1}.</span>
                    <TopicBadge topic={s.topic} size={26} />
                    <span className="flex-1 truncate text-sm font-semibold">{topics.find((t) => t.id === s.topic)?.short}</span>
                    <span className="font-bold text-bad num">{pct(s.accuracy)}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted">Answer at least 3 questions in a topic to see it ranked here.</p>
            )}
            {weakest.length > 0 && (
              <Link to="/play/topic-quiz" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Practise these <Icon name="chevron-right" size={14} />
              </Link>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 font-semibold">Last 14 days</h2>
            <div className="flex h-28 items-end gap-1" role="img" aria-label="Questions answered per day for the last 14 days">
              {days.map((d) => {
                const e = save.stats.daily[d];
                const h = ((e?.answered ?? 0) / maxDay) * 100;
                return (
                  <div key={d} className="flex flex-1 flex-col items-center gap-1" title={`${d}: ${e?.answered ?? 0} answered, ${e?.minutes ?? 0} min`}>
                    <div className="w-full rounded-t-md bg-primary/80" style={{ height: `${Math.max(h, e?.answered ? 6 : 2)}%`, opacity: e?.answered ? 1 : 0.25 }} />
                  </div>
                );
              })}
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-muted">
              <span>{days[0].slice(5)}</span>
              <span>Today</span>
            </div>
          </Card>
        </div>

        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-1 font-semibold">Study time by topic</h2>
          <p className="mb-4 text-sm text-muted">From Focus Timer sessions · {totalMinutes} min total</p>
          {totalMinutes === 0 ? (
            <EmptyState icon="timer" title="No study time logged yet">
              Complete a Focus Timer session with a topic selected.
            </EmptyState>
          ) : (
            <div className="grid gap-2">
              {summaries
                .filter((s) => s.studyMinutes > 0)
                .sort((a, b) => b.studyMinutes - a.studyMinutes)
                .map((s) => {
                  const t = topics.find((x) => x.id === s.topic)!;
                  return (
                    <div key={s.topic} className="grid grid-cols-[8rem_1fr_4rem] items-center gap-3 text-sm sm:grid-cols-[12rem_1fr_4rem]">
                      <span className="truncate font-semibold">{t.short}</span>
                      <ProgressBar value={s.studyMinutes / maxMin} colour={t.colour} label={`${t.short} study time`} />
                      <span className="text-right num">{s.studyMinutes} min</span>
                    </div>
                  );
                })}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 font-semibold">
            Achievements <span className="text-muted">{Object.keys(save.achievements).length}/{achievements.length}</span>
          </h2>
          <ul className="grid gap-2">
            {achievements.map((a) => {
              const got = !!save.achievements[a.id];
              const prog = Math.min(1, stats[a.stat] / a.gte);
              return (
                <li key={a.id} className={`flex items-center gap-3 rounded-xl p-2 ${got ? 'bg-legendary/10' : ''}`}>
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${got ? 'bg-legendary text-white' : 'bg-surface-2 text-muted'}`}>
                    <Icon name={got ? a.icon : 'lock'} size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{a.name}</div>
                    <div className="text-xs text-muted">{a.description}</div>
                    {!got && <ProgressBar value={prog} height="h-1" className="mt-1" label={`${a.name} progress`} />}
                  </div>
                  <span className="text-xs">
                    <Moles amount={a.reward} size={14} />
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}
