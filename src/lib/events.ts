/** Tiny typed event bus for game feedback (coins, level-ups, toasts). */
export interface GameEvents {
  reward: { moles: number; xp: number; label?: string };
  levelup: { level: number; bonus: number };
  achievement: { id: string; name: string; reward: number };
  toast: { message: string; tone?: 'info' | 'good' | 'bad' };
}

type Handler<K extends keyof GameEvents> = (payload: GameEvents[K]) => void;
const handlers: Record<string, Set<(payload: never) => void>> = {};

export function on<K extends keyof GameEvents>(type: K, fn: Handler<K>): () => void {
  const set = (handlers[type] ??= new Set());
  set.add(fn as (payload: never) => void);
  return () => set.delete(fn as (payload: never) => void);
}

export function emit<K extends keyof GameEvents>(type: K, payload: GameEvents[K]): void {
  // Deliver asynchronously so feedback never blocks the action that caused it.
  queueMicrotask(() => handlers[type]?.forEach((fn) => (fn as Handler<K>)(payload)));
}

export const toast = (message: string, tone: GameEvents['toast']['tone'] = 'info') => emit('toast', { message, tone });
