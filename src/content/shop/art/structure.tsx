import type { ArtProps } from '../types';
import { shade } from '@/lib/color';
import { Anim, useSvgId } from './kit';

const T = 48;

/* ───────────── Floors (fill the whole floor area) ───────────── */

export function LinoFloor({ w, h, c }: ArtProps) {
  const id = useSvgId('lino');
  return (
    <g>
      <defs>
        <pattern id={id} width={T} height={T} patternUnits="userSpaceOnUse">
          <rect width={T} height={T} fill={c.base} />
          <rect x={0.5} y={0.5} width={T - 1} height={T - 1} fill="none" stroke={shade(c.base, -0.08)} />
          <circle cx={12} cy={14} r={1.2} fill={shade(c.base, -0.12)} />
          <circle cx={33} cy={30} r={1} fill={shade(c.base, -0.1)} />
          <circle cx={22} cy={40} r={0.9} fill={shade(c.base, 0.2)} />
        </pattern>
      </defs>
      <rect width={w} height={h} fill={`url(#${id})`} />
    </g>
  );
}

export function CheckerFloor({ w, h, c }: ArtProps) {
  const id = useSvgId('chk');
  return (
    <g>
      <defs>
        <pattern id={id} width={T * 2} height={T * 2} patternUnits="userSpaceOnUse">
          <rect width={T * 2} height={T * 2} fill={c.a} />
          <rect width={T} height={T} fill={c.b} />
          <rect x={T} y={T} width={T} height={T} fill={c.b} />
        </pattern>
      </defs>
      <rect width={w} height={h} fill={`url(#${id})`} />
    </g>
  );
}

export function WoodFloor({ w, h, c }: ArtProps) {
  const id = useSvgId('wood');
  const ph = 16;
  return (
    <g>
      <defs>
        <pattern id={id} width={T * 3} height={ph * 3} patternUnits="userSpaceOnUse">
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect y={i * ph} width={T * 3} height={ph} fill={i === 1 ? shade(c.base, -0.06) : i === 2 ? shade(c.base, 0.05) : c.base} />
              <line x1={0} x2={T * 3} y1={i * ph + 0.5} y2={i * ph + 0.5} stroke={shade(c.base, -0.22)} />
              <line x1={(i * 53) % (T * 3)} x2={(i * 53) % (T * 3)} y1={i * ph} y2={i * ph + ph} stroke={shade(c.base, -0.22)} />
              <path d={`M ${20 + i * 30} ${i * ph + 8} q 10 -3 22 0`} stroke={shade(c.base, -0.12)} fill="none" />
            </g>
          ))}
        </pattern>
      </defs>
      <rect width={w} height={h} fill={`url(#${id})`} />
    </g>
  );
}

/** Hexagon tiles – a benzene-ring pun. */
export function HexFloor({ w, h, c }: ArtProps) {
  const id = useSvgId('hex');
  const s = 14; // hexagon side
  const hw = Math.sqrt(3) * s;
  const path = (cx: number, cy: number) =>
    Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i + Math.PI / 6;
      return `${i ? 'L' : 'M'} ${cx + s * Math.cos(a)} ${cy + s * Math.sin(a)}`;
    }).join(' ') + ' Z';
  return (
    <g>
      <defs>
        <pattern id={id} width={hw} height={s * 3} patternUnits="userSpaceOnUse">
          <rect width={hw} height={s * 3} fill={c.grout} />
          {[
            [hw / 2, 0],
            [0, s * 1.5],
            [hw, s * 1.5],
            [hw / 2, s * 3],
          ].map(([x, y], i) => (
            <path key={i} d={path(x, y)} fill={c.base} stroke={c.grout} strokeWidth={1.5} />
          ))}
          {[
            [hw / 2, 0],
            [0, s * 1.5],
            [hw, s * 1.5],
            [hw / 2, s * 3],
          ].map(([x, y], i) => (
            <circle key={'r' + i} cx={x} cy={y} r={s * 0.5} fill="none" stroke={shade(c.base, -0.12)} strokeWidth={1} />
          ))}
        </pattern>
      </defs>
      <rect width={w} height={h} fill={`url(#${id})`} />
    </g>
  );
}

/* ───────────── Walls (fill the back-wall face) ───────────── */

function Skirting({ w, h, colour }: { w: number; h: number; colour: string }) {
  return (
    <g>
      <rect y={h - 10} width={w} height={10} fill={colour} />
      <rect y={h - 10} width={w} height={2} fill="rgba(255,255,255,0.35)" />
    </g>
  );
}

export function PaintedWall({ w, h, c }: ArtProps) {
  const id = useSvgId('pw');
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={shade(c.base, -0.08)} />
          <stop offset="1" stopColor={c.base} />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill={`url(#${id})`} />
      <rect y={h * 0.55} width={w} height={2} fill={shade(c.base, -0.1)} opacity={0.6} />
      <Skirting w={w} h={h} colour={shade(c.base, -0.35)} />
    </g>
  );
}

export function TiledWall({ w, h, c }: ArtProps) {
  const id = useSvgId('tw');
  const tw = 24;
  const th = 12;
  return (
    <g>
      <defs>
        <pattern id={id} width={tw} height={th * 2} patternUnits="userSpaceOnUse">
          <rect width={tw} height={th * 2} fill={c.grout} />
          <rect x={1} y={1} width={tw - 2} height={th - 2} rx={2} fill={c.base} />
          <rect x={-tw / 2 + 1} y={th + 1} width={tw - 2} height={th - 2} rx={2} fill={c.base} />
          <rect x={tw / 2 + 1} y={th + 1} width={tw - 2} height={th - 2} rx={2} fill={c.base} />
        </pattern>
      </defs>
      <rect width={w} height={h} fill={`url(#${id})`} />
      <Skirting w={w} h={h} colour={shade(c.grout, -0.3)} />
    </g>
  );
}

export function BrickWall({ w, h, c }: ArtProps) {
  const id = useSvgId('bw');
  const bw = 32;
  const bh = 14;
  return (
    <g>
      <defs>
        <pattern id={id} width={bw} height={bh * 2} patternUnits="userSpaceOnUse">
          <rect width={bw} height={bh * 2} fill={c.mortar} />
          <rect x={1} y={1} width={bw - 2} height={bh - 2} rx={2} fill={c.base} />
          <rect x={-bw / 2 + 1} y={bh + 1} width={bw - 2} height={bh - 2} rx={2} fill={shade(c.base, -0.07)} />
          <rect x={bw / 2 + 1} y={bh + 1} width={bw - 2} height={bh - 2} rx={2} fill={shade(c.base, 0.05)} />
        </pattern>
      </defs>
      <rect width={w} height={h} fill={`url(#${id})`} />
      <Skirting w={w} h={h} colour={shade(c.base, -0.45)} />
    </g>
  );
}

/* ───────────── Lighting (fixtures drawn on the wall; tint applied over the room) ───────────── */

export function FluorescentLights({ w, c }: ArtProps) {
  const n = Math.max(2, Math.round(w / 220));
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const x = ((i + 0.5) * w) / n - 40;
        return (
          <g key={i}>
            <ellipse cx={x + 40} cy={16} rx={70} ry={14} fill={c.glow} opacity={0.35} />
            <rect x={x} y={4} width={80} height={10} rx={5} fill="#e8edf2" stroke="rgba(0,0,0,.2)" />
            <rect x={x + 4} y={7} width={72} height={4} rx={2} fill={c.glow} />
          </g>
        );
      })}
    </g>
  );
}

export function PendantLights({ w, c }: ArtProps) {
  const n = Math.max(3, Math.round(w / 140));
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const x = ((i + 0.5) * w) / n;
        return (
          <g key={i}>
            <line x1={x} x2={x} y1={0} y2={22} stroke="#3a3a3a" strokeWidth={1.5} />
            <circle cx={x} cy={38} r={22} fill={c.glow} opacity={0.3} />
            <path d={`M ${x - 13} ${34} Q ${x} ${14} ${x + 13} ${34} Z`} fill={c.shade} stroke="rgba(0,0,0,.25)" />
            <circle cx={x} cy={35} r={4.5} fill={c.glow} />
          </g>
        );
      })}
    </g>
  );
}

export function NeonStrip({ w, c, anim }: ArtProps) {
  return (
    <g>
      <rect x={8} y={6} width={w - 16} height={18} rx={9} fill={c.glow} opacity={0.25}>
        <Anim on={anim} attr="opacity" values="0.25;0.4;0.25" dur="2.4s" />
      </rect>
      <rect x={14} y={11} width={w - 28} height={6} rx={3} fill={c.glow}>
        <Anim on={anim} attr="opacity" values="1;0.75;1;1;0.85;1" dur="3s" />
      </rect>
      <rect x={14} y={12} width={w - 28} height={2} rx={1} fill="#fff" opacity={0.7} />
    </g>
  );
}

/* ───────────── Extra wallpapers & floors ───────────── */

export function StripedWall({ w, h, c }: ArtProps) {
  const id = useSvgId('stripe');
  return (
    <g>
      <defs>
        <pattern id={id} width={24} height={h} patternUnits="userSpaceOnUse">
          <rect width={24} height={h} fill={c.a} />
          <rect width={10} height={h} fill={c.b} />
          <rect x={12} width={2} height={h} fill={c.b} opacity={0.5} />
        </pattern>
      </defs>
      <rect width={w} height={h} fill={`url(#${id})`} />
      <rect y={h * 0.55} width={w} height={6} fill={shade(c.b, -0.15)} />
      <rect y={h * 0.55 + 6} width={w} height={h * 0.45} fill={c.a} />
      <rect y={h - 10} width={w} height={10} fill={shade(c.b, -0.35)} />
      <rect y={h - 10} width={w} height={2} fill="rgba(255,255,255,0.35)" />
    </g>
  );
}

export function StarryWall({ w, h, c, anim }: ArtProps) {
  const id = useSvgId('stars');
  const stars = Array.from({ length: Math.floor(w / 14) }, (_, i) => [(i * 53.3) % w, 8 + ((i * 37.7) % (h - 26)), i % 3]);
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c.top} />
          <stop offset="1" stopColor={c.bottom} />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill={`url(#${id})`} />
      {stars.map(([x, y, k], i) => (
        <circle key={i} cx={x} cy={y} r={k === 0 ? 1.4 : 0.8} fill={c.star}>
          {anim && k === 0 && <animate attributeName="opacity" values="1;0.3;1" dur={`${2 + (i % 4)}s`} repeatCount="indefinite" />}
        </circle>
      ))}
      <circle cx={w * 0.82} cy={22} r={9} fill={c.star} opacity={0.9} />
      <circle cx={w * 0.82 + 4} cy={19} r={8} fill={c.top} />
      <rect y={h - 10} width={w} height={10} fill={shade(c.bottom, -0.3)} />
    </g>
  );
}

export function CarpetFloor({ w, h, c }: ArtProps) {
  const id = useSvgId('carpet');
  return (
    <g>
      <defs>
        <pattern id={id} width={12} height={12} patternUnits="userSpaceOnUse">
          <rect width={12} height={12} fill={c.base} />
          <circle cx={3} cy={3} r={0.8} fill={shade(c.base, -0.08)} />
          <circle cx={9} cy={9} r={0.8} fill={shade(c.base, 0.08)} />
        </pattern>
      </defs>
      <rect width={w} height={h} fill={`url(#${id})`} />
    </g>
  );
}
