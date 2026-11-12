import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { modes } from '@/modes/registry';
import type { GameMode } from '@/modes/types';
import { Icon, PageHeader } from '@/components/ui';
import { useI18n } from '@/i18n/useI18n';

function Badge({ mode }: { mode: GameMode }) {
  const b = mode.useBadge!();
  return b ? <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-white">{b}</span> : null;
}

function ModeCard({ mode, i }: { mode: GameMode; i: number }) {
  const ready = mode.status === 'ready';
  const { t, c } = useI18n();
  const m = c.mode(mode);
  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.04 }}
      className={`card group relative flex h-full flex-col overflow-hidden p-5 transition ${ready ? 'hover:-translate-y-0.5 hover:shadow-lift' : 'opacity-70'}`}
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-15 transition group-hover:scale-110" style={{ background: mode.colour }} />
      <div className="flex items-start justify-between gap-2">
        <span className="grid h-12 w-12 place-items-center rounded-2xl text-white shadow-press" style={{ background: ready ? mode.colour : 'rgb(var(--muted))' }}>
          <Icon name={mode.icon} size={26} />
        </span>
        {ready ? mode.useBadge && <Badge mode={mode} /> : <span className="chip"><Icon name="lock" size={12} /> {t.play.comingSoon}</span>}
      </div>
      <h2 className="mt-4 text-xl font-semibold">{m.name}</h2>
      <p className="text-sm font-semibold text-muted">{m.tagline}</p>
      <p className="mt-2 flex-1 text-sm text-muted">{m.description}</p>
      {ready && (
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold" style={{ color: mode.colour }}>
          {t.play.play} <Icon name="chevron-right" size={16} />
        </span>
      )}
    </motion.div>
  );
  return ready ? (
    <Link to={`/play/${mode.id}`} className="block rounded-2xl" aria-label={`${m.name}: ${m.tagline}`}>
      {inner}
    </Link>
  ) : (
    <div aria-label={t.play.comingSoonAria(m.name)}>{inner}</div>
  );
}

export default function PlayScreen() {
  const ready = modes.filter((m) => m.status === 'ready');
  const soon = modes.filter((m) => m.status !== 'ready');
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title={t.play.title} subtitle={t.play.subtitle} icon="play" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ready.map((m, i) => (
          <ModeCard key={m.id} mode={m} i={i} />
        ))}
      </div>
      <h2 className="mb-3 mt-10 text-lg font-semibold text-muted">{t.play.comingSoon}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {soon.map((m, i) => (
          <ModeCard key={m.id} mode={m} i={i} />
        ))}
      </div>
    </div>
  );
}
