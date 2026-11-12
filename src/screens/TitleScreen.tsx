import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame, useLevel } from '@/store/game';
import { Avatar } from '@/components/Avatar';
import { Button, Moles } from '@/components/ui';
import { LogoMark } from '@/components/Logo';

const FLOATERS = ['H₂O', 'NaCl', 'CO₂', 'CH₄', 'NH₃', 'H₂SO₄', 'C₆H₆', 'Fe³⁺', '⇌', 'mol'];

export default function TitleScreen() {
  const nav = useNavigate();
  const save = useGame((g) => g.save);
  const lvl = useLevel();
  const returning = save.stats.answered > 0 || save.stats.focusSessions > 0 || !!save.settings.name;
  const [name, setName] = useState(save.settings.name);

  const go = () => {
    if (name.trim() !== save.settings.name) useGame.getState().updateSettings({ name: name.trim().slice(0, 24) });
    nav('/home');
  };

  return (
    <div className="relative flex min-h-full flex-col items-center justify-center overflow-hidden px-4 py-10">
      {/* background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgb(var(--primary)/0.18),transparent_60%),radial-gradient(ellipse_at_bottom_right,rgb(var(--accent)/0.15),transparent_55%)]" />
      <svg className="absolute inset-0 -z-10 h-full w-full opacity-[0.07]" aria-hidden>
        <defs>
          <pattern id="hexbg" width="56" height="97" patternUnits="userSpaceOnUse" patternTransform="scale(1.2)">
            <path d="M28 0 L56 16 L56 48 L28 64 L0 48 L0 16 Z M28 64 L28 97" fill="none" stroke="rgb(var(--ink))" strokeWidth="2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexbg)" />
      </svg>
      {FLOATERS.map((f, i) => (
        <motion.span
          key={f}
          aria-hidden
          className="pointer-events-none absolute -z-10 select-none font-display font-semibold text-primary/25"
          style={{ left: `${(i * 37) % 92 + 3}%`, top: `${(i * 53) % 85 + 5}%`, fontSize: 18 + (i % 4) * 8 }}
          animate={{ y: [0, -14, 0], rotate: [0, i % 2 ? 6 : -6, 0] }}
          transition={{ duration: 6 + (i % 5), repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
        >
          {f}
        </motion.span>
      ))}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 120, damping: 16 }} className="flex flex-col items-center text-center">
        <motion.div initial={{ scale: 0.6, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}>
          <Avatar size={170} wave />
        </motion.div>
        <div className="mt-2 flex items-center gap-3">
          <LogoMark size={48} />
          <h1 className="font-display text-6xl font-semibold tracking-tight sm:text-7xl">
            Lab<span className="text-primary">Rat</span>
          </h1>
        </div>
        <p className="mt-3 max-w-md text-lg text-muted">Leaving Cert Chemistry revision. Earn Moles, level up and build the lab of your dreams.</p>

        <div className="mt-8 w-full max-w-sm">
          {returning ? (
            <div className="card p-5">
              <p className="font-display text-xl">Welcome back{save.settings.name ? `, ${save.settings.name}` : ''}!</p>
              <p className="mt-1 flex items-center justify-center gap-3 text-sm text-muted">
                <span>Level {lvl.level}</span>·<Moles amount={save.profile.moles} size={16} />
              </p>
              <Button size="lg" className="mt-4 w-full" icon="play" onClick={go} autoFocus>
                Continue
              </Button>
            </div>
          ) : (
            <form
              className="card p-5 text-left"
              onSubmit={(e) => {
                e.preventDefault();
                go();
              }}
            >
              <label className="label" htmlFor="name">
                What should we call you?
              </label>
              <input id="name" className="input h-11" placeholder="Your name (optional)" value={name} maxLength={24} onChange={(e) => setName(e.target.value)} autoFocus />
              <Button size="lg" className="mt-4 w-full" icon="play" type="submit">
                Start revising
              </Button>
              <p className="mt-3 text-center text-xs text-muted">No account needed. Progress saves on this device and works offline.</p>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
