import { beforeEach, describe, expect, it } from 'vitest';
import { useGame } from './game';
import { createNewSave } from './defaults';
import { migrate, SaveFormatError } from './migrations';
import { economy } from '@/content/economy';
import { getItem } from '@/content/shop/items';
import { sellPrice, xpForLevel } from '@/engine/economy/economy';

const S = () => useGame.getState();

beforeEach(() => {
  const save = createNewSave();
  useGame.setState({ save });
});

describe('game store', () => {
  it('new players start with Moles and a furnished starter lab', () => {
    expect(S().save.profile.moles).toBe(economy.startingMoles);
    expect(S().save.lab.rooms.starter.placed.length).toBeGreaterThan(0);
  });

  it('buying deducts Moles and adds to inventory; selling refunds part', () => {
    const before = S().save.profile.moles;
    const r = S().buy('stool', 'red');
    expect(r.ok).toBe(true);
    expect(S().save.profile.moles).toBe(before - getItem('stool')!.price);
    const refund = S().sell(r.uid!);
    expect(refund).toBe(sellPrice(getItem('stool')!.price));
    expect(S().save.inventory.some((i) => i.uid === r.uid)).toBe(false);
  });

  it('refuses unaffordable or level-locked items', () => {
    expect(S().buy('tesla-coil', 'violet').ok).toBe(false);
    S().mutate((d) => (d.profile.moles = 0));
    expect(S().buy('island', 'grey')).toMatchObject({ ok: false, reason: 'Not enough Moles.' });
  });

  it('applied items can only be bought once per variant', () => {
    S().mutate((d) => (d.profile.moles = 10_000));
    expect(S().buy('floor-wood', 'oak').ok).toBe(true);
    expect(S().buy('floor-wood', 'oak').ok).toBe(false);
  });

  it('level-ups pay a Moles bonus', () => {
    const before = S().save.profile.moles;
    S().grant({ moles: 0, xp: xpForLevel(3) });
    // level 2 and 3 bonuses (plus the "Rising Chemist" achievement is level 5, so none here)
    expect(S().save.profile.moles).toBe(before + 2 * economy.levelUpMolesPerLevel + 3 * economy.levelUpMolesPerLevel);
  });

  it('answers update stats, history, achievements and the review queue', () => {
    const q = S().pool[0];
    S().recordAnswer(q, true, { source: 'quiz', streak: 1 });
    expect(S().save.achievements['first-correct']).toBeTruthy();
    expect(S().save.history[q.uid]).toMatchObject({ seen: 1, correct: 1, last: true });
    const q2 = S().pool[1];
    S().recordAnswer(q2, false, { source: 'quiz', streak: 0 });
    expect(S().save.srs.cards[q2.uid]?.box).toBe(1);
    expect(S().save.stats.topics[q2.topic].answered).toBeGreaterThan(0);
  });

  it('disabling a bank removes its questions from the pool', () => {
    expect(S().pool.length).toBeGreaterThan(0);
    S().setBankEnabled('sample', false);
    expect(S().pool.length).toBe(0);
    S().setBankEnabled('sample', true);
    expect(S().pool.length).toBeGreaterThan(0);
  });

  it('export → import round-trips the save', () => {
    S().buy('stool', 'blue');
    const json = S().exportSave();
    useGame.setState({ save: createNewSave() });
    S().importSave(json);
    expect(S().save.inventory.some((i) => i.itemId === 'stool' && i.variant === 'blue')).toBe(true);
  });
});

describe('migrations', () => {
  it('fills missing fields from defaults', () => {
    const old = createNewSave() as unknown as Record<string, unknown>;
    delete old.flags;
    delete (old.settings as Record<string, unknown>).quizLength;
    const m = migrate(old);
    expect(m.flags).toEqual({});
    expect(m.settings.quizLength).toBe(10);
  });
  it('keeps explicit nulls (e.g. no goggles)', () => {
    const s = createNewSave();
    s.avatar.goggles = null;
    expect(migrate(JSON.parse(JSON.stringify(s))).avatar.goggles).toBeNull();
  });
  it('rejects junk', () => {
    expect(() => migrate({ hello: 1 })).toThrow(SaveFormatError);
  });
});

describe('pets', () => {
  it('adopting names the pet and puts it in the current room', () => {
    S().mutate((d) => (d.profile.moles = 5000));
    const r = S().buy('pet-hamster', 'golden', { name: '  Boron  ' });
    expect(r.ok).toBe(true);
    const pet = S().save.inventory.find((o) => o.uid === r.uid)!;
    expect(pet).toMatchObject({ name: 'Boron', room: 'starter', pats: 0 });
    expect(S().save.achievements['first-pet']).toBeTruthy();
  });

  it('first pat each day pays a bonus, later pats only add hearts', () => {
    S().mutate((d) => (d.profile.moles = 5000));
    const { uid } = S().buy('pet-frog', 'green', { name: 'Fizz' });
    const before = S().save.profile.moles;
    expect(S().patPet(uid!).bonus).toBe(economy.dailyPatMoles);
    expect(S().patPet(uid!).bonus).toBe(0);
    expect(S().save.profile.moles).toBe(before + economy.dailyPatMoles);
    expect(S().save.inventory.find((o) => o.uid === uid)!.pats).toBe(2);
  });

  it('pets cannot be sold', () => {
    S().mutate((d) => (d.profile.moles = 5000));
    const { uid } = S().buy('pet-goldfish', 'orange', { name: 'Blub' });
    expect(S().sell(uid!)).toBe(0);
    expect(S().save.inventory.some((o) => o.uid === uid)).toBe(true);
  });

  it('pet hotel survives a save round-trip', () => {
    S().mutate((d) => (d.profile.moles = 5000));
    const { uid } = S().buy('pet-bunny', 'white', { name: 'Hop' });
    S().setPetRoom(uid!, 'hotel');
    const reloaded = migrate(JSON.parse(S().exportSave()));
    expect(reloaded.inventory.find((o) => o.uid === uid)!.room).toBe('hotel');
  });

  it('legacy placed lab rats become named roaming pets', () => {
    const s = createNewSave();
    s.inventory.push({ uid: 'oldrat', itemId: 'pet-rat', variant: 'white' });
    s.lab.rooms.starter.placed.push({ uid: 'oldrat', x: 5, y: 5, rot: 0 });
    const m = migrate(JSON.parse(JSON.stringify(s)));
    expect(m.inventory.find((o) => o.uid === 'oldrat')).toMatchObject({ name: 'Pip', room: 'starter' });
    expect(m.lab.rooms.starter.placed.some((p) => p.uid === 'oldrat')).toBe(false);
  });

  it('rooms can be renamed and reset', () => {
    S().renameRoom('starter', '  The Mole Hole ');
    expect(S().save.lab.rooms.starter.name).toBe('The Mole Hole');
    S().renameRoom('starter', '');
    expect(S().save.lab.rooms.starter.name).toBeUndefined();
  });
});
