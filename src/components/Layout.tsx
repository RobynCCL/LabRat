import { AnimatePresence, animate, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useGame, useLevel } from '@/store/game';
import { Icon, MoleCoin } from './ui';
import { LogoMark, Wordmark } from './Logo';
import { Avatar } from './Avatar';
import { dueCards, toDay } from '@/engine/srs/leitner';
import { useI18n } from '@/i18n/useI18n';

const NAV = [
  { to: '/home', key: 'home', icon: 'home' },
  { to: '/play', key: 'play', icon: 'play' },
  { to: '/lab', key: 'lab', icon: 'flask' },
  { to: '/shop', key: 'shop', icon: 'bag' },
  { to: '/stats', key: 'stats', icon: 'chart' },
  { to: '/banks', key: 'banks', icon: 'book' },
  { to: '/settings', key: 'settings', icon: 'settings' },
] as const;

function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);
  useEffect(() => {
    const from = prev.current;
    prev.current = value;
    if (!ref.current) return;
    const c = animate(from, value, {
      duration: Math.min(0.8, Math.abs(value - from) / 100 + 0.3),
      onUpdate: (v) => ref.current && (ref.current.textContent = Math.round(v).toLocaleString('en-IE')),
    });
    return () => c.stop();
  }, [value]);
  return (
    <span ref={ref} className="num">
      {value.toLocaleString('en-IE')}
    </span>
  );
}

export function StatusBar() {
  const moles = useGame((g) => g.save.profile.moles);
  const lvl = useLevel();
  const { t } = useI18n();
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="flex items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-3 shadow-soft" title={t.nav.levelTitle(lvl.level, lvl.into, lvl.needed)}>
        <span className="grid h-7 w-7 place-items-center rounded-full bg-primary font-display text-sm font-semibold text-primary-ink">{lvl.level}</span>
        <div className="hidden w-20 sm:block">
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
            <motion.div className="h-full rounded-full bg-primary" initial={false} animate={{ width: `${lvl.progress * 100}%` }} />
          </div>
          <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-muted num">
            {lvl.into}/{lvl.needed} XP
          </div>
        </div>
        <span className="sr-only">{t.common.level(lvl.level)}</span>
      </div>
      <div data-coin-target className="flex items-center gap-1.5 rounded-full border border-border bg-surface py-1 pl-1 pr-3 font-bold shadow-soft" aria-label={t.nav.molesAria(moles)}>
        <MoleCoin size={26} />
        <CountUp value={moles} />
        <span className="text-xs font-semibold text-muted">mol</span>
      </div>
    </div>
  );
}

export function Layout() {
  const location = useLocation();
  const due = useGame((g) => dueCards(g.save.srs, toDay(), new Set(g.pool.map((q) => q.uid))).length);
  const name = useGame((g) => g.save.settings.name);
  const { t } = useI18n();
  return (
    <div className="flex min-h-full">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-surface focus:p-2">
        {t.nav.skip}
      </a>
      {/* Sidebar (laptop) */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-surface/60 p-4 backdrop-blur lg:flex">
        <NavLink to="/" className="mb-6 flex items-center gap-2 px-2">
          <LogoMark size={34} />
          <Wordmark className="text-2xl" />
        </NavLink>
        <nav className="grid gap-1" aria-label={t.nav.main}>
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold transition ${isActive ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-surface-2 hover:text-ink'}`
              }
            >
              <Icon name={n.icon} />
              <span className="flex-1">{t.nav[n.key]}</span>
              {n.to === '/play' && due > 0 && <span className="rounded-full bg-accent px-1.5 text-xs font-bold text-white num">{due}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-2 rounded-2xl bg-surface-2 p-2">
          <div className="h-12 w-11 overflow-hidden">
            <Avatar size={44} />
          </div>
          <div className="min-w-0 text-sm">
            <div className="truncate font-semibold">{name || 'Lab Rat'}</div>
            <div className="text-xs text-muted">{t.nav.tagline}</div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-bg/85 px-4 py-2.5 backdrop-blur sm:px-6">
          <NavLink to="/home" className="flex items-center gap-2 lg:hidden" aria-label={t.nav.home}>
            <LogoMark size={30} />
          </NavLink>
          <div className="ml-auto flex items-center gap-1">
            <StatusBar />
            <NavLink to="/banks" aria-label={t.nav.banks} title={t.nav.banks} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-surface-2 lg:hidden">
              <Icon name="book" size={18} />
            </NavLink>
            <NavLink to="/settings" aria-label={t.nav.settings} title={t.nav.settings} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-surface-2 lg:hidden">
              <Icon name="settings" size={18} />
            </NavLink>
          </div>
        </header>

        <main id="main" className="flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname.split('/').slice(0, 3).join('/')} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Bottom nav (phone/tablet) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden" aria-label={t.nav.main}>
        {NAV.slice(0, 5).map((n) => (
          <NavLink key={n.to} to={n.to} className={({ isActive }) => `relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-bold ${isActive ? 'text-primary' : 'text-muted'}`}>
            <Icon name={n.icon} size={22} />
            <span className="max-w-full truncate px-0.5">{n.key === 'lab' ? t.nav.labShort : t.nav[n.key]}</span>
            {n.to === '/play' && due > 0 && <span className="absolute right-[28%] top-1 h-2.5 w-2.5 rounded-full bg-accent" />}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
