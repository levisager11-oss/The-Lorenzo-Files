export default function RadarSeal({ size = 64 }) {
  const ticks = Array.from({ length: 12 }).map((_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return {
      x1: 32 + 27 * Math.cos(a), y1: 32 + 27 * Math.sin(a),
      x2: 32 + 29 * Math.cos(a), y2: 32 + 29 * Math.sin(a),
    };
  });

  const ac = 'var(--c-ac)';

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox="0 0 64 64" style={{ position: 'absolute', inset: 0 }}>
        {[28, 22, 16, 10].map((r, i) => (
          <circle key={i} cx="32" cy="32" r={r} fill="none" style={{ stroke: ac, opacity: 0.2 }} strokeWidth="0.5" />
        ))}
        <line x1="32" y1="4" x2="32" y2="60" style={{ stroke: ac, opacity: 0.15 }} strokeWidth="0.5" />
        <line x1="4" y1="32" x2="60" y2="32" style={{ stroke: ac, opacity: 0.15 }} strokeWidth="0.5" />
        <circle cx="32" cy="32" r="30" fill="none" style={{ stroke: ac, opacity: 0.5 }} strokeWidth="1" strokeDasharray="4 3" />
        {ticks.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} style={{ stroke: ac, opacity: 0.55 }} strokeWidth="1" />
        ))}
        <circle cx="32" cy="32" r="2" style={{ fill: ac, opacity: 0.9 }} />
      </svg>
      <svg width={size} height={size} viewBox="0 0 64 64" style={{ position: 'absolute', inset: 0 }} className="radar-sweep">
        <defs>
          <radialGradient id="sweep-grad">
            <stop offset="0%" style={{ stopColor: ac, stopOpacity: 0.55 }} />
            <stop offset="100%" style={{ stopColor: ac, stopOpacity: 0 }} />
          </radialGradient>
        </defs>
        <path d="M32,32 L32,4 A28,28 0 0,1 60,32 Z" fill="url(#sweep-grad)" opacity="0.75" />
        <line x1="32" y1="32" x2="32" y2="4" style={{ stroke: ac, opacity: 1 }} strokeWidth="1" />
      </svg>
    </div>
  );
}
