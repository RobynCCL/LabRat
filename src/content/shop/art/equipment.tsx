import type { ArtProps } from '../types';
import { shade } from '@/lib/color';
import { Anim, HI, LO, Move, OUT, SW } from './kit';

/* Top-down furniture: a worktop with a darker front lip suggests height. */

function Worktop({ w, h, top, inset = 3 }: { w: number; h: number; top: string; inset?: number }) {
  return (
    <g>
      <rect x={inset} y={inset} width={w - inset * 2} height={h - inset * 2} rx={7} fill={shade(top, -0.28)} stroke={OUT} strokeWidth={SW} />
      <rect x={inset} y={inset} width={w - inset * 2} height={h - inset * 2 - 6} rx={7} fill={top} />
      <rect x={inset + 5} y={inset + 4} width={w - inset * 2 - 10} height={3} rx={1.5} fill={HI} />
    </g>
  );
}

export function LabBench({ w, h, c }: ArtProps) {
  return (
    <g>
      <Worktop w={w} h={h} top={c.top} />
      {/* gas taps along the back edge */}
      {[0.25, 0.75].map((f) => (
        <g key={f}>
          <circle cx={w * f} cy={10} r={3} fill={c.tap} stroke={OUT} />
        </g>
      ))}
    </g>
  );
}

export function IslandBench({ w, h, c }: ArtProps) {
  return (
    <g>
      <Worktop w={w} h={h} top={c.top} />
      <rect x={w / 2 - 4} y={10} width={8} height={h - 26} rx={4} fill={shade(c.top, -0.15)} />
      {[0.3, 0.5, 0.7].map((f) => (
        <circle key={f} cx={w / 2} cy={h * f} r={3.2} fill={c.tap} stroke={OUT} />
      ))}
    </g>
  );
}

export function FumeHood({ w, h, c }: ArtProps) {
  return (
    <g>
      <rect x={3} y={3} width={w - 6} height={h - 6} rx={6} fill={shade(c.body, -0.25)} stroke={OUT} strokeWidth={SW} />
      <rect x={3} y={3} width={w - 6} height={h - 12} rx={6} fill={c.body} />
      <rect x={8} y={h - 22} width={w - 16} height={10} rx={3} fill="rgba(170,215,240,0.75)" stroke={OUT} />
      <rect x={10} y={h - 20} width={w * 0.3} height={2} fill={HI} />
      <circle cx={w / 2} cy={16} r={9} fill={shade(c.body, -0.12)} stroke={OUT} />
      <circle cx={w / 2} cy={16} r={5} fill={shade(c.body, -0.35)} />
      <circle cx={w - 14} cy={12} r={3} fill={c.light} />
    </g>
  );
}

export function Sink({ w, h, c }: ArtProps) {
  return (
    <g>
      <Worktop w={w} h={h} top={c.top} />
      <rect x={9} y={12} width={w - 18} height={h - 26} rx={8} fill="#c9d3dc" stroke={OUT} />
      <rect x={12} y={15} width={w - 24} height={h - 32} rx={6} fill="#aebccb" />
      <circle cx={w / 2} cy={h / 2 - 2} r={2.5} fill="#7b8794" />
      <rect x={w / 2 - 2} y={6} width={4} height={12} rx={2} fill="#d0d6dc" stroke={OUT} />
    </g>
  );
}

export function ReagentCabinet({ w, h, c }: ArtProps) {
  const bottles = ['#e85d5d', '#f2b134', '#4fb286', '#4a90d9', '#9b6cd1', '#e8875d', '#5dc1c9', '#d95d9b'];
  const n = Math.floor((w - 16) / 11);
  return (
    <g>
      <Worktop w={w} h={h} top={c.body} />
      {Array.from({ length: n }, (_, i) => (
        <g key={i}>
          <circle cx={12 + i * 11} cy={h / 2 - 6} r={4.2} fill={bottles[(i + (c.seed ? 3 : 0)) % bottles.length]} stroke={OUT} strokeWidth={1} />
          <circle cx={11 + i * 11} cy={h / 2 - 7.5} r={1.3} fill={HI} />
        </g>
      ))}
      <rect x={8} y={h - 16} width={w - 16} height={3} rx={1.5} fill={LO} />
    </g>
  );
}

export function Stool({ w, h, c }: ArtProps) {
  const r = Math.min(w, h) * 0.3;
  return (
    <g>
      {[0, 90, 180, 270].map((a) => (
        <circle key={a} cx={w / 2 + Math.cos((a * Math.PI) / 180 + 0.8) * r * 1.15} cy={h / 2 + Math.sin((a * Math.PI) / 180 + 0.8) * r * 1.15} r={2.5} fill="#7b8794" />
      ))}
      <circle cx={w / 2} cy={h / 2 + 2} r={r} fill={shade(c.seat, -0.3)} />
      <circle cx={w / 2} cy={h / 2} r={r} fill={c.seat} stroke={OUT} strokeWidth={SW} />
      <ellipse cx={w / 2 - r * 0.3} cy={h / 2 - r * 0.35} rx={r * 0.4} ry={r * 0.2} fill={HI} />
    </g>
  );
}

/* Front-view sprites for small items: drawn standing on a base line, may poke above their tile. */

export function Base({ cx, y, rx }: { cx: number; y: number; rx: number }) {
  return <ellipse cx={cx} cy={y} rx={rx} ry={rx * 0.28} fill={LO} />;
}

export function FireExtinguisher({ w, h, c }: ArtProps) {
  const cx = w / 2;
  const b = h - 5;
  return (
    <g>
      <Base cx={cx} y={b} rx={12} />
      <rect x={cx - 9} y={b - 40} width={18} height={40} rx={8} fill={c.body} stroke={OUT} strokeWidth={SW} />
      <rect x={cx - 9} y={b - 26} width={18} height={10} fill={c.band} />
      <rect x={cx - 6} y={b - 36} width={3} height={24} rx={1.5} fill={HI} />
      <rect x={cx - 4} y={b - 48} width={8} height={9} rx={2} fill="#3a3a3a" />
      <path d={`M ${cx + 4} ${b - 45} h 8 l 3 5`} stroke="#3a3a3a" strokeWidth={3} fill="none" strokeLinecap="round" />
      <path d={`M ${cx + 9} ${b - 38} q 8 12 2 30`} stroke="#2b2b2b" strokeWidth={2.5} fill="none" strokeLinecap="round" />
    </g>
  );
}

export function BunsenBurner({ w, h, c, anim }: ArtProps) {
  const cx = w / 2;
  const b = h - 6;
  return (
    <g>
      <Base cx={cx} y={b} rx={13} />
      <rect x={cx - 12} y={b - 6} width={24} height={6} rx={3} fill="#556270" stroke={OUT} />
      <rect x={cx - 3.5} y={b - 28} width={7} height={23} rx={2} fill="#9aa6b2" stroke={OUT} />
      <rect x={cx - 4.5} y={b - 16} width={9} height={4} rx={1} fill="#6d7884" />
      <path d={`M ${cx + 12} ${b - 3} q 8 0 9 6`} stroke="#e88a3c" strokeWidth={3} fill="none" strokeLinecap="round" />
      <g>
        <path d={`M ${cx} ${b - 52} C ${cx + 8} ${b - 42} ${cx + 7} ${b - 30} ${cx} ${b - 29} C ${cx - 7} ${b - 30} ${cx - 8} ${b - 42} ${cx} ${b - 52} Z`} fill={c.outer} opacity={0.8}>
          <Anim on={anim} attr="opacity" values="0.8;0.55;0.85;0.6;0.8" dur="0.7s" />
        </path>
        <path d={`M ${cx} ${b - 42} C ${cx + 4} ${b - 37} ${cx + 3.5} ${b - 31} ${cx} ${b - 30} C ${cx - 3.5} ${b - 31} ${cx - 4} ${b - 37} ${cx} ${b - 42} Z`} fill={c.inner}>
          <Anim on={anim} attr="opacity" values="1;0.8;1" dur="0.5s" />
        </path>
      </g>
    </g>
  );
}

function Beaker({ x, b, bw, bh, liquid }: { x: number; b: number; bw: number; bh: number; liquid: string }) {
  return (
    <g>
      <rect x={x} y={b - bh * 0.55} width={bw} height={bh * 0.55} rx={2} fill={liquid} opacity={0.85} />
      <path d={`M ${x - 1} ${b - bh} h ${bw + 2} M ${x} ${b - bh} v ${bh - 2} q 0 2 2 2 h ${bw - 4} q 2 0 2 -2 v ${-bh + 2}`} fill="rgba(220,240,255,0.35)" stroke={OUT} strokeWidth={SW} />
      <path d={`M ${x - 1} ${b - bh} l -2 -2`} stroke={OUT} strokeWidth={SW} />
      <rect x={x + 2} y={b - bh + 3} width={2} height={bh - 8} rx={1} fill={HI} />
    </g>
  );
}

export function BeakerSet({ w, h, c }: ArtProps) {
  const b = h - 6;
  return (
    <g>
      <Base cx={w / 2} y={b} rx={18} />
      <Beaker x={w / 2 - 17} b={b} bw={14} bh={22} liquid={c.a} />
      <Beaker x={w / 2 - 1} b={b} bw={11} bh={16} liquid={c.b} />
      <Beaker x={w / 2 + 11} b={b} bw={8} bh={12} liquid={c.c} />
    </g>
  );
}

export function FlaskShape({ cx, b, size, liquid, level = 0.45 }: { cx: number; b: number; size: number; liquid: string; level?: number }) {
  const s = size;
  const neck = s * 0.22;
  const top = b - s * 1.25;
  const shoulder = b - s * 0.75;
  const path = `M ${cx - neck} ${top} V ${shoulder} L ${cx - s * 0.62} ${b - 3} Q ${cx - s * 0.64} ${b} ${cx - s * 0.58} ${b} H ${cx + s * 0.58} Q ${cx + s * 0.64} ${b} ${cx + s * 0.62} ${b - 3} L ${cx + neck} ${shoulder} V ${top} Z`;
  const ly = b - s * 0.75 * level;
  const lx = neck + (s * 0.62 - neck) * (1 - level);
  return (
    <g>
      <path d={`M ${cx - lx} ${ly} L ${cx - s * 0.6} ${b - 2} H ${cx + s * 0.6} L ${cx + lx} ${ly} Z`} fill={liquid} opacity={0.88} />
      <path d={path} fill="rgba(220,240,255,0.35)" stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
      <rect x={cx - neck - 1.5} y={top - 2} width={neck * 2 + 3} height={3} rx={1.5} fill="rgba(220,240,255,0.8)" stroke={OUT} strokeWidth={1} />
      <path d={`M ${cx - s * 0.32} ${b - s * 0.45} L ${cx - s * 0.45} ${b - 6}`} stroke={HI} strokeWidth={2} strokeLinecap="round" />
    </g>
  );
}

export function ConicalFlask({ w, h, c }: ArtProps) {
  const b = h - 6;
  return (
    <g>
      <Base cx={w / 2} y={b} rx={15} />
      <FlaskShape cx={w / 2} b={b} size={26} liquid={c.liquid} />
    </g>
  );
}

export function TestTubeRack({ w, h, c }: ArtProps) {
  const b = h - 6;
  const cols = [c.a, c.b, c.c, c.d];
  return (
    <g>
      <Base cx={w / 2} y={b} rx={19} />
      {cols.map((col, i) => {
        const x = w / 2 - 15 + i * 10;
        return (
          <g key={i}>
            <rect x={x - 3} y={b - 30} width={6} height={26} rx={3} fill="rgba(230,245,255,0.6)" stroke={OUT} />
            <rect x={x - 2} y={b - 17 + (i % 2) * 3} width={4} height={12 - (i % 2) * 3} rx={2} fill={col} />
          </g>
        );
      })}
      <rect x={w / 2 - 20} y={b - 22} width={40} height={5} rx={2} fill={c.rack} stroke={OUT} />
      <rect x={w / 2 - 20} y={b - 6} width={40} height={6} rx={2} fill={shade(c.rack, -0.15)} stroke={OUT} />
      <rect x={w / 2 - 20} y={b - 20} width={3} height={16} fill={shade(c.rack, -0.1)} />
      <rect x={w / 2 + 17} y={b - 20} width={3} height={16} fill={shade(c.rack, -0.1)} />
    </g>
  );
}

export function BuretteStand({ w, h, c }: ArtProps) {
  const b = h - 6;
  const cx = w / 2;
  return (
    <g>
      <Base cx={cx} y={b} rx={18} />
      <rect x={cx - 18} y={b - 5} width={30} height={5} rx={2} fill={c.base} stroke={OUT} />
      <rect x={cx - 14} y={b - 66} width={3} height={62} rx={1.5} fill="#9aa6b2" stroke={OUT} strokeWidth={1} />
      <rect x={cx - 13} y={b - 56} width={18} height={3} rx={1.5} fill="#7b8794" />
      <rect x={cx + 2} y={b - 70} width={7} height={46} rx={2} fill="rgba(230,245,255,0.6)" stroke={OUT} />
      <rect x={cx + 3} y={b - 60} width={5} height={35} rx={1.5} fill={c.liquid} opacity={0.85} />
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1={cx + 3} x2={cx + 6} y1={b - 64 + i * 8} y2={b - 64 + i * 8} stroke="#555" strokeWidth={0.7} />
      ))}
      <rect x={cx + 1} y={b - 25} width={9} height={3} rx={1} fill="#4a90d9" />
      <path d={`M ${cx + 5.5} ${b - 22} v 6`} stroke={OUT} strokeWidth={1.5} />
      <FlaskShape cx={cx + 6} b={b} size={14} liquid="#f6b9cf" />
    </g>
  );
}

export function Microscope({ w, h, c }: ArtProps) {
  const b = h - 6;
  const cx = w / 2;
  return (
    <g>
      <Base cx={cx} y={b} rx={15} />
      <rect x={cx - 14} y={b - 6} width={26} height={6} rx={3} fill={c.body} stroke={OUT} />
      <path d={`M ${cx + 6} ${b - 6} Q ${cx + 16} ${b - 26} ${cx + 4} ${b - 40}`} stroke={c.body} strokeWidth={7} fill="none" strokeLinecap="round" />
      <rect x={cx - 12} y={b - 22} width={20} height={3} rx={1.5} fill="#2f3640" />
      <g transform={`rotate(-20 ${cx} ${b - 40})`}>
        <rect x={cx - 5} y={b - 54} width={9} height={28} rx={3} fill="#e9eef2" stroke={OUT} />
        <rect x={cx - 6} y={b - 58} width={11} height={6} rx={2} fill="#2f3640" />
        <rect x={cx - 3} y={b - 28} width={5} height={6} rx={1} fill="#2f3640" />
      </g>
      <circle cx={cx + 9} cy={b - 22} r={3} fill={c.accent} stroke={OUT} strokeWidth={1} />
    </g>
  );
}

/** Small bubbles that rise and pop – reused by the bubbling flask. */
export function Bubbles({ cx, cy, colour, anim, spread = 6 }: { cx: number; cy: number; colour: string; anim: boolean; spread?: number }) {
  return (
    <g>
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={cx + (i - 1) * spread * 0.6} cy={cy} r={2 + (i % 2)} fill={colour} opacity={0.9}>
          <Anim on={anim} attr="opacity" values="0;0.9;0" dur="1.4s" begin={`${i * 0.45}s`} />
          <Move on={anim} values={`0 4; ${i - 1} -10`} dur="1.4s" begin={`${i * 0.45}s`} />
        </circle>
      ))}
    </g>
  );
}
