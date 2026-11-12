# Lab Rat 🧪🐀

A browser game for revising **Irish Leaving Certificate Chemistry**. Answer questions and study to earn **Moles (mol)**, level up, and spend your Moles designing your own laboratory.

- Fully client-side: no account, no backend. Progress autosaves in the browser (IndexedDB) and can be exported or imported as JSON.
- Works offline as an installable PWA.
- Light and dark themes, keyboard-friendly, colour-blind-safe feedback, mute and reduced-motion settings.
- All art is drawn in code (SVG), and all content lives in data files.

## Quick start

Requires **Node 20+** (22 recommended).

```bash
npm install
npm run dev        # http://localhost:5173
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm test` | Unit tests (Vitest) |
| `npm run typecheck` | TypeScript check |
| `npm run build` | Production build into `dist/` (includes the service worker) |
| `npm run preview` | Serve the production build locally (http://localhost:4173) |

In dev builds the store is exposed in the console as `__labrat`. For example, `__labrat.getState().grant({ moles: 1000, xp: 500 })` gives you Moles and XP for testing.

## Deploying

The build is static and uses relative paths plus hash routing (`#/lab`), so it works from any sub-folder without server rewrites.

**GitHub Pages:** push to `main` with `.github/workflows/deploy.yml` in place. Then, once, go to *Settings → Pages → Source* and choose **GitHub Actions**. The workflow runs the tests, builds and publishes `dist/`.

**Netlify:** connect the repo; `netlify.toml` already sets `npm run build` → `dist`. You can also drag the `dist/` folder onto app.netlify.com/drop.

**Any static host:** run `npm run build` and upload the contents of `dist/`.

## What's in the box

| Area | Where |
| --- | --- |
| Game modes: Topic Quiz, Focus Timer, Daily Review, plus 5 "Coming soon" stubs | `src/modes/` (registered in `src/modes/registry.ts`) |
| Topics | `src/content/topics.ts` |
| Question banks (built-in) | `src/content/banks/*.json` (`sample.json` is the test bank; `_template.json` is the template) |
| Shop catalogue (85 items incl. 10 pets) and art | `src/content/shop/items.ts`, `src/content/shop/art/` |
| Economy: prices, rewards, levels, rooms | `src/content/economy.ts` |
| Achievements | `src/content/achievements.ts` |
| Pure game logic (tested) | `src/engine/` (answer checking, chem formatter, validation, CSV, Leitner boxes, economy, lab grid) |
| Save model, autosave, migrations | `src/store/` |
| Screens | `src/screens/` |

**Adding content or features:** see [CONTRIBUTING.md](CONTRIBUTING.md). It covers question banks, topics, shop items, achievements and game modes step by step.

## Using your own questions

1. Open **Question banks** in the app.
2. **Request a bank** tab: choose a topic, subtopic, number and difficulty, then copy the generated prompt into Claude.
3. **Import** tab: paste Claude's reply (code fences and chatter are ignored), or upload `.json`/`.csv`. Bad rows are listed with the row number and the reason; valid rows are imported.
4. You can also add and edit questions one by one with the form.
5. Turn off the **Sample questions** bank when you have your own.

Banks you import are stored in your save, so export your save to back them up. To ship a bank *with the game* for everyone, put the JSON file in `src/content/banks/`.
