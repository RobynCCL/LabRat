import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useGame } from '@/store/game';
import { economy } from '@/content/economy';
import { topicById, topics } from '@/content/topics';
import { focusReward } from '@/engine/economy/economy';
import { toDay } from '@/engine/srs/leitner';
import { play } from '@/lib/sound';
import { Button, Card, Icon, Moles, TopicBadge } from '@/components/ui';
import { ModeShell } from '../shared/ModeShell';
import mode from './index';

type Phase = 'setup' | 'work' | 'done' | 'break' | 'quenched';

const fmt = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export default function FocusTimerScreen() {
  const save = useGame((g) => g.save);
  const { updateSettings, completeFocus, cancelFocus } = useGame.getState();
  const work = save.settings.focusWork;
  const brk = save.settings.focusBreak;
  const grace = economy.focus.leaveGraceSeconds;

  const [topic, setTopic] = useState<string>('');
  const [phase, setPhase] = useState<Phase>('setup');
  const [endAt, setEndAt] = useState(0);
  const [pausedLeft, setPausedLeft] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [total, setTotal] = useState(1);
  const [awarded, setAwarded] = useState(0);
  const [away, setAway] = useState<number | null>(null); // ms the tab was hidden (shown as a warning)
  const hiddenAt = useRef<number | null>(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const left = pausedLeft ?? Math.max(0, endAt - now);
  const running = (phase === 'work' || phase === 'break') && pausedLeft === null;

  // Tick
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [running]);

  // Phase completion
  useEffect(() => {
    if (!running || left > 0) return;
    if (phase === 'work') {
      const r = focusReward(work);
      completeFocus(topic || null, work, r);
      setAwarded(r.moles);
      play('timer');
      setPhase('done');
    } else if (phase === 'break') {
      play('timer');
      setPhase('setup');
    }
  }, [left, running, phase, work, topic, completeFocus]);

  // Leaving the tab during a work session
  useEffect(() => {
    const onVis = () => {
      if (phaseRef.current !== 'work') return;
      if (document.visibilityState === 'hidden') hiddenAt.current = Date.now();
      else if (hiddenAt.current) {
        const gone = Date.now() - hiddenAt.current;
        hiddenAt.current = null;
        if (gone > grace * 1000 && pausedLeftRef.current === null) {
          cancelFocus();
          play('wrong');
          setPhase('quenched');
        } else if (gone > 2000) setAway(gone);
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [grace, cancelFocus]);
  const pausedLeftRef = useRef(pausedLeft);
  pausedLeftRef.current = pausedLeft;

  // Tab title shows the countdown
  useEffect(() => {
    const base = 'Lab Rat';
    if (phase === 'work' || phase === 'break') document.title = `${fmt(left)} · ${phase === 'work' ? 'Focus' : 'Break'} – ${base}`;
    else document.title = base;
    return () => {
      document.title = base;
    };
  }, [left, phase]);

  const startWork = () => {
    const ms = work * 60_000;
    setTotal(ms);
    setEndAt(Date.now() + ms);
    setNow(Date.now());
    setPausedLeft(null);
    setAway(null);
    setPhase('work');
  };
  const startBreak = () => {
    const ms = brk * 60_000;
    setTotal(ms);
    setEndAt(Date.now() + ms);
    setNow(Date.now());
    setPausedLeft(null);
    setPhase('break');
  };
  const togglePause = () => {
    if (pausedLeft === null) setPausedLeft(Math.max(0, endAt - Date.now()));
    else {
      setEndAt(Date.now() + pausedLeft);
      setNow(Date.now());
      setPausedLeft(null);
    }
  };
  const giveUp = () => {
    if (phase === 'work') cancelFocus();
    setPhase('setup');
  };

  const reward = focusReward(work);
  const todayMin = save.stats.daily[toDay()]?.minutes ?? 0;
  const progress = 1 - left / total;
  const topicStudy = topics
    .map((t) => ({ t, m: save.stats.topics[t.id]?.studyMinutes ?? 0 }))
    .filter((x) => x.m > 0)
    .sort((a, b) => b.m - a.m)
    .slice(0, 5);

  return (
    <ModeShell
      title={mode.name}
      icon={mode.icon}
      colour={mode.colour}
      right={
        <span className="chip">
          <Icon name="timer" size={14} /> {todayMin} min today
        </span>
      }
    >
      <AnimatePresence mode="wait">
        {phase === 'setup' && (
          <motion.div key="setup" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid gap-5 lg:grid-cols-[1fr_20rem]">
            <Card className="p-5 sm:p-6">
              <label className="label" htmlFor="focus-topic">
                What are you studying?
              </label>
              <div className="flex items-center gap-3">
                <TopicBadge topic={topic || 'mixed'} size={40} />
                <select id="focus-topic" className="input h-11" value={topic} onChange={(e) => setTopic(e.target.value)}>
                  <option value="">General study (no topic)</option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Slider label="Focus" value={work} min={economy.focus.minWorkMinutes} max={economy.focus.maxWorkMinutes} step={5} onChange={(v) => updateSettings({ focusWork: v })} />
                <Slider label="Break" value={brk} min={1} max={30} step={1} onChange={(v) => updateSettings({ focusBreak: v })} />
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {[
                  [25, 5],
                  [45, 10],
                  [50, 10],
                ].map(([w, b]) => (
                  <button key={w} className="chip hover:text-ink" onClick={() => updateSettings({ focusWork: w, focusBreak: b })}>
                    {w}/{b}
                  </button>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-surface-2 p-4">
                <div>
                  <div className="font-semibold">
                    Reward: <Moles amount={reward.moles} /> <span className="text-muted">+ {reward.xp} XP</span>
                  </div>
                  <div className="text-sm text-muted">Stay on this tab. Leaving it for more than {grace} seconds quenches the reaction and cancels the reward.</div>
                </div>
                <Button size="lg" icon="play" onClick={startWork}>
                  Start focusing
                </Button>
              </div>
            </Card>
            <Card className="p-5">
              <h2 className="mb-3 font-semibold">Study time by topic</h2>
              {topicStudy.length ? (
                <ul className="grid gap-2">
                  {topicStudy.map(({ t, m }) => (
                    <li key={t.id} className="flex items-center gap-2 text-sm">
                      <TopicBadge topic={t.id} size={24} />
                      <span className="flex-1 truncate">{t.short}</span>
                      <span className="font-semibold num">{m} min</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">Finish a session with a topic selected and it'll be logged here and on the Stats page.</p>
              )}
              <p className="mt-4 text-xs text-muted">
                Sessions completed: {save.stats.focusSessions} · Quenched: {save.stats.focusCancelled}
              </p>
            </Card>
          </motion.div>
        )}

        {(phase === 'work' || phase === 'break') && (
          <motion.div key="run" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
            <p className="mb-2 font-display text-xl text-muted">
              {phase === 'work' ? (topic ? `Studying ${topicById(topic)?.short}` : 'Focus session') : 'Break time, stretch your legs!'}
            </p>
            <TimerFlask progress={progress} label={fmt(left)} phase={phase} paused={pausedLeft !== null} />
            {away !== null && phase === 'work' && (
              <p className="mt-3 rounded-xl bg-warn/15 px-3 py-2 text-sm font-semibold" role="status">
                <Icon name="info" size={16} className="mr-1 inline" />
                You were away for {Math.round(away / 1000)}s. More than {grace}s quenches the session.
              </p>
            )}
            <div className="mt-5 flex gap-2">
              <Button variant="secondary" icon={pausedLeft === null ? 'pause' : 'play'} onClick={togglePause}>
                {pausedLeft === null ? 'Pause' : 'Resume'}
              </Button>
              <Button variant="ghost" icon="x" onClick={giveUp}>
                {phase === 'work' ? 'Give up' : 'Skip break'}
              </Button>
            </div>
          </motion.div>
        )}

        {phase === 'done' && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="mx-auto max-w-lg p-8 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-good/15 text-good">
                <Icon name="check" size={34} strokeWidth={3} />
              </div>
              <h2 className="mt-3 text-3xl font-semibold">Session complete!</h2>
              <p className="text-muted">
                {work} minutes{topic ? ` of ${topicById(topic)?.short}` : ''} logged.
              </p>
              <div className="mt-3 flex justify-center">
                <Moles amount={awarded} size={26} className="text-2xl" />
              </div>
              <div className="mt-6 flex justify-center gap-2">
                <Button icon="timer" onClick={startBreak}>
                  Take a {brk}-min break
                </Button>
                <Button variant="secondary" onClick={startWork}>
                  Another session
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {phase === 'quenched' && (
          <motion.div key="q" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="mx-auto max-w-lg p-8 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-bad/15 text-bad">
                <Icon name="x" size={34} strokeWidth={3} />
              </div>
              <h2 className="mt-3 text-3xl font-semibold">Reaction quenched</h2>
              <p className="text-muted">You left the tab for more than {grace} seconds, so this session doesn't count. Try again. You've got this.</p>
              <div className="mt-6 flex justify-center gap-2">
                <Button icon="refresh" onClick={startWork}>
                  Restart session
                </Button>
                <Button variant="secondary" onClick={() => setPhase('setup')}>
                  Change settings
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </ModeShell>
  );
}

function Slider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="label">{label}</label>
        <span className="font-display text-xl font-semibold num">{value} min</span>
      </div>
      <input type="range" className="w-full accent-[rgb(var(--primary))]" min={min} max={max} step={step} value={value} aria-label={`${label} minutes`} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

/** Big round-bottom flask that fills as the timer runs. */
function TimerFlask({ progress, label, phase, paused }: { progress: number; label: string; phase: 'work' | 'break'; paused: boolean }) {
  const liquid = phase === 'work' ? '#2fb5a5' : '#7c9cf0';
  const level = 262 - progress * 182; // y of liquid surface (262 = empty, 80 = full)
  return (
    <div className="relative" role="timer" aria-live="off" aria-label={`${label} remaining`}>
      <svg width="260" height="290" viewBox="0 0 260 290">
        <defs>
          <clipPath id="flaskclip">
            <path d="M108 20 h44 v62 a92 92 0 1 1 -44 0 Z" />
          </clipPath>
        </defs>
        <ellipse cx="130" cy="276" rx="80" ry="10" fill="rgba(0,0,0,0.1)" />
        <path d="M108 20 h44 v62 a92 92 0 1 1 -44 0 Z" fill="rgb(var(--surface))" />
        <g clipPath="url(#flaskclip)">
          <motion.rect x="0" width="260" height="300" fill={liquid} opacity="0.85" initial={false} animate={{ y: level }} transition={{ type: 'tween', duration: 0.3 }} />
          <motion.path d={`M0 0 q 32 -8 65 0 t 65 0 t 65 0 t 65 0 v 10 h -260 z`} fill={liquid} initial={false} animate={{ y: level }} transition={{ type: 'tween', duration: 0.3 }} />
          {!paused &&
            [0, 1, 2, 3].map((i) => (
              <motion.circle
                key={i}
                cx={95 + i * 22}
                r={4 + (i % 2) * 2}
                fill="#fff"
                opacity={0.5}
                initial={{ cy: 265 }}
                animate={{ cy: [265, Math.max(level + 10, 90)], opacity: [0.6, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.6, ease: 'easeOut' }}
              />
            ))}
        </g>
        <path d="M108 20 h44 v62 a92 92 0 1 1 -44 0 Z" fill="none" stroke="rgb(var(--ink) / 0.35)" strokeWidth="4" strokeLinejoin="round" />
        <rect x="100" y="12" width="60" height="12" rx="6" fill="rgb(var(--surface))" stroke="rgb(var(--ink) / 0.35)" strokeWidth="4" />
        <path d="M66 205 a72 72 0 0 1 4 -50" stroke="#fff" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.5" />
      </svg>
      <div className="absolute inset-x-0 top-[132px] text-center">
        <div className="font-display text-5xl font-semibold num drop-shadow-sm">{label}</div>
        {paused && <div className="text-sm font-bold uppercase tracking-wide text-muted">Paused</div>}
      </div>
    </div>
  );
}
