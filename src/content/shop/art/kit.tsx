import { useId } from 'react';

/** Shared look for all item art: soft dark outline, rounded corners, white highlights. */
export const OUT = 'rgba(24,28,44,0.30)';
export const SW = 1.5;
export const HI = 'rgba(255,255,255,0.45)';
export const LO = 'rgba(0,0,0,0.14)';

/** Stable, CSS-safe id for <pattern>/<linearGradient> definitions. */
export function useSvgId(prefix: string): string {
  return prefix + useId().replace(/[^a-zA-Z0-9]/g, '');
}

/** Looping opacity/position animation that switches off when `on` is false. */
export function Anim({
  on,
  attr,
  values,
  dur,
  begin = '0s',
}: {
  on: boolean;
  attr: string;
  values: string;
  dur: string;
  begin?: string;
}) {
  if (!on) return null;
  return <animate attributeName={attr} values={values} dur={dur} begin={begin} repeatCount="indefinite" />;
}

export function Move({ on, values, dur, begin = '0s' }: { on: boolean; values: string; dur: string; begin?: string }) {
  if (!on) return null;
  return (
    <animateTransform attributeName="transform" type="translate" values={values} dur={dur} begin={begin} repeatCount="indefinite" additive="sum" />
  );
}

export function Spin({ on, from, to, dur }: { on: boolean; from: string; to: string; dur: string }) {
  if (!on) return null;
  return <animateTransform attributeName="transform" type="rotate" from={from} to={to} dur={dur} repeatCount="indefinite" />;
}

/** Glass vessel seen from above: rim ring + liquid. */
export function GlassTop({ cx, cy, r, liquid }: { cx: number; cy: number; r: number; liquid?: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="rgba(220,240,255,0.55)" stroke={OUT} strokeWidth={SW} />
      {liquid && <circle cx={cx} cy={cy} r={r * 0.72} fill={liquid} opacity={0.9} />}
      <path d={`M ${cx - r * 0.55} ${cy - r * 0.3} a ${r * 0.6} ${r * 0.6} 0 0 1 ${r * 0.5} -${r * 0.35}`} stroke={HI} strokeWidth={2} fill="none" strokeLinecap="round" />
    </g>
  );
}
