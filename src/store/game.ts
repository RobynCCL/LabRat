import { create } from 'zustand';
import { produce } from 'immer';
import { economy } from '@/content/economy';
import { achievements } from '@/content/achievements';
import { getItem } from '@/content/shop/items';
import type { ShopItem } from '@/content/shop/types';
import { applyXp, levelFromXp, levelUpReward, sellPrice, type Reward } from '@/engine/economy/economy';
import { computeStats, type TopicIndex } from '@/engine/progress/stats';
import { addMistake, completeReviewDay, reviewCard, toDay } from '@/engine/srs/leitner';
import type { PoolQuestion, Question, QuestionBank } from '@/engine/questions/types';
import type { Placed } from '@/engine/lab/grid';
import { emit } from '@/lib/events';
import { newId } from '@/lib/id';
import { buildPool, topicIndex } from '@/lib/questionPool';
import { cleanName } from '@/lib/pets';
import { createNewSave, emptyRoom } from './defaults';
import { migrate } from './migrations';
import { clearRaw, loadRaw, saveRaw } from './persistence';
import type { ItemRef, OwnedItem, SaveData, Settings } from './saveTypes';

export interface LabSnapshot {
  roomId: string;
  placed: Placed[];
  inventory: OwnedItem[];
  moles: number;
}

interface GameStore {
  ready: boolean;
  save: SaveData;
  pool: PoolQuestion[];
  index: TopicIndex;

  load(): Promise<void>;
  /** Low-level escape hatch: mutate the save with an immer recipe. */
  mutate(recipe: (d: SaveData) => void): void;

  grant(reward: Reward, label?: string): void;
  recordAnswer(q: PoolQuestion, correct: boolean, opts: { source: 'quiz' | 'review' | 'other'; streak?: number }): void;
  completeQuiz(correct: number, total: number, reward: Reward): void;
  completeFocus(topic: string | null, minutes: number, reward: Reward): void;
  cancelFocus(): void;
  reviewAnswer(uid: string, correct: boolean): void;
  completeReview(): void;

  buy(itemId: string, variant: string, opts?: { name?: string }): { ok: boolean; reason?: string; uid?: string };
  renameItem(uid: string, name: string): void;
  patPet(uid: string): { bonus: number };
  /** Move a roaming pet to a room, or 'hotel' to rest it. */
  setPetRoom(uid: string, roomId: string): void;
  renameRoom(roomId: string, name: string): void;
  equip(slot: 'floor' | 'wall' | 'lighting' | 'coat' | 'goggles' | 'gloves', ref: ItemRef | null): void;
  setPlaced(roomId: string, placed: Placed[]): void;
  sell(uid: string): number;
  restoreLab(s: LabSnapshot): void;
  snapshotLab(): LabSnapshot;
  unlockRoom(roomId: string): { ok: boolean; reason?: string };
  setCurrentRoom(roomId: string): void;

  updateSettings(p: Partial<Settings>): void;
  setFlag(k: string, v?: boolean): void;

  upsertBank(bank: QuestionBank): void;
  deleteBank(bankId: string): void;
  setBankEnabled(bankId: string, enabled: boolean): void;
  upsertQuestion(bankId: string, q: Question, previousId?: string): void;
  deleteQuestion(bankId: string, qid: string): void;

  exportSave(): string;
  importSave(json: string): void;
  resetSave(): Promise<void>;
}

/** Which item ids are "owned" for an applied (structure/avatar) item variant. */
export function ownsApplied(save: SaveData, item: ShopItem, variant: string): boolean {
  return item.kind === 'applied' && (item.price === 0 || (save.unlocked[item.id] ?? []).includes(variant));
}

const DAILY_KEEP = 90;
function bumpDaily(d: SaveData, f: (e: { answered: number; correct: number; minutes: number }) => void) {
  const day = toDay();
  const e = (d.stats.daily[day] ??= { answered: 0, correct: 0, minutes: 0 });
  f(e);
  const keys = Object.keys(d.stats.daily).sort();
  for (const k of keys.slice(0, Math.max(0, keys.length - DAILY_KEEP))) delete d.stats.daily[k];
}

function grantInto(d: SaveData, r: Reward, events: (() => void)[]) {
  const moles = Math.max(0, Math.round(r.moles));
  d.profile.moles += moles;
  d.profile.molesEarned += moles;
  const res = applyXp(d.profile.xp, r.xp);
  d.profile.xp = res.xp;
  for (let l = res.from + 1; l <= res.to; l++) {
    const bonus = levelUpReward(l);
    d.profile.moles += bonus;
    d.profile.molesEarned += bonus;
    events.push(() => emit('levelup', { level: l, bonus }));
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleSave(data: SaveData) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    void saveRaw(data);
  }, 400);
}

export const useGame = create<GameStore>((set, get) => {
  const initial = createNewSave();
  const pool0 = buildPool(initial.banks.user, initial.banks.disabled);

  /** Single commit path: apply recipe, then level-ups + achievements, then emit events and autosave. */
  function commit(recipe: (d: SaveData, events: (() => void)[]) => void) {
    const prev = get().save;
    const events: (() => void)[] = [];
    let next = produce(prev, (d) => {
      recipe(d, events);
      d.updatedAt = Date.now();
    });
    let { pool, index } = get();
    if (next.banks !== prev.banks) {
      pool = buildPool(next.banks.user, next.banks.disabled);
      index = topicIndex(pool);
    }
    // Achievements (loop because an achievement reward could trigger another).
    for (let i = 0; i < 3; i++) {
      const stats = computeStats(next, index);
      const fresh = achievements.filter((a) => !next.achievements[a.id] && stats[a.stat] >= a.gte);
      if (!fresh.length) break;
      next = produce(next, (d) => {
        for (const a of fresh) {
          d.achievements[a.id] = Date.now();
          grantInto(d, { moles: a.reward, xp: 0 }, events);
          events.push(() => emit('achievement', { id: a.id, name: a.name, reward: a.reward }));
        }
      });
    }
    set({ save: next, pool, index });
    if (get().ready) scheduleSave(next);
    events.forEach((e) => e());
  }

  return {
    ready: false,
    save: initial,
    pool: pool0,
    index: topicIndex(pool0),

    async load() {
      let save: SaveData;
      try {
        const raw = await loadRaw();
        save = raw ? migrate(raw) : createNewSave();
      } catch (e) {
        console.error('[Lab Rat] Could not load save, starting fresh.', e);
        save = createNewSave();
      }
      const pool = buildPool(save.banks.user, save.banks.disabled);
      set({ save, pool, index: topicIndex(pool), ready: true });
      if (typeof window !== 'undefined') {
        const flush = () => void saveRaw(get().save);
        window.addEventListener('pagehide', flush);
        document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && flush());
      }
    },

    mutate(recipe) {
      commit((d) => recipe(d));
    },

    grant(reward, label) {
      commit((d, ev) => {
        grantInto(d, reward, ev);
        if (reward.moles > 0 || reward.xp > 0) ev.unshift(() => emit('reward', { ...reward, label }));
      });
    },

    recordAnswer(q, correct, { source, streak }) {
      commit((d) => {
        const t = (d.stats.topics[q.topic] ??= { answered: 0, correct: 0, studyMinutes: 0 });
        t.answered++;
        d.stats.answered++;
        if (correct) {
          t.correct++;
          d.stats.correct++;
        }
        if (streak != null) d.stats.bestStreak = Math.max(d.stats.bestStreak, streak);
        const h = (d.history[q.uid] ??= { seen: 0, correct: 0, last: false, at: 0 });
        h.seen++;
        if (correct) h.correct++;
        h.last = correct;
        h.at = Date.now();
        bumpDaily(d, (e) => {
          e.answered++;
          if (correct) e.correct++;
        });
        if (!correct && source !== 'review') d.srs = addMistake(d.srs, q.uid, toDay());
      });
    },

    completeQuiz(correct, total, reward) {
      commit((d, ev) => {
        d.stats.quizzesCompleted++;
        if (total > 0 && correct === total) d.stats.perfectQuizzes++;
        grantInto(d, reward, ev);
        if (reward.moles || reward.xp) ev.unshift(() => emit('reward', { ...reward, label: 'Quiz complete' }));
      });
    },

    completeFocus(topic, minutes, reward) {
      commit((d, ev) => {
        d.stats.focusSessions++;
        d.stats.focusMinutes += minutes;
        if (topic) {
          const t = (d.stats.topics[topic] ??= { answered: 0, correct: 0, studyMinutes: 0 });
          t.studyMinutes += minutes;
        }
        bumpDaily(d, (e) => (e.minutes += minutes));
        grantInto(d, reward, ev);
        ev.unshift(() => emit('reward', { ...reward, label: 'Focus session complete' }));
      });
    },

    cancelFocus() {
      commit((d) => {
        d.stats.focusCancelled++;
      });
    },

    reviewAnswer(uid, correct) {
      commit((d) => {
        d.srs = reviewCard(d.srs, uid, correct, toDay());
      });
    },

    completeReview() {
      commit((d) => {
        d.stats.reviewsCompleted++;
        d.srs = completeReviewDay(d.srs, toDay());
      });
    },

    buy(itemId, variant, opts) {
      const save = get().save;
      const item = getItem(itemId);
      if (!item || !item.variants.some((v) => v.id === variant)) return { ok: false, reason: 'Unknown item.' };
      const level = levelFromXp(save.profile.xp).level;
      if (item.unlockLevel && level < item.unlockLevel) return { ok: false, reason: `Unlocks at level ${item.unlockLevel}.` };
      if (item.kind === 'applied' && ownsApplied(save, item, variant)) return { ok: false, reason: 'You already own this.' };
      if (save.profile.moles < item.price) return { ok: false, reason: 'Not enough Moles.' };
      const uid = newId('i');
      commit((d) => {
        d.profile.moles -= item.price;
        d.stats.itemsBought++;
        if (item.kind === 'applied') (d.unlocked[item.id] ??= []).push(variant);
        else if (item.pet)
          d.inventory.push({
            uid,
            itemId,
            variant,
            name: cleanName(opts?.name ?? '') || item.name,
            pats: 0,
            adoptedAt: Date.now(),
            ...(item.kind === 'pet' ? { room: d.lab.current } : {}),
          });
        else d.inventory.push({ uid, itemId, variant });
      });
      return { ok: true, uid };
    },

    equip(slot, ref) {
      commit((d) => {
        if (slot === 'coat') {
          if (ref) d.avatar.coat = ref;
        } else if (slot === 'goggles' || slot === 'gloves') d.avatar[slot] = ref;
        else if (ref) {
          const room = (d.lab.rooms[d.lab.current] ??= emptyRoom());
          room[slot] = ref;
        }
      });
    },

    setPlaced(roomId, placed) {
      commit((d) => {
        (d.lab.rooms[roomId] ??= emptyRoom()).placed = placed;
      });
    },

    renameItem(uid, name) {
      const n = cleanName(name);
      if (!n) return;
      commit((d) => {
        const o = d.inventory.find((i) => i.uid === uid);
        if (o) o.name = n;
      });
    },

    patPet(uid) {
      let bonus = 0;
      commit((d, ev) => {
        const o = d.inventory.find((i) => i.uid === uid);
        if (!o) return;
        o.pats = (o.pats ?? 0) + 1;
        const today = toDay();
        if (o.lastPatDay !== today) {
          o.lastPatDay = today;
          bonus = economy.dailyPatMoles;
          grantInto(d, { moles: bonus, xp: 0 }, ev);
          const label = `${o.name ?? 'Your pet'} is happy!`; // read now: the draft is revoked after commit
          ev.unshift(() => emit('reward', { moles: bonus, xp: 0, label }));
        }
      });
      return { bonus };
    },

    setPetRoom(uid, roomId) {
      commit((d) => {
        const o = d.inventory.find((i) => i.uid === uid);
        if (o) o.room = d.lab.unlockedRooms.includes(roomId) ? roomId : 'hotel';
      });
    },

    renameRoom(roomId, name) {
      commit((d) => {
        const r = (d.lab.rooms[roomId] ??= emptyRoom());
        const n = name.replace(/\s+/g, ' ').trim().slice(0, 28);
        if (n) r.name = n;
        else delete r.name;
      });
    },

    sell(uid) {
      const own = get().save.inventory.find((i) => i.uid === uid);
      const item = own && getItem(own.itemId);
      if (!own || !item || item.pet) return 0; // pets are never sold
      const refund = sellPrice(item.price);
      commit((d) => {
        d.inventory = d.inventory.filter((i) => i.uid !== uid);
        for (const r of Object.values(d.lab.rooms)) r.placed = r.placed.filter((p) => p.uid !== uid);
        d.profile.moles += refund;
      });
      return refund;
    },

    snapshotLab() {
      const s = get().save;
      return { roomId: s.lab.current, placed: s.lab.rooms[s.lab.current]?.placed ?? [], inventory: s.inventory, moles: s.profile.moles };
    },

    restoreLab(snap) {
      commit((d) => {
        (d.lab.rooms[snap.roomId] ??= emptyRoom()).placed = snap.placed as Placed[];
        d.inventory = snap.inventory as OwnedItem[];
        d.profile.moles = snap.moles;
      });
    },

    unlockRoom(roomId) {
      const save = get().save;
      const room = economy.rooms.find((r) => r.id === roomId);
      if (!room) return { ok: false, reason: 'Unknown room.' };
      if (save.lab.unlockedRooms.includes(roomId)) return { ok: true };
      if (levelFromXp(save.profile.xp).level < room.unlockLevel) return { ok: false, reason: `Reach level ${room.unlockLevel} first.` };
      if (save.profile.moles < room.price) return { ok: false, reason: 'Not enough Moles.' };
      commit((d) => {
        d.profile.moles -= room.price;
        d.lab.unlockedRooms.push(roomId);
        d.lab.rooms[roomId] ??= emptyRoom();
        d.lab.current = roomId;
      });
      return { ok: true };
    },

    setCurrentRoom(roomId) {
      if (!get().save.lab.unlockedRooms.includes(roomId)) return;
      commit((d) => {
        d.lab.current = roomId;
        d.lab.rooms[roomId] ??= emptyRoom();
      });
    },

    updateSettings(p) {
      commit((d) => {
        Object.assign(d.settings, p);
      });
    },

    setFlag(k, v = true) {
      commit((d) => {
        d.flags[k] = v;
      });
    },

    upsertBank(bank) {
      commit((d) => {
        const i = d.banks.user.findIndex((b) => b.bankId === bank.bankId);
        if (i >= 0) d.banks.user[i] = bank;
        else d.banks.user.push(bank);
      });
    },

    deleteBank(bankId) {
      commit((d) => {
        d.banks.user = d.banks.user.filter((b) => b.bankId !== bankId);
        d.banks.disabled = d.banks.disabled.filter((x) => x !== bankId);
      });
    },

    setBankEnabled(bankId, enabled) {
      commit((d) => {
        d.banks.disabled = d.banks.disabled.filter((x) => x !== bankId);
        if (!enabled) d.banks.disabled.push(bankId);
      });
    },

    upsertQuestion(bankId, q, previousId) {
      commit((d) => {
        const b = d.banks.user.find((x) => x.bankId === bankId);
        if (!b) return;
        const i = b.questions.findIndex((x) => x.id === (previousId ?? q.id));
        if (i >= 0) b.questions[i] = q;
        else b.questions.push(q);
      });
    },

    deleteQuestion(bankId, qid) {
      commit((d) => {
        const b = d.banks.user.find((x) => x.bankId === bankId);
        if (b) b.questions = b.questions.filter((x) => x.id !== qid);
      });
    },

    exportSave() {
      return JSON.stringify({ app: 'lab-rat', exportedAt: new Date().toISOString(), ...get().save }, null, 2);
    },

    importSave(json) {
      const raw = JSON.parse(json);
      const save = migrate(raw);
      delete (save as unknown as Record<string, unknown>).app;
      delete (save as unknown as Record<string, unknown>).exportedAt;
      const pool = buildPool(save.banks.user, save.banks.disabled);
      set({ save, pool, index: topicIndex(pool) });
      void saveRaw(save);
    },

    async resetSave() {
      await clearRaw();
      const save = createNewSave();
      const pool = buildPool(save.banks.user, save.banks.disabled);
      set({ save, pool, index: topicIndex(pool) });
      await saveRaw(save);
    },
  };
});

/** Convenience selectors */
export const useSave = <T,>(sel: (s: SaveData) => T) => useGame((g) => sel(g.save));
export const useLevel = () => useGame((g) => levelFromXp(g.save.profile.xp));
