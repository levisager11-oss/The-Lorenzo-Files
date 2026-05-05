export default function SecurityBreach({ onDismiss }) {
    return (
        <div
            className="breach-flash"
            style={{
                position: 'fixed', inset: 0, zIndex: 9990,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
            }}
            onClick={onDismiss}
        >
            <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.5rem, 8vw, 5.5rem)',
                fontWeight: 700, color: 'white',
                letterSpacing: '0.3em',
                animation: 'blink 0.3s step-end infinite',
                textAlign: 'center',
                padding: '0 16px',
            }}>
                SECURITY BREACH
            </div>
            <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 13, letterSpacing: '0.35em',
                color: 'rgba(255,255,255,0.65)', marginTop: 16,
                textAlign: 'center', padding: '0 16px',
            }}>
                UNAUTHORIZED ACCESS DETECTED — CLICK TO DISMISS
            </div>
        </div>
    );
}
