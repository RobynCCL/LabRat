/** Small colour helpers for code-drawn art. */
function parse(hex: string): [number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const toHex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');

/** amt < 0 darkens, amt > 0 lightens (−1…1). */
export function shade(hex: string, amt: number): string {
  if (!hex.startsWith('#')) return hex;
  const [r, g, b] = parse(hex);
  const t = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  return toHex(r + (t - r) * p, g + (t - g) * p, b + (t - b) * p);
}

export function alpha(hex: string, a: number): string {
  if (!hex.startsWith('#')) return hex;
  const [r, g, b] = parse(hex);
  return `rgba(${r},${g},${b},${a})`;
}

export function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = parse(a);
  const [r2, g2, b2] = parse(b);
  return toHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}
