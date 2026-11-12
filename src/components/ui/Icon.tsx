/** Hand-drawn 24×24 stroke icon set (one consistent style, no icon font). */
const P: Record<string, string> = {
  home: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  play: 'M7 4.5v15l12-7.5z',
  flask: 'M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3M7.5 14h9',
  bag: 'M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  settings:
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
  book: 'M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5zM4 19.5A1.5 1.5 0 0 0 5.5 21H20M8 7h8M8 11h6',
  timer: 'M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 9v4l2.5 2M9 2h6',
  calendar: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4M8 14h2M12 14h2M8 17h2',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
  flame: 'M12 21c4 0 7-2.7 7-6.5 0-3.5-2.5-5.5-4-8.5-1 2-2 3-3.5 3.5C11 7 11 5 12 3 8 5 5 9.5 5 14.5 5 18.3 8 21 12 21zM12 21c-1.7 0-3-1.3-3-3 0-2 1.5-3 3-4.5 1.5 1.5 3 2.5 3 4.5 0 1.7-1.3 3-3 3z',
  spark: 'M12 2v5M12 17v5M2 12h5M17 12h5M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3',
  trophy: 'M8 4h8v5a4 4 0 0 1-8 0zM8 6H4.5a3 3 0 0 0 3.5 4M16 6h3.5a3 3 0 0 1-3.5 4M12 13v4M8 21h8M9 17h6v4H9z',
  badge: 'M12 2l2.4 2.1 3.2-.3.7 3.1 2.8 1.6-1.3 2.9 1.3 2.9-2.8 1.6-.7 3.1-3.2-.3L12 22l-2.4-2.1-3.2.3-.7-3.1-2.8-1.6L4.2 12 2.9 9.1l2.8-1.6.7-3.1 3.2.3zM8.5 12l2.5 2.5 4.5-5',
  crown: 'M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5zM5 19h14',
  check: 'M4.5 12.5l5 5 10-11',
  x: 'M6 6l12 12M18 6L6 18',
  'chevron-left': 'M15 5l-7 7 7 7',
  'chevron-right': 'M9 5l7 7-7 7',
  'chevron-down': 'M5 9l7 7 7-7',
  'arrow-up': 'M12 19V5M5 12l7-7 7 7',
  'arrow-down': 'M12 5v14M5 12l7 7 7-7',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  edit: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
  upload: 'M12 16V4M7 9l5-5 5 5M4 16v4h16v-4',
  download: 'M12 4v12M7 11l5 5 5-5M4 16v4h16v-4',
  copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
  rotate: 'M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7',
  undo: 'M9 14L4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3',
  move: 'M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3',
  coin: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9 9.5c0-1.4 1.3-2 3-2s3 .6 3 2-1.3 1.8-3 2.3-3 .9-3 2.4 1.3 2.3 3 2.3 3-.7 3-2M12 6v1.5M12 16.5V18',
  lock: 'M6 11h12v10H6zM8 11V8a4 4 0 0 1 8 0v3',
  volume: 'M4 9h4l5-4v14l-5-4H4zM16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12',
  'volume-off': 'M4 9h4l5-4v14l-5-4H4zM17 9l5 6M22 9l-5 6',
  sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1.5v2M12 20.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M1.5 12h2M20.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4',
  moon: 'M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5z',
  grip: 'M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01',
  image: 'M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M15.5 9.5h.01',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8h.01',
  sparkles: 'M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z',
  box: 'M3 7.5L12 3l9 4.5v9L12 21l-9-4.5zM3 7.5l9 4.5 9-4.5M12 12v9',
  menu: 'M4 6h16M4 12h16M4 18h16',
  pause: 'M8 5h3v14H8zM13 5h3v14h-3z',
  refresh: 'M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5',
  door: 'M5 21V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v17M3 21h18M14.5 12h.01',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 12h.01',
  atom: 'M12 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM12 21c2.2 0 4-4 4-9s-1.8-9-4-9-4 4-4 9 1.8 9 4 9zM4.2 16.5c1.1 1.9 5.5 1.5 9.8-1s6.9-6.1 5.8-8-5.5-1.5-9.8 1-6.9 6.1-5.8 8zM4.2 7.5c-1.1 1.9 1.5 5.5 5.8 8s8.7 2.9 9.8 1-1.5-5.5-5.8-8-8.7-2.9-9.8-1z',
  scale: 'M12 3v18M7 21h10M5 7h14M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z',
  grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  drop: 'M12 3s7 7.5 7 12a7 7 0 0 1-14 0c0-4.5 7-12 7-12z',
  exam: 'M7 3h10l3 3v15H4V3zM8 9h8M8 13h8M8 17h5',
  heart: 'M12 20s-7.5-4.6-9.2-9.1C1.7 7.8 3.6 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.4 0 5.3 3.3 4.2 6.4C19.5 15.4 12 20 12 20z',
  flip: 'M12 3v18M8 7l-5 5 5 5V7zM16 7l5 5-5 5V7z',
  pencil: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
  hand: 'M8 13V5.5a1.5 1.5 0 0 1 3 0V11M11 10V4.5a1.5 1.5 0 0 1 3 0V11M14 10.5V6a1.5 1.5 0 0 1 3 0v8a7 7 0 0 1-7 7h-.5A6.5 6.5 0 0 1 4 15.5V12a1.5 1.5 0 0 1 3 0v1',
};

export type IconName = keyof typeof P | string;

export function Icon({ name, size = 20, className = '', strokeWidth = 2, title }: { name: IconName; size?: number; className?: string; strokeWidth?: number; title?: string }) {
  const d = P[name] ?? P.info;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={'shrink-0 ' + className}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title && <title>{title}</title>}
      <path d={d} />
    </svg>
  );
}
