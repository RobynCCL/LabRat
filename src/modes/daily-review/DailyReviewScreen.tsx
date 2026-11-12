import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '@/store/game';
import { economy } from '@/content/economy';
import { BOX_COUNT, DEFAULT_INTERVALS, boxCounts, currentStreak, dueCards, toDay } from '@/engine/srs/leitner';
import { reviewAnswerReward, reviewCompletionReward } from '@/engine/economy/economy';
import type { PoolQuestion } from '@/engine/questions/types';
import { QuestionView } from '@/components/question/QuestionView';
import { Button, Card, Icon, Moles, ProgressBar } from '@/components/ui';
import { ModeShell } from '../shared/ModeShell';
import mode from './index';
import { useI18n } from '@/i18n/useI18n';

export default function DailyReviewScreen() {
  const save = useGame((g) => g.save);
  const pool = useGame((g) => g.pool);
  const { recordAnswer, reviewAnswer, grant, completeReview } = useGame.getState();
  const { t } = useI18n();
  const today = toDay();

  const byUid = useMemo(() => new Map(pool.map((q) => [q.uid, q])), [pool]);
  const due = useMemo(() => dueCards(save.srs, today, new Set(byUid.keys())), [save.srs, today, byUid]);
  const counts = boxCounts(save.srs);
  const streak = currentStreak(save.srs, today);
  const doneToday = save.srs.streak.lastDate === today;

  const [session, setSession] = useState<PoolQuestion[] | null>(null);
  const [i, setI] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [earned, setEarned] = useState(0);
  const [finished, setFinished] = useState(false);

  const start = () => {
    setSession(due.slice(0, economy.review.maxCards).map((u) => byUid.get(u)!));
    setI(0);
    setResults([]);
    setEarned(0);
    setFinished(false);
  };

  const next = () => {
    if (!session) return;
    if (i + 1 < session.length) setI(i + 1);
    else {
      const newStreak = doneToday ? streak : streak + 1;
      completeReview();
      const r = reviewCompletionReward(newStreak);
      grant(r, t.feedback.reviewDone(newStreak));
      setEarned((e) => e + r.moles);
      setFinished(true);
    }
  };

  return (
    <ModeShell
      modeId={mode.id}
      title={mode.name}
      icon={mode.icon}
      colour={mode.colour}
      right={
        <span className={`chip ${streak ? 'bg-accent/15 text-accent' : ''}`}>
          <Icon name="flame" size={14} /> {t.review.streakChip(streak)}
        </span>
      }
    >
      <AnimatePresence mode="wait">
        {!session && (
          <motion.div key="intro" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid gap-5">
            <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
              <div>
                <p className="font-display text-3xl font-semibold num">{due.length ? t.review.due(due.length) : t.review.caughtUp}</p>
                <p className="text-muted">
                  {due.length
                    ? t.review.sessionInfo(Math.min(due.length, economy.review.maxCards))
                    : Object.keys(save.srs.cards).length
                      ? t.review.nothingToday
                      : t.review.empty}
                </p>
              </div>
              {due.length ? (
                <Button size="lg" icon="play" onClick={start}>
                  {t.review.start}
                </Button>
              ) : (
                <Link to="/play/topic-quiz">
                  <Button size="lg" variant="secondary" icon="target">
                    {t.review.takeQuiz}
                  </Button>
                </Link>
              )}
            </Card>

            <section>
              <h2 className="mb-2 text-lg font-semibold">{t.review.boxes}</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {Array.from({ length: BOX_COUNT }, (_, b) => (
                  <div key={b} className="card relative overflow-hidden p-4">
                    <div className="text-xs font-bold uppercase tracking-wide text-muted">{t.review.box(b + 1)}</div>
                    <div className="font-display text-3xl font-semibold num">{counts[b]}</div>
                    <div className="text-xs text-muted">{t.review.every(DEFAULT_INTERVALS[b + 1])}</div>
                    <div className="absolute bottom-0 left-0 h-1.5 bg-epic/70" style={{ width: `${((b + 1) / BOX_COUNT) * 100}%` }} />
                  </div>
                ))}
              </div>
              <p className="mt-2 text-sm text-muted">
                {t.review.graduated} <span className="font-semibold text-ink num">{save.srs.graduated}</span> · {t.review.best}{' '}
                <span className="font-semibold text-ink num">{save.srs.streak.best}</span> {t.review.days}
              </p>
            </section>
          </motion.div>
        )}

        {session && !finished && session[i] && (
          <motion.div key={'r' + i} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.18 }}>
            <ProgressBar value={i / session.length} className="mx-auto mb-4 max-w-3xl" colour="rgb(var(--r-epic))" label={t.review.progress} />
            <QuestionView
              question={session[i]}
              meta={t.review.meta(save.srs.cards[session[i].uid]?.box ?? 1, i + 1, session.length)}
              onAnswered={({ result }) => {
                const q = session[i];
                recordAnswer(q, result.correct, { source: 'review' });
                reviewAnswer(q.uid, result.correct);
                const r = reviewAnswerReward(result.correct);
                grant(r);
                setEarned((e) => e + r.moles);
                setResults((x) => [...x, result.correct]);
              }}
              onNext={next}
              nextLabel={i + 1 < session.length ? t.review.nextCard : t.review.finish}
            />
          </motion.div>
        )}

        {finished && session && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="mx-auto max-w-xl p-8 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent/15 text-accent">
                <Icon name="flame" size={34} />
              </div>
              <h2 className="mt-3 text-3xl font-semibold">{t.review.complete}</h2>
              <p className="text-muted">{t.review.remembered(results.filter(Boolean).length, results.length, currentStreak(useGame.getState().save.srs, today))}</p>
              <div className="mt-4 flex justify-center">
                <Moles amount={earned} size={26} className="text-2xl" />
              </div>
              <div className="mt-6 flex justify-center gap-2">
                <Link to="/play">
                  <Button variant="secondary">{t.play.backToModes}</Button>
                </Link>
                {dueCards(useGame.getState().save.srs, today, new Set(byUid.keys())).length > 0 && (
                  <Button icon="refresh" onClick={start}>
                    {t.review.reviewMore}
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </ModeShell>
  );
}
