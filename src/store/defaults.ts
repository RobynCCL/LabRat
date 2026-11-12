import { economy } from '@/content/economy';
import { STARTER_APPLIED, STARTER_EQUIPPED, STARTER_LAYOUT } from '@/content/shop/items';
import { emptySrs } from '@/engine/srs/leitner';
import { newId } from '@/lib/id';
import { SAVE_VERSION, type OwnedItem, type RoomState, type SaveData } from './saveTypes';

export function emptyRoom(): RoomState {
  return {
    placed: [],
    floor: { ...STARTER_EQUIPPED.floor },
    wall: { ...STARTER_EQUIPPED.wall },
    lighting: { ...STARTER_EQUIPPED.lighting },
  };
}

export function createNewSave(now = Date.now()): SaveData {
  const inventory: OwnedItem[] = [];
  const starter = emptyRoom();
  for (const s of STARTER_LAYOUT) {
    const uid = newId('i');
    inventory.push({ uid, itemId: s.itemId, variant: s.variant });
    starter.placed.push({ uid, x: s.x, y: s.y, rot: s.rot ?? 0 });
  }
  return {
    version: SAVE_VERSION,
    createdAt: now,
    updatedAt: now,
    settings: {
      name: '',
      theme: 'system',
      muted: false,
      volume: 0.6,
      reducedMotion: 'system',
      focusWork: economy.focus.defaultWorkMinutes,
      focusBreak: economy.focus.defaultBreakMinutes,
      quizLength: 10,
    },
    profile: { moles: economy.startingMoles, xp: 0, molesEarned: 0 },
    stats: {
      topics: {},
      answered: 0,
      correct: 0,
      bestStreak: 0,
      quizzesCompleted: 0,
      perfectQuizzes: 0,
      focusSessions: 0,
      focusCancelled: 0,
      focusMinutes: 0,
      reviewsCompleted: 0,
      itemsBought: 0,
      daily: {},
    },
    history: {},
    srs: emptySrs(),
    achievements: {},
    inventory,
    unlocked: Object.fromEntries(Object.entries(STARTER_APPLIED).map(([k, v]) => [k, [...v]])),
    avatar: {
      coat: { ...STARTER_EQUIPPED.coat },
      goggles: STARTER_EQUIPPED.goggles ? { ...STARTER_EQUIPPED.goggles } : null,
      gloves: null,
    },
    lab: {
      current: economy.rooms[0].id,
      rooms: { [economy.rooms[0].id]: starter },
      unlockedRooms: [economy.rooms[0].id],
    },
    banks: { user: [], disabled: [] },
    flags: {},
  };
}
