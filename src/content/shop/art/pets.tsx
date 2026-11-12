import type { ArtProps } from '../types';
import { shade } from '@/lib/color';
import { Anim, HI, LO, Move, OUT, SW, useSvgId } from './kit';

/*
 * Pets: front/side sprites facing RIGHT, standing on b = h - 6.
 * The lab flips them horizontally when they walk left and adds a walking bob,
 * so each sprite only needs idle details (blinks, tails, ears).
 */

const Shadow = ({ cx, b, rx }: { cx: number; b: number; rx: number }) => <ellipse cx={cx} cy={b} rx={rx} ry={Math.max(2.5, rx * 0.22)} fill={LO} />;

function Eye({ x, y, r = 1.6, anim, colour = '#2b2233' }: { x: number; y: number; r?: number; anim: boolean; colour?: string }) {
  return (
    <g>
      <ellipse cx={x} cy={y} rx={r} ry={r} fill={colour}>
        <Anim on={anim} attr="ry" values={`${r};${r};${r};0.2;${r}`} dur="4.5s" />
      </ellipse>
      <circle cx={x + r * 0.35} cy={y - r * 0.35} r={r * 0.35} fill="#fff" />
    </g>
  );
}

export function RatPet({ w, h, c, anim }: ArtProps) {
  const cx = w / 2;
  const b = h - 6;
  return (
    <g>
      <Shadow cx={cx} b={b} rx={15} />
      <path d={`M ${cx - 12} ${b - 6} q -10 2 -10 -8 q 0 -6 5 -6`} stroke="#f2a9b8" strokeWidth={2.2} fill="none" strokeLinecap="round">
        {anim && <animateTransform attributeName="transform" type="rotate" values={`0 ${cx - 12} ${b - 6};-8 ${cx - 12} ${b - 6};0 ${cx - 12} ${b - 6}`} dur="1.8s" repeatCount="indefinite" />}
      </path>
      <ellipse cx={cx - 2} cy={b - 9} rx={13} ry={9} fill={c.fur} stroke={OUT} strokeWidth={SW} />
      <ellipse cx={cx - 5} cy={b - 1.5} rx={3} ry={1.8} fill="#f2a9b8" />
      <ellipse cx={cx + 5} cy={b - 1.5} rx={3} ry={1.8} fill="#f2a9b8" />
      <path d={`M ${cx + 6} ${b - 16} q 10 -2 13 6 q -4 5 -11 4 Z`} fill={c.fur} stroke={OUT} strokeWidth={SW} />
      <circle cx={cx + 6} cy={b - 18} r={4.5} fill={c.fur} stroke={OUT} strokeWidth={SW} />
      <circle cx={cx + 6} cy={b - 18} r={2.5} fill="#f2a9b8" />
      <Eye x={cx + 12} y={b - 13} r={1.4} anim={anim} colour={c.eye} />
      <circle cx={cx + 19} cy={b - 10} r={1.5} fill="#e57a92">
        <Anim on={anim} attr="cy" values={`${b - 10};${b - 10.6};${b - 10};${b - 10}`} dur="0.9s" />
      </circle>
      <path d={`M ${cx + 17} ${b - 9} l 6 -1 M ${cx + 17} ${b - 8.5} l 6 1.5`} stroke="rgba(60,60,60,0.45)" strokeWidth={0.6} />
    </g>
  );
}

export function HamsterPet({ w, h, c, anim }: ArtProps) {
  const cx = w / 2;
  const b = h - 6;
  return (
    <g>
      <Shadow cx={cx} b={b} rx={13} />
      <g>
        <Move on={anim} values="0 0; 0 -0.8; 0 0" dur="1.4s" />
        <ellipse cx={cx} cy={b - 11} rx={14} ry={12} fill={c.fur} stroke={OUT} strokeWidth={SW} />
        <ellipse cx={cx + 2} cy={b - 7} rx={8} ry={6} fill={c.belly} />
        <circle cx={cx - 7} cy={b - 21} r={3.5} fill={c.fur} stroke={OUT} />
        <circle cx={cx + 7} cy={b - 21} r={3.5} fill={c.fur} stroke={OUT} />
        <circle cx={cx - 7} cy={b - 21} r={1.8} fill="#f2a9b8" />
        <circle cx={cx + 7} cy={b - 21} r={1.8} fill="#f2a9b8" />
        <Eye x={cx - 3} y={b - 14} r={1.5} anim={anim} />
        <Eye x={cx + 7} y={b - 14} r={1.5} anim={anim} />
        <ellipse cx={cx + 2} cy={b - 10.5} rx={1.4} ry={1} fill="#e57a92" />
        <circle cx={cx - 6} cy={b - 10} r={2.2} fill="#f2a9b8" opacity={0.6} />
        <circle cx={cx + 10} cy={b - 10} r={2.2} fill="#f2a9b8" opacity={0.6} />
        <ellipse cx={cx - 3} cy={b - 3} rx={2.2} ry={1.5} fill="#f2a9b8" />
        <ellipse cx={cx + 6} cy={b - 3} rx={2.2} ry={1.5} fill="#f2a9b8" />
      </g>
    </g>
  );
}

export function CatPet({ w, h, c, anim }: ArtProps) {
  const cx = w / 2;
  const b = h - 6;
  return (
    <g>
      <Shadow cx={cx} b={b} rx={14} />
      <path d={`M ${cx - 9} ${b - 4} q -12 0 -10 -14 q 1 -6 5 -7`} stroke={c.fur} strokeWidth={4.5} fill="none" strokeLinecap="round">
        {anim && <animateTransform attributeName="transform" type="rotate" values={`0 ${cx - 9} ${b - 4};-14 ${cx - 9} ${b - 4};0 ${cx - 9} ${b - 4}`} dur="2.6s" repeatCount="indefinite" />}
      </path>
      <path d={`M ${cx - 11} ${b} q -1 -18 9 -20 q 12 -1 12 20 Z`} fill={c.fur} stroke={OUT} strokeWidth={SW} />
      {c.patch && <ellipse cx={cx - 4} cy={b - 10} rx={5} ry={4} fill={c.patch} />}
      <ellipse cx={cx + 2} cy={b - 7} rx={5} ry={6} fill={c.belly} />
      <g>
        <path d={`M ${cx - 8} ${b - 30} l 2 -9 l 6 6 M ${cx + 4} ${b - 33} l 6 -6 l 2 9`} fill={c.fur} stroke={OUT} strokeWidth={1.2} strokeLinejoin="round" />
        <path d={`M ${cx - 6} ${b - 32} l 1.5 -4 l 3 3 M ${cx + 6} ${b - 34} l 3 -3 l 1 4`} fill="#f2a9b8" />
        <ellipse cx={cx + 2} cy={b - 26} rx={11} ry={9} fill={c.fur} stroke={OUT} strokeWidth={SW} />
        {c.patch && <path d={`M ${cx - 6} ${b - 32} q 5 -3 8 2 q -4 4 -8 2 Z`} fill={c.patch} />}
        <Eye x={cx - 2} y={b - 27} r={1.7} anim={anim} colour={c.eye} />
        <Eye x={cx + 6} y={b - 27} r={1.7} anim={anim} colour={c.eye} />
        <path d={`M ${cx + 1} ${b - 23.5} l 1 1 l 1 -1 Z`} fill="#e57a92" />
        <path d={`M ${cx + 2} ${b - 22.5} q -1.5 2 -3 1 M ${cx + 2} ${b - 22.5} q 1.5 2 3 1`} stroke="#7a4a5a" strokeWidth={0.7} fill="none" />
        <path d={`M ${cx - 4} ${b - 23} l -6 -1 M ${cx + 8} ${b - 23} l 6 -1`} stroke="rgba(60,60,60,0.4)" strokeWidth={0.6} />
      </g>
      <ellipse cx={cx - 3} cy={b - 1} rx={3} ry={1.8} fill={c.belly} stroke={OUT} strokeWidth={0.6} />
      <ellipse cx={cx + 5} cy={b - 1} rx={3} ry={1.8} fill={c.belly} stroke={OUT} strokeWidth={0.6} />
    </g>
  );
}

export function PuppyPet({ w, h, c, anim }: ArtProps) {
  const cx = w / 2;
  const b = h - 6;
  return (
    <g>
      <Shadow cx={cx} b={b} rx={15} />
      <path d={`M ${cx - 11} ${b - 10} q -8 -4 -7 -12`} stroke={c.fur} strokeWidth={4} fill="none" strokeLinecap="round">
        {anim && <animateTransform attributeName="transform" type="rotate" values={`-15 ${cx - 11} ${b - 10};15 ${cx - 11} ${b - 10};-15 ${cx - 11} ${b - 10}`} dur="0.5s" repeatCount="indefinite" />}
      </path>
      <path d={`M ${cx - 12} ${b} q -1 -17 10 -18 q 11 0 12 18 Z`} fill={c.fur} stroke={OUT} strokeWidth={SW} />
      {c.spots && (
        <g fill={c.spots}>
          <circle cx={cx - 6} cy={b - 9} r={2} />
          <circle cx={cx + 4} cy={b - 13} r={1.6} />
        </g>
      )}
      <ellipse cx={cx + 1} cy={b - 6} rx={5} ry={5} fill={c.belly} />
      <rect x={cx - 8} y={b - 19} width={16} height={3.5} rx={1.5} fill={c.collar} />
      <circle cx={cx} cy={b - 15} r={2} fill="#f4c542" stroke={OUT} strokeWidth={0.6} />
      <ellipse cx={cx + 1} cy={b - 27} rx={11} ry={9.5} fill={c.fur} stroke={OUT} strokeWidth={SW} />
      <ellipse cx={cx + 5} cy={b - 23} rx={6} ry={4.5} fill={c.belly} />
      <path d={`M ${cx - 8} ${b - 33} q -6 2 -5 11 q 3 2 6 -3 Z`} fill={c.ear} stroke={OUT} strokeWidth={1}>
        {anim && <animateTransform attributeName="transform" type="rotate" values={`0 ${cx - 8} ${b - 33};8 ${cx - 8} ${b - 33};0 ${cx - 8} ${b - 33}`} dur="3s" repeatCount="indefinite" />}
      </path>
      <path d={`M ${cx + 9} ${b - 34} q 6 2 5 11 q -3 2 -6 -3 Z`} fill={c.ear} stroke={OUT} strokeWidth={1} />
      <Eye x={cx - 2} y={b - 28} r={1.8} anim={anim} />
      <Eye x={cx + 6} y={b - 28} r={1.8} anim={anim} />
      <ellipse cx={cx + 5} cy={b - 24} rx={2.2} ry={1.6} fill="#2b2233" />
      <path d={`M ${cx + 5} ${b - 22.5} q 0 3 2 3`} stroke="#7a4a5a" strokeWidth={0.8} fill="none" />
      <ellipse cx={cx + 7} cy={b - 19.5} rx={1.5} ry={2} fill="#e57a92">
        <Anim on={anim} attr="ry" values="2;2.6;2" dur="0.6s" />
      </ellipse>
      <ellipse cx={cx - 4} cy={b - 1} rx={3} ry={1.8} fill={c.belly} stroke={OUT} strokeWidth={0.6} />
      <ellipse cx={cx + 6} cy={b - 1} rx={3} ry={1.8} fill={c.belly} stroke={OUT} strokeWidth={0.6} />
    </g>
  );
}

export function BunnyPet({ w, h, c, anim }: ArtProps) {
  const cx = w / 2;
  const b = h - 6;
  return (
    <g>
      <Shadow cx={cx} b={b} rx={14} />
      <circle cx={cx - 12} cy={b - 8} r={4} fill="#fff" stroke={OUT} strokeWidth={0.8} />
      <ellipse cx={cx - 2} cy={b - 9} rx={12} ry={9.5} fill={c.fur} stroke={OUT} strokeWidth={SW} />
      <g>
        {anim && <animateTransform attributeName="transform" type="rotate" values={`0 ${cx + 4} ${b - 28};0 ${cx + 4} ${b - 28};-12 ${cx + 4} ${b - 28};0 ${cx + 4} ${b - 28}`} dur="3.5s" repeatCount="indefinite" />}
        <ellipse cx={cx + 2} cy={b - 38} rx={3.2} ry={10} fill={c.fur} stroke={OUT} strokeWidth={1.2} transform={`rotate(-10 ${cx + 2} ${b - 38})`} />
        <ellipse cx={cx + 2} cy={b - 38} rx={1.6} ry={7} fill="#f2a9b8" transform={`rotate(-10 ${cx + 2} ${b - 38})`} />
      </g>
      <ellipse cx={cx + 9} cy={b - 37} rx={3.2} ry={10} fill={c.fur} stroke={OUT} strokeWidth={1.2} transform={`rotate(14 ${cx + 9} ${b - 37})`} />
      <ellipse cx={cx + 9} cy={b - 37} rx={1.6} ry={7} fill="#f2a9b8" transform={`rotate(14 ${cx + 9} ${b - 37})`} />
      <ellipse cx={cx + 6} cy={b - 22} rx={9} ry={8} fill={c.fur} stroke={OUT} strokeWidth={SW} />
      <Eye x={cx + 3} y={b - 23} r={1.6} anim={anim} />
      <Eye x={cx + 10} y={b - 23} r={1.6} anim={anim} />
      <path d={`M ${cx + 7} ${b - 19.5} l 1 1 l 1 -1 Z`} fill="#e57a92">
        <Anim on={anim} attr="opacity" values="1;0.5;1" dur="0.8s" />
      </path>
      <circle cx={cx + 1} cy={b - 19} r={1.8} fill="#f2a9b8" opacity={0.6} />
      <ellipse cx={cx + 3} cy={b - 1} rx={4} ry={2} fill={c.fur} stroke={OUT} strokeWidth={0.6} />
    </g>
  );
}

export function HedgehogPet({ w, h, c, anim }: ArtProps) {
  const cx = w / 2;
  const b = h - 6;
  const spikes = Array.from({ length: 9 }, (_, i) => {
    const a = Math.PI + (i / 8) * Math.PI * 0.85;
    return [cx - 3 + Math.cos(a) * 15, b - 5 + Math.sin(a) * 15];
  });
  return (
    <g>
      <Shadow cx={cx} b={b} rx={16} />
      <path d={`M ${cx - 17} ${b - 2} ${spikes.map(([x, y], i) => `L ${x} ${y} L ${cx - 3 + Math.cos(Math.PI + ((i + 0.5) / 8) * Math.PI * 0.85) * 11} ${b - 5 + Math.sin(Math.PI + ((i + 0.5) / 8) * Math.PI * 0.85) * 11}`).join(' ')} L ${cx + 10} ${b - 2} Z`} fill={c.spines} stroke={OUT} strokeWidth={1.2} strokeLinejoin="round" />
      <path d={`M ${cx + 2} ${b} q 0 -14 10 -14 q 8 0 10 10 q -2 4 -8 4 Z`} fill={c.face} stroke={OUT} strokeWidth={SW} />
      <Eye x={cx + 12} y={b - 9} r={1.5} anim={anim} />
      <circle cx={cx + 21} cy={b - 4.5} r={1.8} fill="#2b2233">
        <Anim on={anim} attr="cx" values={`${cx + 21};${cx + 21.6};${cx + 21}`} dur="0.7s" />
      </circle>
      <circle cx={cx + 9} cy={b - 5} r={1.8} fill="#f2a9b8" opacity={0.6} />
      <path d={`M ${cx - 10} ${b - 12} q 3 -3 6 -2`} stroke={shade(c.spines, 0.35)} strokeWidth={1.5} fill="none" strokeLinecap="round" />
    </g>
  );
}

export function TortoisePet({ w, h, c, anim }: ArtProps) {
  const cx = w / 2;
  const b = h - 6;
  const hex = (x: number, y: number, r: number) =>
    Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i + Math.PI / 6;
      return `${i ? 'L' : 'M'} ${x + r * Math.cos(a)} ${y + r * Math.sin(a)}`;
    }).join(' ') + ' Z';
  return (
    <g>
      <Shadow cx={cx} b={b} rx={17} />
      <ellipse cx={cx - 9} cy={b - 1.5} rx={3.5} ry={2.5} fill={c.skin} stroke={OUT} strokeWidth={0.8} />
      <ellipse cx={cx + 7} cy={b - 1.5} rx={3.5} ry={2.5} fill={c.skin} stroke={OUT} strokeWidth={0.8} />
      <g>
        {anim && <animateTransform attributeName="transform" type="translate" values="0 0; 1.5 -1; 0 0" dur="4s" repeatCount="indefinite" />}
        <path d={`M ${cx + 11} ${b - 7} q 4 -9 10 -7 q 3 2 1 6 q -4 4 -11 3 Z`} fill={c.skin} stroke={OUT} strokeWidth={SW} />
        <Eye x={cx + 17} y={b - 10} r={1.3} anim={anim} />
        <path d={`M ${cx + 18} ${b - 6.5} q 2 0.8 3.5 -0.5`} stroke="#3a5a3a" strokeWidth={0.8} fill="none" />
      </g>
      <path d={`M ${cx - 16} ${b - 4} q 0 -20 15 -20 q 15 0 15 20 Z`} fill={c.shell} stroke={OUT} strokeWidth={SW} />
      <path d={hex(cx - 1, b - 13, 5.5)} fill={shade(c.shell, 0.18)} stroke={shade(c.shell, -0.3)} strokeWidth={1} />
      <path d={hex(cx - 10, b - 9, 3.8)} fill={shade(c.shell, 0.12)} stroke={shade(c.shell, -0.3)} strokeWidth={1} />
      <path d={hex(cx + 8, b - 9, 3.8)} fill={shade(c.shell, 0.12)} stroke={shade(c.shell, -0.3)} strokeWidth={1} />
      <rect x={cx - 17} y={b - 5} width={32} height={3} rx={1.5} fill={shade(c.shell, -0.3)} />
      <path d={`M ${cx - 9} ${b - 20} q 4 -3 9 -3`} stroke={HI} strokeWidth={2} fill="none" strokeLinecap="round" />
    </g>
  );
}

export function FrogPet({ w, h, c, anim }: ArtProps) {
  const cx = w / 2;
  const b = h - 6;
  return (
    <g>
      <Shadow cx={cx} b={b} rx={15} />
      <ellipse cx={cx - 9} cy={b - 3} rx={6} ry={3.5} fill={shade(c.skin, -0.12)} stroke={OUT} strokeWidth={1} />
      <ellipse cx={cx + 9} cy={b - 3} rx={6} ry={3.5} fill={shade(c.skin, -0.12)} stroke={OUT} strokeWidth={1} />
      <ellipse cx={cx} cy={b - 11} rx={14} ry={10} fill={c.skin} stroke={OUT} strokeWidth={SW} />
      <ellipse cx={cx} cy={b - 6} rx={8} ry={4.5} fill={c.belly}>
        <Anim on={anim} attr="ry" values="4.5;5.8;4.5" dur="1.6s" />
      </ellipse>
      {[-6, 6].map((dx) => (
        <g key={dx}>
          <circle cx={cx + dx} cy={b - 21} r={5} fill={c.skin} stroke={OUT} strokeWidth={SW} />
          <circle cx={cx + dx} cy={b - 21} r={3.2} fill="#fff" />
          <Eye x={cx + dx + 0.5} y={b - 21} r={1.8} anim={anim} />
        </g>
      ))}
      <path d={`M ${cx - 6} ${b - 13} q 6 4 12 0`} stroke={shade(c.skin, -0.4)} strokeWidth={1.2} fill="none" strokeLinecap="round" />
      {c.spots && (
        <g fill={c.spots}>
          <circle cx={cx - 9} cy={b - 12} r={1.6} />
          <circle cx={cx + 10} cy={b - 10} r={1.3} />
          <circle cx={cx + 3} cy={b - 16} r={1.1} />
        </g>
      )}
      <circle cx={cx - 9} cy={b - 14} r={2} fill="#f2a9b8" opacity={0.5} />
      <circle cx={cx + 9} cy={b - 14} r={2} fill="#f2a9b8" opacity={0.5} />
    </g>
  );
}

/* ───────────── Tank pets (placed on benches) ───────────── */

export function GoldfishBowl({ w, h, c, anim }: ArtProps) {
  const cx = w / 2;
  const b = h - 6;
  const id = useSvgId('bowl');
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <circle cx={cx} cy={b - 15} r={14} />
        </clipPath>
      </defs>
      <Shadow cx={cx} b={b} rx={12} />
      <circle cx={cx} cy={b - 15} r={15} fill="rgba(200,235,255,0.4)" stroke={OUT} strokeWidth={SW} />
      <g clipPath={`url(#${id})`}>
        <rect x={cx - 16} y={b - 22} width={32} height={24} fill={c.water} opacity={0.65} />
        <path d={`M ${cx - 16} ${b - 22} q 8 -2 16 0 t 16 0`} stroke="#fff" strokeWidth={1} fill="none" opacity={0.7} />
        <path d={`M ${cx - 8} ${b - 1} q 0 -6 -2 -10 M ${cx + 6} ${b - 1} q 2 -5 0 -8`} stroke="#4fb286" strokeWidth={2} fill="none" strokeLinecap="round" />
        <rect x={cx - 14} y={b - 3} width={28} height={4} fill="#e7d3a6" />
        <g>
          <Move on={anim} values="-6 0; 6 1; -6 0" dur="5s" />
          <ellipse cx={cx} cy={b - 12} rx={5} ry={3.3} fill={c.fish} />
          <path d={`M ${cx - 5} ${b - 12} l -4 -3 v 6 Z`} fill={c.fish} />
          <circle cx={cx + 2.5} cy={b - 12.8} r={0.8} fill="#1d2230" />
        </g>
      </g>
      <ellipse cx={cx} cy={b - 29} rx={8} ry={2} fill="none" stroke={OUT} strokeWidth={1.2} />
      <path d={`M ${cx - 10} ${b - 22} a 12 12 0 0 1 6 -5`} stroke={HI} strokeWidth={2} fill="none" strokeLinecap="round" />
    </g>
  );
}

export function AxolotlTank({ w, h, c, anim }: ArtProps) {
  const cx = w / 2;
  const b = h - 6;
  return (
    <g>
      <Shadow cx={cx} b={b} rx={20} />
      <rect x={cx - 20} y={b - 28} width={40} height={28} rx={3} fill="rgba(160,215,240,0.45)" stroke={OUT} strokeWidth={SW} />
      <rect x={cx - 19} y={b - 22} width={38} height={21} fill={c.water} opacity={0.55} />
      <rect x={cx - 19} y={b - 5} width={38} height={4} fill="#c9b48a" />
      <g>
        <Move on={anim} values="-5 0; 5 -2; -5 0" dur="6s" />
        <path d={`M ${cx - 10} ${b - 9} q -6 -1 -8 2`} stroke={c.body} strokeWidth={3} fill="none" strokeLinecap="round" />
        <ellipse cx={cx - 3} cy={b - 9} rx={8} ry={3.5} fill={c.body} stroke={OUT} strokeWidth={0.8} />
        <ellipse cx={cx + 6} cy={b - 11} rx={5} ry={4} fill={c.body} stroke={OUT} strokeWidth={0.8} />
        {[-1, 0, 1].map((k) => (
          <path key={k} d={`M ${cx + 3} ${b - 13 + k * 1.5} l -4 ${-3 + k * 2.5}`} stroke={c.gills} strokeWidth={1.6} strokeLinecap="round">
            {anim && <animateTransform attributeName="transform" type="rotate" values={`0 ${cx + 3} ${b - 13};${k * 8} ${cx + 3} ${b - 13};0 ${cx + 3} ${b - 13}`} dur="1.6s" repeatCount="indefinite" />}
          </path>
        ))}
        <circle cx={cx + 8} cy={b - 12} r={0.9} fill="#1d2230" />
        <path d={`M ${cx + 8} ${b - 9.5} q 1.5 1 3 0`} stroke="#7a4a5a" strokeWidth={0.6} fill="none" />
      </g>
      <rect x={cx - 21} y={b - 30} width={42} height={3} rx={1.5} fill="#3a3f4a" />
      <path d={`M ${cx - 17} ${b - 24} v 16`} stroke={HI} strokeWidth={2} strokeLinecap="round" />
    </g>
  );
}
