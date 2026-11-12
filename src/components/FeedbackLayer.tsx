import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { on } from '@/lib/events';
import { play } from '@/lib/sound';
import { achievements } from '@/content/achievements';
import { Icon, MoleCoin } from './ui';

interface Float {
  id: number;
  moles: number;
  xp: number;
  label?: string;
  right: number;
  y: number;
}
interface Toast {
  id: number;
  kind: 'achievement' | 'info' | 'good' | 'bad';
  title: string;
  body?: string;
  icon: string;
}

let seq = 0;

function coinTarget(): { x: number; y: number; right: number } {
  const el = document.querySelector('[data-coin-target]');
  if (!el) return { x: window.innerWidth - 80, y: 30, right: 16 };
  const r = el.getBoundingClientRect();
  return { x: r.left + 16, y: r.top + r.height / 2, right: Math.max(8, window.innerWidth - r.right) };
}

/**
 * Non-blocking feedback: floating "+N mol" pills, coins flying to the counter,
 * level-up banner and toasts. Nothing here ever waits for the player.
 */
export function FeedbackLayer() {
  const [floats, setFloats] = useState<Float[]>([]);
  const [coins, setCoins] = useState<{ id: number; tx: number; ty: number; delay: number; sx: number }[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [level, setLevel] = useState<{ level: number; bonus: number } | null>(null);

  useEffect(() => {
    const offs = [
      on('reward', (r) => {
        if (r.moles <= 0 && r.xp <= 0) return;
        const t = coinTarget();
        const id = ++seq;
        setFloats((f) => [...f, { id, ...r, right: t.right, y: t.y + 28 }]);
        setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 1600);
        if (r.moles > 0) {
          play('coin');
          const n = Math.min(6, 2 + Math.floor(r.moles / 10));
          const batch = Array.from({ length: n }, (_, i) => ({ id: ++seq, tx: t.x, ty: t.y, delay: i * 0.05, sx: window.innerWidth / 2 + (i - n / 2) * 18 }));
          setCoins((c) => [...c, ...batch]);
          setTimeout(() => setCoins((c) => c.filter((x) => !batch.includes(x))), 1200);
        }
      }),
      on('levelup', (l) => {
        play('levelup');
        setLevel(l);
        setTimeout(() => setLevel((cur) => (cur?.level === l.level ? null : cur)), 3800);
      }),
      on('achievement', (a) => {
        play('achievement');
        const def = achievements.find((x) => x.id === a.id);
        const id = ++seq;
        setToasts((t) => [...t, { id, kind: 'achievement', title: a.name, body: `${def?.description ?? ''} +${a.reward} mol`, icon: def?.icon ?? 'trophy' }]);
        setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
      }),
      on('toast', (m) => {
        const id = ++seq;
        setToasts((t) =>
          t.some((x) => x.title === m.message) ? t : [...t.slice(-3), { id, kind: m.tone ?? 'info', title: m.message, icon: m.tone === 'good' ? 'check' : 'info' }],
        );
        setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
      }),
    ];
    return () => offs.forEach((o) => o());
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-live="polite">
      {/* flying coins */}
      {coins.map((c) => (
        <motion.div
          key={c.id}
          className="absolute"
          initial={{ x: c.sx, y: window.innerHeight * 0.45, scale: 0.6, opacity: 0 }}
          animate={{ x: c.tx, y: c.ty - 12, scale: 1, opacity: [0, 1, 1, 0.2] }}
          transition={{ duration: 0.8, delay: c.delay, ease: [0.5, 0, 0.2, 1] }}
        >
          <MoleCoin size={24} />
        </motion.div>
      ))}

      {/* floating reward pills */}
      <AnimatePresence>
        {floats.map((f) => (
          <motion.div
            key={f.id}
            className="absolute whitespace-nowrap rounded-full bg-surface px-3 py-1 text-sm font-bold shadow-lift ring-1 ring-border"
            style={{ right: f.right, top: f.y }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {f.label && <span className="mr-1 text-accent">{f.label}</span>}
            {f.moles > 0 && <span className="text-mole">+{f.moles} mol</span>}
            {f.xp > 0 && <span className="ml-1.5 text-primary">+{f.xp} XP</span>}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* level up banner */}
      <AnimatePresence>
        {level && (
          <motion.div className="absolute left-1/2 top-20 -translate-x-1/2" initial={{ opacity: 0, y: -20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20 }} role="status">
            <div className="pointer-events-auto relative flex items-center gap-4 overflow-hidden rounded-3xl bg-primary px-6 py-4 text-primary-ink shadow-lift">
              {Array.from({ length: 14 }, (_, i) => (
                <motion.span
                  key={i}
                  className="absolute h-2 w-2 rounded-full"
                  style={{ left: '50%', top: '50%', background: ['#fde047', '#f472b6', '#5eead4', '#fff'][i % 4] }}
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{ x: Math.cos(i) * 160, y: Math.sin(i * 1.7) * 60, opacity: 0 }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              ))}
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/20 font-display text-3xl font-semibold">{level.level}</div>
              <div>
                <div className="font-display text-2xl font-semibold">Level up!</div>
                <div className="text-sm opacity-90">You reached level {level.level} · +{level.bonus} mol bonus</div>
              </div>
              <button className="ml-2 rounded-lg p-1 hover:bg-white/15" aria-label="Dismiss" onClick={() => setLevel(null)}>
                <Icon name="x" size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* toasts */}
      <div className="absolute right-4 top-16 flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-border bg-surface p-3 shadow-lift"
            >
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${t.kind === 'achievement' ? 'bg-legendary/15 text-legendary' : t.kind === 'bad' ? 'bg-bad/15 text-bad' : t.kind === 'good' ? 'bg-good/15 text-good' : 'bg-primary/10 text-primary'}`}>
                <Icon name={t.icon} size={22} />
              </span>
              <div className="min-w-0">
                {t.kind === 'achievement' && <div className="text-[11px] font-extrabold uppercase tracking-wide text-legendary">Achievement unlocked</div>}
                <div className="font-semibold">{t.title}</div>
                {t.body && <div className="text-sm text-muted">{t.body}</div>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
