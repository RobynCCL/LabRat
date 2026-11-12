export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <rect width="64" height="64" rx="16" fill="rgb(var(--primary))" />
      <path d="M25 12h14v4h-2v12l11 18a5 5 0 0 1-4.3 7.5H20.3A5 5 0 0 1 16 46l11-18V16h-2z" fill="#f6f5f0" />
      <path d="M21 42h22l3 5a2 2 0 0 1-1.7 3H19.7a2 2 0 0 1-1.7-3z" fill="#5eead4" />
      <circle cx="29" cy="37" r="2" fill="#5eead4" />
      <circle cx="35" cy="33" r="1.5" fill="#5eead4" />
    </svg>
  );
}

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-display font-semibold tracking-tight ${className}`}>
      Lab<span className="text-primary">Rat</span>
    </span>
  );
}
