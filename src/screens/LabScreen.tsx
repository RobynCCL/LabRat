import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ownsApplied, useGame, useLevel, type LabSnapshot } from '@/store/game';
import { economy } from '@/content/economy';
import { getItem, shopItems } from '@/content/shop/items';
import type { AppliedItem, PlaceableItem } from '@/content/shop/types';
import { addItem, findSpot, moveItem, placementProblem, removeItem, footprint, type Placed, type Rot } from '@/engine/lab/grid';
import { sellPrice } from '@/engine/economy/economy';
import { RoomView, T, PAD, floorTop, metaFor, wallRect, isStanding } from '@/components/lab/RoomView';
import { usePetWander } from '@/components/lab/usePetWander';
import { PetsPanel } from '@/components/lab/PetsPanel';
import { ItemPreview } from '@/components/ItemPreview';
import { Button, Card, EmptyState, Icon, IconButton, Kbd, Modal, Moles, PageHeader, Segmented } from '@/components/ui';
import { exportSvgToPng } from '@/lib/exportPng';
import { play } from '@/lib/sound';
import { toast } from '@/lib/events';
import { useReducedMotion } from '@/App';

interface Drag {
  uid: string;
  offX: number;
  offY: number;
  rot: Rot;
  fromStorage: boolean;
  start: { x: number; y: number } | null;
}

export default function LabScreen() {
  const save = useGame((g) => g.save);
  const level = useLevel().level;
  const store = useGame.getState();
  const reduce = useReducedMotion();
  const roomId = save.lab.current;
  const roomDef = economy.rooms.find((r) => r.id === roomId) ?? economy.rooms[0];
  const room = save.lab.rooms[roomId];
  const size = { cols: roomDef.cols, rows: roomDef.rows };

  const inv = useMemo(() => new Map(save.inventory.map((i) => [i.uid, i])), [save.inventory]);
  const meta = useCallback((uid: string) => metaFor(getItem(inv.get(uid)?.itemId ?? '')), [inv]);

  const [decorate, setDecorate] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [panel, setPanel] = useState<'storage' | 'style'>('storage');
  const [undo, setUndo] = useState<LabSnapshot[]>([]);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [preview, setPreview] = useState<{ placed: Placed[]; valid: boolean; cand: Placed } | null>(null);
  const [selling, setSelling] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [bubble, setBubble] = useState<{ uid: string; text: string; key: number } | null>(null);
  const [renaming, setRenaming] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const roomName = room.name || roomDef.name;

  const pets = usePetWander(roomId, size, room, save.inventory, !reduce && !exporting, bubble?.uid);

  // Tap a pet: pat it, show what it says.
  const patPet = (uid: string) => {
    const own = inv.get(uid);
    const item = getItem(own?.itemId ?? '');
    if (!own || !item?.pet) return;
    const sayings = item.pet.sayings;
    const text = `${own.name ?? item.name}\n${sayings[Math.floor(Math.random() * sayings.length)]}`;
    setBubble({ uid, text, key: Date.now() });
    store.patPet(uid);
    play('correct');
  };
  useEffect(() => {
    if (!bubble) return;
    const t = setTimeout(() => setBubble(null), 3200);
    return () => clearTimeout(t);
  }, [bubble]);
  const petProps = (uid: string): React.SVGProps<SVGGElement> =>
    decorate
      ? { style: { pointerEvents: 'none' } }
      : {
          role: 'button',
          tabIndex: 0,
          'aria-label': `Pat ${inv.get(uid)?.name ?? 'pet'}`,
          style: { cursor: 'pointer', outline: 'none' },
          onClick: () => patPet(uid),
          onKeyDown: (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              patPet(uid);
            }
          },
        };

  // Items placed in ANY room are not in storage.
  const placedEverywhere = useMemo(() => new Set(Object.values(save.lab.rooms).flatMap((r) => r.placed.map((p) => p.uid))), [save.lab.rooms]);
  const storage = useMemo(() => {
    const groups = new Map<string, { itemId: string; variant: string; uids: string[]; name?: string }>();
    for (const o of save.inventory) {
      if (placedEverywhere.has(o.uid)) continue;
      if (getItem(o.itemId)?.kind === 'pet') continue; // roaming pets live in the Pets panel
      const k = o.name ? o.uid : `${o.itemId}:${o.variant}`;
      if (!groups.has(k)) groups.set(k, { itemId: o.itemId, variant: o.variant, uids: [], name: o.name });
      groups.get(k)!.uids.push(o.uid);
    }
    return [...groups.values()];
  }, [save.inventory, placedEverywhere]);

  const commit = (placed: Placed[]) => {
    setUndo((u) => [...u.slice(-29), store.snapshotLab()]);
    store.setPlaced(roomId, placed);
  };

  const doUndo = () => {
    const last = undo[undo.length - 1];
    if (!last) return;
    setUndo((u) => u.slice(0, -1));
    store.restoreLab(last);
    setSelected(null);
    play('click');
  };

  /* ───────── pointer → tile ───────── */
  const toTile = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const pt = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
    return { fx: (pt.x - PAD) / T, fy: (pt.y - floorTop) / T };
  };

  const candidateFor = (d: Drag, clientX: number, clientY: number): Placed | null => {
    const t = toTile(clientX, clientY);
    const m = meta(d.uid);
    if (!t || !m) return null;
    const x = Math.floor(t.fx) - d.offX;
    const y = m.layer === 'wall' ? 0 : Math.floor(t.fy) - d.offY;
    return { uid: d.uid, x, y, rot: d.rot };
  };

  useEffect(() => {
    if (!drag) return;
    const onMove = (e: PointerEvent) => {
      const cand = candidateFor(drag, e.clientX, e.clientY);
      if (!cand) return;
      const placed = room.placed;
      const result = drag.fromStorage ? addItem(size, placed, cand, meta) : moveItem(size, placed, drag.uid, cand, meta);
      setPreview({ placed: result ?? placed, valid: !!result, cand });
    };
    const onUp = () => {
      if (preview?.valid) {
        const moved = !drag.start || drag.start.x !== preview.cand.x || drag.start.y !== preview.cand.y;
        if (moved) {
          commit(preview.placed);
          play('place');
        }
        setSelected(drag.uid);
      } else if (preview && !preview.valid) {
        play('error');
      }
      setDrag(null);
      setPreview(null);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  });

  /* ───────── actions on the selected item ───────── */
  const selPlaced = selected ? room.placed.find((p) => p.uid === selected) : undefined;
  const selItem = selected ? (getItem(inv.get(selected)?.itemId ?? '') as PlaceableItem | undefined) : undefined;

  const nudge = (dx: number, dy: number) => {
    if (!selPlaced) return;
    const r = moveItem(size, room.placed, selPlaced.uid, { x: selPlaced.x + dx, y: selPlaced.y + dy, rot: selPlaced.rot }, meta);
    if (r) {
      commit(r);
      play('place');
    } else play('error');
  };
  const rotate = () => {
    if (!selPlaced || !selItem?.rotatable) return;
    const rot = ((selPlaced.rot + 1) % 4) as Rot;
    const r = moveItem(size, room.placed, selPlaced.uid, { x: selPlaced.x, y: selPlaced.y, rot }, meta);
    if (r) {
      commit(r);
      play('place');
    } else {
      play('error');
      toast('No room to rotate here. Move it first.');
    }
  };
  const flip = () => {
    if (!selPlaced || !selItem || !isStanding(selItem)) return;
    commit(room.placed.map((p) => (p.uid === selPlaced.uid ? { ...p, flip: !p.flip } : p)));
    play('place');
  };
  const putAway = (uid = selected) => {
    if (!uid) return;
    commit(removeItem(room.placed, uid, meta).placed);
    setSelected(null);
    play('click');
  };
  const confirmSell = () => {
    if (!selling) return;
    setUndo((u) => [...u.slice(-29), store.snapshotLab()]);
    store.setPlaced(roomId, removeItem(room.placed, selling, meta).placed);
    const refund = store.sell(selling);
    play('coin');
    toast(`Sold for ${refund} mol`, 'good');
    setSelling(null);
    setSelected(null);
  };
  const placeFromStorage = (uid: string) => {
    const m = meta(uid);
    if (!m) return;
    const spot = findSpot(size, room.placed, uid, meta);
    if (!spot) {
      play('error');
      toast(m.layer === 'tabletop' ? 'No free bench space. Bench-top items need a bench to sit on.' : m.layer === 'wall' ? 'The wall is full. Store or move something first.' : 'No free floor space for that. Try moving things around.', 'bad');
      return;
    }
    commit([...room.placed, spot]);
    setSelected(uid);
    play('place');
  };

  // Keyboard shortcuts in decorate mode
  useEffect(() => {
    if (!decorate) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        doUndo();
        return;
      }
      if (!selected) return;
      const k = e.key;
      if (k === 'ArrowLeft') nudge(-1, 0);
      else if (k === 'ArrowRight') nudge(1, 0);
      else if (k === 'ArrowUp') nudge(0, -1);
      else if (k === 'ArrowDown') nudge(0, 1);
      else if (k === 'r' || k === 'R') (selItem && isStanding(selItem) ? flip() : rotate());
      else if (k === 'f' || k === 'F') flip();
      else if (k === 'Delete' || k === 'Backspace') putAway();
      else if (k === 'Escape') setSelected(null);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const startDrag = (uid: string, e: React.PointerEvent, fromStorage: boolean) => {
    if (e.button !== 0) return;
    const m = meta(uid);
    if (!m) return;
    const p = room.placed.find((x) => x.uid === uid);
    const t = toTile(e.clientX, e.clientY);
    let offX = 0;
    let offY = 0;
    if (p && t) {
      offX = Math.max(0, Math.min(Math.floor(t.fx) - p.x, footprint(m, p.rot).w - 1));
      offY = m.layer === 'wall' ? 0 : Math.max(0, Math.min(Math.floor(t.fy) - p.y, footprint(m, p.rot).h - 1));
    } else if (fromStorage) {
      offX = Math.floor((m.w - 1) / 2);
      offY = Math.floor((m.h - 1) / 2);
    }
    e.preventDefault();
    setSelected(uid);
    setDrag({ uid, offX, offY, rot: p?.rot ?? 0, fromStorage, start: p ? { x: p.x, y: p.y } : null });
  };

  const itemProps = (uid: string): React.SVGProps<SVGGElement> =>
    decorate
      ? {
          tabIndex: 0,
          role: 'button',
          'aria-label': `${getItem(inv.get(uid)?.itemId ?? '')?.name ?? 'Item'}${selected === uid ? ' (selected – arrows move, R rotates, Delete stores)' : ''}`,
          style: { cursor: drag ? 'grabbing' : 'grab', outline: 'none' },
          onPointerDown: (e) => startDrag(uid, e, false),
          onFocus: () => setSelected(uid),
          onKeyDown: (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setSelected(uid);
            }
          },
        }
      : getItem(inv.get(uid)?.itemId ?? '')?.pet
        ? {
            role: 'button',
            tabIndex: 0,
            'aria-label': `Say hello to ${inv.get(uid)?.name}`,
            style: { cursor: 'pointer', outline: 'none' },
            onClick: () => patPet(uid),
            onKeyDown: (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                patPet(uid);
              }
            },
          }
        : {};

  // Ghost overlay showing where the dragged item would land
  let overlay: React.ReactNode = null;
  if (preview && drag) {
    const m = meta(drag.uid);
    const item = getItem(inv.get(drag.uid)?.itemId ?? '') as PlaceableItem | undefined;
    if (m && item) {
      const fp = footprint(m, preview.cand.rot);
      const r =
        m.layer === 'wall'
          ? wallRect(preview.cand, item)
          : { x: PAD + preview.cand.x * T, y: floorTop + preview.cand.y * T, w: fp.w * T, h: fp.h * T };
      overlay = (
        <g pointerEvents="none" data-export-ignore>
          <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={8} fill={preview.valid ? 'rgb(var(--good) / 0.18)' : 'rgb(var(--bad) / 0.22)'} stroke={preview.valid ? 'rgb(var(--good))' : 'rgb(var(--bad))'} strokeWidth={3} strokeDasharray={preview.valid ? '0' : '6 4'} />
          {!preview.valid && (
            <text x={r.x + r.w / 2} y={r.y + r.h / 2 + 5} textAnchor="middle" fontSize={14} fontWeight={800} fill="rgb(var(--bad))">
              {placementProblem(size, room.placed, preview.cand, meta) === 'needs-surface' ? 'Needs a bench' : '✕'}
            </text>
          )}
        </g>
      );
    }
  }

  const exportPng = async () => {
    if (!svgRef.current) return;
    setExporting(true);
    setSelected(null);
    await new Promise((r) => setTimeout(r, 60));
    try {
      await exportSvgToPng(svgRef.current, {
        title: room.name ? room.name : `${save.settings.name ? save.settings.name + '’s' : 'My'} ${roomDef.name}`,
        subtitle: `Level ${level} · ${room.placed.length} items${pets.length ? ` · ${pets.map((p) => p.name).join(', ')}` : ''}`,
        filename: `lab-rat-${roomDef.id}.png`,
        dark: document.documentElement.dataset.theme === 'dark',
      });
      toast('Lab picture saved!', 'good');
    } catch (e) {
      console.error(e);
      toast('Sorry, the picture could not be created.', 'bad');
    }
    setExporting(false);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title={roomName}
        icon="flask"
        subtitle={decorate ? 'Decorate mode: drag items to move them, or use the keyboard.' : 'Your personal laboratory. Earn Moles to fill it with kit.'}
        actions={
          <>
            {!decorate && (
              <Button variant="ghost" icon="pencil" onClick={() => setRenaming(true)} aria-label="Rename this room">
                Rename
              </Button>
            )}
            {!decorate && (
              <Button variant="secondary" icon="image" onClick={exportPng} disabled={exporting}>
                {exporting ? 'Saving…' : 'Show off (PNG)'}
              </Button>
            )}
            {decorate && (
              <Button variant="secondary" icon="undo" onClick={doUndo} disabled={!undo.length} title="Undo (Ctrl+Z)">
                Undo
              </Button>
            )}
            <Button
              icon={decorate ? 'check' : 'edit'}
              variant={decorate ? 'primary' : 'accent'}
              onClick={() => {
                setDecorate(!decorate);
                setSelected(null);
                setUndo([]);
              }}
            >
              {decorate ? 'Done' : 'Decorate'}
            </Button>
          </>
        }
      />

      <RoomTabs level={level} />

      <div className={`grid gap-4 ${decorate ? 'lg:grid-cols-[1fr_20rem]' : ''}`}>
        <div className="min-w-0">
          <Card className="overflow-hidden p-2 sm:p-4" style={{ background: 'var(--lab-bg)' }}>
            <div className="overflow-x-auto scrollbar-thin" onPointerDown={(e) => decorate && e.target === e.currentTarget && setSelected(null)}>
              <RoomView
                ref={svgRef}
                cols={size.cols}
                rows={size.rows}
                room={room}
                inventory={inv}
                anim={!reduce && !exporting}
                preview={preview?.placed}
                showGrid={decorate}
                selected={decorate ? selected : null}
                itemProps={itemProps}
                overlay={overlay}
                pets={pets}
                petProps={petProps}
                bubble={bubble}
                className={`mx-auto block h-auto w-full select-none ${decorate ? "touch-none" : ""}`}
                title={`${roomName}, ${room.placed.length} items, ${pets.length} pets`}
              />
            </div>
          </Card>

          <AnimatePresence>
            {decorate && selected && selItem && selPlaced && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="card mt-3 flex flex-wrap items-center gap-2 p-2.5">
                <ItemPreview item={selItem} variant={inv.get(selected)!.variant} size={40} />
                <div className="mr-auto min-w-0">
                  <div className="truncate font-semibold">{selItem.name}</div>
                  <div className="hidden text-xs text-muted sm:block">
                    <Kbd>←↑↓→</Kbd> move · {isStanding(selItem) ? <><Kbd>F</Kbd> flip · </> : selItem.rotatable && <><Kbd>R</Kbd> rotate · </>}
                    <Kbd>Del</Kbd> store · <Kbd>Ctrl Z</Kbd> undo
                  </div>
                </div>
                <div className="flex gap-0.5 sm:hidden">
                  <IconButton icon="chevron-left" label="Move left" onClick={() => nudge(-1, 0)} />
                  <IconButton icon="arrow-up" label="Move up" onClick={() => nudge(0, -1)} />
                  <IconButton icon="arrow-down" label="Move down" onClick={() => nudge(0, 1)} />
                  <IconButton icon="chevron-right" label="Move right" onClick={() => nudge(1, 0)} />
                </div>
                {isStanding(selItem) ? (
                  <Button size="sm" variant="secondary" icon="flip" onClick={flip}>
                    Flip
                  </Button>
                ) : (
                  selItem.rotatable && (
                    <Button size="sm" variant="secondary" icon="rotate" onClick={rotate}>
                      Rotate
                    </Button>
                  )
                )}
                <Button size="sm" variant="secondary" icon="box" onClick={() => putAway()}>
                  Store
                </Button>
                {!selItem.pet && (
                  <Button size="sm" variant="secondary" icon="coin" onClick={() => setSelling(selected)}>
                    Sell
                  </Button>
                )}
                <IconButton icon="x" label="Deselect" onClick={() => setSelected(null)} />
              </motion.div>
            )}
          </AnimatePresence>
          {!decorate && <PetsPanel roomId={roomId} onSayHello={patPet} />}
          {!decorate && room.placed.length < 3 && (
            <p className="mt-3 text-sm text-muted">
              Tip: visit the <Link to="/shop" className="font-semibold text-primary underline">Shop</Link> to buy furniture, then press <b>Decorate</b> to arrange it.
            </p>
          )}
        </div>

        {decorate && (
          <aside className="grid content-start gap-3">
            <Segmented label="Panel" value={panel} onChange={setPanel} options={[{ value: 'storage', label: `Storage (${storage.reduce((n, g) => n + g.uids.length, 0)})` }, { value: 'style', label: 'Room style' }]} />
            {panel === 'storage' ? (
              <Card className="max-h-[32rem] overflow-y-auto p-2 scrollbar-thin">
                {storage.length === 0 ? (
                  <EmptyState icon="box" title="Storage is empty">
                    Everything you own is on display. <Link to="/shop" className="font-semibold text-primary underline">Buy more in the Shop</Link>.
                  </EmptyState>
                ) : (
                  <ul className="grid gap-1">
                    {storage.map((g) => {
                      const item = getItem(g.itemId) as PlaceableItem;
                      const v = item.variants.find((x) => x.id === g.variant);
                      return (
                        <li key={g.itemId + g.variant} className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-surface-2">
                          <div className="cursor-grab touch-none rounded-lg bg-surface-2 p-0.5" onPointerDown={(e) => startDrag(g.uids[0], e, true)} title="Drag into your lab">
                            <ItemPreview item={item} variant={g.variant} size={44} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold">{g.name ?? item.name}</div>
                            <div className="truncate text-xs text-muted">
                              {v?.name} {g.uids.length > 1 && <>· ×{g.uids.length}</>}
                            </div>
                          </div>
                          <Button size="sm" variant="secondary" onClick={() => placeFromStorage(g.uids[0])}>
                            Place
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Card>
            ) : (
              <StylePanel />
            )}
          </aside>
        )}
      </div>

      <RenameRoom open={renaming} onClose={() => setRenaming(false)} roomId={roomId} current={room.name ?? ''} fallback={roomDef.name} />

      <Modal
        open={!!selling}
        onClose={() => setSelling(null)}
        title="Sell item?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSelling(null)}>
              Keep it
            </Button>
            <Button variant="danger" icon="coin" onClick={confirmSell}>
              Sell
            </Button>
          </>
        }
      >
        {selling && (() => {
          const it = getItem(inv.get(selling)?.itemId ?? '');
          return it ? (
            <div className="flex items-center gap-4">
              <ItemPreview item={it} variant={inv.get(selling)!.variant} size={72} />
              <p>
                Sell <b>{it.name}</b> for <Moles amount={sellPrice(it.price)} /> ({Math.round(economy.sellRefund * 100)}% of its price)? Anything sitting on it goes back to storage. You can undo this.
              </p>
            </div>
          ) : null;
        })()}
      </Modal>
    </div>
  );
}

function RoomTabs({ level }: { level: number }) {
  const save = useGame((g) => g.save);
  const { setCurrentRoom, unlockRoom } = useGame.getState();
  const [confirm, setConfirm] = useState<string | null>(null);
  const target = economy.rooms.find((r) => r.id === confirm);
  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {economy.rooms.map((r) => {
        const unlocked = save.lab.unlockedRooms.includes(r.id);
        const active = save.lab.current === r.id;
        return (
          <button
            key={r.id}
            onClick={() => (unlocked ? setCurrentRoom(r.id) : setConfirm(r.id))}
            className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-semibold transition ${active ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-surface hover:border-primary/40'}`}
          >
            <Icon name={unlocked ? 'door' : 'lock'} size={16} />
            {save.lab.rooms[r.id]?.name || r.name}
            <span className="text-xs font-normal text-muted">
              {r.cols}×{r.rows}
            </span>
            {!unlocked && <span className="chip">Lv {r.unlockLevel}</span>}
          </button>
        );
      })}
      <Modal
        open={!!target}
        onClose={() => setConfirm(null)}
        title={target ? `Unlock the ${target.name}` : ''}
        footer={
          target && (
            <>
              <Button variant="secondary" onClick={() => setConfirm(null)}>
                Not yet
              </Button>
              <Button
                icon="door"
                disabled={level < target.unlockLevel || save.profile.moles < target.price}
                onClick={() => {
                  const r = unlockRoom(target.id);
                  if (r.ok) {
                    play('buy');
                    toast(`Welcome to the ${target.name}!`, 'good');
                    setConfirm(null);
                  } else toast(r.reason ?? 'Cannot unlock yet', 'bad');
                }}
              >
                Unlock for {target.price} mol
              </Button>
            </>
          )
        }
      >
        {target && (
          <div className="grid gap-2">
            <p>
              A bigger space ({target.cols}×{target.rows} tiles) for your growing collection. It has its own layout and style; items in storage can go in either room.
            </p>
            <p className="text-sm">
              Requires <b>level {target.unlockLevel}</b> (you're level {level}) and <Moles amount={target.price} /> (you have <Moles amount={save.profile.moles} />).
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}

function StylePanel() {
  const save = useGame((g) => g.save);
  const room = save.lab.rooms[save.lab.current];
  const { equip } = useGame.getState();
  const slots: { slot: 'floor' | 'wall' | 'lighting'; label: string }[] = [
    { slot: 'floor', label: 'Floor' },
    { slot: 'wall', label: 'Walls' },
    { slot: 'lighting', label: 'Lighting' },
  ];
  return (
    <Card className="grid gap-4 p-3">
      {slots.map(({ slot, label }) => {
        const items = shopItems.filter((i): i is AppliedItem => i.kind === 'applied' && i.slot === slot);
        const owned = items.flatMap((i) => i.variants.filter((v) => ownsApplied(save, i, v.id)).map((v) => ({ i, v })));
        return (
          <div key={slot}>
            <div className="mb-1.5 text-sm font-bold">{label}</div>
            <div className="flex flex-wrap gap-1.5">
              {owned.map(({ i, v }) => {
                const active = room[slot].itemId === i.id && room[slot].variant === v.id;
                return (
                  <button
                    key={i.id + v.id}
                    title={`${i.name} – ${v.name}`}
                    aria-label={`${i.name} – ${v.name}`}
                    aria-pressed={active}
                    onClick={() => {
                      equip(slot, { itemId: i.id, variant: v.id });
                      play('place');
                    }}
                    className={`overflow-hidden rounded-xl border-2 transition ${active ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/40'}`}
                  >
                    <ItemPreview item={i} variant={v.id} size={48} />
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <p className="text-xs text-muted">
        More styles in the <Link to="/shop" className="font-semibold text-primary underline">Shop</Link> under Structure.
      </p>
    </Card>
  );
}

function RenameRoom({ open, onClose, roomId, current, fallback }: { open: boolean; onClose: () => void; roomId: string; current: string; fallback: string }) {
  const [name, setName] = useState(current);
  useEffect(() => {
    if (open) setName(current);
  }, [open, current]);
  const save = () => {
    useGame.getState().renameRoom(roomId, name);
    onClose();
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Name this room"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button icon="check" onClick={save}>
            Save
          </Button>
        </>
      }
    >
      <label className="block">
        <span className="label">Room name</span>
        <input className="input" maxLength={28} value={name} placeholder={fallback} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && save()} />
      </label>
      <p className="mt-2 text-sm text-muted">Leave it blank to use “{fallback}”. Ideas: The Mole Hole, Fizz HQ, Avogadro’s Den.</p>
    </Modal>
  );
}
