import type { ComponentType, LazyExoticComponent } from 'react';

/**
 * A game mode plug-in. Each mode lives in its own folder under src/modes/
 * and exports one `GameMode` object from its index.ts. Register it in
 * src/modes/registry.ts – that's the only shared file you touch.
 */
export interface GameMode {
  /** URL slug: the mode is served at #/play/<id>. */
  id: string;
  name: string;
  /** One line shown on the mode card. */
  tagline: string;
  /** Longer description (mode card hover / detail). */
  description: string;
  /** Icon name from src/components/ui/Icon.tsx */
  icon: string;
  /** Accent colour for the card (hex). */
  colour: string;
  status: 'ready' | 'coming-soon';
  /** The mode's screen. Lazy-loaded so modes don't bloat the first load. */
  component?: LazyExoticComponent<ComponentType>;
  /** Optional hook returning a small badge (e.g. "4 due"). Must be a React hook. */
  useBadge?: () => string | null;
}
