/**
 * THE SHOP CATALOGUE. Adding an item = adding one entry here (plus an Art
 * component in ./art if it needs a new look). See CONTRIBUTING.md.
 *
 * Prices live here next to each item; global multipliers live in economy.ts.
 */
import type { PetInfo, ShopItem } from './types';
import * as S from './art/structure';
import * as E from './art/equipment';
import * as D from './art/decor';
import * as F from './art/fun';
import * as A from './art/avatar';
import * as U from './art/furniture';
import * as Z from './art/cozy';
import * as P from './art/pets';

export const shopItems: ShopItem[] = [
  /* ─────────────── STRUCTURE: floors ─────────────── */
  {
    id: 'floor-lino', name: 'Lino tiles', description: 'Wipe-clean school-lab classic.',
    category: 'structure', kind: 'applied', slot: 'floor', rarity: 'common', price: 0, Art: S.LinoFloor,
    variants: [
      { id: 'grey', name: 'Grey', colors: { base: '#dfe3e6' } },
      { id: 'mint', name: 'Mint', colors: { base: '#d3eee4' } },
      { id: 'sand', name: 'Sand', colors: { base: '#eee4cf' } },
    ],
  },
  {
    id: 'floor-checker', name: 'Checkerboard floor', description: 'Bold squares, retro diner energy.',
    category: 'structure', kind: 'applied', slot: 'floor', rarity: 'uncommon', price: 160, Art: S.CheckerFloor,
    variants: [
      { id: 'mono', name: 'Mono', colors: { a: '#f2f2f0', b: '#3c4250' } },
      { id: 'teal', name: 'Teal', colors: { a: '#eef7f5', b: '#5fb3a5' } },
      { id: 'cherry', name: 'Cherry', colors: { a: '#fbf1ef', b: '#d9707a' } },
    ],
  },
  {
    id: 'floor-wood', name: 'Wooden boards', description: 'Warm planks for a cosy study lab.',
    category: 'structure', kind: 'applied', slot: 'floor', rarity: 'uncommon', price: 220, Art: S.WoodFloor,
    variants: [
      { id: 'oak', name: 'Oak', colors: { base: '#d9b07c' } },
      { id: 'walnut', name: 'Walnut', colors: { base: '#9a6a48' } },
      { id: 'ash', name: 'Ash', colors: { base: '#e8d6bb' } },
    ],
  },
  {
    id: 'floor-hex', name: 'Benzene tiles', description: 'Hexagonal tiles. Delocalised style.',
    category: 'structure', kind: 'applied', slot: 'floor', rarity: 'rare', price: 420, Art: S.HexFloor,
    variants: [
      { id: 'cloud', name: 'Cloud', colors: { base: '#eef1f6', grout: '#c3cbd8' } },
      { id: 'lagoon', name: 'Lagoon', colors: { base: '#bfe5e7', grout: '#7fb7bd' } },
      { id: 'amber', name: 'Amber', colors: { base: '#f6dfae', grout: '#d1aa63' } },
    ],
  },

  /* ─────────────── STRUCTURE: walls ─────────────── */
  {
    id: 'wall-paint', name: 'Painted wall', description: 'A fresh coat of paint.',
    category: 'structure', kind: 'applied', slot: 'wall', rarity: 'common', price: 0, Art: S.PaintedWall,
    variants: [
      { id: 'white', name: 'Chalk', colors: { base: '#f3f1ea' } },
      { id: 'sage', name: 'Sage', colors: { base: '#cfe0cc' } },
      { id: 'sky', name: 'Sky', colors: { base: '#cfe2f3' } },
      { id: 'peach', name: 'Peach', colors: { base: '#f6d7c3' } },
      { id: 'lilac', name: 'Lilac', colors: { base: '#ddd3ef' } },
    ],
  },
  {
    id: 'wall-tile', name: 'Metro tiles', description: 'Glossy brick-bond tiles.',
    category: 'structure', kind: 'applied', slot: 'wall', rarity: 'uncommon', price: 180, Art: S.TiledWall,
    variants: [
      { id: 'white', name: 'White', colors: { base: '#f7f8f8', grout: '#cfd5d9' } },
      { id: 'green', name: 'Bottle green', colors: { base: '#5d9c7f', grout: '#3f6f59' } },
      { id: 'navy', name: 'Navy', colors: { base: '#3f5a86', grout: '#2b3e5e' } },
    ],
  },
  {
    id: 'wall-brick', name: 'Exposed brick', description: 'Converted-warehouse chic.',
    category: 'structure', kind: 'applied', slot: 'wall', rarity: 'rare', price: 340, Art: S.BrickWall,
    variants: [
      { id: 'red', name: 'Red', colors: { base: '#c06a52', mortar: '#e3d4c3' } },
      { id: 'white', name: 'Whitewashed', colors: { base: '#ece7e1', mortar: '#cfc6bb' } },
    ],
  },

  /* ─────────────── STRUCTURE: lighting ─────────────── */
  {
    id: 'light-fluoro', name: 'Fluorescent tubes', description: 'Standard issue. Hums slightly.',
    category: 'structure', kind: 'applied', slot: 'lighting', rarity: 'common', price: 0, Art: S.FluorescentLights,
    variants: [{ id: 'cool', name: 'Cool white', colors: { glow: '#f4fbff', tint: '#e8f4ff', tintOpacity: '0.04' } }],
  },
  {
    id: 'light-pendant', name: 'Pendant lamps', description: 'Warm pools of light.',
    category: 'structure', kind: 'applied', slot: 'lighting', rarity: 'uncommon', price: 200, Art: S.PendantLights,
    variants: [
      { id: 'brass', name: 'Brass', colors: { glow: '#ffe2a6', shade: '#c9a24a', tint: '#ffcc66', tintOpacity: '0.08' } },
      { id: 'black', name: 'Black', colors: { glow: '#ffe9bf', shade: '#30343c', tint: '#ffd27a', tintOpacity: '0.07' } },
    ],
  },
  {
    id: 'light-neon', name: 'Neon strip', description: 'After-hours glow. Animated.',
    category: 'structure', kind: 'applied', slot: 'lighting', rarity: 'epic', price: 600, Art: S.NeonStrip, animated: true, unlockLevel: 4,
    variants: [
      { id: 'pink', name: 'Pink', colors: { glow: '#ff5fb1', tint: '#ff5fb1', tintOpacity: '0.08' } },
      { id: 'cyan', name: 'Cyan', colors: { glow: '#3ee6ff', tint: '#3ee6ff', tintOpacity: '0.08' } },
      { id: 'lime', name: 'Lime', colors: { glow: '#a6ff4d', tint: '#a6ff4d', tintOpacity: '0.07' } },
    ],
  },

  /* ─────────────── EQUIPMENT ─────────────── */
  {
    id: 'bench', name: 'Lab bench', description: 'Your trusty workspace. Glassware can sit on it.',
    category: 'equipment', kind: 'placeable', layer: 'floor', size: [2, 1], surface: true, rotatable: true,
    rarity: 'common', price: 60, Art: E.LabBench,
    variants: [
      { id: 'grey', name: 'Grey resin', colors: { top: '#8d99a6', tap: '#e2b43c' } },
      { id: 'oak', name: 'Oak', colors: { top: '#c99b65', tap: '#5a6570' } },
      { id: 'white', name: 'White', colors: { top: '#eef0f2', tap: '#3b82c4' } },
      { id: 'black', name: 'Black epoxy', colors: { top: '#3a3f4a', tap: '#e2b43c' } },
    ],
  },
  {
    id: 'island', name: 'Island bench', description: 'A big shared bench with gas taps down the middle.',
    category: 'equipment', kind: 'placeable', layer: 'floor', size: [2, 2], surface: true, rotatable: true,
    rarity: 'rare', price: 260, Art: E.IslandBench,
    variants: [
      { id: 'grey', name: 'Grey resin', colors: { top: '#8d99a6', tap: '#e2b43c' } },
      { id: 'teal', name: 'Teal', colors: { top: '#4f9f95', tap: '#f2f2f2' } },
      { id: 'black', name: 'Black epoxy', colors: { top: '#3a3f4a', tap: '#e2b43c' } },
    ],
  },
  {
    id: 'fume-hood', name: 'Fume hood', description: 'For anything that smells like a swimming pool.',
    category: 'equipment', kind: 'placeable', layer: 'floor', size: [2, 1], rotatable: true,
    rarity: 'uncommon', price: 180, Art: E.FumeHood,
    variants: [
      { id: 'white', name: 'White', colors: { body: '#eceff1', light: '#4fd18b' } },
      { id: 'steel', name: 'Steel', colors: { body: '#b4bec8', light: '#4fd18b' } },
    ],
  },
  {
    id: 'sink', name: 'Lab sink', description: 'Wash up, then wash up again.',
    category: 'equipment', kind: 'placeable', layer: 'floor', size: [1, 1], rotatable: true,
    rarity: 'common', price: 70, Art: E.Sink,
    variants: [
      { id: 'grey', name: 'Grey', colors: { top: '#8d99a6' } },
      { id: 'white', name: 'White', colors: { top: '#eef0f2' } },
    ],
  },
  {
    id: 'cabinet', name: 'Reagent cabinet', description: 'Rows of colourful reagent bottles.',
    category: 'equipment', kind: 'placeable', layer: 'floor', size: [2, 1], rotatable: true,
    rarity: 'uncommon', price: 140, Art: E.ReagentCabinet,
    variants: [
      { id: 'wood', name: 'Wood', colors: { body: '#b98a5e' } },
      { id: 'white', name: 'White', colors: { body: '#e7eaee', seed: '1' } },
    ],
  },
  {
    id: 'stool', name: 'Lab stool', description: 'Spins if nobody is looking.',
    category: 'equipment', kind: 'placeable', layer: 'floor', size: [1, 1], rotatable: false,
    rarity: 'common', price: 25, Art: E.Stool,
    variants: [
      { id: 'red', name: 'Red', colors: { seat: '#d9534f' } },
      { id: 'blue', name: 'Blue', colors: { seat: '#3b82c4' } },
      { id: 'yellow', name: 'Yellow', colors: { seat: '#e9b73a' } },
      { id: 'black', name: 'Black', colors: { seat: '#3a3f4a' } },
    ],
  },
  {
    id: 'extinguisher', name: 'Fire extinguisher', description: 'Safety first. Always.',
    category: 'equipment', kind: 'placeable', layer: 'floor', size: [1, 1], view: 'front',
    rarity: 'common', price: 30, Art: E.FireExtinguisher,
    variants: [
      { id: 'water', name: 'Water (red)', colors: { body: '#d63c3c', band: '#d63c3c' } },
      { id: 'co2', name: 'CO₂ (black band)', colors: { body: '#d63c3c', band: '#2b2b2b' } },
      { id: 'foam', name: 'Foam (cream band)', colors: { body: '#d63c3c', band: '#f3e2b3' } },
    ],
  },
  {
    id: 'bunsen', name: 'Bunsen burner', description: 'Blue flame for heating, yellow for safety. Animated.',
    category: 'equipment', kind: 'placeable', layer: 'tabletop', size: [1, 1], animated: true,
    rarity: 'common', price: 45, Art: E.BunsenBurner,
    variants: [
      { id: 'blue', name: 'Roaring blue', colors: { outer: '#6aa8ff', inner: '#2f5fe0' } },
      { id: 'yellow', name: 'Safety flame', colors: { outer: '#ffcf4d', inner: '#ff8a2a' } },
    ],
  },
  {
    id: 'beakers', name: 'Beaker set', description: 'Three beakers, three solutions.',
    category: 'equipment', kind: 'placeable', layer: 'tabletop', size: [1, 1],
    rarity: 'common', price: 35, Art: E.BeakerSet,
    variants: [
      { id: 'indicator', name: 'Indicators', colors: { a: '#e8668a', b: '#f2c94c', c: '#56b37f' } },
      { id: 'copper', name: 'Copper salts', colors: { a: '#3c8fd6', b: '#7fc6e8', c: '#4fb3a1' } },
    ],
  },
  {
    id: 'conical', name: 'Conical flask', description: 'Swirl, don’t shake.',
    category: 'equipment', kind: 'placeable', layer: 'tabletop', size: [1, 1],
    rarity: 'common', price: 30, Art: E.ConicalFlask,
    variants: [
      { id: 'pink', name: 'Phenolphthalein pink', colors: { liquid: '#f08bb4' } },
      { id: 'orange', name: 'Methyl orange', colors: { liquid: '#f29a3c' } },
      { id: 'clear', name: 'Clear', colors: { liquid: '#d6ecf5' } },
    ],
  },
  {
    id: 'test-tubes', name: 'Test tube rack', description: 'Four tubes of mystery.',
    category: 'equipment', kind: 'placeable', layer: 'tabletop', size: [1, 1],
    rarity: 'common', price: 35, Art: E.TestTubeRack,
    variants: [
      { id: 'wood', name: 'Wood', colors: { rack: '#c99b65', a: '#e85d5d', b: '#4fb286', c: '#4a90d9', d: '#f2b134' } },
      { id: 'white', name: 'White', colors: { rack: '#eef0f2', a: '#9b6cd1', b: '#5dc1c9', c: '#e8875d', d: '#d95d9b' } },
    ],
  },
  {
    id: 'burette', name: 'Burette & stand', description: 'For titrations accurate to 0.05 cm³.',
    category: 'equipment', kind: 'placeable', layer: 'tabletop', size: [1, 1],
    rarity: 'uncommon', price: 90, Art: E.BuretteStand,
    variants: [
      { id: 'clear', name: 'Clear titrant', colors: { base: '#5a6570', liquid: '#d6ecf5' } },
      { id: 'purple', name: 'Permanganate', colors: { base: '#5a6570', liquid: '#8e3fa8' } },
    ],
  },
  {
    id: 'microscope', name: 'Microscope', description: 'Get a closer look at things.',
    category: 'equipment', kind: 'placeable', layer: 'tabletop', size: [1, 1],
    rarity: 'rare', price: 240, Art: E.Microscope,
    variants: [
      { id: 'white', name: 'White', colors: { body: '#eef0f2', accent: '#3b82c4' } },
      { id: 'black', name: 'Black', colors: { body: '#3a3f4a', accent: '#e9b73a' } },
    ],
  },

  /* ─────────────── DECOR ─────────────── */
  {
    id: 'poster-pt', name: 'Periodic table poster', description: 'Every lab needs one.',
    category: 'decor', kind: 'placeable', layer: 'wall', size: [3, 2],
    rarity: 'common', price: 50, Art: D.PeriodicTablePoster,
    variants: [
      { id: 'classic', name: 'Classic', colors: { frame: '#3a3f4a', paper: '#fdfcf8', s: '#f28b82', d: '#8ab4f8', p: '#fdd663', f: '#c58af9', noble: '#81c995' } },
      { id: 'pastel', name: 'Pastel', colors: { frame: '#c99b65', paper: '#fffaf2', s: '#f6c1c1', d: '#c8dbf6', p: '#f8e7a8', f: '#e0cdf6', noble: '#c6e8cc' } },
    ],
  },
  {
    id: 'poster-safety', name: 'Safety poster', description: 'A gentle reminder.',
    category: 'decor', kind: 'placeable', layer: 'wall', size: [1, 1],
    rarity: 'common', price: 25, Art: D.SafetyPoster,
    variants: [
      { id: 'blue', name: 'Blue', colors: { frame: '#ffffff', paper: '#fdfcf8', band: '#2f6fb3' } },
      { id: 'green', name: 'Green', colors: { frame: '#ffffff', paper: '#fdfcf8', band: '#2e8b57' } },
    ],
  },
  {
    id: 'poster-molecule', name: 'Benzene poster', description: 'C₆H₆, beautifully drawn.',
    category: 'decor', kind: 'placeable', layer: 'wall', size: [1, 1],
    rarity: 'uncommon', price: 70, Art: D.MoleculePoster,
    variants: [
      { id: 'dark', name: 'Dark carbon', colors: { frame: '#3a3f4a', paper: '#fdfcf8', atom: '#4b5563' } },
      { id: 'teal', name: 'Teal', colors: { frame: '#0f766e', paper: '#effaf8', atom: '#14b8a6' } },
    ],
  },
  {
    id: 'whiteboard', name: 'Whiteboard', description: 'Already covered in equations.',
    category: 'decor', kind: 'placeable', layer: 'wall', size: [3, 2],
    rarity: 'uncommon', price: 120, Art: D.Whiteboard,
    variants: [
      { id: 'silver', name: 'Silver', colors: { frame: '#c3cad2', ink1: '#2f5fe0', ink2: '#d63c3c' } },
      { id: 'black', name: 'Black', colors: { frame: '#3a3f4a', ink1: '#1d8a5a', ink2: '#7b3fd6' } },
    ],
  },
  {
    id: 'clock', name: 'Wall clock', description: 'Shows the real time. Animated.',
    category: 'decor', kind: 'placeable', layer: 'wall', size: [1, 1], animated: true,
    rarity: 'common', price: 40, Art: D.WallClock,
    variants: [
      { id: 'black', name: 'Black', colors: { rim: '#2f343c', hand: '#d63c3c' } },
      { id: 'teal', name: 'Teal', colors: { rim: '#0f766e', hand: '#e9b73a' } },
      { id: 'red', name: 'Red', colors: { rim: '#c0392b', hand: '#2f343c' } },
    ],
  },
  {
    id: 'window', name: 'Window', description: 'A view of passing clouds. Animated.',
    category: 'decor', kind: 'placeable', layer: 'wall', size: [2, 2], animated: true,
    rarity: 'uncommon', price: 150, Art: D.LabWindow,
    variants: [
      { id: 'day', name: 'Daytime', colors: { frame: '#f2f2f0', skyTop: '#7ec3f0', skyBottom: '#cfeafc', sun: '#ffd85a', hills: '#7cbf6e' } },
      { id: 'sunset', name: 'Sunset', colors: { frame: '#f2f2f0', skyTop: '#f08a6a', skyBottom: '#ffd29a', sun: '#fff1b8', hills: '#5b7f63' } },
      { id: 'night', name: 'Night', colors: { frame: '#3a3f4a', skyTop: '#1b2340', skyBottom: '#3b4a7a', sun: '#f4f1d0', hills: '#24344a' } },
    ],
  },
  {
    id: 'plant', name: 'Potted plant', description: 'Photosynthesis in action.',
    category: 'decor', kind: 'placeable', layer: 'floor', size: [1, 1], rotatable: false,
    rarity: 'common', price: 40, Art: D.PottedPlant,
    variants: [
      { id: 'terracotta', name: 'Terracotta', colors: { pot: '#c96f4a', leaf: '#4c9a3a' } },
      { id: 'white', name: 'White pot', colors: { pot: '#eef0f2', leaf: '#3f8f5a' } },
      { id: 'blue', name: 'Blue pot', colors: { pot: '#3b82c4', leaf: '#5aa846' } },
    ],
  },
  {
    id: 'monstera', name: 'Monstera', description: 'Big leaves, big personality.',
    category: 'decor', kind: 'placeable', layer: 'floor', size: [1, 1], rotatable: true,
    rarity: 'uncommon', price: 110, Art: D.Monstera,
    variants: [
      { id: 'green', name: 'Deep green', colors: { pot: '#e7e1d6', leaf: '#2f7d4a' } },
      { id: 'variegated', name: 'Variegated', colors: { pot: '#3a3f4a', leaf: '#6fae6a' } },
    ],
  },
  {
    id: 'cactus', name: 'Desk cactus', description: 'Low maintenance lab buddy.',
    category: 'decor', kind: 'placeable', layer: 'tabletop', size: [1, 1],
    rarity: 'common', price: 30, Art: D.DeskCactus,
    variants: [
      { id: 'pink', name: 'Pink bloom', colors: { pot: '#e9b88f', cactus: '#5aa860', flower: '#f27ba5' } },
      { id: 'yellow', name: 'Yellow bloom', colors: { pot: '#8fb8e9', cactus: '#4e9a5a', flower: '#f6d04d' } },
    ],
  },
  {
    id: 'rug', name: 'Lab rug', description: 'Hexagon motif. Furniture can stand on it.',
    category: 'decor', kind: 'placeable', layer: 'rug', size: [3, 2], rotatable: true,
    rarity: 'uncommon', price: 120, Art: D.Rug,
    variants: [
      { id: 'navy', name: 'Navy', colors: { base: '#3f5a86', trim: '#e9c46a' } },
      { id: 'terracotta', name: 'Terracotta', colors: { base: '#c86b4f', trim: '#f6e7c8' } },
      { id: 'sage', name: 'Sage', colors: { base: '#8fb59a', trim: '#f4f1e8' } },
    ],
  },

  /* ─────────────── FUN ─────────────── */
  {
    id: 'bubbling-flask', name: 'Bubbling flask', description: 'It just keeps bubbling. Animated.',
    category: 'fun', kind: 'placeable', layer: 'tabletop', size: [1, 1], animated: true,
    rarity: 'rare', price: 220, Art: F.BubblingFlask,
    variants: [
      { id: 'green', name: 'Toxic green', colors: { liquid: '#5fd35f' } },
      { id: 'purple', name: 'Potion purple', colors: { liquid: '#a35fe0' } },
      { id: 'blue', name: 'Copper blue', colors: { liquid: '#3c9be0' } },
    ],
  },
  {
    id: 'lava-lamp', name: 'Lava lamp', description: 'Density and convection, groovily. Animated.',
    category: 'fun', kind: 'placeable', layer: 'tabletop', size: [1, 1], animated: true,
    rarity: 'epic', price: 380, Art: F.LavaLamp, unlockLevel: 3,
    variants: [
      { id: 'sunset', name: 'Sunset', colors: { liquid: '#ffe08a', blob: '#ff6b3d', metal: '#b9c1c9' } },
      { id: 'ocean', name: 'Ocean', colors: { liquid: '#a8e6ff', blob: '#2f6fe0', metal: '#3a3f4a' } },
      { id: 'berry', name: 'Berry', colors: { liquid: '#ffd1ea', blob: '#c2187a', metal: '#b9c1c9' } },
    ],
  },
  {
    id: 'neon-sign', name: 'Neon sign', description: 'Light up your wall. Animated.',
    category: 'fun', kind: 'placeable', layer: 'wall', size: [2, 1], animated: true,
    rarity: 'epic', price: 450, Art: F.NeonSign, unlockLevel: 4,
    variants: [
      { id: 'pink', name: 'Pink H₂O', colors: { tube: '#ff5fb1', text: 'H₂O' } },
      { id: 'cyan', name: 'Cyan NaCl', colors: { tube: '#3ee6ff', text: 'NaCl' } },
      { id: 'lime', name: 'Lime mol', colors: { tube: '#a6ff4d', text: 'mol' } },
    ],
  },
  {
    id: 'tesla-coil', name: 'Tesla coil', description: 'Strictly decorative. Probably. Animated.',
    category: 'fun', kind: 'placeable', layer: 'floor', size: [1, 1], view: 'front', animated: true,
    rarity: 'legendary', price: 1200, Art: F.TeslaCoil, unlockLevel: 8,
    variants: [
      { id: 'violet', name: 'Violet arcs', colors: { coil: '#c27c3a', spark: '#b98cff' } },
      { id: 'blue', name: 'Blue arcs', colors: { coil: '#c27c3a', spark: '#6fd3ff' } },
    ],
  },

  /* ─────────────── STRUCTURE: extra styles ─────────────── */
  {
    id: 'wall-stripes', name: 'Striped wallpaper', description: 'Wallpaper above, panelling below. Very cosy.',
    category: 'structure', kind: 'applied', slot: 'wall', rarity: 'uncommon', price: 200, Art: S.StripedWall,
    variants: [
      { id: 'mint', name: 'Mint', colors: { a: '#eaf6f1', b: '#a9d8c4' } },
      { id: 'rose', name: 'Rose', colors: { a: '#fbeff1', b: '#eab3bd' } },
      { id: 'butter', name: 'Butter', colors: { a: '#fdf7e3', b: '#ecd27e' } },
      { id: 'navy', name: 'Navy', colors: { a: '#e9eef7', b: '#5b7099' } },
    ],
  },
  {
    id: 'wall-starry', name: 'Starry night wallpaper', description: 'Study under the stars. Animated.',
    category: 'structure', kind: 'applied', slot: 'wall', rarity: 'epic', price: 550, Art: S.StarryWall, animated: true, unlockLevel: 3,
    variants: [
      { id: 'midnight', name: 'Midnight', colors: { top: '#141c3a', bottom: '#2d3d74', star: '#fff6c8' } },
      { id: 'aurora', name: 'Aurora', colors: { top: '#0f2a33', bottom: '#2b6b62', star: '#c8fff1' } },
    ],
  },
  {
    id: 'floor-carpet', name: 'Soft carpet', description: 'Warm underfoot.',
    category: 'structure', kind: 'applied', slot: 'floor', rarity: 'common', price: 120, Art: S.CarpetFloor,
    variants: [
      { id: 'oat', name: 'Oatmeal', colors: { base: '#e6dccb' } },
      { id: 'sage', name: 'Sage', colors: { base: '#bcd0b8' } },
      { id: 'blush', name: 'Blush', colors: { base: '#efcfcf' } },
      { id: 'slate', name: 'Slate', colors: { base: '#8e98a8' } },
    ],
  },

  /* ─────────────── FURNITURE ─────────────── */
  {
    id: 'beanbag', name: 'Beanbag', description: 'Sink in and revise. Or nap.',
    category: 'furniture', kind: 'placeable', layer: 'floor', size: [1, 1], view: 'front',
    rarity: 'common', price: 80, Art: U.Beanbag,
    variants: [
      { id: 'cherry', name: 'Cherry', colors: { base: '#e0645c' } },
      { id: 'teal', name: 'Teal', colors: { base: '#3fa79a' } },
      { id: 'mustard', name: 'Mustard', colors: { base: '#e3b23c' } },
      { id: 'lilac', name: 'Lilac', colors: { base: '#b59ae0' } },
    ],
  },
  {
    id: 'sofa', name: 'Comfy sofa', description: 'Room for you, a friend and a pet.',
    category: 'furniture', kind: 'placeable', layer: 'floor', size: [2, 1], view: 'front',
    rarity: 'uncommon', price: 240, Art: U.Sofa,
    variants: [
      { id: 'teal', name: 'Teal velvet', colors: { base: '#2f8f87', cushion: '#f2c14e' } },
      { id: 'mustard', name: 'Mustard', colors: { base: '#d9a63a', cushion: '#e8e2d4' } },
      { id: 'pink', name: 'Bubblegum', colors: { base: '#e894b4', cushion: '#fff2b3' } },
      { id: 'navy', name: 'Navy', colors: { base: '#3f5a86', cushion: '#e8875d' } },
    ],
  },
  {
    id: 'armchair', name: 'Armchair', description: 'A thinking chair for tricky calculations.',
    category: 'furniture', kind: 'placeable', layer: 'floor', size: [1, 1], view: 'front',
    rarity: 'uncommon', price: 150, Art: U.Armchair,
    variants: [
      { id: 'green', name: 'Forest', colors: { base: '#4f8a5b' } },
      { id: 'rust', name: 'Rust', colors: { base: '#c2673f' } },
      { id: 'grey', name: 'Grey', colors: { base: '#8d96a3' } },
    ],
  },
  {
    id: 'coffee-table', name: 'Coffee table', description: 'Bench-top items can go on it.',
    category: 'furniture', kind: 'placeable', layer: 'floor', size: [1, 1], view: 'front', surface: true, surfaceLift: 20,
    rarity: 'common', price: 70, Art: U.CoffeeTable,
    variants: [
      { id: 'oak', name: 'Oak', colors: { wood: '#c99b65' } },
      { id: 'walnut', name: 'Walnut', colors: { wood: '#7f5539' } },
      { id: 'white', name: 'White', colors: { wood: '#eceae4' } },
    ],
  },
  {
    id: 'desk', name: 'Study desk', description: 'With drawers for your notes. Bench-top items can go on it.',
    category: 'furniture', kind: 'placeable', layer: 'floor', size: [2, 1], view: 'front', surface: true, surfaceLift: 27,
    rarity: 'uncommon', price: 160, Art: U.StudyDesk,
    variants: [
      { id: 'oak', name: 'Oak', colors: { wood: '#c99b65', knob: '#3a3f4a' } },
      { id: 'white', name: 'White', colors: { wood: '#eceae4', knob: '#e3b23c' } },
      { id: 'mint', name: 'Mint', colors: { wood: '#a8d8c4', knob: '#3a3f4a' } },
    ],
  },
  {
    id: 'bookshelf', name: 'Bookshelf', description: 'Crammed with textbooks and paperbacks.',
    category: 'furniture', kind: 'placeable', layer: 'floor', size: [2, 1], view: 'front',
    rarity: 'uncommon', price: 180, Art: U.Bookshelf,
    variants: [
      { id: 'oak', name: 'Oak', colors: { wood: '#c99b65' } },
      { id: 'walnut', name: 'Walnut', colors: { wood: '#7f5539' } },
      { id: 'teal', name: 'Teal', colors: { wood: '#3f8f88' } },
    ],
  },
  {
    id: 'floor-lamp', name: 'Floor lamp', description: 'A warm glow for late-night study.',
    category: 'furniture', kind: 'placeable', layer: 'floor', size: [1, 1], view: 'front',
    rarity: 'common', price: 90, Art: U.FloorLamp,
    variants: [
      { id: 'cream', name: 'Cream', colors: { shade: '#f3ead2', metal: '#3a3f4a', glow: '#ffe2a6' } },
      { id: 'coral', name: 'Coral', colors: { shade: '#f2907a', metal: '#c9a24a', glow: '#ffd2b8' } },
      { id: 'sage', name: 'Sage', colors: { shade: '#a9c7a0', metal: '#3a3f4a', glow: '#f1ffd6' } },
    ],
  },
  {
    id: 'tall-cactus', name: 'Tall cactus', description: 'Prickly, but a good listener.',
    category: 'furniture', kind: 'placeable', layer: 'floor', size: [1, 1], view: 'front',
    rarity: 'common', price: 90, Art: U.TallCactus,
    variants: [
      { id: 'terracotta', name: 'Terracotta', colors: { pot: '#c96f4a', cactus: '#4e9a5a', flower: '#f27ba5' } },
      { id: 'white', name: 'White pot', colors: { pot: '#eef0f2', cactus: '#5aa860', flower: '#f6d04d' } },
    ],
  },
  {
    id: 'round-rug', name: 'Round rug', description: 'Concentric circles, like electron shells.',
    category: 'furniture', kind: 'placeable', layer: 'rug', size: [2, 2],
    rarity: 'common', price: 100, Art: U.RoundRug,
    variants: [
      { id: 'ocean', name: 'Ocean', colors: { a: '#3f78a8', b: '#9fcbe8' } },
      { id: 'sunset', name: 'Sunset', colors: { a: '#e07a5f', b: '#f2cc8f' } },
      { id: 'forest', name: 'Forest', colors: { a: '#4f7d5b', b: '#b8d8a8' } },
      { id: 'berry', name: 'Berry', colors: { a: '#8e4b88', b: '#e7b6e0' } },
    ],
  },

  /* ─────────────── DECOR: cosy extras ─────────────── */
  {
    id: 'string-lights', name: 'String lights', description: 'Twinkly fairy lights. Animated.',
    category: 'decor', kind: 'placeable', layer: 'wall', size: [3, 1], animated: true,
    rarity: 'uncommon', price: 130, Art: Z.StringLights,
    variants: [
      { id: 'rainbow', name: 'Rainbow', colors: { a: '#ff6b6b', b: '#ffd93d', c: '#6bcb77', d: '#4d96ff' } },
      { id: 'warm', name: 'Warm white', colors: { a: '#ffe9b0', b: '#ffd27a', c: '#fff4d6', d: '#ffc35a' } },
      { id: 'pastel', name: 'Pastel', colors: { a: '#ffc8dd', b: '#bde0fe', c: '#cdeac0', d: '#fff1a8' } },
    ],
  },
  {
    id: 'trophy-shelf', name: 'Trophy shelf', description: 'Show off your wins.',
    category: 'decor', kind: 'placeable', layer: 'wall', size: [2, 1],
    rarity: 'uncommon', price: 140, Art: Z.TrophyShelf,
    variants: [
      { id: 'oak', name: 'Oak', colors: { wood: '#c99b65', ribbon: '#3b82c4' } },
      { id: 'white', name: 'White', colors: { wood: '#eceae4', ribbon: '#d9534f' } },
    ],
  },
  {
    id: 'mole-portrait', name: 'Portrait of a Mole', description: 'A very distinguished ancestor.',
    category: 'decor', kind: 'placeable', layer: 'wall', size: [1, 1],
    rarity: 'rare', price: 160, Art: Z.MolePortrait,
    variants: [
      { id: 'gold', name: 'Gilded', colors: { frame: '#c9a24a', bg: '#3f5a86', tie: '#d9534f' } },
      { id: 'dark', name: 'Ebony', colors: { frame: '#3a3f4a', bg: '#a8d8c4', tie: '#e3b23c' } },
    ],
  },
  {
    id: 'corkboard', name: 'Cork board', description: 'Sticky notes and revision reminders.',
    category: 'decor', kind: 'placeable', layer: 'wall', size: [2, 1],
    rarity: 'common', price: 60, Art: Z.Corkboard,
    variants: [{ id: 'notes', name: 'Sticky notes', colors: { a: '#fff59d', b: '#ffcc80', c: '#a5d6a7' } }],
  },
  {
    id: 'bunting', name: 'Bunting', description: 'Every day is a celebration. Animated.',
    category: 'decor', kind: 'placeable', layer: 'wall', size: [3, 1], animated: true,
    rarity: 'common', price: 60, Art: Z.Bunting,
    variants: [
      { id: 'party', name: 'Party', colors: { a: '#ef476f', b: '#ffd166', c: '#06d6a0' } },
      { id: 'pastel', name: 'Pastel', colors: { a: '#ffc8dd', b: '#bde0fe', c: '#cdeac0' } },
      { id: 'green', name: 'Green & gold', colors: { a: '#169b62', b: '#ffffff', c: '#ff883e' } },
    ],
  },
  {
    id: 'hanging-plant', name: 'Hanging plant', description: 'Trailing leaves that sway. Animated.',
    category: 'decor', kind: 'placeable', layer: 'wall', size: [1, 1], animated: true,
    rarity: 'uncommon', price: 80, Art: Z.HangingPlant,
    variants: [
      { id: 'terracotta', name: 'Terracotta', colors: { pot: '#c96f4a', leaf: '#4c9a3a' } },
      { id: 'white', name: 'White', colors: { pot: '#eef0f2', leaf: '#5aa860' } },
    ],
  },
  {
    id: 'globe', name: 'Globe', description: 'Spins slowly. Animated.',
    category: 'decor', kind: 'placeable', layer: 'tabletop', size: [1, 1], animated: true,
    rarity: 'uncommon', price: 70, Art: Z.Globe,
    variants: [
      { id: 'classic', name: 'Classic', colors: { sea: '#5fa8d3', land: '#7cbf6e', stand: '#c9a24a' } },
      { id: 'antique', name: 'Antique', colors: { sea: '#e8d9b0', land: '#b88a54', stand: '#6b4a32' } },
    ],
  },
  {
    id: 'book-stack', name: 'Stack of books', description: 'Definitely all chemistry.',
    category: 'decor', kind: 'placeable', layer: 'tabletop', size: [1, 1],
    rarity: 'common', price: 25, Art: Z.BookStack,
    variants: [
      { id: 'bright', name: 'Bright', colors: { a: '#d9534f', b: '#3b82c4', c: '#e9b73a' } },
      { id: 'muted', name: 'Muted', colors: { a: '#7f8c6a', b: '#a0785a', c: '#5b7099' } },
    ],
  },
  {
    id: 'tea-mug', name: 'Mug of tea', description: 'Steaming hot. Animated.',
    category: 'decor', kind: 'placeable', layer: 'tabletop', size: [1, 1], animated: true,
    rarity: 'common', price: 20, Art: Z.TeaMug,
    variants: [
      { id: 'teal', name: 'Teal mol mug', colors: { mug: '#2f8f87', label: 'mol' } },
      { id: 'red', name: 'Red pH mug', colors: { mug: '#d9534f', label: 'pH' } },
      { id: 'navy', name: 'Navy H₂O mug', colors: { mug: '#3f5a86', label: 'H₂O' } },
    ],
  },
  {
    id: 'firefly-jar', name: 'Firefly jar', description: 'Glowing, harmless, bioluminescent. Animated.',
    category: 'decor', kind: 'placeable', layer: 'tabletop', size: [1, 1], animated: true,
    rarity: 'rare', price: 140, Art: Z.FireflyJar,
    variants: [
      { id: 'gold', name: 'Golden glow', colors: { glow: '#ffe066', lid: '#c9a24a' } },
      { id: 'mint', name: 'Mint glow', colors: { glow: '#9cffd8', lid: '#3a3f4a' } },
    ],
  },
  {
    id: 'plush-mole', name: 'Mole plushie', description: 'The official mascot of the mole concept.',
    category: 'decor', kind: 'placeable', layer: 'tabletop', size: [1, 1],
    rarity: 'common', price: 50, Art: Z.PlushMole,
    variants: [
      { id: 'brown', name: 'Classic', colors: { fur: '#8a6a52', badge: '#0f766e' } },
      { id: 'pink', name: 'Pink', colors: { fur: '#e8a5b8', badge: '#3b82c4' } },
      { id: 'blue', name: 'Blue', colors: { fur: '#8fb4e0', badge: '#d9534f' } },
    ],
  },

  /* ─────────────── FUN: gadgets ─────────────── */
  {
    id: 'record-player', name: 'Record player', description: 'Study beats, spinning. Animated.',
    category: 'fun', kind: 'placeable', layer: 'tabletop', size: [1, 1], animated: true,
    rarity: 'rare', price: 190, Art: Z.RecordPlayer,
    variants: [
      { id: 'wood', name: 'Wood', colors: { body: '#a0785a', label: '#e3b23c' } },
      { id: 'teal', name: 'Teal', colors: { body: '#2f8f87', label: '#f27ba5' } },
    ],
  },
  {
    id: 'volcano', name: 'Volcano model', description: 'The classic science-fair eruption. Animated.',
    category: 'fun', kind: 'placeable', layer: 'tabletop', size: [1, 1], animated: true,
    rarity: 'uncommon', price: 150, Art: Z.Volcano,
    variants: [
      { id: 'lava', name: 'Lava', colors: { rock: '#7a5a44', foam: '#ff7a3d' } },
      { id: 'foam', name: 'Baking-soda foam', colors: { rock: '#6b7480', foam: '#f2f6fa' } },
    ],
  },
  {
    id: 'retro-tv', name: 'Retro TV', description: 'Only shows chemistry documentaries. Animated.',
    category: 'fun', kind: 'placeable', layer: 'tabletop', size: [1, 1], animated: true,
    rarity: 'rare', price: 200, Art: Z.RetroTV,
    variants: [
      { id: 'orange', name: 'Orange', colors: { body: '#e8875d', screen: '#4fb3a1' } },
      { id: 'cream', name: 'Cream', colors: { body: '#efe6d2', screen: '#5b7fd1' } },
    ],
  },
  {
    id: 'arcade', name: 'Atom Arcade', description: 'A retro arcade cabinet. High score: 6.02 × 10²³. Animated.',
    category: 'fun', kind: 'placeable', layer: 'floor', size: [1, 1], view: 'front', animated: true,
    rarity: 'epic', price: 650, Art: Z.ArcadeCabinet, unlockLevel: 4,
    variants: [
      { id: 'purple', name: 'Purple', colors: { body: '#5b3f9e', marquee: '#ff5fb1' } },
      { id: 'red', name: 'Red', colors: { body: '#b8323a', marquee: '#ffd166' } },
      { id: 'black', name: 'Black', colors: { body: '#2b2f3a', marquee: '#3ee6ff' } },
    ],
  },
  {
    id: 'vending', name: 'Fizz machine', description: 'Carbonated drinks (aqueous CO₂).',
    category: 'fun', kind: 'placeable', layer: 'floor', size: [1, 1], view: 'front',
    rarity: 'rare', price: 320, Art: Z.VendingMachine,
    variants: [
      { id: 'red', name: 'Red', colors: { body: '#d63c3c' } },
      { id: 'blue', name: 'Blue', colors: { body: '#2f6fb3' } },
      { id: 'green', name: 'Green', colors: { body: '#2e8b57' } },
    ],
  },
  {
    id: 'disco-ball', name: 'Disco ball', description: 'For celebrating a perfect quiz. Animated.',
    category: 'fun', kind: 'placeable', layer: 'wall', size: [1, 1], animated: true,
    rarity: 'epic', price: 380, Art: Z.DiscoBall, unlockLevel: 3,
    variants: [
      { id: 'pink', name: 'Pink sparkle', colors: { glow: '#ff9bd0' } },
      { id: 'blue', name: 'Blue sparkle', colors: { glow: '#9bd7ff' } },
    ],
  },
  {
    id: 'aquarium', name: 'Aquarium', description: 'Two fish and some swaying weed. Animated.',
    category: 'fun', kind: 'placeable', layer: 'floor', size: [2, 1], view: 'front', animated: true,
    rarity: 'rare', price: 420, Art: Z.Aquarium,
    variants: [
      { id: 'tropical', name: 'Tropical', colors: { water: '#4fb3d9', fish1: '#ff8c42', fish2: '#ffd166', stand: '#3a3f4a' } },
      { id: 'lagoon', name: 'Lagoon', colors: { water: '#5fd3b5', fish1: '#ef476f', fish2: '#118ab2', stand: '#c99b65' } },
    ],
  },
  {
    id: 'telescope', name: 'Telescope', description: 'Spectroscopy starts with stargazing.',
    category: 'fun', kind: 'placeable', layer: 'floor', size: [1, 1], view: 'front',
    rarity: 'rare', price: 260, Art: Z.Telescope,
    variants: [
      { id: 'brass', name: 'Brass', colors: { tube: '#c9a24a', band: '#7f5539' } },
      { id: 'white', name: 'White', colors: { tube: '#eceae4', band: '#3b82c4' } },
    ],
  },
  {
    id: 'molecule-model', name: 'Giant molecule model', description: 'A slowly rotating sculpture. Animated.',
    category: 'fun', kind: 'placeable', layer: 'floor', size: [1, 1], view: 'front', animated: true,
    rarity: 'rare', price: 300, Art: Z.MoleculeSculpture,
    variants: [
      { id: 'cpk', name: 'Classic colours', colors: { a: '#3a3f4a', b: '#f4f4f4', c: '#d9534f' } },
      { id: 'neon', name: 'Neon', colors: { a: '#7b3fd6', b: '#3ee6ff', c: '#a6ff4d' } },
    ],
  },
  {
    id: 'lab-bot', name: 'Lab-bot', description: 'A friendly helper robot that blinks at you. Animated.',
    category: 'fun', kind: 'placeable', layer: 'floor', size: [1, 1], view: 'front', animated: true,
    rarity: 'epic', price: 750, Art: Z.LabBot, unlockLevel: 5,
    variants: [
      { id: 'white', name: 'White', colors: { body: '#e9eef2', eye: '#3ee6ff' } },
      { id: 'yellow', name: 'Yellow', colors: { body: '#f2c94c', eye: '#a6ff4d' } },
      { id: 'pink', name: 'Pink', colors: { body: '#f2a9c4', eye: '#ffffff' } },
    ],
  },

  /* ─────────────── PETS ───────────────
     Roaming pets (kind: 'pet') wander the floor of the room they live in.
     Tank pets are placeables with a `pet` field: they sit on benches but can still be named. */
  {
    id: 'pet-rat', name: 'Lab rat', description: 'Clever, curious and very good at mazes.',
    category: 'pets', kind: 'pet', rarity: 'rare', price: 300, Art: P.RatPet, animated: true,
    pet: pet(['*sniff sniff*', 'Is that cheese or CaCO₃?', 'I solved the maze! Now you solve the equation.', 'Squeak! (that means "nice work")']),
    variants: [
      { id: 'white', name: 'White', colors: { fur: '#f4f2ee', eye: '#d64b6a' } },
      { id: 'grey', name: 'Grey', colors: { fur: '#a9a6b3', eye: '#2b2233' } },
      { id: 'brown', name: 'Brown', colors: { fur: '#b08462', eye: '#2b2233' } },
    ],
  },
  {
    id: 'pet-hamster', name: 'Hamster', description: 'Small, round and stores snacks in its cheeks.',
    category: 'pets', kind: 'pet', rarity: 'uncommon', price: 200, Art: P.HamsterPet, animated: true,
    pet: pet(['*stuffs cheeks*', 'I ran 5 km on my wheel today!', 'Moles? I prefer seeds.', 'Pat pat pat!'], 1.4),
    variants: [
      { id: 'golden', name: 'Golden', colors: { fur: '#e9a65a', belly: '#fbe8cf' } },
      { id: 'white', name: 'Snowy', colors: { fur: '#f1eee8', belly: '#ffffff' } },
      { id: 'grey', name: 'Grey', colors: { fur: '#9b9aa6', belly: '#e6e4ea' } },
    ],
  },
  {
    id: 'pet-frog', name: 'Frog', description: 'An amphibian with excellent jumping technique.',
    category: 'pets', kind: 'pet', rarity: 'uncommon', price: 220, Art: P.FrogPet, animated: true,
    pet: pet(['Ribbit.', 'I breathe through my skin. Diffusion!', 'Fancy a hop?', '*blinks slowly*'], 1.1),
    variants: [
      { id: 'green', name: 'Tree frog', colors: { skin: '#6cc04a', belly: '#e9f5c8', spots: '' } },
      { id: 'blue', name: 'Dart frog', colors: { skin: '#3a7bd5', belly: '#9cc3f2', spots: '#1d2230' } },
      { id: 'pink', name: 'Bubblegum', colors: { skin: '#f29bb5', belly: '#fde2ea', spots: '#e06a8f' } },
    ],
  },
  {
    id: 'pet-bunny', name: 'Bunny', description: 'Fluffy, floppy and fond of carrots.',
    category: 'pets', kind: 'pet', rarity: 'rare', price: 350, Art: P.BunnyPet, animated: true,
    pet: pet(['*twitches nose*', 'Carrots contain β-carotene!', 'Boing!', 'You are some-bunny special.'], 1.3),
    variants: [
      { id: 'white', name: 'White', colors: { fur: '#f6f4f0' } },
      { id: 'brown', name: 'Brown', colors: { fur: '#b58763' } },
      { id: 'grey', name: 'Grey', colors: { fur: '#a7a9b4' } },
    ],
  },
  {
    id: 'pet-hedgehog', name: 'Hedgehog', description: 'Spiky outside, soft inside.',
    category: 'pets', kind: 'pet', rarity: 'rare', price: 400, Art: P.HedgehogPet, animated: true,
    pet: pet(['*snuffle*', 'My spines are made of keratin.', 'Hug me carefully!', 'Let’s go bug hunting.'], 0.9),
    variants: [
      { id: 'brown', name: 'Classic', colors: { spines: '#7a5a44', face: '#ead7bf' } },
      { id: 'pale', name: 'Pale', colors: { spines: '#c9b8a2', face: '#fbf1e4' } },
    ],
  },
  {
    id: 'pet-tortoise', name: 'Tortoise', description: 'Slow and steady wins the exam. Has a benzene-ring shell.',
    category: 'pets', kind: 'pet', rarity: 'rare', price: 450, Art: P.TortoisePet, animated: true,
    pet: pet(['…', 'Take your time. I always do.', 'My shell is mostly keratin and bone.', 'Slow and steady, friend.'], 0.4),
    variants: [
      { id: 'olive', name: 'Olive', colors: { shell: '#8a9a4a', skin: '#b9c28a' } },
      { id: 'amber', name: 'Amber', colors: { shell: '#b8803a', skin: '#d8c08a' } },
    ],
  },
  {
    id: 'pet-cat', name: 'Cat', description: 'Will sit on your notes the moment you open them.',
    category: 'pets', kind: 'pet', rarity: 'epic', price: 600, Art: P.CatPet, animated: true, unlockLevel: 3,
    pet: pet(['Mrrp?', 'I knocked a beaker off the bench. Sorry.', 'Purrrrr…', 'Feed me. Then study.'], 1.2),
    variants: [
      { id: 'ginger', name: 'Ginger', colors: { fur: '#e8954a', belly: '#fbe2c4', eye: '#3a7a3a', patch: '' } },
      { id: 'black', name: 'Black', colors: { fur: '#3a3a44', belly: '#55555f', eye: '#e3b23c', patch: '' } },
      { id: 'calico', name: 'Calico', colors: { fur: '#f6f1ea', belly: '#ffffff', eye: '#3a7a3a', patch: '#e8954a' } },
      { id: 'grey', name: 'Grey tabby', colors: { fur: '#9ba0aa', belly: '#e1e3e8', eye: '#3b82c4', patch: '#6d727c' } },
    ],
  },
  {
    id: 'pet-puppy', name: 'Puppy', description: 'Always happy to see you. Especially after a quiz.',
    category: 'pets', kind: 'pet', rarity: 'epic', price: 600, Art: P.PuppyPet, animated: true, unlockLevel: 3,
    pet: pet(['Woof!', 'Walk? Walk?! WALK?!', 'You’re the best scientist ever!', '*wags tail at 6 Hz*'], 1.5),
    variants: [
      { id: 'golden', name: 'Golden', colors: { fur: '#e2b06a', belly: '#f8e6c6', ear: '#c98f4a', collar: '#d9534f', spots: '' } },
      { id: 'brown', name: 'Chocolate', colors: { fur: '#8a5a3a', belly: '#c49a74', ear: '#6b4228', collar: '#3b82c4', spots: '' } },
      { id: 'spotty', name: 'Spotty', colors: { fur: '#f6f4f0', belly: '#ffffff', ear: '#3a3a44', collar: '#e3b23c', spots: '#3a3a44' } },
    ],
  },
  {
    id: 'pet-goldfish', name: 'Goldfish (in a bowl)', description: 'A tiny pet for your bench. Goes on a bench, desk or table.',
    category: 'pets', kind: 'placeable', layer: 'tabletop', size: [1, 1], rarity: 'common', price: 120, Art: P.GoldfishBowl, animated: true,
    pet: pet(['blub', 'blub blub', 'I forgot what I was saying… blub.', 'Dissolved O₂ levels: excellent.'], 0, 'tank'),
    variants: [
      { id: 'orange', name: 'Orange', colors: { fish: '#ff8c42', water: '#7fc8e8' } },
      { id: 'white', name: 'White', colors: { fish: '#f6efe6', water: '#7fc8e8' } },
    ],
  },
  {
    id: 'pet-axolotl', name: 'Axolotl (in a tank)', description: 'Smiles permanently. Goes on a bench, desk or table.',
    category: 'pets', kind: 'placeable', layer: 'tabletop', size: [1, 1], rarity: 'epic', price: 500, Art: P.AxolotlTank, animated: true, unlockLevel: 5,
    pet: pet(['*smiles*', 'I can regrow my legs. Can you balance a redox equation?', 'Gills out, good vibes.', ':)'], 0, 'tank'),
    variants: [
      { id: 'pink', name: 'Pink', colors: { body: '#f7b4c8', gills: '#e0607e', water: '#8fd3e8' } },
      { id: 'gold', name: 'Golden', colors: { body: '#f6d58a', gills: '#e39a3a', water: '#8fd3e8' } },
      { id: 'dark', name: 'Wild', colors: { body: '#6b6f5a', gills: '#9b5a6a', water: '#7fbfa8' } },
    ],
  },

  /* ─────────────── AVATAR ─────────────── */
  {
    id: 'coat-classic', name: 'Classic lab coat', description: 'Crisp, white, pocket full of pens.',
    category: 'avatar', kind: 'applied', slot: 'coat', rarity: 'common', price: 0, Art: A.CoatArt,
    variants: [{ id: 'white', name: 'White', colors: { base: '#f7f8fa', trim: '#9aa6b2' } }],
  },
  {
    id: 'coat-colour', name: 'Coloured lab coat', description: 'Stand out at the bench.',
    category: 'avatar', kind: 'applied', slot: 'coat', rarity: 'uncommon', price: 150, Art: A.CoatArt,
    variants: [
      { id: 'sky', name: 'Sky', colors: { base: '#9cc9ef', trim: '#2f6fb3' } },
      { id: 'mint', name: 'Mint', colors: { base: '#a8e0c8', trim: '#2e8b57' } },
      { id: 'lilac', name: 'Lilac', colors: { base: '#cdb8ef', trim: '#6b4fb3' } },
      { id: 'coral', name: 'Coral', colors: { base: '#f5b0a0', trim: '#c0503c' } },
      { id: 'charcoal', name: 'Charcoal', colors: { base: '#4a505c', trim: '#e9b73a' } },
    ],
  },
  {
    id: 'coat-galaxy', name: 'Galaxy coat', description: 'Contains approximately 6 × 10²³ stars.',
    category: 'avatar', kind: 'applied', slot: 'coat', rarity: 'legendary', price: 900, Art: A.CoatArt, unlockLevel: 10,
    variants: [{ id: 'nebula', name: 'Nebula', colors: { base: '#2b2163', trim: '#a35fe0', pattern: 'galaxy' } }],
  },
  {
    id: 'goggles', name: 'Safety goggles', description: 'Eyes are irreplaceable.',
    category: 'avatar', kind: 'applied', slot: 'goggles', rarity: 'common', price: 60, Art: A.GogglesArt,
    variants: [
      { id: 'clear', name: 'Clear', colors: { strap: '#4b5563', lens: '#d6f0ff' } },
      { id: 'blue', name: 'Blue', colors: { strap: '#2f6fb3', lens: '#bfe3ff' } },
      { id: 'orange', name: 'Orange', colors: { strap: '#e07b2c', lens: '#ffe2bf' } },
      { id: 'pink', name: 'Pink', colors: { strap: '#d64b8a', lens: '#ffd6ea' } },
    ],
  },
  {
    id: 'gloves', name: 'Nitrile gloves', description: 'Snap! Ready for anything.',
    category: 'avatar', kind: 'applied', slot: 'gloves', rarity: 'common', price: 40, Art: A.GlovesArt,
    variants: [
      { id: 'purple', name: 'Purple', colors: { base: '#8b6fd6' } },
      { id: 'blue', name: 'Blue', colors: { base: '#4a90d9' } },
      { id: 'black', name: 'Black', colors: { base: '#30343c' } },
    ],
  },
];

function pet(sayings: string[], speed = 1, habitat: PetInfo['habitat'] = 'roam'): PetInfo {
  return { sayings, speed, habitat };
}

const byId = new Map(shopItems.map((i) => [i.id, i]));
export const getItem = (id: string): ShopItem | undefined => byId.get(id);

/** Applied items owned from the start (variant ids). Price-0 applied items are always free. */
export const STARTER_APPLIED: Record<string, string[]> = {
  'floor-lino': ['grey', 'mint', 'sand'],
  'wall-paint': ['white', 'sage', 'sky', 'peach', 'lilac'],
  'light-fluoro': ['cool'],
  'coat-classic': ['white'],
  'goggles': ['clear'],
};

/** Furniture a new player starts with, placed in the starter room. Coordinates are tiles. */
export const STARTER_LAYOUT: { itemId: string; variant: string; x: number; y: number; rot?: 0 | 1 | 2 | 3 }[] = [
  { itemId: 'bench', variant: 'grey', x: 1, y: 1 },
  { itemId: 'conical', variant: 'pink', x: 2, y: 1 },
  { itemId: 'stool', variant: 'blue', x: 1, y: 2 },
  { itemId: 'poster-pt', variant: 'classic', x: 4, y: 0 },
];

export const STARTER_EQUIPPED = {
  floor: { itemId: 'floor-lino', variant: 'grey' },
  wall: { itemId: 'wall-paint', variant: 'white' },
  lighting: { itemId: 'light-fluoro', variant: 'cool' },
  coat: { itemId: 'coat-classic', variant: 'white' },
  goggles: { itemId: 'goggles', variant: 'clear' },
  gloves: null,
};
