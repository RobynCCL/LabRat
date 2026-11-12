import type { ArtProps } from '../types';
import { shade } from '@/lib/color';
import { Anim, HI, LO, OUT, SW } from './kit';

/*
 * Front-view furniture sprites. Each draws standing on a base line near the
 * bottom of its box (b = h - 5) and may extend upwards past the top of its tile.
 */

const Shadow = ({ cx, b, rx }: { cx: number; b: number; rx: number }) => <ellipse cx={cx} cy={b} rx={rx} ry={Math.max(3, rx * 0.18)} fill={LO} />;

export function Beanbag({ w, h, c }: ArtProps) {
  const cx = w / 2;
  const b = h - 5;
  return (
    <g>
      <Shadow cx={cx} b={b} rx={19} />
      <path d={`M ${cx - 19} ${b - 2} Q ${cx - 22} ${b - 26} ${cx - 6} ${b - 32} Q ${cx + 10} ${b - 36} ${cx + 18} ${b - 22} Q ${cx + 23} ${b - 8} ${cx + 17} ${b - 1} Q ${cx} ${b + 3} ${cx - 19} ${b - 2} Z`} fill={c.base} stroke={OUT} strokeWidth={SW} />
      <path d={`M ${cx - 12} ${b - 12} Q ${cx} ${b - 20} ${cx + 13} ${b - 11}`} stroke={shade(c.base, -0.18)} strokeWidth={2} fill="none" strokeLinecap="round" />
      <path d={`M ${cx - 10} ${b - 27} q 6 -4 12 -3`} stroke={HI} strokeWidth={2.5} fill="none" strokeLinecap="round" />
    </g>
  );
}

export function Sofa({ w, h, c }: ArtProps) {
  const b = h - 5;
  const dark = shade(c.base, -0.15);
  return (
    <g>
      <Shadow cx={w / 2} b={b} rx={w / 2 - 4} />
      {/* back */}
      <rect x={8} y={b - 40} width={w - 16} height={24} rx={9} fill={dark} stroke={OUT} strokeWidth={SW} />
      {/* seat cushions */}
      <rect x={10} y={b - 22} width={w / 2 - 11} height={13} rx={5} fill={c.base} stroke={OUT} />
      <rect x={w / 2 + 1} y={b - 22} width={w / 2 - 11} height={13} rx={5} fill={c.base} stroke={OUT} />
      {/* arms */}
      <rect x={2} y={b - 30} width={11} height={26} rx={5} fill={c.base} stroke={OUT} strokeWidth={SW} />
      <rect x={w - 13} y={b - 30} width={11} height={26} rx={5} fill={c.base} stroke={OUT} strokeWidth={SW} />
      <rect x={10} y={b - 9} width={w - 20} height={6} rx={2} fill={shade(c.base, -0.3)} />
      <rect x={8} y={b - 3} width={4} height={4} fill="#5a4636" />
      <rect x={w - 12} y={b - 3} width={4} height={4} fill="#5a4636" />
      {/* cushion */}
      <rect x={w / 2 + 8} y={b - 34} width={16} height={14} rx={4} fill={c.cushion} stroke={OUT} transform={`rotate(-8 ${w / 2 + 16} ${b - 27})`} />
      <path d={`M 14 ${b - 36} h ${w * 0.3}`} stroke={HI} strokeWidth={2} strokeLinecap="round" />
    </g>
  );
}

export function Armchair({ w, h, c }: ArtProps) {
  const cx = w / 2;
  const b = h - 5;
  return (
    <g>
      <Shadow cx={cx} b={b} rx={18} />
      <rect x={cx - 15} y={b - 40} width={30} height={26} rx={10} fill={shade(c.base, -0.15)} stroke={OUT} strokeWidth={SW} />
      <rect x={cx - 13} y={b - 20} width={26} height={11} rx={5} fill={c.base} stroke={OUT} />
      <rect x={cx - 21} y={b - 28} width={10} height={24} rx={5} fill={c.base} stroke={OUT} strokeWidth={SW} />
      <rect x={cx + 11} y={b - 28} width={10} height={24} rx={5} fill={c.base} stroke={OUT} strokeWidth={SW} />
      <rect x={cx - 15} y={b - 3} width={3} height={4} fill="#5a4636" />
      <rect x={cx + 12} y={b - 3} width={3} height={4} fill="#5a4636" />
      <circle cx={cx} cy={b - 30} r={1.6} fill={shade(c.base, -0.35)} />
      <path d={`M ${cx - 10} ${b - 36} h 10`} stroke={HI} strokeWidth={2} strokeLinecap="round" />
    </g>
  );
}

/** Low table – a surface, so bench-top items can sit on it. */
export function CoffeeTable({ w, h, c }: ArtProps) {
  const b = h - 5;
  return (
    <g>
      <Shadow cx={w / 2} b={b} rx={w / 2 - 4} />
      <rect x={7} y={b - 14} width={4} height={14} fill={shade(c.wood, -0.25)} />
      <rect x={w - 11} y={b - 14} width={4} height={14} fill={shade(c.wood, -0.25)} />
      <rect x={3} y={b - 22} width={w - 6} height={10} rx={4} fill={c.wood} stroke={OUT} strokeWidth={SW} />
      <rect x={6} y={b - 21} width={w - 12} height={2.5} rx={1} fill={HI} />
    </g>
  );
}

export function StudyDesk({ w, h, c }: ArtProps) {
  const b = h - 5;
  return (
    <g>
      <Shadow cx={w / 2} b={b} rx={w / 2 - 4} />
      <rect x={6} y={b - 24} width={5} height={24} fill={shade(c.wood, -0.25)} />
      <rect x={w - 34} y={b - 22} width={28} height={22} rx={2} fill={shade(c.wood, -0.08)} stroke={OUT} />
      <rect x={w - 31} y={b - 18} width={22} height={7} rx={1.5} fill={shade(c.wood, 0.08)} stroke={OUT} strokeWidth={1} />
      <rect x={w - 31} y={b - 9} width={22} height={7} rx={1.5} fill={shade(c.wood, 0.08)} stroke={OUT} strokeWidth={1} />
      <circle cx={w - 20} cy={b - 14.5} r={1.3} fill={c.knob} />
      <circle cx={w - 20} cy={b - 5.5} r={1.3} fill={c.knob} />
      <rect x={2} y={b - 30} width={w - 4} height={8} rx={3} fill={c.wood} stroke={OUT} strokeWidth={SW} />
      <rect x={5} y={b - 29} width={w * 0.5} height={2} rx={1} fill={HI} />
    </g>
  );
}

export function Bookshelf({ w, h, c }: ArtProps) {
  const b = h - 5;
  const top = b - 78;
  const shelves = [0, 1, 2];
  const books = ['#d9534f', '#3b82c4', '#e9b73a', '#4fb286', '#9b6cd1', '#e8875d', '#5dc1c9', '#3a3f4a'];
  return (
    <g>
      <Shadow cx={w / 2} b={b} rx={w / 2 - 4} />
      <rect x={4} y={top} width={w - 8} height={78} rx={4} fill={c.wood} stroke={OUT} strokeWidth={SW} />
      {shelves.map((s) => {
        const y = top + 6 + s * 24;
        return (
          <g key={s}>
            <rect x={9} y={y} width={w - 18} height={19} fill={shade(c.wood, -0.35)} />
            {Array.from({ length: Math.floor((w - 22) / 7) }, (_, i) => {
              const tall = 13 + ((i * 7 + s * 3) % 6);
              const tilt = (i + s) % 9 === 4;
              return (
                <rect
                  key={i}
                  x={11 + i * 7}
                  y={y + 19 - tall}
                  width={6}
                  height={tall}
                  rx={1}
                  fill={books[(i * 3 + s * 5) % books.length]}
                  transform={tilt ? `rotate(12 ${14 + i * 7} ${y + 19})` : undefined}
                />
              );
            })}
            <rect x={6} y={y + 19} width={w - 12} height={3} fill={shade(c.wood, 0.1)} />
          </g>
        );
      })}
    </g>
  );
}

export function FloorLamp({ w, h, c, anim }: ArtProps) {
  const cx = w / 2;
  const b = h - 5;
  return (
    <g>
      <circle cx={cx} cy={b - 58} r={26} fill={c.glow} opacity={0.22}>
        <Anim on={anim} attr="opacity" values="0.18;0.28;0.18" dur="4s" />
      </circle>
      <Shadow cx={cx} b={b} rx={10} />
      <ellipse cx={cx} cy={b - 2} rx={9} ry={3} fill={c.metal} stroke={OUT} />
      <rect x={cx - 1.5} y={b - 56} width={3} height={54} fill={c.metal} />
      <path d={`M ${cx - 14} ${b - 52} L ${cx - 9} ${b - 72} H ${cx + 9} L ${cx + 14} ${b - 52} Z`} fill={c.shade} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
      <ellipse cx={cx} cy={b - 52} rx={14} ry={2.5} fill={c.glow} />
    </g>
  );
}

export function TallCactus({ w, h, c }: ArtProps) {
  const cx = w / 2;
  const b = h - 5;
  return (
    <g>
      <Shadow cx={cx} b={b} rx={13} />
      <path d={`M ${cx - 12} ${b - 16} h 24 l -3 16 h -18 Z`} fill={c.pot} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
      <path d={`M ${cx - 6} ${b - 40} h -6 a 4 4 0 0 1 -4 -4 v -10 a 3 3 0 0 1 6 0 v 8 h 4`} fill={c.cactus} stroke={OUT} />
      <path d={`M ${cx + 6} ${b - 32} h 6 a 4 4 0 0 0 4 -4 v -14 a 3 3 0 0 0 -6 0 v 12 h -4`} fill={c.cactus} stroke={OUT} />
      <rect x={cx - 7} y={b - 64} width={14} height={50} rx={7} fill={c.cactus} stroke={OUT} strokeWidth={SW} />
      <path d={`M ${cx - 2} ${b - 60} v 42 M ${cx + 3} ${b - 58} v 40`} stroke={shade(c.cactus, -0.2)} strokeWidth={1} />
      <circle cx={cx} cy={b - 65} r={3} fill={c.flower} stroke={OUT} strokeWidth={1} />
    </g>
  );
}

export function RoundRug({ w, h, c }: ArtProps) {
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) / 2 - 3;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={c.a} stroke={OUT} strokeWidth={SW} />
      <circle cx={cx} cy={cy} r={r * 0.72} fill={c.b} />
      <circle cx={cx} cy={cy} r={r * 0.45} fill={c.a} />
      <circle cx={cx} cy={cy} r={r * 0.2} fill={c.b} />
      <circle cx={cx} cy={cy} r={r - 4} fill="none" stroke={shade(c.a, 0.25)} strokeWidth={1.5} strokeDasharray="3 4" />
    </g>
  );
}
