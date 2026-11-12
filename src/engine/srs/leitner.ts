/**
 * Leitner-box spaced repetition.
 *
 * - A question answered wrong anywhere in the game goes into box 1, due tomorrow
 *   (or today if `dueToday` is set – used when a mistake is made outside review).
 * - In Daily Review, a correct answer moves the card up one box; a wrong answer
 *   sends it back to box 1.
 * - Each box has an interval in days before the card is due again.
 * - Answering correctly from the top box "graduates" the card (removed).
 *
 * Dates are local calendar days as "YYYY-MM-DD" strings so the logic is pure
 * and timezone-safe.
 */

export interface LeitnerCard {
  box: number; // 1-based
  due: string; // YYYY-MM-DD
  lapses: number;
}

export interface SrsState {
  cards: Record<string, LeitnerCard>;
  streak: { count: number; lastDate: string | null; best: number };
  graduated: number;
}

/** Days until next review after landing in box N (index = box). */
export const DEFAULT_INTERVALS = [0, 1, 2, 4, 7, 14];
export const BOX_COUNT = DEFAULT_INTERVALS.length - 1;

export const emptySrs = (): SrsState => ({ cards: {}, streak: { count: 0, lastDate: null, best: 0 }, graduated: 0 });

export function toDay(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split('-').map(Number);
  const dt = new Date(y, m - 1, d + n, 12); // noon avoids DST edge cases
  return toDay(dt);
}

export function daysBetween(a: string, b: string): number {
  const [y1, m1, d1] = a.split('-').map(Number);
  const [y2, m2, d2] = b.split('-').map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000);
}

/** Record a mistake made outside Daily Review. */
export function addMistake(state: SrsState, uid: string, today: string, dueToday = false): SrsState {
  const prev = state.cards[uid];
  const card: LeitnerCard = {
    box: 1,
    due: dueToday ? today : addDays(today, DEFAULT_INTERVALS[1]),
    lapses: (prev?.lapses ?? 0) + 1,
  };
  // If it was already due earlier, keep the earlier date.
  if (prev && prev.box === 1 && prev.due < card.due) card.due = prev.due;
  return { ...state, cards: { ...state.cards, [uid]: card } };
}

/** Apply a Daily Review answer. */
export function reviewCard(
  state: SrsState,
  uid: string,
  correct: boolean,
  today: string,
  intervals: number[] = DEFAULT_INTERVALS,
): SrsState {
  const card = state.cards[uid];
  if (!card) return state;
  const boxes = intervals.length - 1;
  const cards = { ...state.cards };
  let graduated = state.graduated;
  if (correct) {
    if (card.box >= boxes) {
      delete cards[uid];
      graduated++;
    } else {
      const box = card.box + 1;
      cards[uid] = { ...card, box, due: addDays(today, intervals[box]) };
    }
  } else {
    cards[uid] = { box: 1, due: addDays(today, intervals[1]), lapses: card.lapses + 1 };
  }
  return { ...state, cards, graduated };
}

export function dueCards(state: SrsState, today: string, validUids?: Set<string>): string[] {
  return Object.entries(state.cards)
    .filter(([uid, c]) => c.due <= today && (!validUids || validUids.has(uid)))
    .sort((a, b) => a[1].box - b[1].box || a[1].due.localeCompare(b[1].due))
    .map(([uid]) => uid);
}

export function boxCounts(state: SrsState, boxes = BOX_COUNT): number[] {
  const counts = Array(boxes).fill(0);
  for (const c of Object.values(state.cards)) counts[Math.min(c.box, boxes) - 1]++;
  return counts;
}

/** Call when a Daily Review session is completed. */
export function completeReviewDay(state: SrsState, today: string): SrsState {
  const { lastDate, count, best } = state.streak;
  if (lastDate === today) return state;
  const next = lastDate && daysBetween(lastDate, today) === 1 ? count + 1 : 1;
  return { ...state, streak: { count: next, lastDate: today, best: Math.max(best, next) } };
}

/** Streak to display: 0 if a day was missed. */
export function currentStreak(state: SrsState, today: string): number {
  const { lastDate, count } = state.streak;
  if (!lastDate) return 0;
  const gap = daysBetween(lastDate, today);
  return gap <= 1 ? count : 0;
}
