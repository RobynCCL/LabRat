import { MotionConfig } from 'framer-motion';
import { Suspense, lazy, useEffect, useState } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useGame } from './store/game';
import { configureSound } from './lib/sound';
import { Layout } from './components/Layout';
import { FeedbackLayer } from './components/FeedbackLayer';
import { Loader } from './components/Loader';
import TitleScreen from './screens/TitleScreen';
import HomeScreen from './screens/HomeScreen';
import PlayScreen from './screens/PlayScreen';
import ModeHost from './screens/ModeHost';

// Heavier screens are split out.
const LabScreen = lazy(() => import('./screens/LabScreen'));
const ShopScreen = lazy(() => import('./screens/ShopScreen'));
const StatsScreen = lazy(() => import('./screens/StatsScreen'));
const BankManagerScreen = lazy(() => import('./screens/BankManagerScreen'));
const SettingsScreen = lazy(() => import('./screens/SettingsScreen'));

function usePrefersReducedMotion() {
  const [v, setV] = useState(() => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const m = matchMedia('(prefers-reduced-motion: reduce)');
    const f = () => setV(m.matches);
    m.addEventListener('change', f);
    return () => m.removeEventListener('change', f);
  }, []);
  return v;
}

/** Applies theme, reduced motion and sound settings to the document. */
export function useReducedMotion(): boolean {
  const setting = useGame((g) => g.save.settings.reducedMotion);
  const prefers = usePrefersReducedMotion();
  return setting === 'on' || (setting === 'system' && prefers);
}

function SettingsEffects() {
  const settings = useGame((g) => g.save.settings);
  const reduce = useReducedMotion();
  useEffect(() => {
    const apply = () => {
      const dark = settings.theme === 'dark' || (settings.theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.dataset.theme = dark ? 'dark' : 'light';
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#11151c' : '#0f766e');
    };
    apply();
    const m = matchMedia('(prefers-color-scheme: dark)');
    m.addEventListener('change', apply);
    return () => m.removeEventListener('change', apply);
  }, [settings.theme]);
  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduce);
  }, [reduce]);
  useEffect(() => configureSound({ muted: settings.muted, volume: settings.volume }), [settings.muted, settings.volume]);
  return null;
}

export default function App() {
  const ready = useGame((g) => g.ready);
  const reduce = useReducedMotion();
  useEffect(() => {
    void useGame.getState().load();
  }, []);

  return (
    <MotionConfig reducedMotion={reduce ? 'always' : 'never'}>
      <SettingsEffects />
      {!ready ? (
        <Loader />
      ) : (
        <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <FeedbackLayer />
          <Routes>
            <Route path="/" element={<TitleScreen />} />
            <Route element={<Layout />}>
              <Route path="/home" element={<HomeScreen />} />
              <Route path="/play" element={<PlayScreen />} />
              <Route path="/play/:modeId" element={<ModeHost />} />
              <Route path="/lab" element={<Suspense fallback={<Loader inline />}><LabScreen /></Suspense>} />
              <Route path="/shop" element={<Suspense fallback={<Loader inline />}><ShopScreen /></Suspense>} />
              <Route path="/stats" element={<Suspense fallback={<Loader inline />}><StatsScreen /></Suspense>} />
              <Route path="/banks" element={<Suspense fallback={<Loader inline />}><BankManagerScreen /></Suspense>} />
              <Route path="/settings" element={<Suspense fallback={<Loader inline />}><SettingsScreen /></Suspense>} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      )}
    </MotionConfig>
  );
}
