import type { QuestionBank } from '@/engine/questions/types';
import type { SrsState } from '@/engine/srs/leitner';
import type { Placed } from '@/engine/lab/grid';

export const SAVE_VERSION = 1;

export interface ItemRef {
  itemId: string;
  variant: string;
}

export interface OwnedItem extends ItemRef {
  /** Unique per purchased copy. */
  uid: string;
  /** Pets: the name you gave them. */
  name?: string;
  /** Roaming pets: the room id they live in, or 'hotel' when resting at the pet hotel. */
  room?: string;
  /** Pets: how many times you've patted them. */
  pats?: number;
  /** Pets: day (YYYY-MM-DD) of the last pat that paid the daily bonus. */
  lastPatDay?: string;
  adoptedAt?: number;
}

export interface RoomState {
  /** Custom room name (falls back to the room's default name). */
  name?: string;
  placed: Placed[];
  floor: ItemRef;
  wall: ItemRef;
  lighting: ItemRef;
}

export interface TopicStats {
  answered: number;
  correct: number;
  studyMinutes: number;
}

export type QuestionLanguage = 'auto' | 'en' | 'ga' | 'both';

export interface Settings {
  name: string;
  /** Interface language. */
  language: 'en' | 'ga';
  /** Which question banks to use: 'auto' follows the interface language. */
  questionLanguage: QuestionLanguage;
  theme: 'system' | 'light' | 'dark';
  muted: boolean;
  volume: number;
  reducedMotion: 'system' | 'on' | 'off';
  focusWork: number;
  focusBreak: number;
  quizLength: 10 | 20;
}

export interface SaveData {
  version: number;
  createdAt: number;
  updatedAt: number;
  settings: Settings;
  profile: {
    moles: number;
    xp: number;
    molesEarned: number;
  };
  stats: {
    topics: Record<string, TopicStats>;
    answered: number;
    correct: number;
    bestStreak: number;
    quizzesCompleted: number;
    perfectQuizzes: number;
    focusSessions: number;
    focusCancelled: number;
    focusMinutes: number;
    reviewsCompleted: number;
    itemsBought: number;
    /** Per calendar day (YYYY-MM-DD): answered, correct, study minutes. Last 90 days kept. */
    daily: Record<string, { answered: number; correct: number; minutes: number }>;
  };
  /** Latest result per question uid ("bankId/questionId"). */
  history: Record<string, { seen: number; correct: number; last: boolean; at: number }>;
  srs: SrsState;
  achievements: Record<string, number>; // id → unlocked timestamp
  /** Placeable items you own (placed or in storage). */
  inventory: OwnedItem[];
  /** Applied items you own: itemId → variant ids. */
  unlocked: Record<string, string[]>;
  avatar: {
    coat: ItemRef;
    goggles: ItemRef | null;
    gloves: ItemRef | null;
  };
  lab: {
    current: string;
    rooms: Record<string, RoomState>;
    unlockedRooms: string[];
  };
  banks: {
    /** Banks you imported or created (editable). */
    user: QuestionBank[];
    /** bankIds switched off. */
    disabled: string[];
  };
  /** Free-form flags for onboarding hints, etc. */
  flags: Record<string, boolean>;
}
