import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import './styles/index.css';

registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Dev-only handle for debugging in the browser console: __labrat.getState()
if (import.meta.env.DEV) {
  void import('./store/game').then(({ useGame }) => {
    (window as unknown as { __labrat: typeof useGame }).__labrat = useGame;
  });
}
