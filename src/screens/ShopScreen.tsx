import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ownsApplied, useGame, useLevel } from '@/store/game';
import { shopItems } from '@/content/shop/items';
import { CATEGORIES, RARITIES, type Category, type ShopItem } from '@/content/shop/types';
import { ItemPreview } from '@/components/ItemPreview';
import { Avatar } from '@/components/Avatar';
import { Button, Card, Icon, Moles, PageHeader, RarityTag, Segmented } from '@/components/ui';
import { play } from '@/lib/sound';
import { toast } from '@/lib/events';

type Sort = 'price' | 'rarity';

export default function ShopScreen() {
  const [cat, setCat] = useState<Category>('equipment');
  const [sort, setSort] = useState<Sort>('price');
  const items = shopItems
    .filter((i) => i.category === cat)
    .sort((a, b) =>
      sort === 'price' ? a.price - b.price : RARITIES.findIndex((r) => r.id === a.rarity) - RARITIES.findIndex((r) => r.id === b.rarity) || a.price - b.price,
    );

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Shop"
        icon="bag"
        subtitle="Spend your Moles on kit, decor and style."
        actions={
          <Link to="/lab">
            <Button variant="secondary" icon="flask">
              Go to my lab
            </Button>
          </Link>
        }
      />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Shop categories">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={cat === c.id}
              onClick={() => setCat(c.id)}
              className={`rounded-xl px-4 py-2 text-left transition ${cat === c.id ? 'bg-primary text-primary-ink shadow-press' : 'bg-surface text-ink shadow-soft hover:bg-surface-2'}`}
            >
              <div className="font-bold">{c.label}</div>
              <div className={`text-xs ${cat === c.id ? 'opacity-85' : 'text-muted'}`}>{c.blurb}</div>
            </button>
          ))}
        </div>
        <Segmented size="sm" label="Sort" value={sort} onChange={setSort} options={[{ value: 'price', label: 'Price' }, { value: 'rarity', label: 'Rarity' }]} />
      </div>

      <div className={cat === 'avatar' ? 'grid gap-4 lg:grid-cols-[16rem_1fr]' : ''}>
        {cat === 'avatar' && (
          <Card className="flex h-fit flex-col items-center p-5 lg:sticky lg:top-20">
            <Avatar size={170} />
            <p className="mt-2 font-display text-lg">Your look</p>
            <p className="text-center text-sm text-muted">Buy a style, then tap it again to wear it.</p>
          </Card>
        )}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((it, i) => (
            <ItemCard key={it.id} item={it} i={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ItemCard({ item, i }: { item: ShopItem; i: number }) {
  const save = useGame((g) => g.save);
  const level = useLevel().level;
  const { buy, equip } = useGame.getState();
  const [variant, setVariant] = useState(item.variants[0].id);
  const [hover, setHover] = useState(false);
  const v = item.variants.find((x) => x.id === variant)!;
  const locked = !!item.unlockLevel && level < item.unlockLevel;
  const owns = item.kind === 'applied' ? ownsApplied(save, item, variant) : false;
  const ownedCount = item.kind === 'placeable' ? save.inventory.filter((o) => o.itemId === item.id).length : 0;
  const affordable = save.profile.moles >= item.price;

  let equipped = false;
  if (item.kind === 'applied') {
    const room = save.lab.rooms[save.lab.current];
    const ref = item.slot === 'floor' || item.slot === 'wall' || item.slot === 'lighting' ? room[item.slot] : save.avatar[item.slot];
    equipped = !!ref && ref.itemId === item.id && ref.variant === variant;
  }

  const onBuy = () => {
    const r = buy(item.id, variant);
    if (!r.ok) {
      play('error');
      toast(r.reason ?? 'Could not buy that', 'bad');
      return;
    }
    play('buy');
    if (item.kind === 'applied') {
      equip(item.slot, { itemId: item.id, variant });
      toast(`${item.name} (${v.name}) unlocked and applied!`, 'good');
    } else toast(`${item.name} added to storage. Place it in Decorate mode.`, 'good');
  };

  const firstColour = (c: Record<string, string>) => Object.values(c).find((x) => x.startsWith('#')) ?? '#ccc';
  const accentColour = (c: Record<string, string>) => Object.values(c).filter((x) => x.startsWith('#'))[1] ?? firstColour(c);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }} className="card flex flex-col overflow-hidden" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className="relative grid h-40 place-items-center bg-[radial-gradient(circle_at_50%_40%,rgb(var(--surface)),rgb(var(--surface-2)))]">
        <ItemPreview item={item} variant={variant} size={128} anim={hover && !!item.animated} />
        <div className="absolute left-3 top-3 flex gap-1">
          <RarityTag rarity={item.rarity} />
          {item.animated && (
            <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-bold text-muted shadow-sm" title="Animated">
              <Icon name="sparkles" size={12} className="inline" /> Animated
            </span>
          )}
        </div>
        {item.kind === 'placeable' && ownedCount > 0 && <span className="absolute right-3 top-3 chip">Owned ×{ownedCount}</span>}
        {locked && (
          <div className="absolute inset-0 grid place-items-center bg-surface/70 backdrop-blur-[1px]">
            <span className="flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-sm font-bold text-bg">
              <Icon name="lock" size={14} /> Unlocks at level {item.unlockLevel}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold leading-tight">{item.name}</h3>
          {item.kind === 'placeable' && (
            <span className="chip shrink-0" title="Size in tiles">
              {item.layer === 'wall' ? 'Wall' : item.layer === 'tabletop' ? 'Bench-top' : item.layer === 'rug' ? 'Rug' : `${item.size[0]}×${item.size[1]}`}
            </span>
          )}
        </div>
        <p className="mt-0.5 flex-1 text-sm text-muted">{item.description}</p>
        {item.variants.length > 1 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5" role="radiogroup" aria-label={`${item.name} colour`}>
            {item.variants.map((x) => (
              <button
                key={x.id}
                role="radio"
                aria-checked={variant === x.id}
                aria-label={x.name}
                title={x.name}
                onClick={() => setVariant(x.id)}
                className={`h-7 w-7 rounded-full border-2 transition ${variant === x.id ? 'scale-110 border-ink' : 'border-border hover:scale-105'}`}
                style={{ background: `linear-gradient(135deg, ${firstColour(x.colors)} 50%, ${accentColour(x.colors)} 50%)` }}
              />
            ))}
            <span className="ml-1 text-xs font-semibold text-muted">{v.name}</span>
          </div>
        )}
        <div className="mt-4 flex items-center justify-between gap-2">
          {item.price === 0 ? <span className="text-sm font-bold text-good">Free</span> : <Moles amount={item.price} size={20} className={affordable ? '' : 'text-bad'} />}
          {item.kind === 'applied' && owns ? (
            <Button
              size="sm"
              variant={equipped ? 'secondary' : 'primary'}
              icon={equipped ? 'check' : undefined}
              disabled={equipped}
              onClick={() => {
                equip(item.slot, { itemId: item.id, variant });
                play('place');
              }}
            >
              {equipped ? (item.category === 'avatar' ? 'Wearing' : 'Applied') : item.category === 'avatar' ? 'Wear' : 'Apply'}
            </Button>
          ) : (
            <Button size="sm" icon="bag" disabled={locked || !affordable} onClick={onBuy} silent>
              {affordable ? 'Buy' : 'Need more'}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
