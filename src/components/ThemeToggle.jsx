export default function ThemeToggle({ lightMode, onToggle, style }) {
  return (
    <button
      onClick={onToggle}
      title={lightMode ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        background: 'var(--ac-a08)', color: 'var(--c-ac)',
        border: '1px solid var(--ac-a28)',
        padding: '5px 10px', borderRadius: 2,
        fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
        cursor: 'pointer', transition: 'all 150ms',
        fontFamily: 'var(--font-display)', fontWeight: 600,
        ...style,
      }}
      onMouseOver={e => { e.currentTarget.style.background = 'var(--ac-a12)'; e.currentTarget.style.borderColor = 'var(--c-ac)'; }}
      onMouseOut={e => { e.currentTarget.style.background = 'var(--ac-a08)'; e.currentTarget.style.borderColor = 'var(--ac-a28)'; }}
    >
      {lightMode ? (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      )}
      {lightMode ? 'BLACKOUT' : 'DAYLIGHT'}
    </button>
  );
}
