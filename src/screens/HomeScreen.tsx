import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useGame, useLevel } from '@/store/game';
import { topics } from '@/content/topics';
import { economy } from '@/content/economy';
import { achievements } from '@/content/achievements';
import { currentStreak, dueCards, toDay } from '@/engine/srs/leitner';
import { topicSummaries } from '@/engine/progress/stats';
import { Avatar } from '@/components/Avatar';
import { RoomView } from '@/components/lab/RoomView';
import { usePetWander } from '@/components/lab/usePetWander';
import { Button, Card, Icon, Moles, ProgressBar, TopicBadge } from '@/components/ui';
import { useReducedMotion } from '@/App';
import { useI18n } from '@/i18n/useI18n';

function greeting(t: { morning: string; afternoon: string; evening: string }) {
  const h = new Date().getHours();
  return h < 12 ? t.morning : h < 18 ? t.afternoon : t.evening;
}

export default function HomeScreen() {
  const save = useGame((g) => g.save);
  const pool = useGame((g) => g.pool);
  const index = useGame((g) => g.index);
  const lvl = useLevel();
  const reduce = useReducedMotion();
  const { t, c } = useI18n();
  const tt = t;
  const today = toDay();
  const due = dueCards(save.srs, today, new Set(pool.map((q) => q.uid))).length;
  const streak = currentStreak(save.srs, today);
  const todayStats = save.stats.daily[today] ?? { answered: 0, correct: 0, minutes: 0 };
  const summaries = useMemo(() => topicSummaries(save, index, topics.map((t) => t.id)).filter((s) => s.questionCount > 0), [save, index]);
  const inv = useMemo(() => new Map(save.inventory.map((i) => [i.uid, i])), [save.inventory]);
  const roomDef = economy.rooms.find((r) => r.id === save.lab.current) ?? economy.rooms[0];
  const room = save.lab.rooms[save.lab.current];
  const pets = usePetWander(save.lab.current, { cols: roomDef.cols, rows: roomDef.rows }, room, save.inventory, !reduce);
  const recent = Object.entries(save.achievements)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => achievements.find((a) => a.id === id))
    .filter(Boolean);

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
  const itemV = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-3" variants={container} initial="hidden" animate="show">
      {/* Hero */}
      <motion.div variants={itemV} className="lg:col-span-2">
        <Card className="relative flex h-full items-center gap-4 overflow-hidden p-5 sm:p-6">
          <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-primary/10" />
          <div className="relative hidden shrink-0 sm:block">
            <Avatar size={120} wave />
          </div>
          <div className="relative min-w-0 flex-1">
            <p className="text-sm font-semibold text-muted">{greeting(t.home)}</p>
            <h1 className="text-3xl font-semibold">{save.settings.name || 'Lab Rat'}</h1>
            <div className="mt-3 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary font-display text-lg font-semibold text-primary-ink">{lvl.level}</span>
              <div className="flex-1">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">{t.common.level(lvl.level)}</span>
                  <span className="text-muted num">
                    {lvl.into} / {lvl.needed} XP
                  </span>
                </div>
                <ProgressBar value={lvl.progress} className="mt-1" label={t.home.levelProgress} />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/play/topic-quiz">
                <Button icon="target">{t.home.quickQuiz}</Button>
              </Link>
              <Link to="/play/focus-timer">
                <Button variant="secondary" icon="timer">
                  {t.home.focusTimer}
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Today */}
      <motion.div variants={itemV}>
        <Card className="flex h-full flex-col p-5">
          <h2 className="font-semibold">{t.home.today}</h2>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-surface-2 p-2">
              <div className="font-display text-2xl font-semibold num">{todayStats.answered}</div>
              <div className="text-[11px] font-bold uppercase text-muted">{t.home.answered}</div>
            </div>
            <div className="rounded-xl bg-surface-2 p-2">
              <div className="font-display text-2xl font-semibold num">{todayStats.minutes}</div>
              <div className="text-[11px] font-bold uppercase text-muted">{t.home.minutes}</div>
            </div>
            <div className="rounded-xl bg-surface-2 p-2">
              <div className="flex items-center justify-center gap-1 font-display text-2xl font-semibold text-accent num">
                <Icon name="flame" size={18} />
                {streak}
              </div>
              <div className="text-[11px] font-bold uppercase text-muted">{t.home.dayStreak}</div>
            </div>
          </div>
          <Link to="/play/daily-review" className="mt-3 block">
            <div className={`flex items-center gap-3 rounded-xl border-2 p-3 transition hover:shadow-soft ${due ? 'border-epic/40 bg-epic/10' : 'border-border'}`}>
              <Icon name="calendar" className={due ? 'text-epic' : 'text-muted'} />
              <div className="flex-1">
                <div className="font-semibold">{due ? t.home.reviewDue(due) : t.home.dailyReview}</div>
                <div className="text-xs text-muted">{due ? t.home.keepStreak : save.srs.streak.lastDate === today ? t.home.doneToday : t.home.nothingDue}</div>
              </div>
              <Icon name="chevron-right" className="text-muted" />
            </div>
          </Link>
        </Card>
      </motion.div>

      {/* Lab preview */}
      <motion.div variants={itemV} className="lg:col-span-2">
        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between px-5 pt-4">
            <div>
              <h2 className="font-semibold">{room.name || c.room(roomDef)}</h2>
              <p className="text-sm text-muted">
                {t.home.items(room.placed.length)}{pets.length ? ` · ${pets.map((p) => p.name).join(', ')}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Moles amount={save.profile.moles} />
              <Link to="/lab">
                <Button size="sm" variant="secondary" iconRight="chevron-right">
                  {t.home.openLab}
                </Button>
              </Link>
            </div>
          </div>
          <Link to="/lab" className="block p-3" aria-label={t.home.openLab} style={{ background: 'var(--lab-bg)' }}>
            <RoomView cols={roomDef.cols} rows={roomDef.rows} room={room} inventory={inv} pets={pets} anim={!reduce} title={room.name || c.room(roomDef)} className="mx-auto block h-auto w-full max-w-xl" />
          </Link>
        </Card>
      </motion.div>

      {/* Mastery */}
      <motion.div variants={itemV}>
        <Card className="flex h-full flex-col p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{t.home.topicMastery}</h2>
            <Link to="/stats" className="text-sm font-semibold text-primary">
              {t.home.allStats}
            </Link>
          </div>
          <ul className="mt-3 grid gap-3">
            {summaries.slice(0, 6).map((s) => {
              const t2 = { topicPicker: tt.topicPicker };
              const t = topics.find((x) => x.id === s.topic)!;
              return (
                <li key={s.topic} className="flex items-center gap-2.5">
                  <TopicBadge topic={s.topic} size={30} />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="truncate font-semibold">{c.topicShort(t)}</span>
                      <span className="text-muted num">{Math.round(s.mastery * 100)}%</span>
                    </div>
                    <ProgressBar value={s.mastery} colour={t.colour} height="h-2" className="mt-1" label={t2.topicPicker.mastery(c.topicShort(t))} />
                  </div>
                </li>
              );
            })}
          </ul>
          {recent.length > 0 && (
            <div className="mt-auto pt-4">
              <h3 className="mb-2 text-sm font-semibold text-muted">{t.home.recentAchievements}</h3>
              <div className="flex flex-wrap gap-1.5">
                {recent.map((a) => (
                  <span key={a!.id} className="chip bg-legendary/15 text-legendary">
                    <Icon name={a!.icon} size={13} /> {c.achievementName(a!)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}
