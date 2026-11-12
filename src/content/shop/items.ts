/**
 * THE SHOP CATALOGUE. Adding an item = adding one entry here (plus an Art
 * component in ./art if it needs a new look). See CONTRIBUTING.md.
 *
 * Prices live here next to each item; global multipliers live in economy.ts.
 */
import type { ShopItem } from './types';
import * as S from './art/structure';
import * as E from './art/equipment';
import * as D from './art/decor';
import * as F from './art/fun';
import * as A from './art/avatar';

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
    category: 'equipment', kind: 'placeable', layer: 'floor', size: [1, 1], rotatable: false,
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
    id: 'pet-rat', name: 'Pip the lab rat', description: 'A very good lab assistant. Animated.',
    category: 'fun', kind: 'placeable', layer: 'floor', size: [1, 1], rotatable: false, animated: true,
    rarity: 'epic', price: 500, Art: F.LabRatPet,
    variants: [
      { id: 'white', name: 'White', colors: { fur: '#f4f2ee', eye: '#d64b6a', bed: '#5fa8d3' } },
      { id: 'grey', name: 'Grey', colors: { fur: '#a9a6b3', eye: '#2b2233', bed: '#e9b73a' } },
      { id: 'brown', name: 'Brown', colors: { fur: '#b08462', eye: '#2b2233', bed: '#7fbf7a' } },
    ],
  },
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
    category: 'fun', kind: 'placeable', layer: 'floor', size: [1, 1], rotatable: false, animated: true,
    rarity: 'legendary', price: 1200, Art: F.TeslaCoil, unlockLevel: 8,
    variants: [
      { id: 'violet', name: 'Violet arcs', colors: { coil: '#c27c3a', spark: '#b98cff' } },
      { id: 'blue', name: 'Blue arcs', colors: { coil: '#c27c3a', spark: '#6fd3ff' } },
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
