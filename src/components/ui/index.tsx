import { AnimatePresence, motion } from 'framer-motion';
import { forwardRef, useEffect, useId, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';
import { topicById } from '@/content/topics';
import type { Rarity } from '@/content/shop/types';
import { formatChem } from '@/engine/questions/formatChem';
import { play } from '@/lib/sound';

export { Icon };

/* ───────── Button ───────── */
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary text-primary-ink shadow-press hover:brightness-110 active:translate-y-px active:shadow-none',
  accent: 'bg-accent text-white shadow-press hover:brightness-105 active:translate-y-px active:shadow-none',
  secondary: 'bg-surface text-ink border border-border shadow-soft hover:bg-surface-2',
  ghost: 'text-ink hover:bg-surface-2',
  danger: 'bg-bad text-white shadow-press hover:brightness-110 active:translate-y-px active:shadow-none',
};
const SIZES = { sm: 'h-8 px-3 text-sm gap-1.5 rounded-lg', md: 'h-10 px-4 gap-2 rounded-xl', lg: 'h-12 px-6 text-lg gap-2 rounded-2xl' };

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: keyof typeof SIZES;
  icon?: string;
  iconRight?: string;
  silent?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', icon, iconRight, className = '', children, silent, onClick, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`inline-flex select-none items-center justify-center font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      onClick={(e) => {
        if (!silent) play('click');
        onClick?.(e);
      }}
      {...rest}
    >
      {icon && <Icon name={icon} size={size === 'lg' ? 22 : 18} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === 'lg' ? 22 : 18} />}
    </button>
  );
});

export function IconButton({ icon, label, className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { icon: string; label: string }) {
  return (
    <button aria-label={label} title={label} className={`inline-grid h-9 w-9 place-items-center rounded-xl text-ink transition hover:bg-surface-2 disabled:opacity-40 ${className}`} {...rest}>
      <Icon name={icon} size={18} />
    </button>
  );
}

/* ───────── Layout bits ───────── */
export function Card({ children, className = '', ...rest }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`card ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions, icon }: { title: string; subtitle?: ReactNode; actions?: ReactNode; icon?: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Icon name={icon} size={24} />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
          {subtitle && <p className="text-muted">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function ProgressBar({ value, className = '', colour, label, height = 'h-2.5' }: { value: number; className?: string; colour?: string; label?: string; height?: string }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className={`w-full overflow-hidden rounded-full bg-surface-2 ${height} ${className}`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label={label}>
      <motion.div className="h-full rounded-full" style={{ background: colour ?? 'rgb(var(--primary))' }} initial={false} animate={{ width: `${pct}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
    </div>
  );
}

export function EmptyState({ icon = 'info', title, children }: { icon?: string; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border p-8 text-center">
      <Icon name={icon} size={32} className="text-muted" />
      <p className="font-display text-lg">{title}</p>
      {children && <div className="max-w-md text-sm text-muted">{children}</div>}
    </div>
  );
}

/* ───────── Form controls ───────── */
export function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <label htmlFor={id} className="cursor-pointer">
        <div className="font-semibold">{label}</div>
        {description && <div className="text-sm text-muted">{description}</div>}
      </label>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? 'bg-primary' : 'bg-border'}`}
      >
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );
}

export function Segmented<T extends string | number>({ value, options, onChange, label, size = 'md' }: { value: T; options: { value: T; label: ReactNode }[]; onChange: (v: T) => void; label: string; size?: 'sm' | 'md' }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex flex-wrap rounded-xl bg-surface-2 p-1">
      {options.map((o) => (
        <button
          key={String(o.value)}
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
          className={`rounded-lg font-semibold transition ${size === 'sm' ? 'px-2.5 py-1 text-sm' : 'px-3.5 py-1.5'} ${o.value === value ? 'bg-surface text-ink shadow-soft' : 'text-muted hover:text-ink'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ───────── Modal ───────── */
export function Modal({ open, onClose, title, children, wide, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean; footer?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && ref.current) {
        const f = ref.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    setTimeout(() => ref.current?.querySelector<HTMLElement>('[data-autofocus], input, textarea, select, button')?.focus(), 30);
    return () => {
      document.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`relative flex max-h-[92vh] w-full flex-col rounded-t-3xl border border-border bg-surface shadow-lift sm:rounded-3xl ${wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'}`}
            initial={{ y: 30, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-border px-5 py-3">
              <h2 className="text-lg font-semibold">{title}</h2>
              <IconButton icon="x" label="Close" onClick={onClose} />
            </div>
            <div className="overflow-y-auto px-5 py-4">{children}</div>
            {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-3">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/* ───────── Domain bits ───────── */
export function ChemText({ text, className, as: As = 'span' }: { text: string; className?: string; as?: 'span' | 'p' | 'div' }) {
  return <As className={className}>{formatChem(text)}</As>;
}

/** "Element tile" badge for a topic. */
export function TopicBadge({ topic, size = 36 }: { topic: string; size?: number }) {
  const t = topicById(topic);
  const colour = t?.colour ?? '#6b7a8f';
  return (
    <span
      className="inline-grid shrink-0 place-items-center rounded-lg font-display font-semibold text-white shadow-sm"
      style={{ width: size, height: size, background: colour, fontSize: size * 0.42, boxShadow: `inset 0 -3px 0 rgba(0,0,0,.18)` }}
      aria-hidden
    >
      {t?.symbol ?? (topic === 'mixed' ? 'Mx' : '?')}
    </span>
  );
}

export function MoleCoin({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={'shrink-0 ' + className} aria-hidden>
      <circle cx="16" cy="17" r="14" fill="#b07a12" />
      <circle cx="16" cy="15.5" r="14" fill="#f4c542" />
      <circle cx="16" cy="15.5" r="11" fill="#f9d86a" stroke="#d9a425" strokeWidth="1.2" />
      {/* tiny mole face */}
      <ellipse cx="16" cy="17" rx="7" ry="6" fill="#7a5a44" />
      <circle cx="13.3" cy="15.5" r="1" fill="#1f1a17" />
      <circle cx="18.7" cy="15.5" r="1" fill="#1f1a17" />
      <ellipse cx="16" cy="18.3" rx="2" ry="1.4" fill="#f29bb0" />
      <path d="M8 9a10 10 0 0 1 6-4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity=".7" fill="none" />
    </svg>
  );
}

export function Moles({ amount, size = 18, className = '' }: { amount: number; size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 font-bold num ${className}`}>
      <MoleCoin size={size} />
      {amount.toLocaleString('en-IE')}
      <span className="sr-only">Moles</span>
    </span>
  );
}

const RARITY_CLASS: Record<Rarity, string> = {
  common: 'bg-common/15 text-common',
  uncommon: 'bg-uncommon/15 text-uncommon',
  rare: 'bg-rare/15 text-rare',
  epic: 'bg-epic/15 text-epic',
  legendary: 'bg-legendary/15 text-legendary',
};
export function RarityTag({ rarity }: { rarity: Rarity }) {
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide ${RARITY_CLASS[rarity]}`}>{rarity}</span>;
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="rounded-md border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] text-muted shadow-sm">{children}</kbd>;
}
