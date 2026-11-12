import type { ArtProps } from '../types';
import { shade } from '@/lib/color';
import { HI, OUT, useSvgId } from './kit';

export interface AvatarLook {
  coat: Record<string, string>;
  goggles: Record<string, string> | null;
  gloves: Record<string, string> | null;
  fur?: string;
}

export const DEFAULT_FUR = '#b9b2c9';

/**
 * The player's avatar: a rat scientist (front view). viewBox 0 0 120 140.
 * Coat colours: { base, trim, pattern? ('galaxy') }.
 */
export function AvatarFigure({ look, wave = false }: { look: AvatarLook; wave?: boolean }) {
  const fur = look.fur ?? DEFAULT_FUR;
  const coat = look.coat;
  const gid = useSvgId('coat');
  const coatFill = coat.pattern === 'galaxy' ? `url(#${gid})` : coat.base;
  const glove = look.gloves?.base ?? fur;
  return (
    <g>
      <defs>
        {coat.pattern === 'galaxy' && (
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={coat.base} />
            <stop offset="0.6" stopColor={coat.trim} />
            <stop offset="1" stopColor={coat.base} />
          </linearGradient>
        )}
      </defs>
      <ellipse cx={60} cy={134} rx={30} ry={5} fill="rgba(0,0,0,0.15)" />
      {/* tail */}
      <path d="M 82 120 q 26 4 26 -20 q 0 -10 -8 -12" stroke="#f2a9b8" strokeWidth={4} fill="none" strokeLinecap="round" />
      {/* feet */}
      <ellipse cx={48} cy={130} rx={8} ry={4} fill="#f2a9b8" stroke={OUT} />
      <ellipse cx={72} cy={130} rx={8} ry={4} fill="#f2a9b8" stroke={OUT} />
      {/* coat body */}
      <path d="M 36 74 Q 34 100 33 126 Q 60 132 87 126 Q 86 100 84 74 Q 60 64 36 74 Z" fill={coatFill} stroke={OUT} strokeWidth={2} />
      {coat.pattern === 'galaxy' &&
        [
          [44, 92], [70, 84], [62, 108], [50, 118], [78, 112], [56, 80],
        ].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i % 2 ? 1.2 : 0.8} fill="#fff" opacity={0.9} />)}
      {/* lapels & buttons */}
      <path d="M 52 70 L 60 92 L 68 70" fill={shade(coat.base, -0.06)} stroke={OUT} strokeWidth={1.5} />
      <path d="M 54 72 L 60 86 L 66 72 Q 60 68 54 72 Z" fill={shade(fur, 0.15)} />
      <line x1={60} y1={92} x2={60} y2={127} stroke={coat.trim} strokeWidth={1.5} />
      {[100, 112].map((y) => (
        <circle key={y} cx={64} cy={y} r={1.8} fill={coat.trim} />
      ))}
      <rect x={40} y={98} width={12} height={9} rx={2} fill="none" stroke={coat.trim} strokeWidth={1.5} />
      <rect x={43} y={94} width={2} height={7} rx={1} fill="#3b82c4" />
      {/* arms */}
      <path d="M 37 78 Q 26 92 30 108" stroke={coatFill} strokeWidth={11} fill="none" strokeLinecap="round" />
      <path d="M 37 78 Q 26 92 30 108" stroke={OUT} strokeWidth={1} fill="none" />
      <circle cx={30} cy={110} r={6} fill={glove} stroke={OUT} />
      {wave ? (
        <g>
          <path d="M 83 78 Q 96 70 98 54" stroke={coatFill} strokeWidth={11} fill="none" strokeLinecap="round" />
          <circle cx={98} cy={50} r={6} fill={glove} stroke={OUT} />
        </g>
      ) : (
        <g>
          <path d="M 83 78 Q 94 92 90 108" stroke={coatFill} strokeWidth={11} fill="none" strokeLinecap="round" />
          <circle cx={90} cy={110} r={6} fill={glove} stroke={OUT} />
        </g>
      )}
      {/* head */}
      <circle cx={38} cy={24} r={13} fill={fur} stroke={OUT} strokeWidth={2} />
      <circle cx={82} cy={24} r={13} fill={fur} stroke={OUT} strokeWidth={2} />
      <circle cx={38} cy={24} r={8} fill="#f2a9b8" />
      <circle cx={82} cy={24} r={8} fill="#f2a9b8" />
      <path d="M 34 48 Q 34 22 60 22 Q 86 22 86 48 Q 86 66 60 72 Q 34 66 34 48 Z" fill={fur} stroke={OUT} strokeWidth={2} />
      <ellipse cx={60} cy={58} rx={13} ry={9} fill={shade(fur, 0.25)} />
      {/* eyes */}
      <circle cx={49} cy={46} r={4} fill="#2b2233" />
      <circle cx={71} cy={46} r={4} fill="#2b2233" />
      <circle cx={50.5} cy={44.5} r={1.4} fill="#fff" />
      <circle cx={72.5} cy={44.5} r={1.4} fill="#fff" />
      {/* nose, mouth, whiskers */}
      <ellipse cx={60} cy={55} rx={4} ry={3} fill="#e57a92" />
      <path d="M 60 58 v 3 q -3 3 -6 1 M 60 61 q 3 3 6 1" stroke="#7a4a5a" strokeWidth={1.3} fill="none" strokeLinecap="round" />
      <path d="M 50 57 l -14 -3 M 50 60 l -13 3 M 70 57 l 14 -3 M 70 60 l 13 3" stroke="rgba(60,50,70,0.45)" strokeWidth={1} />
      <circle cx={44} cy={55} r={3.5} fill="#f2a9b8" opacity={0.5} />
      <circle cx={76} cy={55} r={3.5} fill="#f2a9b8" opacity={0.5} />
      {/* goggles pushed up on forehead */}
      {look.goggles && (
        <g>
          <path d="M 35 34 Q 60 28 85 34" stroke={look.goggles.strap} strokeWidth={4} fill="none" />
          <rect x={41} y={26} width={16} height={11} rx={5} fill={look.goggles.lens} stroke={look.goggles.strap} strokeWidth={2.5} />
          <rect x={63} y={26} width={16} height={11} rx={5} fill={look.goggles.lens} stroke={look.goggles.strap} strokeWidth={2.5} />
          <rect x={56} y={29} width={8} height={3} fill={look.goggles.strap} />
          <path d="M 44 29 l 4 0" stroke={HI} strokeWidth={2} strokeLinecap="round" />
          <path d="M 66 29 l 4 0" stroke={HI} strokeWidth={2} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
}

const BASE_LOOK: AvatarLook = {
  coat: { base: '#f7f8fa', trim: '#9aa6b2' },
  goggles: null,
  gloves: null,
};

/** Shop previews: show the avatar wearing just this item. */
export function CoatArt({ w, h, c }: ArtProps) {
  return (
    <g transform={`translate(${w / 2 - 60 * (h / 140)} 0) scale(${h / 140})`}>
      <AvatarFigure look={{ ...BASE_LOOK, coat: c }} />
    </g>
  );
}
export function GogglesArt({ w, h, c }: ArtProps) {
  return (
    <g transform={`translate(${w / 2 - 60 * (h / 140)} 0) scale(${h / 140})`}>
      <AvatarFigure look={{ ...BASE_LOOK, goggles: c }} />
    </g>
  );
}
export function GlovesArt({ w, h, c }: ArtProps) {
  return (
    <g transform={`translate(${w / 2 - 60 * (h / 140)} 0) scale(${h / 140})`}>
      <AvatarFigure look={{ ...BASE_LOOK, gloves: c }} wave />
    </g>
  );
}
