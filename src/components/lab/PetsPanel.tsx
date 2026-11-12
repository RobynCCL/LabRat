import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '@/store/game';
import { economy } from '@/content/economy';
import { getItem } from '@/content/shop/items';
import { cleanName, hearts, HEART_STEPS, patsToNextHeart, suggestName } from '@/lib/pets';
import { toDay } from '@/engine/srs/leitner';
import type { OwnedItem } from '@/store/saveTypes';
import { ItemPreview } from '../ItemPreview';
import { Button, Card, Icon, IconButton, Modal } from '../ui';

export function Hearts({ pats, size = 14 }: { pats?: number; size?: number }) {
  const n = hearts(pats);
  return (
    <span className="inline-flex gap-0.5" aria-label={`${n} of ${HEART_STEPS.length} hearts`} title={`${n} of ${HEART_STEPS.length} hearts`}>
      {HEART_STEPS.map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden>
          <path d="M12 20s-7.5-4.6-9.2-9.1C1.7 7.8 3.6 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.4 0 5.3 3.3 4.2 6.4C19.5 15.4 12 20 12 20z" fill={i < n ? '#ef476f' : 'none'} stroke={i < n ? '#ef476f' : 'rgb(var(--muted) / 0.6)'} strokeWidth={2} />
        </svg>
      ))}
    </span>
  );
}

/** Where a pet is: room name, "Pet hotel", or (tank pets) shelf/storage. */
export function usePetLocation() {
  const save = useGame((g) => g.save);
  return (o: OwnedItem): { label: string; roomId: string | null } => {
    const item = getItem(o.itemId);
    const roomName = (id: string) => save.lab.rooms[id]?.name || economy.rooms.find((r) => r.id === id)?.name || id;
    if (item?.kind === 'pet') return o.room && o.room !== 'hotel' ? { label: roomName(o.room), roomId: o.room } : { label: 'Pet hotel', roomId: null };
    const home = Object.entries(save.lab.rooms).find(([, r]) => r.placed.some((p) => p.uid === o.uid))?.[0];
    return home ? { label: roomName(home), roomId: home } : { label: 'In storage', roomId: null };
  };
}

/** List of all your pets under the lab, with a card for each. */
export function PetsPanel({ roomId, onSayHello }: { roomId: string; onSayHello: (uid: string) => void }) {
  const inventory = useGame((g) => g.save.inventory);
  const pets = useMemo(() => inventory.filter((o) => getItem(o.itemId)?.pet), [inventory]);
  const where = usePetLocation();
  const [open, setOpen] = useState<string | null>(null);
  const today = toDay();

  return (
    <Card className="mt-3 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-semibold">
          <Icon name="heart" className="text-[#ef476f]" /> Your pets
        </h2>
        <Link to="/shop?tab=pets">
          <Button size="sm" variant="secondary" icon="plus">
            Adopt
          </Button>
        </Link>
      </div>
      {pets.length === 0 ? (
        <p className="text-sm text-muted">
          No pets yet. Adopt one from the <Link to="/shop?tab=pets" className="font-semibold text-primary underline">Pets</Link> section of the shop. They'll wander around your lab, and you can pat them every day for a little bonus.
        </p>
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {pets.map((o) => {
              const item = getItem(o.itemId)!;
              const loc = where(o);
              const here = loc.roomId === roomId;
              return (
                <li key={o.uid}>
                  <button onClick={() => setOpen(o.uid)} className={`flex w-full items-center gap-2 rounded-xl border-2 p-2 text-left transition hover:border-primary/50 ${here ? 'border-border bg-surface' : 'border-dashed border-border bg-surface-2/50'}`}>
                    <span className="rounded-lg bg-surface-2">
                      <ItemPreview item={item} variant={o.variant} size={44} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{o.name}</span>
                      <Hearts pats={o.pats} size={11} />
                      <span className="block truncate text-[11px] text-muted">
                        {loc.label}
                        {o.lastPatDay !== today && here && <span className="ml-1 font-bold text-accent">· wants a pat!</span>}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-xs text-muted">Tap a pet in the lab to pat it. The first pat each day earns {economy.dailyPatMoles} mol.</p>
        </>
      )}
      <PetModal uid={open} onClose={() => setOpen(null)} onSayHello={onSayHello} currentRoom={roomId} />
    </Card>
  );
}

export function PetModal({ uid, onClose, onSayHello, currentRoom }: { uid: string | null; onClose: () => void; onSayHello?: (uid: string) => void; currentRoom?: string }) {
  const save = useGame((g) => g.save);
  const { renameItem, setPetRoom } = useGame.getState();
  const own = save.inventory.find((o) => o.uid === uid);
  const item = getItem(own?.itemId ?? '');
  const where = usePetLocation();
  const [name, setName] = useState('');
  useEffect(() => {
    if (own) setName(own.name ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);
  if (!own || !item?.pet) return <Modal open={false} onClose={onClose} title="">{null}</Modal>;
  const roaming = item.kind === 'pet';
  const next = patsToNextHeart(own.pats);
  const loc = where(own);
  const adopted = own.adoptedAt ? new Date(own.adoptedAt).toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' }) : null;
  const variant = item.variants.find((v) => v.id === own.variant);

  const saveName = () => {
    const n = cleanName(name);
    if (n && n !== own.name) renameItem(own.uid, n);
  };

  return (
    <Modal open={!!uid} onClose={() => { saveName(); onClose(); }} title={own.name ?? item.name}>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="rounded-2xl bg-surface-2 p-2">
          <ItemPreview item={item} variant={own.variant} size={120} anim />
        </div>
        <div className="w-full min-w-0 flex-1">
          <label className="block">
            <span className="label">Name</span>
            <div className="flex gap-1">
              <input className="input" maxLength={16} value={name} onChange={(e) => setName(e.target.value)} onBlur={saveName} onKeyDown={(e) => e.key === 'Enter' && saveName()} />
              <IconButton icon="sparkles" label="Suggest a name" onClick={() => setName(suggestName(save.inventory.map((o) => o.name ?? '')))} />
            </div>
          </label>
          <p className="mt-2 text-sm text-muted">
            {variant?.name} {item.name.toLowerCase().replace(/ \(.*\)$/, '')}
            {adopted && <> · adopted {adopted}</>}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Hearts pats={own.pats} size={18} />
            <span className="text-xs text-muted">{next === null ? 'Best friends forever!' : `${next} more pat${next === 1 ? '' : 's'} to the next heart`}</span>
          </div>
          {roaming ? (
            <label className="mt-4 block">
              <span className="label">Lives in</span>
              <select className="input" value={own.room ?? 'hotel'} onChange={(e) => setPetRoom(own.uid, e.target.value)}>
                {save.lab.unlockedRooms.map((r) => (
                  <option key={r} value={r}>
                    {save.lab.rooms[r]?.name || economy.rooms.find((x) => x.id === r)?.name}
                  </option>
                ))}
                <option value="hotel">Pet hotel (resting, not shown)</option>
              </select>
            </label>
          ) : (
            <p className="mt-4 text-sm">
              <b>{loc.label}.</b> {loc.roomId ? 'Tap the tank in your lab to say hello.' : 'Place the tank on a bench, desk or table in Decorate mode.'}
            </p>
          )}
          {onSayHello && loc.roomId && loc.roomId === currentRoom && (
            <Button
              className="mt-4"
              icon="heart"
              onClick={() => {
                saveName();
                onSayHello(own.uid);
                onClose();
              }}
            >
              Pat {own.name}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
