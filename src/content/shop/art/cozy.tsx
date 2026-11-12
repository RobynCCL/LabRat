import type { ArtProps } from '../types';
import { shade } from '@/lib/color';
import { Anim, HI, LO, Move, OUT, SW, Spin, useSvgId } from './kit';

const Shadow = ({ cx, b, rx }: { cx: number; b: number; rx: number }) => <ellipse cx={cx} cy={b} rx={rx} ry={Math.max(2.5, rx * 0.2)} fill={LO} />;

/* ───────────── Wall decor ───────────── */

export function StringLights({ w, c, anim }: ArtProps) {
  const n = Math.floor(w / 16);
  const cols = [c.a, c.b, c.c, c.d];
  const sag = (x: number) => 10 + Math.sin((x / w) * Math.PI) * 12;
  return (
    <g>
      <path d={`M 2 10 Q ${w / 2} 44 ${w - 2} 10`} stroke="#3a3f4a" strokeWidth={1.3} fill="none" />
      {Array.from({ length: n }, (_, i) => {
        const x = 8 + i * ((w - 16) / (n - 1));
        const y = sag(x) + 3;
        const col = cols[i % cols.length];
        return (
          <g key={i}>
            <circle cx={x} cy={y + 3} r={7} fill={col} opacity={0.25}>
              <Anim on={anim} attr="opacity" values="0.1;0.35;0.1" dur={`${1.6 + (i % 3) * 0.5}s`} begin={`${(i % 4) * 0.3}s`} />
            </circle>
            <rect x={x - 1.5} y={y - 3} width={3} height={3} fill="#3a3f4a" />
            <ellipse cx={x} cy={y + 3} rx={3} ry={4} fill={col}>
              <Anim on={anim} attr="opacity" values="1;0.6;1" dur={`${1.6 + (i % 3) * 0.5}s`} begin={`${(i % 4) * 0.3}s`} />
            </ellipse>
          </g>
        );
      })}
    </g>
  );
}

export function TrophyShelf({ w, h, c }: ArtProps) {
  const b = h - 8;
  return (
    <g>
      <rect x={4} y={b} width={w - 8} height={5} rx={2} fill={c.wood} stroke={OUT} />
      <path d={`M 10 ${b + 5} l 4 6 M ${w - 10} ${b + 5} l -4 6`} stroke={shade(c.wood, -0.3)} strokeWidth={2.5} />
      {/* trophy */}
      <g>
        <path d={`M 14 ${b - 24} h 16 v 6 a 8 8 0 0 1 -16 0 Z`} fill="#f4c542" stroke={OUT} />
        <path d={`M 14 ${b - 22} a 4 4 0 0 0 -4 5 a 4 4 0 0 0 5 3 M 30 ${b - 22} a 4 4 0 0 1 4 5 a 4 4 0 0 1 -5 3`} stroke="#d9a425" strokeWidth={1.8} fill="none" />
        <rect x={20} y={b - 10} width={4} height={5} fill="#d9a425" />
        <rect x={16} y={b - 5} width={12} height={5} rx={1} fill="#5a4636" />
        <path d={`M 17 ${b - 22} v 4`} stroke={HI} strokeWidth={2} strokeLinecap="round" />
      </g>
      {/* medal */}
      <g>
        <path d={`M ${w / 2 - 4} ${b - 26} l 4 10 l 4 -10`} stroke={c.ribbon} strokeWidth={3} fill="none" />
        <circle cx={w / 2} cy={b - 11} r={6} fill="#cfd5dc" stroke={OUT} />
        <text x={w / 2} y={b - 8.5} textAnchor="middle" fontSize={6.5} fontWeight={800} fill="#6b7480" fontFamily="system-ui">
          1
        </text>
      </g>
      {/* flask & books */}
      <rect x={w - 34} y={b - 16} width={5} height={16} rx={1} fill="#3b82c4" />
      <rect x={w - 28} y={b - 13} width={5} height={13} rx={1} fill="#d9534f" />
      <rect x={w - 22} y={b - 18} width={5} height={18} rx={1} fill="#4fb286" transform={`rotate(10 ${w - 20} ${b})`} />
    </g>
  );
}

export function MolePortrait({ w, h, c }: ArtProps) {
  const cx = w / 2;
  const cy = h / 2;
  return (
    <g>
      <rect x={6} y={4} width={w - 12} height={h - 8} rx={3} fill={LO} transform="translate(2 3)" />
      <rect x={6} y={4} width={w - 12} height={h - 8} rx={3} fill={c.frame} stroke={OUT} strokeWidth={SW} />
      <rect x={10} y={8} width={w - 20} height={h - 16} fill={c.bg} />
      {/* a distinguished mole in a bow tie */}
      <path d={`M ${cx - 10} ${h - 8} q 0 -12 10 -12 q 10 0 10 12 Z`} fill="#3a3f4a" />
      <path d={`M ${cx - 4} ${h - 19} l 4 3 l 4 -3 v 5 l -4 -3 l -4 3 Z`} fill={c.tie} />
      <ellipse cx={cx} cy={cy - 2} rx={9} ry={8} fill="#7a5a44" stroke={OUT} />
      <circle cx={cx - 3.5} cy={cy - 4} r={1.2} fill="#1f1a17" />
      <circle cx={cx + 3.5} cy={cy - 4} r={1.2} fill="#1f1a17" />
      <ellipse cx={cx} cy={cy + 1} rx={3} ry={2} fill="#f29bb0" />
      <circle cx={cx + 3.5} cy={cy - 4} r={2.6} fill="none" stroke="#e9b73a" strokeWidth={0.9} />
    </g>
  );
}

export function Corkboard({ w, h, c }: ArtProps) {
  const notes = [c.a, c.b, c.c, '#fff'];
  return (
    <g>
      <rect x={4} y={4} width={w - 8} height={h - 8} rx={3} fill={LO} transform="translate(2 3)" />
      <rect x={4} y={4} width={w - 8} height={h - 8} rx={3} fill="#a0784f" stroke={OUT} strokeWidth={SW} />
      <rect x={8} y={8} width={w - 16} height={h - 16} fill="#d2a679" />
      {notes.map((col, i) => {
        const x = 12 + i * ((w - 30) / 3);
        const y = 11 + (i % 2) * 8;
        return (
          <g key={i} transform={`rotate(${(i % 2 ? 6 : -5)} ${x + 7} ${y + 7})`}>
            <rect x={x} y={y} width={15} height={15} fill={col} stroke="rgba(0,0,0,.12)" />
            <path d={`M ${x + 3} ${y + 6} h 9 M ${x + 3} ${y + 9.5} h 7`} stroke="rgba(0,0,0,.3)" strokeWidth={1} />
            <circle cx={x + 7.5} cy={y + 2} r={1.8} fill={['#d9534f', '#3b82c4', '#4fb286', '#e9b73a'][i]} />
          </g>
        );
      })}
    </g>
  );
}

export function Bunting({ w, c, anim }: ArtProps) {
  const n = Math.floor(w / 14);
  const cols = [c.a, c.b, c.c];
  return (
    <g>
      <path d={`M 2 8 Q ${w / 2} 22 ${w - 2} 8`} stroke="#6b5a48" strokeWidth={1.2} fill="none" />
      {Array.from({ length: n }, (_, i) => {
        const x = 6 + i * ((w - 12) / n);
        const t = (x + 5) / w;
        const y = 8 + Math.sin(t * Math.PI) * 7;
        return (
          <path key={i} d={`M ${x} ${y} h 10 l -5 12 Z`} fill={cols[i % 3]} stroke={OUT} strokeWidth={0.8}>
            {anim && <animateTransform attributeName="transform" type="rotate" values={`-4 ${x + 5} ${y};4 ${x + 5} ${y};-4 ${x + 5} ${y}`} dur={`${2.4 + (i % 3) * 0.4}s`} repeatCount="indefinite" />}
          </path>
        );
      })}
    </g>
  );
}

export function HangingPlant({ w, c, anim }: ArtProps) {
  const cx = w / 2;
  return (
    <g>
      <path d={`M ${cx} 0 L ${cx - 9} 18 M ${cx} 0 L ${cx + 9} 18`} stroke="#8a6d3b" strokeWidth={1.2} />
      <path d={`M ${cx - 11} 18 h 22 l -3 12 h -16 Z`} fill={c.pot} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
      {[-1, 0, 1].map((k) => (
        <g key={k}>
          {anim && <animateTransform attributeName="transform" type="rotate" values={`-3 ${cx} 18;3 ${cx} 18;-3 ${cx} 18`} dur={`${3 + k}s`} repeatCount="indefinite" />}
          <path d={`M ${cx + k * 7} 22 q ${k * 4} 14 ${k * 2} 28`} stroke={shade(c.leaf, -0.2)} strokeWidth={1.2} fill="none" />
          {[0, 1, 2, 3].map((j) => (
            <ellipse key={j} cx={cx + k * 7 + k * (j * 0.8) + (j % 2 ? 3 : -3)} cy={26 + j * 7} rx={4} ry={2.4} fill={j % 2 ? c.leaf : shade(c.leaf, -0.12)} transform={`rotate(${j % 2 ? 30 : -30} ${cx + k * 7} ${26 + j * 7})`} />
          ))}
        </g>
      ))}
      <ellipse cx={cx} cy={19} rx={10} ry={3} fill={shade(c.leaf, 0.05)} />
    </g>
  );
}

export function DiscoBall({ w, c, anim }: ArtProps) {
  const cx = w / 2;
  const cy = 24;
  const id = useSvgId('disco');
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <circle cx={cx} cy={cy} r={13} />
        </clipPath>
      </defs>
      <line x1={cx} y1={0} x2={cx} y2={cy - 13} stroke="#6b7480" strokeWidth={1.2} />
      <circle cx={cx} cy={cy} r={22} fill={c.glow} opacity={0.15}>
        <Anim on={anim} attr="opacity" values="0.08;0.25;0.08" dur="2s" />
      </circle>
      <circle cx={cx} cy={cy} r={13} fill="#c9d1da" stroke={OUT} strokeWidth={SW} />
      <g clipPath={`url(#${id})`}>
        <g>
          <Move on={anim} values="0 0; 6 0" dur="1.2s" />
          {Array.from({ length: 6 }, (_, r) =>
            Array.from({ length: 8 }, (_, k) => (
              <rect key={`${r}-${k}`} x={cx - 19 + k * 5 - (r % 2) * 2.5} y={cy - 13 + r * 5} width={4.2} height={4.2} fill={(r + k) % 3 === 0 ? '#fff' : (r * k) % 4 === 1 ? c.glow : '#aab4bf'} />
            )),
          )}
        </g>
      </g>
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M ${cx + (i - 1) * 16} ${cy + 18 + (i % 2) * 6} l 1.5 -4 l 1.5 4 l -1.5 4 Z`} fill="#fff" opacity={0}>
          <Anim on={anim} attr="opacity" values="0;1;0" dur="1.4s" begin={`${i * 0.45}s`} />
        </path>
      ))}
    </g>
  );
}

/* ───────────── Bench-top bits ───────────── */

export function Globe({ w, h, c, anim }: ArtProps) {
  const cx = w / 2;
  const b = h - 6;
  const id = useSvgId('globe');
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <circle cx={cx} cy={b - 22} r={11} />
        </clipPath>
      </defs>
      <Shadow cx={cx} b={b} rx={10} />
      <path d={`M ${cx - 7} ${b} h 14 l -3 -4 h -8 Z`} fill={c.stand} stroke={OUT} />
      <rect x={cx - 1} y={b - 10} width={2} height={7} fill={c.stand} />
      <circle cx={cx} cy={b - 22} r={11} fill={c.sea} stroke={OUT} strokeWidth={SW} />
      <g clipPath={`url(#${id})`}>
        <g>
          <Move on={anim} values="-14 0; 14 0" dur="10s" />
          {[-14, 14].map((o) => (
            <g key={o} transform={`translate(${o} 0)`}>
              <path d={`M ${cx - 6} ${b - 28} q 4 -3 7 0 q 2 4 -2 6 q -4 1 -5 -2 Z`} fill={c.land} />
              <path d={`M ${cx + 2} ${b - 19} q 5 -1 6 3 q -2 4 -6 2 Z`} fill={c.land} />
            </g>
          ))}
        </g>
      </g>
      <path d={`M ${cx - 13} ${b - 14} A 14 14 0 0 1 ${cx + 10} ${b - 34}`} stroke={c.stand} strokeWidth={1.8} fill="none" />
      <path d={`M ${cx - 6} ${b - 29} a 8 8 0 0 1 5 -3`} stroke={HI} strokeWidth={2} fill="none" strokeLinecap="round" />
    </g>
  );
}

export function BookStack({ w, h, c }: ArtProps) {
  const cx = w / 2;
  const b = h - 6;
  const books = [
    { col: c.a, w: 26, h: 6 },
    { col: c.b, w: 22, h: 5 },
    { col: c.c, w: 24, h: 6 },
    { col: c.a, w: 18, h: 5 },
  ];
  let y = b;
  return (
    <g>
      <Shadow cx={cx} b={b} rx={14} />
      {books.map((bk, i) => {
        y -= bk.h;
        const x = cx - bk.w / 2 + (i % 2 ? 2 : -2);
        return (
          <g key={i}>
            <rect x={x} y={y} width={bk.w} height={bk.h} rx={1.2} fill={bk.col} stroke={OUT} strokeWidth={1} />
            <rect x={x + bk.w - 4} y={y + 1} width={3} height={bk.h - 2} fill="#fdfcf8" />
          </g>
        );
      })}
      <path d={`M ${cx + 2} ${y} q 2 -6 6 -8`} stroke={c.c} strokeWidth={1.5} fill="none" />
    </g>
  );
}

export function TeaMug({ w, h, c, anim }: ArtProps) {
  const cx = w / 2;
  const b = h - 6;
  return (
    <g>
      <Shadow cx={cx} b={b} rx={10} />
      {[0, 1].map((i) => (
        <path key={i} d={`M ${cx - 3 + i * 6} ${b - 20} q -3 -4 0 -8 q 3 -4 0 -8`} stroke="#c9d1da" strokeWidth={1.8} fill="none" strokeLinecap="round" opacity={0.8}>
          <Anim on={anim} attr="opacity" values="0;0.8;0" dur="2.4s" begin={`${i * 1.1}s`} />
          <Move on={anim} values="0 2; 0 -4" dur="2.4s" begin={`${i * 1.1}s`} />
        </path>
      ))}
      <path d={`M ${cx + 7} ${b - 14} a 4.5 4.5 0 0 1 0 9`} stroke={c.mug} strokeWidth={2.5} fill="none" />
      <rect x={cx - 8} y={b - 18} width={15} height={18} rx={3} fill={c.mug} stroke={OUT} strokeWidth={SW} />
      <ellipse cx={cx - 0.5} cy={b - 17} rx={6.5} ry={1.6} fill="#8a5a3a" />
      <text x={cx - 0.5} y={b - 6} textAnchor="middle" fontSize={6} fontWeight={800} fill="#fff" fontFamily="system-ui">
        {c.label || 'mol'}
      </text>
    </g>
  );
}

export function FireflyJar({ w, h, c, anim }: ArtProps) {
  const cx = w / 2;
  const b = h - 6;
  return (
    <g>
      <circle cx={cx} cy={b - 16} r={16} fill={c.glow} opacity={0.15}>
        <Anim on={anim} attr="opacity" values="0.08;0.22;0.08" dur="3s" />
      </circle>
      <Shadow cx={cx} b={b} rx={10} />
      <rect x={cx - 10} y={b - 28} width={20} height={28} rx={6} fill="rgba(220,240,255,0.35)" stroke={OUT} strokeWidth={SW} />
      <rect x={cx - 8} y={b - 32} width={16} height={5} rx={1.5} fill={c.lid} stroke={OUT} />
      {[
        [-4, -18],
        [3, -10],
        [5, -22],
        [-3, -7],
        [0, -14],
      ].map(([dx, dy], i) => (
        <circle key={i} cx={cx + dx} cy={b + dy} r={1.6} fill={c.glow}>
          <Anim on={anim} attr="opacity" values="0.2;1;0.2" dur={`${1.2 + i * 0.35}s`} begin={`${i * 0.3}s`} />
          <Move on={anim} values={`0 0; ${i % 2 ? 2 : -2} -2; 0 0`} dur={`${2 + i * 0.3}s`} />
        </circle>
      ))}
      <path d={`M ${cx - 7} ${b - 24} v 16`} stroke={HI} strokeWidth={2} strokeLinecap="round" />
    </g>
  );
}

export function RecordPlayer({ w, h, c, anim }: ArtProps) {
  const cx = w / 2;
  const b = h - 6;
  return (
    <g>
      <Shadow cx={cx} b={b} rx={19} />
      <rect x={cx - 19} y={b - 10} width={38} height={10} rx={2.5} fill={c.body} stroke={OUT} strokeWidth={SW} />
      <ellipse cx={cx - 3} cy={b - 12} rx={14} ry={4.5} fill="#1d2230" stroke={OUT} />
      <ellipse cx={cx - 3} cy={b - 12} rx={4} ry={1.4} fill={c.label}>
        <Anim on={anim} attr="opacity" values="1;0.6;1" dur="1.6s" />
      </ellipse>
      <path d={`M ${cx + 14} ${b - 14} l -6 -10 l -8 9`} stroke="#c9d1da" strokeWidth={1.8} fill="none" strokeLinejoin="round" />
      <circle cx={cx + 14} cy={b - 14} r={2} fill="#9aa6b2" />
      <circle cx={cx + 12} cy={b - 5} r={1.4} fill="#e9b73a" />
      {[0, 1].map((i) => (
        <text key={i} x={cx + 8 + i * 6} y={b - 24} fontSize={8} fill={c.label} opacity={0} fontFamily="system-ui">
          ♪
          <Anim on={anim} attr="opacity" values="0;1;0" dur="2s" begin={`${i}s`} />
          <Move on={anim} values="0 0; 4 -10" dur="2s" begin={`${i}s`} />
        </text>
      ))}
    </g>
  );
}

export function Volcano({ w, h, c, anim }: ArtProps) {
  const cx = w / 2;
  const b = h - 6;
  return (
    <g>
      <Shadow cx={cx} b={b} rx={16} />
      <rect x={cx - 17} y={b - 4} width={34} height={4} rx={1.5} fill="#7cbf6e" stroke={OUT} strokeWidth={1} />
      <path d={`M ${cx - 15} ${b - 4} L ${cx - 5} ${b - 24} H ${cx + 5} L ${cx + 15} ${b - 4} Z`} fill={c.rock} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
      <path d={`M ${cx - 5} ${b - 24} q 2 6 -2 10 q 3 3 1 8 M ${cx + 4} ${b - 23} q -1 5 3 9`} stroke={c.foam} strokeWidth={3} fill="none" strokeLinecap="round" />
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={cx + (i - 1.5) * 3} cy={b - 26} r={2.5 + (i % 2)} fill={c.foam}>
          <Move on={anim} values={`0 2; ${(i - 1.5) * 3} -12`} dur="1.1s" begin={`${i * 0.25}s`} />
          <Anim on={anim} attr="opacity" values="1;0" dur="1.1s" begin={`${i * 0.25}s`} />
        </circle>
      ))}
    </g>
  );
}

export function PlushMole({ w, h, c }: ArtProps) {
  const cx = w / 2;
  const b = h - 6;
  return (
    <g>
      <Shadow cx={cx} b={b} rx={12} />
      <ellipse cx={cx} cy={b - 10} rx={12} ry={10} fill={c.fur} stroke={OUT} strokeWidth={SW} />
      <ellipse cx={cx - 9} cy={b - 3} rx={4} ry={2.5} fill="#f2a9b8" stroke={OUT} strokeWidth={0.8} />
      <ellipse cx={cx + 9} cy={b - 3} rx={4} ry={2.5} fill="#f2a9b8" stroke={OUT} strokeWidth={0.8} />
      <circle cx={cx} cy={b - 22} r={9} fill={c.fur} stroke={OUT} strokeWidth={SW} />
      <circle cx={cx - 3.5} cy={b - 24} r={1.3} fill="#1f1a17" />
      <circle cx={cx + 3.5} cy={b - 24} r={1.3} fill="#1f1a17" />
      <ellipse cx={cx} cy={b - 19.5} rx={2.6} ry={1.9} fill="#f29bb0" />
      <circle cx={cx - 6} cy={b - 20} r={1.8} fill="#f2a9b8" opacity={0.6} />
      <circle cx={cx + 6} cy={b - 20} r={1.8} fill="#f2a9b8" opacity={0.6} />
      <rect x={cx - 5} y={b - 13} width={10} height={6} rx={2} fill={c.badge} />
      <text x={cx} y={b - 8.5} textAnchor="middle" fontSize={4.5} fontWeight={800} fill="#fff" fontFamily="system-ui">
        mol
      </text>
    </g>
  );
}

export function RetroTV({ w, h, c, anim }: ArtProps) {
  const cx = w / 2;
  const b = h - 6;
  return (
    <g>
      <Shadow cx={cx} b={b} rx={18} />
      <path d={`M ${cx - 6} ${b - 30} l -6 -8 M ${cx + 6} ${b - 30} l 6 -8`} stroke="#3a3f4a" strokeWidth={1.4} />
      <rect x={cx - 18} y={b - 30} width={36} height={27} rx={5} fill={c.body} stroke={OUT} strokeWidth={SW} />
      <rect x={cx - 15} y={b - 27} width={24} height={20} rx={4} fill="#1d2230" />
      <g>
        <rect x={cx - 13} y={b - 25} width={20} height={16} rx={3} fill={c.screen} opacity={0.9}>
          <Anim on={anim} attr="opacity" values="0.9;0.7;0.9;0.85;0.9" dur="1.8s" />
        </rect>
        {/* tiny molecule on screen */}
        <circle cx={cx - 6} cy={b - 18} r={2.3} fill="#fff" />
        <circle cx={cx} cy={b - 15} r={1.6} fill="#fff" />
        <circle cx={cx} cy={b - 21} r={1.6} fill="#fff" />
        <path d={`M ${cx - 6} ${b - 18} L ${cx} ${b - 15} M ${cx - 6} ${b - 18} L ${cx} ${b - 21}`} stroke="#fff" strokeWidth={0.8} />
      </g>
      <circle cx={cx + 13} cy={b - 22} r={1.8} fill="#e9b73a" />
      <circle cx={cx + 13} cy={b - 16} r={1.8} fill="#9aa6b2" />
      <rect x={cx - 12} y={b - 3} width={4} height={3} fill="#3a3f4a" />
      <rect x={cx + 8} y={b - 3} width={4} height={3} fill="#3a3f4a" />
    </g>
  );
}

/* ───────────── Big floor gadgets (front view) ───────────── */

export function ArcadeCabinet({ w, h, c, anim }: ArtProps) {
  const cx = w / 2;
  const b = h - 5;
  return (
    <g>
      <Shadow cx={cx} b={b} rx={17} />
      <path d={`M ${cx - 16} ${b} V ${b - 70} q 0 -6 6 -6 h 20 q 6 0 6 6 V ${b} Z`} fill={c.body} stroke={OUT} strokeWidth={SW} />
      <rect x={cx - 14} y={b - 74} width={28} height={9} rx={2} fill={c.marquee} />
      <text x={cx} y={b - 67.5} textAnchor="middle" fontSize={5.5} fontWeight={900} fill="#fff" fontFamily="system-ui" letterSpacing={0.4}>
        ATOM
      </text>
      <rect x={cx - 12} y={b - 62} width={24} height={20} rx={2} fill="#101521" />
      {/* game: electrons orbiting */}
      <circle cx={cx} cy={b - 52} r={2.2} fill={c.marquee} />
      <ellipse cx={cx} cy={b - 52} rx={8} ry={3.5} fill="none" stroke="#6fd3ff" strokeWidth={0.7} />
      <circle cx={cx + 8} cy={b - 52} r={1.4} fill="#a6ff4d">
        {anim && <animateTransform attributeName="transform" type="rotate" from={`0 ${cx} ${b - 52}`} to={`360 ${cx} ${b - 52}`} dur="1.6s" repeatCount="indefinite" />}
      </circle>
      <rect x={cx - 15} y={b - 40} width={30} height={9} rx={2} fill={shade(c.body, -0.2)} />
      <circle cx={cx - 7} cy={b - 36} r={2.4} fill="#d9534f" />
      <circle cx={cx + 3} cy={b - 36} r={1.8} fill="#e9b73a" />
      <circle cx={cx + 8} cy={b - 36} r={1.8} fill="#3b82c4" />
      <rect x={cx - 6} y={b - 22} width={12} height={8} rx={1} fill={shade(c.body, -0.3)} />
      <rect x={cx - 3} y={b - 19} width={6} height={1.4} fill="#e9b73a" />
      <rect x={cx - 14} y={b - 60} width={2} height={50} fill={HI} opacity={0.4} />
    </g>
  );
}

export function VendingMachine({ w, h, c }: ArtProps) {
  const cx = w / 2;
  const b = h - 5;
  const cans = ['#d9534f', '#3b82c4', '#4fb286', '#e9b73a', '#9b6cd1', '#e8875d'];
  return (
    <g>
      <Shadow cx={cx} b={b} rx={18} />
      <rect x={cx - 18} y={b - 76} width={36} height={76} rx={4} fill={c.body} stroke={OUT} strokeWidth={SW} />
      <rect x={cx - 16} y={b - 74} width={32} height={9} rx={2} fill="#fff" opacity={0.9} />
      <text x={cx} y={b - 67.3} textAnchor="middle" fontSize={6.5} fontWeight={900} fill={c.body} fontFamily="system-ui">
        FIZZ
      </text>
      <rect x={cx - 15} y={b - 62} width={22} height={40} rx={2} fill="rgba(210,235,255,0.85)" stroke={OUT} strokeWidth={1} />
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2].map((k) => <rect key={`${r}${k}`} x={cx - 13 + k * 7} y={b - 59 + r * 10} width={5} height={7} rx={1.2} fill={cans[(r * 3 + k) % cans.length]} />),
      )}
      <rect x={cx + 9} y={b - 60} width={6} height={10} rx={1} fill="#1d2230" />
      <rect x={cx + 10} y={b - 47} width={4} height={2} fill="#e9b73a" />
      <rect x={cx - 15} y={b - 17} width={22} height={8} rx={2} fill="#1d2230" />
      <path d={`M ${cx - 13} ${b - 60} v 34`} stroke="#fff" strokeWidth={2} opacity={0.6} />
    </g>
  );
}

export function Aquarium({ w, h, c, anim }: ArtProps) {
  const b = h - 5;
  const top = b - 46;
  const id = useSvgId('aqua');
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <rect x={6} y={top + 4} width={w - 12} height={28} />
        </clipPath>
      </defs>
      <Shadow cx={w / 2} b={b} rx={w / 2 - 4} />
      <rect x={6} y={b - 14} width={w - 12} height={14} rx={2} fill={c.stand} stroke={OUT} strokeWidth={SW} />
      <rect x={4} y={top} width={w - 8} height={34} rx={3} fill="rgba(140,205,240,0.55)" stroke={OUT} strokeWidth={SW} />
      <g clipPath={`url(#${id})`}>
        <rect x={6} y={top + 6} width={w - 12} height={28} fill={c.water} opacity={0.7} />
        <path d={`M 6 ${top + 32} q 10 -5 20 0 t 20 0 t 20 0 t 20 0 t 20 0 V ${top + 36} H 6 Z`} fill="#e7d3a6" />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${14 + i * 30} ${top + 32} q -4 -8 0 -16 q 4 -6 0 -12`} stroke="#4fb286" strokeWidth={2.5} fill="none" strokeLinecap="round">
            {anim && <animateTransform attributeName="transform" type="rotate" values={`-6 ${14 + i * 30} ${top + 32};6 ${14 + i * 30} ${top + 32};-6 ${14 + i * 30} ${top + 32}`} dur={`${3 + i}s`} repeatCount="indefinite" />}
          </path>
        ))}
        {[
          { y: top + 14, col: c.fish1, dur: '7s', delay: '0s' },
          { y: top + 22, col: c.fish2, dur: '9s', delay: '-3s' },
        ].map((f, i) => (
          <g key={i}>
            <Move on={anim} values={`0 0; ${w - 30} 0; 0 0`} dur={f.dur} begin={f.delay} />
            <ellipse cx={14} cy={f.y} rx={5} ry={3} fill={f.col} />
            <path d={`M 9 ${f.y} l -4 -3 v 6 Z`} fill={f.col} />
            <circle cx={16} cy={f.y - 0.8} r={0.8} fill="#1d2230" />
          </g>
        ))}
        {[0, 1].map((i) => (
          <circle key={i} cx={w - 20 - i * 6} cy={top + 30} r={1.3} fill="#fff" opacity={0.8}>
            <Move on={anim} values="0 0; 0 -22" dur="2s" begin={`${i * 0.9}s`} />
          </circle>
        ))}
      </g>
      <rect x={2} y={top - 3} width={w - 4} height={5} rx={2} fill={c.stand} stroke={OUT} />
      <path d={`M 9 ${top + 6} v 22`} stroke={HI} strokeWidth={2.5} strokeLinecap="round" />
    </g>
  );
}

export function Telescope({ w, h, c }: ArtProps) {
  const cx = w / 2;
  const b = h - 5;
  return (
    <g>
      <Shadow cx={cx} b={b} rx={16} />
      <path d={`M ${cx} ${b - 30} L ${cx - 13} ${b} M ${cx} ${b - 30} L ${cx + 13} ${b} M ${cx} ${b - 30} V ${b}`} stroke="#5a4636" strokeWidth={2.5} strokeLinecap="round" />
      <g transform={`rotate(-32 ${cx} ${b - 32})`}>
        <rect x={cx - 18} y={b - 37} width={36} height={10} rx={4} fill={c.tube} stroke={OUT} strokeWidth={SW} />
        <rect x={cx + 16} y={b - 39} width={7} height={14} rx={2} fill={shade(c.tube, -0.2)} stroke={OUT} />
        <rect x={cx - 22} y={b - 35} width={5} height={6} rx={1.5} fill="#3a3f4a" />
        <rect x={cx - 3} y={b - 37} width={4} height={10} fill={c.band} />
        <path d={`M ${cx - 14} ${b - 34} h 24`} stroke={HI} strokeWidth={1.8} strokeLinecap="round" />
      </g>
    </g>
  );
}

export function LabBot({ w, h, c, anim }: ArtProps) {
  const cx = w / 2;
  const b = h - 5;
  return (
    <g>
      <Shadow cx={cx} b={b} rx={14} />
      <g>
        <Move on={anim} values="0 0; 0 -2; 0 0" dur="2.2s" />
        <ellipse cx={cx} cy={b - 4} rx={10} ry={3} fill="#3a3f4a" />
        <rect x={cx - 11} y={b - 30} width={22} height={24} rx={7} fill={c.body} stroke={OUT} strokeWidth={SW} />
        <rect x={cx - 6} y={b - 23} width={12} height={8} rx={2} fill="#1d2230" />
        <circle cx={cx - 3} cy={b - 19} r={1.2} fill="#a6ff4d" />
        <circle cx={cx + 1} cy={b - 19} r={1.2} fill="#e9b73a" />
        <circle cx={cx + 4} cy={b - 19} r={1.2} fill="#d9534f" />
        <path d={`M ${cx - 11} ${b - 22} q -7 2 -6 10 M ${cx + 11} ${b - 22} q 7 2 6 10`} stroke={shade(c.body, -0.25)} strokeWidth={3} fill="none" strokeLinecap="round" />
        <rect x={cx - 12} y={b - 52} width={24} height={20} rx={8} fill={c.body} stroke={OUT} strokeWidth={SW} />
        <rect x={cx - 9} y={b - 47} width={18} height={10} rx={5} fill="#1d2230" />
        <g>
          <ellipse cx={cx - 4} cy={b - 42} rx={2.2} ry={2.6} fill={c.eye}>
            <Anim on={anim} attr="ry" values="2.6;2.6;0.3;2.6;2.6" dur="4s" />
          </ellipse>
          <ellipse cx={cx + 4} cy={b - 42} rx={2.2} ry={2.6} fill={c.eye}>
            <Anim on={anim} attr="ry" values="2.6;2.6;0.3;2.6;2.6" dur="4s" />
          </ellipse>
        </g>
        <line x1={cx} y1={b - 52} x2={cx} y2={b - 59} stroke="#6b7480" strokeWidth={1.5} />
        <circle cx={cx} cy={b - 60} r={2.5} fill={c.eye}>
          <Anim on={anim} attr="opacity" values="1;0.3;1" dur="1.2s" />
        </circle>
        <path d={`M ${cx - 9} ${b - 50} h 8`} stroke={HI} strokeWidth={2} strokeLinecap="round" />
      </g>
    </g>
  );
}

export function MoleculeSculpture({ w, h, c, anim }: ArtProps) {
  const cx = w / 2;
  const b = h - 5;
  const cy = b - 46;
  const atoms = [
    [0, 0, 7, c.a],
    [-13, -9, 5, c.b],
    [13, -9, 5, c.b],
    [-11, 12, 5, c.b],
    [11, 12, 5, c.c],
  ] as const;
  return (
    <g>
      <Shadow cx={cx} b={b} rx={14} />
      <rect x={cx - 11} y={b - 12} width={22} height={12} rx={2} fill="#eef0f2" stroke={OUT} strokeWidth={SW} />
      <rect x={cx - 1.5} y={b - 28} width={3} height={16} fill="#9aa6b2" />
      <g>
        <Spin on={anim} from={`0 ${cx} ${cy}`} to={`360 ${cx} ${cy}`} dur="16s" />
        {atoms.slice(1).map(([dx, dy], i) => (
          <line key={i} x1={cx} y1={cy} x2={cx + dx} y2={cy + dy} stroke="#9aa6b2" strokeWidth={2.5} />
        ))}
        {atoms.map(([dx, dy, r, col], i) => (
          <g key={'a' + i}>
            <circle cx={cx + dx} cy={cy + dy} r={r} fill={col} stroke={OUT} />
            <circle cx={cx + dx - r * 0.35} cy={cy + dy - r * 0.35} r={r * 0.3} fill="#fff" opacity={0.6} />
          </g>
        ))}
      </g>
    </g>
  );
}
