import "./logo.css";

/** Simple mark: a link glyph formed from two rounded strokes. */
export function Logo({ size = 22 }: { size?: number }) {
  return (
    <span className="logo" aria-hidden>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <path d="M9.5 14.5 14.5 9.5" />
        <path d="M8 11 6.2 12.8a3.6 3.6 0 0 0 5.1 5.1L13 16.1" />
        <path d="m16 13 1.8-1.8a3.6 3.6 0 0 0-5.1-5.1L11 7.9" />
      </svg>
    </span>
  );
}

export function Wordmark() {
  return (
    <span className="wordmark">
      <Logo />
      <span className="wordmark__text">Shortenly</span>
    </span>
  );
}
