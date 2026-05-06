import { useEffect, useState } from 'react';

const KONAMI = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'b', 'a',
];

export default function MemeEasterEgg() {
    const [visible, setVisible] = useState(false);
    const [imgError, setImgError] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let seq = [];
        const handler = (e) => {
            seq = [...seq, e.key].slice(-KONAMI.length);
            const matched = KONAMI.slice(0, seq.length).every((k, i) => k === seq[i]);
            if (!matched) {
                seq = [];
                setProgress(0);
                return;
            }
            setProgress(seq.length / KONAMI.length);
            if (seq.length === KONAMI.length) {
                setVisible(true);
                setImgError(false);
                seq = [];
                setProgress(0);
            }
        };
        const triggerDirect = () => { setVisible(true); setImgError(false); };
        window.addEventListener('keydown', handler);
        window.addEventListener('lorenzoEasterEgg', triggerDirect);
        return () => {
            window.removeEventListener('keydown', handler);
            window.removeEventListener('lorenzoEasterEgg', triggerDirect);
        };
    }, []);

    if (!visible) {
        return progress > 0 ? (
            <div style={{
                position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
                zIndex: 9998, display: 'flex', gap: 4, padding: '6px 10px',
                background: 'rgba(0,0,0,0.7)', borderRadius: 4,
                border: '1px solid rgba(0,212,255,0.2)',
            }}>
                {KONAMI.map((_, i) => (
                    <div key={i} style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: i < Math.round(progress * KONAMI.length)
                            ? 'var(--c-ac)'
                            : 'rgba(0,212,255,0.15)',
                        transition: 'background 150ms',
                        boxShadow: i < Math.round(progress * KONAMI.length)
                            ? '0 0 6px var(--c-ac)'
                            : 'none',
                    }} />
                ))}
            </div>
        ) : null;
    }

    return (
        <div
            onClick={() => setVisible(false)}
            style={{
                position: 'fixed', inset: 0, zIndex: 9995,
                background: 'rgba(0,0,0,0.96)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', padding: 24,
                animation: 'fadeIn 0.3s ease',
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 20, maxWidth: 480, width: '100%',
                    animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)',
                }}
            >
                {/* Header badge */}
                <div style={{
                    fontFamily: 'var(--font-display)', fontSize: 9,
                    letterSpacing: '0.4em', color: '#ff2d55',
                    border: '1px solid rgba(255,45,85,0.5)',
                    padding: '4px 16px', borderRadius: 2,
                    textTransform: 'uppercase',
                }}>
                    ◆ CLASSIFIED OPERATIVE IDENTIFIED ◆
                </div>

                {/* Image or fallback */}
                <div style={{
                    position: 'relative',
                    border: '2px solid rgba(0,212,255,0.25)',
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: '0 0 60px rgba(0,212,255,0.1), 0 0 120px rgba(0,0,0,0.8)',
                    maxWidth: 320,
                    width: '100%',
                    background: '#000',
                }}>
                    {!imgError ? (
                        <img
                            src="/meme.png"
                            alt="Classified Operative"
                            onError={() => setImgError(true)}
                            style={{ width: '100%', display: 'block', maxHeight: 420, objectFit: 'contain' }}
                        />
                    ) : (
                        <div style={{
                            padding: '40px 24px', textAlign: 'center',
                            fontFamily: 'var(--font-mono)', color: 'var(--c-ac)',
                            lineHeight: 1.4,
                        }}>
                            <div style={{ fontSize: 64, marginBottom: 8 }}>🪵</div>
                            <div style={{ fontSize: 11, letterSpacing: '0.2em', opacity: 0.6 }}>
                                [IMAGE REDACTED]
                            </div>
                            <div style={{ fontSize: 9, marginTop: 6, opacity: 0.4, letterSpacing: '0.1em' }}>
                                place meme.png in /public to reveal operative
                            </div>
                        </div>
                    )}

                    {/* Scan line effect */}
                    <div style={{
                        position: 'absolute', inset: 0, pointerEvents: 'none',
                        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
                    }} />

                    {/* Classified stamp */}
                    <div style={{
                        position: 'absolute', bottom: 10, right: 10,
                        fontFamily: 'var(--font-display)', fontSize: 11,
                        fontWeight: 700, color: 'rgba(255,45,85,0.7)',
                        letterSpacing: '0.25em', border: '2px solid rgba(255,45,85,0.4)',
                        padding: '2px 8px', borderRadius: 2,
                        transform: 'rotate(-8deg)',
                        textTransform: 'uppercase',
                    }}>
                        TOP SECRET
                    </div>
                </div>

                {/* Name plate */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(1.2rem, 4vw, 1.8rem)',
                        fontWeight: 700, color: 'var(--c-ac)',
                        letterSpacing: '0.22em',
                        textShadow: '0 0 20px var(--ac-a35)',
                    }}>
                        OPERATIVE: MR TUNG
                    </div>
                    <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: 10,
                        letterSpacing: '0.18em', color: 'var(--c-tx2)',
                        marginTop: 6, opacity: 0.7,
                    }}>
                        STATUS: EXTREMELY SUSPICIOUS // ARMED WITH BASEBALL BAT
                    </div>
                    <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: 9,
                        letterSpacing: '0.12em', color: '#ff2d55',
                        marginTop: 4, opacity: 0.8,
                    }}>
                        ⚠ DO NOT APPROACH — APPROACH ANYWAY ⚠
                    </div>
                </div>

                {/* Dismiss */}
                <button
                    onClick={() => setVisible(false)}
                    style={{
                        background: 'transparent', color: 'var(--c-tx3)',
                        border: '1px solid rgba(0,212,255,0.15)',
                        padding: '7px 20px', borderRadius: 2,
                        fontFamily: 'var(--font-display)', fontSize: 9,
                        letterSpacing: '0.2em', textTransform: 'uppercase',
                        cursor: 'pointer', transition: 'all 150ms',
                    }}
                    onMouseOver={e => { e.currentTarget.style.color = 'var(--c-ac)'; e.currentTarget.style.borderColor = 'var(--c-ac)'; }}
                    onMouseOut={e => { e.currentTarget.style.color = 'var(--c-tx3)'; e.currentTarget.style.borderColor = 'rgba(0,212,255,0.15)'; }}
                >
                    BURN AFTER READING
                </button>
            </div>
        </div>
    );
}
