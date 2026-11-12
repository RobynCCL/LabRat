import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui';

/** Common frame for a mode screen: back link + title row. */
export function ModeShell({ title, icon, colour, right, children }: { title: string; icon: string; colour: string; right?: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Link to="/play" className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-muted hover:bg-surface-2 hover:text-ink">
          <Icon name="chevron-left" size={16} /> Modes
        </Link>
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl text-white" style={{ background: colour }}>
            <Icon name={icon} size={20} />
          </span>
          <h1 className="text-2xl font-semibold">{title}</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">{right}</div>
      </div>
      {children}
    </div>
  );
}
