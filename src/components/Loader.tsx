export function Loader({ inline }: { inline?: boolean }) {
  return (
    <div className={`grid place-items-center ${inline ? 'py-24' : 'h-full'}`} role="status" aria-label="…">
      <svg width="56" height="56" viewBox="0 0 64 64" className="animate-pulse">
        <path d="M25 10h14v4h-2v12l11 18a5 5 0 0 1-4.3 7.5H20.3A5 5 0 0 1 16 44l11-18V14h-2z" fill="rgb(var(--primary))" />
      </svg>
    </div>
  );
}
