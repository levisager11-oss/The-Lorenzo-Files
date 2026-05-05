import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import RadarSeal from './RadarSeal';

export default function Header({ username }) {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const handleSignOut = () => {
        signOut(auth).catch(console.error);
    };

    const utc = time.toUTCString().split(' ')[4];

    return (
        <header style={{
            background: 'rgba(5,7,9,0.9)',
            borderBottom: '1px solid rgba(0,212,255,0.12)',
            backdropFilter: 'blur(20px)',
            position: 'sticky',
            top: 0,
            zIndex: 50,
        }}>
            <div className="top-bar" />
            <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 28px', display: 'flex', alignItems: 'stretch', minHeight: 80 }}>

                {/* Left: seal + title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 1 }}>
                    <RadarSeal size={56} />
                    <div>
                        <div style={{
                            fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700,
                            color: '#00d4ff', letterSpacing: '0.18em', lineHeight: 1,
                            textShadow: '0 0 20px rgba(0,212,255,0.35)',
                        }}>
                            DEPARTMENT OF LORENZO
                        </div>
                        <div style={{
                            fontFamily: 'var(--font-display)', fontSize: '0.7rem',
                            letterSpacing: '0.4em', color: '#7aa8cc', marginTop: 4, textTransform: 'uppercase',
                        }}>
                            INTELLIGENCE MANAGEMENT SYSTEM // DELOS NETWORK NODE 7
                        </div>
                    </div>
                </div>

                {/* Right: status cells + agent */}
                <div style={{ display: 'flex', alignItems: 'center', borderLeft: '1px solid rgba(0,212,255,0.12)' }}>
                    {[
                        { label: 'ENCRYPTION', val: 'AES-256', valColor: '#7aa8cc' },
                        { label: 'SIGNAL', val: 'ACTIVE', valColor: '#00ff88' },
                        { label: 'UTC', val: utc, valColor: '#00d4ff' },
                    ].map((s, i) => (
                        <div key={i} className="header-status-cell" style={{
                            padding: '0 20px',
                            borderRight: '1px solid rgba(0,212,255,0.12)',
                            display: 'flex', flexDirection: 'column', justifyContent: 'center',
                            gap: 4, height: '100%',
                        }}>
                            <div style={{
                                fontSize: 8, letterSpacing: '0.2em', color: '#3d5a78',
                                textTransform: 'uppercase', fontFamily: 'var(--font-display)',
                            }}>
                                {s.label}
                            </div>
                            <div style={{ fontSize: 10, letterSpacing: '0.12em', color: s.valColor, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                                {s.val}
                            </div>
                        </div>
                    ))}

                    {/* Agent + sign out */}
                    <div className="header-agent-cell" style={{
                        padding: '0 16px 0 20px',
                        display: 'flex', flexDirection: 'column', justifyContent: 'center',
                        gap: 4, height: '100%',
                    }}>
                        {username && (
                            <>
                                <div style={{ fontSize: 8, letterSpacing: '0.2em', color: '#3d5a78', fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>OPERATOR</div>
                                <div style={{ fontSize: 10, letterSpacing: '0.12em', color: '#00d4ff', fontFamily: 'var(--font-mono)' }}>{username.toUpperCase()}</div>
                            </>
                        )}
                        <button
                            onClick={handleSignOut}
                            style={{
                                background: 'rgba(255,45,85,0.1)', color: '#ff2d55',
                                border: '1px solid rgba(255,45,85,0.25)',
                                padding: '5px 12px', borderRadius: 2,
                                fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
                                display: 'flex', alignItems: 'center', gap: 5, marginTop: 2,
                                cursor: 'pointer', transition: 'all 150ms',
                                fontFamily: 'var(--font-display)', fontWeight: 600,
                            }}
                            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,45,85,0.18)'; e.currentTarget.style.borderColor = '#ff2d55'; }}
                            onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,45,85,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,45,85,0.25)'; }}
                        >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            EXFIL
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
