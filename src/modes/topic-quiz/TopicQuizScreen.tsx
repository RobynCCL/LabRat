import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '@/store/game';
import { topicById } from '@/content/topics';
import { economy } from '@/content/economy';
import { quizAnswerReward, quizCompletionReward } from '@/engine/economy/economy';
import type { PoolQuestion } from '@/engine/questions/types';
import { shuffle } from '@/lib/questionPool';
import { QuestionView } from '@/components/question/QuestionView';
import { Button, Card, ChemText, EmptyState, Icon, Moles, ProgressBar, Segmented } from '@/components/ui';
import { ModeShell } from '../shared/ModeShell';
import { TopicPicker } from '../shared/TopicPicker';
import mode from './index';

type Phase = 'setup' | 'play' | 'done';
type Diff = 'any' | '1' | '2' | '3';
interface Answer {
  q: PoolQuestion;
  correct: boolean;
}

/** Prefer questions not yet answered correctly, then shuffle within groups. */
function pickQuestions(pool: PoolQuestion[], history: Record<string, { last: boolean }>, n: number): PoolQuestion[] {
  const fresh = shuffle(pool.filter((q) => !history[q.uid]?.last));
  const known = shuffle(pool.filter((q) => history[q.uid]?.last));
  return [...fresh, ...known].slice(0, n);
}

export default function TopicQuizScreen() {
  const pool = useGame((g) => g.pool);
  const save = useGame((g) => g.save);
  const { recordAnswer, grant, completeQuiz, updateSettings } = useGame.getState();

  const [phase, setPhase] = useState<Phase>('setup');
  const [topic, setTopic] = useState('mixed');
  const [diff, setDiff] = useState<Diff>('any');
  const length = save.settings.quizLength;
  const [questions, setQuestions] = useState<PoolQuestion[]>([]);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [earned, setEarned] = useState({ moles: 0, xp: 0 });
  const [final, setFinal] = useState<ReturnType<typeof quizCompletionReward> | null>(null);

  const available = useMemo(
    () => pool.filter((q) => (topic === 'mixed' || q.topic === topic) && (diff === 'any' || q.difficulty === Number(diff))),
    [pool, topic, diff],
  );

  const start = () => {
    const qs = pickQuestions(available, save.history, length);
    setQuestions(qs);
    setI(0);
    setAnswers([]);
    setStreak(0);
    setBestStreak(0);
    setEarned({ moles: 0, xp: 0 });
    setFinal(null);
    setPhase('play');
  };

  const onAnswered = (correct: boolean) => {
    const q = questions[i];
    const s = correct ? streak + 1 : 0;
    setStreak(s);
    setBestStreak((b) => Math.max(b, s));
    setAnswers((a) => [...a, { q, correct }]);
    recordAnswer(q, correct, { source: 'quiz', streak: s });
    const r = quizAnswerReward(q.difficulty, correct, s);
    grant(r, r.streakBonus ? `${s} in a row!` : undefined);
    setEarned((e) => ({ moles: e.moles + r.moles, xp: e.xp + r.xp }));
  };

  const next = () => {
    if (i + 1 < questions.length) setI(i + 1);
    else {
      const correct = answers.filter((a) => a.correct).length;
      const r = quizCompletionReward(correct, questions.length);
      completeQuiz(correct, questions.length, r);
      setEarned((e) => ({ moles: e.moles + r.moles, xp: e.xp + r.xp }));
      setFinal(r);
      setPhase('done');
    }
  };

  const topicName = topic === 'mixed' ? 'Mixed topics' : topicById(topic)?.name;

  return (
    <ModeShell
      title={mode.name}
      icon={mode.icon}
      colour={mode.colour}
      right={
        phase === 'play' && (
          <div className="flex items-center gap-3 text-sm">
            <span className={`chip ${streak >= 3 ? 'bg-accent/15 text-accent' : ''}`} title="Answers in a row">
              <Icon name="flame" size={14} /> {streak}
            </span>
            <span className="chip">
              <Moles amount={earned.moles} size={14} />
            </span>
          </div>
        )
      }
    >
      <AnimatePresence mode="wait">
        {phase === 'setup' && (
          <motion.div key="setup" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {pool.length === 0 ? (
              <EmptyState icon="book" title="No questions available">
                All question banks are switched off. Turn one on in the <Link className="font-semibold text-primary underline" to="/banks">Question Bank Manager</Link>.
              </EmptyState>
            ) : (
              <div className="grid gap-5">
                <section>
                  <h2 className="mb-2 text-lg font-semibold">1. Choose a topic</h2>
                  <TopicPicker value={topic} onChange={setTopic} />
                </section>
                <section className="flex flex-wrap items-end gap-6">
                  <div>
                    <h2 className="mb-2 text-lg font-semibold">2. Length</h2>
                    <Segmented label="Quiz length" value={length} onChange={(v) => updateSettings({ quizLength: v })} options={[{ value: 10, label: '10 questions' }, { value: 20, label: '20 questions' }]} />
                  </div>
                  <div>
                    <h2 className="mb-2 text-lg font-semibold">3. Difficulty</h2>
                    <Segmented
                      label="Difficulty"
                      value={diff}
                      onChange={setDiff}
                      options={[
                        { value: 'any', label: 'Any' },
                        { value: '1', label: 'Foundation' },
                        { value: '2', label: 'Standard' },
                        { value: '3', label: 'Challenge' },
                      ]}
                    />
                  </div>
                </section>
                <Card className="flex flex-wrap items-center justify-between gap-4 p-4">
                  <div>
                    <div className="font-display text-lg">{topicName}</div>
                    <div className="text-sm text-muted">
                      {available.length === 0
                        ? 'No questions match these filters.'
                        : available.length < length
                          ? `Only ${available.length} question${available.length === 1 ? '' : 's'} available, so you'll get all of them.`
                          : `${length} questions · up to ${economy.quiz.correct[3]} mol each, plus streak and completion bonuses`}
                    </div>
                  </div>
                  <Button size="lg" icon="play" onClick={start} disabled={available.length === 0}>
                    Start quiz
                  </Button>
                </Card>
              </div>
            )}
          </motion.div>
        )}

        {phase === 'play' && questions[i] && (
          <motion.div key={'q' + i} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.18 }}>
            <ProgressBar value={i / questions.length} className="mx-auto mb-4 max-w-3xl" label="Quiz progress" />
            <QuestionView
              question={questions[i]}
              meta={`${i + 1} / ${questions.length}`}
              onAnswered={({ result }) => onAnswered(result.correct)}
              onNext={next}
              nextLabel={i + 1 < questions.length ? 'Next question' : 'See results'}
            />
          </motion.div>
        )}

        {phase === 'done' && final && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto max-w-3xl">
            <Card className="p-6 text-center sm:p-8">
              <AccuracyRing value={final.accuracy} />
              <h2 className="mt-3 text-3xl font-semibold">{final.label}</h2>
              <p className="text-muted">
                {answers.filter((a) => a.correct).length} of {answers.length} correct · {topicName}
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Stat label="Moles earned" value={<Moles amount={earned.moles} size={22} />} />
                <Stat label="XP earned" value={<span className="num">+{earned.xp}</span>} />
                <Stat label="Best streak" value={<span className="num">{bestStreak}</span>} />
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <Button icon="refresh" onClick={start}>
                  Play again
                </Button>
                <Button variant="secondary" onClick={() => setPhase('setup')}>
                  Change topic
                </Button>
              </div>
            </Card>
            <h3 className="mb-2 mt-6 text-lg font-semibold">Your answers</h3>
            <ul className="grid gap-2">
              {answers.map((a, k) => (
                <li key={k} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-white ${a.correct ? 'bg-good' : 'bg-bad'}`}>
                    <Icon name={a.correct ? 'check' : 'x'} size={16} strokeWidth={3} />
                    <span className="sr-only">{a.correct ? 'Correct' : 'Incorrect'}</span>
                  </span>
                  <ChemText text={a.q.question} className="line-clamp-2 flex-1 text-sm" />
                </li>
              ))}
            </ul>
            {answers.some((a) => !a.correct) && (
              <p className="mt-3 text-sm text-muted">
                <Icon name="calendar" size={14} className="mr-1 inline" />
                Questions you missed have been added to your <Link to="/play/daily-review" className="font-semibold text-primary underline">Daily Review</Link>.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </ModeShell>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-[8rem] rounded-2xl bg-surface-2 px-4 py-3">
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</div>
    </div>
  );
}

export function AccuracyRing({ value, size = 120 }: { value: number; size?: number }) {
  const r = size / 2 - 10;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgb(var(--surface-2))" strokeWidth={12} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgb(var(--primary))"
          strokeWidth={12}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - value) }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center font-display text-3xl font-semibold num">{Math.round(value * 100)}%</div>
    </div>
  );
}
