# Contributing to Lab Rat

This guide is for the project owner and for future Claude Code sessions. It explains how the code is laid out and exactly how to add each kind of content or feature.

**Golden rule:** content lives in data files (`src/content/`), logic lives in pure TypeScript (`src/engine/`), and components only render. If you find yourself typing a price, a question or a topic name inside a component, it belongs in `src/content/` instead.

Before you commit, run:

```bash
npm test && npm run typecheck
```

---

## Project map

```
src/
  content/            ← EDIT THESE to change the game
    topics.ts           topics (ids, names, colours, subtopics)
    economy.ts          every price/reward/level number + rooms
    achievements.ts     achievements (data only)
    banks/*.json        built-in question banks (files starting with "_" are ignored)
    shop/items.ts       shop catalogue
    shop/art/*.tsx      SVG art components for items
    shop/types.ts       ShopItem / Variant / ArtProps types
  engine/             ← pure logic, no React, unit-tested
    questions/          types, checkAnswer, formatChem, validate, csv
    srs/leitner.ts      spaced repetition
    economy/economy.ts  reward + level maths
    lab/grid.ts         placement, collisions, moving
    progress/stats.ts   stats for achievements, mastery, weakest topics
  modes/              ← game-mode plug-ins (one folder each) + registry.ts
  store/              ← save model (saveTypes.ts), defaults, migrations, zustand store (game.ts)
  components/         ← UI kit (ui/), QuestionView, RoomView (lab renderer), FeedbackLayer…
  screens/            ← top-level pages
  lib/                ← sound, events, question pool, PNG export, prompt builder
```

Design tokens (colours, light/dark) are in `src/styles/tokens.css`, and radii, shadows and fonts are in `tailwind.config.js`. Use the token colours (`bg-surface`, `text-muted`, `text-good`, `bg-primary`…) rather than raw hex values in components.

---

## 1. Adding a question bank

### Format

```jsonc
{
  "bankId": "organic-reactions",     // unique; letters, digits, - and _
  "name": "Organic – reaction types",
  "version": 1,
  "description": "Optional",
  "questions": [ /* question objects */ ]
}
```

Every question has these fields:

| field | required | notes |
| --- | --- | --- |
| `id` | ✓ | unique **within the bank**; letters, digits, `-`, `_` |
| `topic` | ✓ | topic id from `topics.ts` (topic *names* are also accepted and mapped) |
| `subtopic` | | free text; suggestions come from the topic's `subtopics` |
| `type` | ✓ | `mcq`, `multi`, `numeric`, `text`, `order`, `match` |
| `difficulty` | ✓ | `1` foundation, `2` standard, `3` challenge |
| `question` | ✓ | text; chemical notation is auto-formatted (see below) |
| `explanation` | recommended | shown after answering |
| `tags` | | array of strings; the tag `no-shuffle` keeps option order fixed |

The `answer` field depends on the type:

| type | fields |
| --- | --- |
| `mcq` | `options: string[]`, `answer: number` (0-based index) |
| `multi` | `options: string[]`, `answer: number[]` (all correct indices) |
| `numeric` | `answer: { value: number, tolerance?: number, unit?: string }`. Tolerance is absolute; default is 1% |
| `text` | `answer: string[]` (every accepted answer); optional `caseSensitive: true`. Comparison ignores spaces, case and sub/superscripts |
| `order` | `answer: string[]` in the **correct** order (the game shuffles them) |
| `match` | `answer: [left, right][]` correct pairs (the game shuffles the right side) |

See `src/content/banks/_template.json` for one example of each type.

**Chemical notation** (`src/engine/questions/formatChem.ts`): write `H2SO4`, `Fe^3+`, `SO4^2-`, `Na+`, `->`, `<=>`, `cm3`, `dm-3`, `mol-1`, `10^-3`. They display as H₂SO₄, Fe³⁺, SO₄²⁻, Na⁺, →, ⇌, cm³, dm⁻³, mol⁻¹, 10⁻³. Ordinary words are never changed.

**CSV format** (one question per row, header required):
`id,topic,subtopic,type,difficulty,question,options,answer,explanation,tags,tolerance,unit,caseSensitive`.
Lists use `|`. For `mcq` the answer is a letter (`B`), 1-based number or option text. For `multi` use `A|C`. For `match` write `left=right|left=right`. For `order` write the items in order in `answer`.

### Ways to add a bank

- **In the app (for you):** Question banks → Import (paste JSON or upload JSON/CSV). Imported banks live in the save.
- **Shipped with the game (for everyone):** drop `my-bank.json` into `src/content/banks/`. It's picked up automatically by `import.meta.glob` in `src/lib/questionPool.ts`. A test (`validate.test.ts`) checks that the sample and template banks are valid. Add your file to that test if you want CI to guard it.
- **Removing the sample bank:** disable it in the app, or delete `src/content/banks/sample.json`. If you delete it, update the two tests in `validate.test.ts` that reference it.

Question progress is keyed by `bankId/questionId`, so **don't rename ids** of questions people have already answered.

---

## 2. Adding a topic

Append to `src/content/topics.ts`:

```ts
{
  id: 'electrochemistry',            // what banks reference
  name: 'Electrochemistry',
  short: 'Electrochem',              // used in tight spaces
  symbol: 'Ec',                      // 1–2 letter "element tile" badge
  colour: '#b5651d',                 // mid-tone hex, readable in light & dark
  subtopics: ['Electrolysis', 'Cells', 'Electrochemical series'],
},
```

That's all. The topic picker, stats, mastery bars, bank manager counts, editor dropdown and bank-request prompt all read this list. Don't change an existing `id`, because saved stats are keyed by it.

---

## 3. Adding a shop item

1. **Art** (skip if reusing an existing component). Add a component to the right file in `src/content/shop/art/`:

   ```tsx
   export function Kettle({ w, h, c, anim }: ArtProps) { … }
   ```

   - `w`/`h` are the pixel size of the item's box (48 px per tile); `c` holds the chosen variant's colours; `anim` is false for reduced motion and static previews.
   - Style: use `OUT` (outline), `SW` (stroke width), `HI`/`LO` (highlight/shadow) and `shade()` from `kit.tsx` / `lib/color.ts`. Use rounded corners and a soft outline.
   - Furniture (benches, rugs, plants) is drawn **top-down** and can rotate. Small things (glassware, pets) are **front-view sprites** standing on a base line near `h - 6`, and may poke above their tile. Floor items that should be sprites must be added to the `STANDING` set in `components/lab/RoomView.tsx`.
   - Animate with the `<Anim>`, `<Move>` or `<Spin>` helpers (SVG SMIL). They switch off automatically when `anim` is false, and they're captured correctly in the PNG export.
   - Use `useSvgId()` for any `<pattern>`, `<linearGradient>` or `<clipPath>` id.

2. **Entry.** Add one object to `shopItems` in `src/content/shop/items.ts`:

   ```ts
   {
     id: 'kettle', name: 'Electric kettle', description: 'Tea is a chemical process.',
     category: 'fun', kind: 'placeable', layer: 'tabletop', size: [1, 1],
     rarity: 'uncommon', price: 90, Art: F.Kettle, animated: false, unlockLevel: 2,
     variants: [
       { id: 'white', name: 'White', colors: { body: '#eef0f2', light: '#4fd18b' } },
       { id: 'red',   name: 'Red',   colors: { body: '#d9534f', light: '#4fd18b' } },
     ],
   },
   ```

   - `kind: 'placeable'` items need a `layer`: `floor` (furniture), `rug` (under furniture), `tabletop` (must sit on a `surface: true` item such as a bench) or `wall`. `size` is `[w, h]` in tiles; for wall items `h` is how tall it hangs (1–2). Set `rotatable: true` for top-down furniture.
   - `kind: 'applied'` items have a `slot`: `floor`, `wall` or `lighting` (room style) or `coat`, `goggles` or `gloves` (avatar). A lighting variant's colours should include `tint` and `tintOpacity` for the room overlay.
   - `category` decides the shop tab; `rarity` is one of `common | uncommon | rare | epic | legendary`.

   - **Front-view furniture** (sofas, shelves, gadgets): set `view: 'front'`. These are drawn standing up, can be **flipped** (F key) instead of rotated, and may be taller than their tile.
   - **Surfaces:** `surface: true` lets bench-top items sit on it. For front-view tables and desks, set `surfaceLift` (px) so items sit on the visible top.

No other file needs changing.

### Adding a pet

Pets are shop items with a `pet` field: `{ sayings: string[], habitat: 'roam' | 'tank', speed?: number }`.

- **Roaming pets** (`kind: 'pet'`, `category: 'pets'`) wander the free floor tiles of the room they live in. Draw them in `src/content/shop/art/pets.tsx` as a ~48 px front/side sprite **facing right**, standing on `h - 6`. The lab mirrors them when they walk left and adds the walking bob, so the art only needs idle animation (blinks, tails). `speed` is tiles per second.
- **Tank pets** are normal `kind: 'placeable'`, `layer: 'tabletop'` items with `pet: { …, habitat: 'tank' }`.
- Players name pets when adopting. Tapping a pet shows a speech bubble with a random line from `sayings`, adds a pat (hearts at 3/10/25/50/100 pats, see `src/lib/pets.ts`), and the first pat each day pays `economy.dailyPatMoles`. Pets can't be sold. Roaming pets can move between rooms or rest at the "pet hotel" (`room: 'hotel'`).
- Name suggestions live in `PET_NAMES` in `src/lib/pets.ts`.

---

## 4. Adding an achievement

Append to `src/content/achievements.ts`:

```ts
{ id: 'night-owl', name: 'Night Owl', description: 'Log 10 focus sessions.', stat: 'focusSessions', gte: 10, reward: 75, icon: 'timer' },
```

`stat` must be a `StatKey` from `src/engine/progress/stats.ts`. To track something new, add a key to `StatKey` and compute it in `computeStats()`, recording the raw number in the save if needed (see section 6). `icon` is any name from `src/components/ui/Icon.tsx`. Achievements are checked automatically after every change to the save.

---

## 5. Adding a game mode

Modes are self-contained plug-ins. To add one called "Equation Balancer" (its stub already exists):

1. Create `src/modes/equation-balancer/EquationBalancerScreen.tsx` with a **default-exported** component. Wrap it in the shared frame:

   ```tsx
   import { ModeShell } from '../shared/ModeShell';
   import mode from './index';
   export default function EquationBalancerScreen() {
     return <ModeShell title={mode.name} icon={mode.icon} colour={mode.colour}>…</ModeShell>;
   }
   ```

2. In that folder's `index.ts`, set `status: 'ready'` and `component: lazy(() => import('./EquationBalancerScreen'))`.

3. For a brand-new mode (not a stub), make the folder and `index.ts` exporting a `GameMode` (see `src/modes/types.ts`), then add it to the array in `src/modes/registry.ts`. That array is the only shared file you touch; it controls the Play menu and the route `#/play/<id>`.

**Services a mode can use** (all from `useGame.getState()` in `src/store/game.ts`):

| need | call |
| --- | --- |
| the enabled questions | `useGame((g) => g.pool)` (each has `uid`, `topic`, …) |
| show a question with feedback | `<QuestionView question onAnswered onNext />` from `components/question/QuestionView` |
| record an answer (stats, mastery, adds mistakes to Daily Review) | `recordAnswer(q, correct, { source: 'quiz', streak })` |
| pay out Moles/XP (handles level-ups, coins and sound) | `grant({ moles, xp }, 'label')` |
| reward amounts | add numbers to `economy.ts` and a pure function to `engine/economy/economy.ts` (with a test) |
| sounds / toasts | `play('correct')` from `lib/sound`; `toast('…')` from `lib/events` |
| custom stats | `mutate((d) => { … })` (see section 6) |

Optional: `useBadge` on the `GameMode` is a React hook returning a short badge such as `"4 due"`.

---

## 6. Translations (English / Gaeilge)

The whole game is bilingual. There are three kinds of translated text:

| What | Where | Notes |
| --- | --- | --- |
| Interface text (buttons, menus, messages) | `src/i18n/en.ts` and `src/i18n/ga.ts` | `ga.ts` is typed as `Dict`, so the build fails if any Irish key is missing. Values are strings, or functions when they include numbers or names. |
| Game content (items, colours, topics, subtopics, pets' sayings, achievements, modes, rooms) | English in each data file; Irish in `src/content/translations.ts` keyed by id | A unit test (`src/i18n/i18n.test.ts`) fails if anything is missing an Irish entry. |
| Questions | Separate banks with `"language": "ga"` | `src/content/banks/sample-ga.json` is the Irish sample. Settings → *Question language* chooses which banks are used: same as app, English, Irish or both. |

**In components** use the hook: `const { t, c, lang } = useI18n();`, then `t.shop.buy`, `t.quiz.onlyN(3)`, `c.itemName(item)`, `c.topicName(topic)`. Never write user-visible English directly in a component.

**Irish counting:** use `count(n, 'ceist')` from `src/i18n/ga.ts`. It applies the right mutation: *ceist amháin*, *3 cheist*, *7 gceist*, *20 ceist*. Where a counted noun is awkward, use a label style instead ("Ceisteanna: 5").

**Answer checking ignores fadas,** so "eatanol" matches "eatánól". For text questions you only need one spelling of each accepted answer.

**Adding something new?** Add the English, then the Irish in `translations.ts` (content) or `ga.ts` (interface). Run `npm test` to confirm nothing is missing.

**Corrections from Irish speakers are very welcome.** Just edit the strings; no code changes are needed.

---

## 7. Changing the save format

The save shape is `SaveData` in `src/store/saveTypes.ts`; defaults are in `src/store/defaults.ts`.

- **Adding a field:** add it to the type and the default. Old saves get the default filled in automatically (`fillDefaults` in `migrations.ts`), so no migration is needed.
- **Renaming or restructuring:** bump `SAVE_VERSION` and add a step to `migrations` in `src/store/migrations.ts` keyed by the old version. Add a test in `src/store/game.test.ts`.

All writes go through `commit()` in `game.ts`, which applies the change, checks achievements and level-ups, emits feedback events and autosaves (debounced).

---

## 8. Economy and balancing

Every number is in `src/content/economy.ts`: starting Moles, per-answer rewards by difficulty, streak bonus, completion bands, focus Moles per minute, the tab-leave grace period, review rewards, sell refund, the level curve, level-up bonus and rooms (size, unlock level, price). Item prices sit with each item in `items.ts`. The tests in `engine/economy/economy.test.ts` read from the config, so they keep passing when you rebalance, as long as the rules still hold.

---

## Conventions

- TypeScript strict; no `any` outside migrations.
- Accessibility: every interactive element is a real `button`/`input`; icon-only buttons need `aria-label` (use `IconButton`). Feedback always pairs colour with an icon **and** text. Respect `anim`/reduced motion.
- Non-blocking feedback: emit events (`emit('reward', …)`) instead of awaiting animations.
- Keep `src/engine/` free of React and the DOM so it stays easy to test.
