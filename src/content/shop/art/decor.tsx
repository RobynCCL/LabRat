import { useEffect, useState } from 'react';
import type { ArtProps } from '../types';
import { shade } from '@/lib/color';
import { HI, LO, Move, OUT, SW, useSvgId } from './kit';

/* ───────────── Wall items (front view) ───────────── */

function Frame({ w, h, frame, paper }: { w: number; h: number; frame: string; paper: string }) {
  return (
    <g>
      <rect x={4} y={4} width={w - 8} height={h - 8} rx={4} fill={LO} transform="translate(2 3)" />
      <rect x={4} y={4} width={w - 8} height={h - 8} rx={4} fill={frame} stroke={OUT} strokeWidth={SW} />
      <rect x={8} y={8} width={w - 16} height={h - 16} rx={2} fill={paper} />
    </g>
  );
}

/** Real periodic-table shape: 18 columns, with s/p/d/f blocks coloured. */
const PT_ROWS: [number, number][][] = [
  [[0, 0], [17, 17]],
  [[0, 1], [12, 17]],
  [[0, 1], [12, 17]],
  [[0, 17]],
  [[0, 17]],
  [[0, 17]],
  [[0, 17]],
];

export function PeriodicTablePoster({ w, h, c }: ArtProps) {
  const pad = 12;
  const cw = (w - pad * 2) / 18;
  const ch = Math.max(1, (h - pad * 2 - 4) / 8.5);
  const block = (col: number) => (col < 2 ? c.s : col < 12 ? c.d : c.p);
  return (
    <g>
      <Frame w={w} h={h} frame={c.frame} paper={c.paper} />
      {PT_ROWS.map((ranges, r) =>
        ranges.flatMap(([a, b]) =>
          Array.from({ length: b - a + 1 }, (_, i) => {
            const col = a + i;
            if (r === 0 && col === 17) return <rect key={`${r}-${col}`} x={pad + col * cw} y={pad + r * ch} width={cw - 0.8} height={ch - 0.8} fill={c.noble} rx={0.6} />;
            return <rect key={`${r}-${col}`} x={pad + col * cw} y={pad + r * ch} width={cw - 0.8} height={ch - 0.8} rx={0.6} fill={col === 17 ? c.noble : block(col)} />;
          }),
        ),
      )}
      {[0, 1].map((r) =>
        Array.from({ length: 14 }, (_, i) => (
          <rect key={`f${r}${i}`} x={pad + (i + 2.5) * cw} y={pad + 7 * ch + 4 + r * ch * 0.75} width={cw - 0.8} height={ch * 0.7} rx={0.6} fill={c.f} />
        )),
      )}
    </g>
  );
}

export function SafetyPoster({ w, h, c }: ArtProps) {
  return (
    <g>
      <Frame w={w} h={h} frame={c.frame} paper={c.paper} />
      <rect x={10} y={10} width={w - 20} height={14} rx={2} fill={c.band} />
      <text x={w / 2} y={20.5} textAnchor="middle" fontSize={8} fontWeight={800} fill="#fff" fontFamily="system-ui, sans-serif">
        SAFETY
      </text>
      {/* goggles */}
      <g transform={`translate(${w / 2} ${h / 2 + 6})`}>
        <path d="M -16 -2 Q -16 -9 -8 -9 L 8 -9 Q 16 -9 16 -2 Q 16 6 8 6 Q 3 6 0 1 Q -3 6 -8 6 Q -16 6 -16 -2 Z" fill={c.band} stroke={OUT} strokeWidth={SW} />
        <ellipse cx={-7.5} cy={-1.5} rx={6} ry={4.5} fill="#cfefff" />
        <ellipse cx={7.5} cy={-1.5} rx={6} ry={4.5} fill="#cfefff" />
        <path d="M -10 -3 q 2 -2 4 -2" stroke="#fff" strokeWidth={1.5} fill="none" />
      </g>
      <text x={w / 2} y={h - 13} textAnchor="middle" fontSize={7} fontWeight={700} fill="#333" fontFamily="system-ui, sans-serif">
        GOGGLES ON
      </text>
    </g>
  );
}

export function MoleculePoster({ w, h, c }: ArtProps) {
  // benzene ring with hydrogens
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) * 0.2;
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a), cx + r * 1.65 * Math.cos(a), cy + r * 1.65 * Math.sin(a)];
  });
  return (
    <g>
      <Frame w={w} h={h} frame={c.frame} paper={c.paper} />
      {pts.map(([x, y, hx, hy], i) => {
        const [nx, ny] = pts[(i + 1) % 6];
        return (
          <g key={i}>
            <line x1={x} y1={y} x2={nx} y2={ny} stroke="#555" strokeWidth={2} />
            <line x1={x} y1={y} x2={hx} y2={hy} stroke="#888" strokeWidth={1.5} />
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={r * 0.55} fill="none" stroke="#555" strokeWidth={1.5} />
      {pts.map(([x, y, hx, hy], i) => (
        <g key={'a' + i}>
          <circle cx={hx} cy={hy} r={3} fill="#f4f4f4" stroke={OUT} />
          <circle cx={x} cy={y} r={4.5} fill={c.atom} stroke={OUT} />
        </g>
      ))}
    </g>
  );
}

export function Whiteboard({ w, h, c }: ArtProps) {
  return (
    <g>
      <rect x={4} y={4} width={w - 8} height={h - 10} rx={4} fill={LO} transform="translate(2 3)" />
      <rect x={4} y={4} width={w - 8} height={h - 10} rx={4} fill={c.frame} stroke={OUT} strokeWidth={SW} />
      <rect x={8} y={8} width={w - 16} height={h - 18} rx={2} fill="#fbfdff" />
      <rect x={12} y={10} width={w * 0.4} height={3} rx={1.5} fill="rgba(0,0,0,0.04)" />
      <g fontFamily="'Comic Sans MS', 'Chalkboard SE', 'Fredoka Variable', system-ui, sans-serif" fontWeight={600}>
        <text x={16} y={30} fontSize={13} fill={c.ink1}>
          PV = nRT
        </text>
        <text x={16} y={52} fontSize={11.5} fill={c.ink2}>
          N₂ + 3H₂ ⇌ 2NH₃
        </text>
        <text x={16} y={72} fontSize={10} fill={c.ink1}>
          n = m ÷ Mr
        </text>
      </g>
      <path d={`M ${w - 60} 32 q 15 -18 30 0 t 22 -6`} stroke={c.ink2} strokeWidth={2} fill="none" strokeLinecap="round" />
      <rect x={w / 2 - 30} y={h - 9} width={60} height={5} rx={2} fill={shade(c.frame, -0.2)} />
      <rect x={w / 2 - 18} y={h - 12} width={12} height={4} rx={2} fill={c.ink1} />
      <rect x={w / 2 + 2} y={h - 12} width={12} height={4} rx={2} fill={c.ink2} />
    </g>
  );
}

function useMinuteClock(active: boolean) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(new Date()), 20_000);
    return () => clearInterval(t);
  }, [active]);
  return now;
}

export function WallClock({ w, h, c, anim }: ArtProps) {
  const now = useMinuteClock(anim);
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) / 2 - 6;
  const mins = now.getMinutes() + now.getSeconds() / 60;
  const hrs = (now.getHours() % 12) + mins / 60;
  const secs = now.getSeconds();
  return (
    <g>
      <circle cx={cx + 2} cy={cy + 3} r={r} fill={LO} />
      <circle cx={cx} cy={cy} r={r} fill={c.rim} stroke={OUT} strokeWidth={SW} />
      <circle cx={cx} cy={cy} r={r - 4} fill="#fffdf7" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <circle key={i} cx={cx + Math.sin(a) * (r - 8)} cy={cy - Math.cos(a) * (r - 8)} r={i % 3 === 0 ? 1.6 : 0.9} fill="#444" />;
      })}
      <line x1={cx} y1={cy} x2={cx} y2={cy - r * 0.45} stroke="#333" strokeWidth={2.4} strokeLinecap="round" transform={`rotate(${hrs * 30} ${cx} ${cy})`} />
      <line x1={cx} y1={cy} x2={cx} y2={cy - r * 0.7} stroke="#333" strokeWidth={1.6} strokeLinecap="round" transform={`rotate(${mins * 6} ${cx} ${cy})`} />
      <g transform={`rotate(${secs * 6} ${cx} ${cy})`}>
        <line x1={cx} y1={cy + 3} x2={cx} y2={cy - r * 0.75} stroke={c.hand} strokeWidth={1} strokeLinecap="round">
          {anim && <animateTransform attributeName="transform" type="rotate" from={`0 ${cx} ${cy}`} to={`360 ${cx} ${cy}`} dur="60s" repeatCount="indefinite" />}
        </line>
      </g>
      <circle cx={cx} cy={cy} r={2} fill={c.hand} />
    </g>
  );
}

export function LabWindow({ w, h, c, anim }: ArtProps) {
  const id = useSvgId('sky');
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c.skyTop} />
          <stop offset="1" stopColor={c.skyBottom} />
        </linearGradient>
        <clipPath id={id + 'c'}>
          <rect x={8} y={8} width={w - 16} height={h - 16} rx={3} />
        </clipPath>
      </defs>
      <rect x={4} y={4} width={w - 8} height={h - 8} rx={5} fill={c.frame} stroke={OUT} strokeWidth={SW} />
      <g clipPath={`url(#${id}c)`}>
        <rect x={8} y={8} width={w - 16} height={h - 16} fill={`url(#${id})`} />
        <circle cx={w * 0.75} cy={h * 0.3} r={7} fill={c.sun} opacity={0.9} />
        {[0, 1].map((i) => (
          <g key={i} opacity={0.95}>
            <Move on={anim} values={`${-w * 0.3} 0; ${w * 0.9} 0`} dur={`${26 + i * 14}s`} begin={`${-i * 11}s`} />
            <ellipse cx={20 + i * 30} cy={h * (0.35 + i * 0.25)} rx={10} ry={5} fill="#fff" />
            <ellipse cx={28 + i * 30} cy={h * (0.33 + i * 0.25)} rx={8} ry={5} fill="#fff" />
          </g>
        ))}
        <path d={`M 8 ${h - 14} q ${w * 0.2} -10 ${w * 0.4} -2 t ${w * 0.5} -4 V ${h} H 8 Z`} fill={c.hills} />
      </g>
      <rect x={w / 2 - 2} y={8} width={4} height={h - 16} fill={c.frame} />
      <rect x={8} y={h / 2 - 2} width={w - 16} height={4} fill={c.frame} />
      <rect x={2} y={h - 8} width={w - 4} height={6} rx={3} fill={shade(c.frame, -0.15)} stroke={OUT} />
    </g>
  );
}

/* ───────────── Floor & tabletop decor (top-down) ───────────── */

function Pot({ cx, cy, r, colour }: { cx: number; cy: number; r: number; colour: string }) {
  return (
    <g>
      <circle cx={cx + 1} cy={cy + 3} r={r} fill={LO} />
      <circle cx={cx} cy={cy} r={r} fill={colour} stroke={OUT} strokeWidth={SW} />
      <circle cx={cx} cy={cy} r={r - 3} fill="#6b4a32" />
    </g>
  );
}

export function PottedPlant({ w, h, c }: ArtProps) {
  const cx = w / 2;
  const cy = h / 2;
  return (
    <g>
      <Pot cx={cx} cy={cy} r={13} colour={c.pot} />
      {Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2;
        return (
          <ellipse key={i} cx={cx + Math.cos(a) * 9} cy={cy + Math.sin(a) * 9} rx={9} ry={5} fill={i % 2 ? c.leaf : shade(c.leaf, -0.12)} stroke={OUT} strokeWidth={1} transform={`rotate(${(a * 180) / Math.PI} ${cx + Math.cos(a) * 9} ${cy + Math.sin(a) * 9})`} />
        );
      })}
      <circle cx={cx} cy={cy} r={5} fill={shade(c.leaf, 0.15)} />
    </g>
  );
}

export function Monstera({ w, h, c }: ArtProps) {
  const cx = w / 2;
  const cy = h / 2;
  return (
    <g>
      <Pot cx={cx} cy={cy} r={11} colour={c.pot} />
      {[0, 72, 144, 216, 288].map((deg, i) => (
        <g key={deg} transform={`rotate(${deg + 15} ${cx} ${cy})`}>
          <path d={`M ${cx} ${cy} q 6 -10 0 -22 q -12 4 0 22`} fill={i % 2 ? c.leaf : shade(c.leaf, -0.1)} stroke={OUT} strokeWidth={1} transform={`scale(1.05) translate(${-cx * 0.05} ${-cy * 0.05})`} />
          <path d={`M ${cx} ${cy - 3} l 0 -15`} stroke={shade(c.leaf, 0.25)} strokeWidth={1} />
          <circle cx={cx + 3} cy={cy - 13} r={1.4} fill={shade(c.leaf, -0.3)} />
        </g>
      ))}
    </g>
  );
}

export function DeskCactus({ w, h, c }: ArtProps) {
  const cx = w / 2;
  const b = h - 6;
  return (
    <g>
      <ellipse cx={cx} cy={b} rx={12} ry={3.5} fill={LO} />
      <path d={`M ${cx - 8} ${b - 30} q -7 0 -7 -7 v -4 q 0 -3 3 -3 q 3 0 3 3 v 4 q 0 2 2 2 Z`} fill={c.cactus} stroke={OUT} />
      <rect x={cx - 7} y={b - 42} width={14} height={30} rx={7} fill={c.cactus} stroke={OUT} strokeWidth={SW} />
      <path d={`M ${cx + 6} ${b - 24} q 7 0 7 -6 v -5 q 0 -3 -3 -3 q -3 0 -3 3 v 4`} fill={c.cactus} stroke={OUT} />
      <line x1={cx} y1={b - 38} x2={cx} y2={b - 16} stroke={shade(c.cactus, -0.2)} strokeWidth={1} />
      <circle cx={cx + 1} cy={b - 43} r={3.5} fill={c.flower} stroke={OUT} strokeWidth={1} />
      <path d={`M ${cx - 11} ${b - 15} h 22 l -3 15 h -16 Z`} fill={c.pot} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
      <rect x={cx - 12} y={b - 17} width={24} height={4} rx={2} fill={shade(c.pot, -0.12)} stroke={OUT} strokeWidth={1} />
    </g>
  );
}

export function Rug({ w, h, c }: ArtProps) {
  return (
    <g>
      <rect x={4} y={4} width={w - 8} height={h - 8} rx={10} fill={c.base} stroke={OUT} strokeWidth={SW} />
      <rect x={11} y={11} width={w - 22} height={h - 22} rx={7} fill="none" stroke={c.trim} strokeWidth={3} strokeDasharray="1 0" />
      <rect x={18} y={18} width={w - 36} height={h - 36} rx={5} fill={shade(c.base, 0.08)} />
      {/* hexagon motif */}
      <path
        d={Array.from({ length: 6 }, (_, i) => {
          const a = (Math.PI / 3) * i + Math.PI / 6;
          return `${i ? 'L' : 'M'} ${w / 2 + 14 * Math.cos(a)} ${h / 2 + 14 * Math.sin(a)}`;
        }).join(' ') + ' Z'}
        fill="none"
        stroke={c.trim}
        strokeWidth={2.5}
      />
      <circle cx={w / 2} cy={h / 2} r={7} fill="none" stroke={c.trim} strokeWidth={1.5} />
      {Array.from({ length: Math.floor((w - 16) / 8) }, (_, i) => (
        <g key={i}>
          <line x1={10 + i * 8} x2={10 + i * 8} y1={0} y2={4} stroke={c.trim} strokeWidth={1.5} />
          <line x1={10 + i * 8} x2={10 + i * 8} y1={h - 4} y2={h} stroke={c.trim} strokeWidth={1.5} />
        </g>
      ))}
      <rect x={10} y={8} width={w * 0.35} height={2} rx={1} fill={HI} opacity={0.5} />
    </g>
  );
}

