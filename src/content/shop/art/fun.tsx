import type { ArtProps } from '../types';
import { shade } from '@/lib/color';
import { Anim, HI, Move, OUT, SW, useSvgId } from './kit';
import { Base, FlaskShape } from './equipment';

/** Pip the lab rat – sits, breathes and twitches its nose. */
export function LabRatPet({ w, h, c, anim }: ArtProps) {
  const cx = w / 2;
  const b = h - 6;
  return (
    <g>
      <Base cx={cx} y={b} rx={15} />
      {/* bed */}
      <ellipse cx={cx} cy={b - 3} rx={18} ry={6} fill={c.bed} stroke={OUT} strokeWidth={SW} />
      <ellipse cx={cx} cy={b - 4} rx={14} ry={3.5} fill={shade(c.bed, 0.2)} />
      {/* tail */}
      <path d={`M ${cx + 9} ${b - 8} q 14 -2 12 -14 q -1 -6 -6 -6`} stroke="#f2a9b8" strokeWidth={2.4} fill="none" strokeLinecap="round" />
      <g>
        <Move on={anim} values="0 0; 0 -0.8; 0 0" dur="2.6s" />
        {/* body */}
        <ellipse cx={cx} cy={b - 15} rx={12} ry={11} fill={c.fur} stroke={OUT} strokeWidth={SW} />
        <ellipse cx={cx} cy={b - 12} rx={7} ry={6} fill={shade(c.fur, 0.25)} />
        {/* head */}
        <circle cx={cx} cy={b - 29} r={8.5} fill={c.fur} stroke={OUT} strokeWidth={SW} />
        <circle cx={cx - 8} cy={b - 36} r={5} fill={c.fur} stroke={OUT} strokeWidth={SW} />
        <circle cx={cx + 8} cy={b - 36} r={5} fill={c.fur} stroke={OUT} strokeWidth={SW} />
        <circle cx={cx - 8} cy={b - 36} r={2.8} fill="#f2a9b8" />
        <circle cx={cx + 8} cy={b - 36} r={2.8} fill="#f2a9b8" />
        <circle cx={cx - 3.3} cy={b - 30} r={1.5} fill={c.eye} />
        <circle cx={cx + 3.3} cy={b - 30} r={1.5} fill={c.eye} />
        <circle cx={cx - 2.8} cy={b - 30.5} r={0.5} fill="#fff" />
        <circle cx={cx + 3.8} cy={b - 30.5} r={0.5} fill="#fff" />
        <circle cx={cx} cy={b - 25.5} r={1.6} fill="#e57a92">
          <Anim on={anim} attr="cy" values={`${b - 25.5};${b - 26.2};${b - 25.5};${b - 25.5}`} dur="1.1s" />
        </circle>
        <path d={`M ${cx - 3} ${b - 25} h -7 M ${cx - 3} ${b - 24} l -6 2 M ${cx + 3} ${b - 25} h 7 M ${cx + 3} ${b - 24} l 6 2`} stroke="rgba(60,60,60,0.5)" strokeWidth={0.6} />
        {/* paws */}
        <ellipse cx={cx - 4} cy={b - 18} rx={2.4} ry={1.6} fill="#f2a9b8" />
        <ellipse cx={cx + 4} cy={b - 18} rx={2.4} ry={1.6} fill="#f2a9b8" />
      </g>
    </g>
  );
}

export function BubblingFlask({ w, h, c, anim }: ArtProps) {
  const cx = w / 2;
  const b = h - 6;
  return (
    <g>
      <Base cx={cx} y={b} rx={15} />
      <circle cx={cx} cy={b - 12} r={14} fill={c.liquid} opacity={0.18}>
        <Anim on={anim} attr="opacity" values="0.12;0.28;0.12" dur="2.2s" />
      </circle>
      <FlaskShape cx={cx} b={b} size={26} liquid={c.liquid} level={0.6} />
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={cx - 4 + (i % 3) * 4} cy={b - 34} r={1.8 + (i % 2)} fill={shade(c.liquid, 0.35)}>
          <Anim on={anim} attr="opacity" values="0;1;0" dur="1.6s" begin={`${i * 0.4}s`} />
          <Move on={anim} values={`0 10; ${(i % 2 ? 1 : -1) * 2} -10`} dur="1.6s" begin={`${i * 0.4}s`} />
        </circle>
      ))}
      {[0, 1].map((i) => (
        <circle key={'in' + i} cx={cx - 5 + i * 9} cy={b - 6} r={1.4} fill="#fff" opacity={0.7}>
          <Move on={anim} values="0 0; 0 -9" dur="1.2s" begin={`${i * 0.6}s`} />
          <Anim on={anim} attr="opacity" values="0.8;0" dur="1.2s" begin={`${i * 0.6}s`} />
        </circle>
      ))}
    </g>
  );
}

export function LavaLamp({ w, h, c, anim }: ArtProps) {
  const cx = w / 2;
  const b = h - 6;
  const id = useSvgId('lava');
  const glass = `M ${cx - 6} ${b - 52} Q ${cx - 9} ${b - 30} ${cx - 10} ${b - 14} H ${cx + 10} Q ${cx + 9} ${b - 30} ${cx + 6} ${b - 52} Z`;
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <path d={glass} />
        </clipPath>
      </defs>
      <Base cx={cx} y={b} rx={12} />
      <ellipse cx={cx} cy={b - 32} rx={18} ry={22} fill={c.blob} opacity={0.14} />
      <path d={glass} fill={c.liquid} stroke={OUT} strokeWidth={SW} />
      <g clipPath={`url(#${id})`}>
        <ellipse cx={cx - 2} cy={b - 20} rx={6} ry={5} fill={c.blob}>
          <Move on={anim} values="0 0; 1 -26; 0 0" dur="7s" />
        </ellipse>
        <ellipse cx={cx + 3} cy={b - 40} rx={4} ry={5} fill={c.blob}>
          <Move on={anim} values="0 0; -2 22; 0 0" dur="9s" />
        </ellipse>
        <ellipse cx={cx} cy={b - 15} rx={9} ry={3} fill={c.blob} />
      </g>
      <path d={`M ${cx - 4} ${b - 48} Q ${cx - 6} ${b - 32} ${cx - 7} ${b - 20}`} stroke={HI} strokeWidth={1.5} fill="none" />
      <path d={`M ${cx - 6} ${b - 52} h 12 l -2 -6 h -8 Z`} fill={c.metal} stroke={OUT} />
      <path d={`M ${cx - 10} ${b - 14} h 20 l 4 14 h -28 Z`} fill={c.metal} stroke={OUT} strokeWidth={SW} />
    </g>
  );
}

export function TeslaCoil({ w, h, c, anim }: ArtProps) {
  const cx = w / 2;
  const b = h - 4;
  const bolt = (d: string, begin: string) => (
    <path d={d} stroke={c.spark} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={anim ? 0 : 0.9}>
      <Anim on={anim} attr="opacity" values="0;1;0;0;0.8;0;0;0" dur="1.3s" begin={begin} />
    </path>
  );
  return (
    <g>
      <Base cx={cx} y={b} rx={16} />
      <rect x={cx - 15} y={b - 10} width={30} height={10} rx={3} fill="#3b3f4a" stroke={OUT} strokeWidth={SW} />
      <rect x={cx - 5} y={b - 52} width={10} height={43} rx={2} fill={c.coil} stroke={OUT} />
      {Array.from({ length: 10 }, (_, i) => (
        <line key={i} x1={cx - 5} x2={cx + 5} y1={b - 50 + i * 4.2} y2={b - 48.5 + i * 4.2} stroke={shade(c.coil, -0.35)} strokeWidth={1} />
      ))}
      <ellipse cx={cx} cy={b - 58} rx={14} ry={6} fill="#c9d1da" stroke={OUT} strokeWidth={SW} />
      <ellipse cx={cx - 4} cy={b - 60} rx={5} ry={1.6} fill={HI} />
      <circle cx={cx} cy={b - 60} r={18} fill={c.spark} opacity={0.12}>
        <Anim on={anim} attr="opacity" values="0.05;0.22;0.08;0.18;0.05" dur="1.3s" />
      </circle>
      {bolt(`M ${cx - 12} ${b - 60} l -6 -4 l 3 -2 l -7 -5`, '0s')}
      {bolt(`M ${cx + 12} ${b - 61} l 5 -6 l -3 -1 l 6 -6`, '0.35s')}
      {bolt(`M ${cx} ${b - 64} l 2 -6 l -3 -1 l 2 -7`, '0.7s')}
    </g>
  );
}

export function NeonSign({ w, h, c, anim }: ArtProps) {
  const id = useSvgId('glow');
  return (
    <g>
      <defs>
        <filter id={id} x="-30%" y="-60%" width="160%" height="220%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect x={6} y={8} width={w - 12} height={h - 16} rx={10} fill="#1d2230" stroke={OUT} strokeWidth={SW} />
      <circle cx={14} cy={16} r={1.8} fill="#555" />
      <circle cx={w - 14} cy={16} r={1.8} fill="#555" />
      <g filter={`url(#${id})`}>
        <text x={w / 2} y={h / 2 + 9} textAnchor="middle" fontSize={26} fontWeight={700} fill="none" stroke={c.tube} strokeWidth={2.4} fontFamily="'Fredoka Variable', system-ui, sans-serif" letterSpacing={1}>
          {c.text || 'H₂O'}
          <Anim on={anim} attr="opacity" values="1;1;1;0.35;1;1;0.6;1;1;1" dur="5s" />
        </text>
      </g>
    </g>
  );
}

