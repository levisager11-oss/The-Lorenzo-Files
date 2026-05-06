import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import RadarSeal from './RadarSeal';
import ThemeToggle from './ThemeToggle';
import useIsMobile from '../hooks/useIsMobile';

export default function Header({ username, experiencePoints, lightMode, onToggleLightMode, onlineCount, onShowProfile, onShowLeaderboard }) {
    const [time, setTime] = useState(new Date());
    const isMobile = useIsMobile();
    const clickCount = { current: 0, timer: null };

    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const handleTitleClick = () => {
        clearTimeout(clickCount.timer);
        clickCount.current += 1;
        if (clickCount.current >= 5) {
            clickCount.current = 0;
            window.dispatchEvent(new CustomEvent('lorenzoEasterEgg'));
        } else {
            clickCount.timer = setTimeout(() => { clickCount.current = 0; }, 1500);
        }
    };

    const handleSignOut = () => {
        signOut(auth).catch(console.error);
    };

    const utc = time.toUTCString().split(' ')[4];

    return (
        <header style={{
            background: 'var(--c-bg-header)',
            borderBottom: '1px solid var(--ac-a12)',
            backdropFilter: 'blur(20px)',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            transition: 'background 250ms ease',
        }}>
            <div className="top-bar" />
            <div style={{ maxWidth: 1400, margin: '0 auto', padding: isMobile ? '0 12px' : '0 28px', display: 'flex', alignItems: 'stretch', minHeight: isMobile ? 60 : 80 }}>

                {/* Left: seal + title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 20, flex: 1, minWidth: 0 }}>
                    <div style={{ flexShrink: 0 }}>
                        <RadarSeal size={isMobile ? 36 : 56} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div
                            onClick={handleTitleClick}
                            style={{
                                fontFamily: 'var(--font-display)', fontSize: isMobile ? '1.1rem' : '2rem', fontWeight: 700,
                                color: 'var(--c-ac)', letterSpacing: isMobile ? '0.1em' : '0.18em', lineHeight: 1,
                                textShadow: '0 0 20px var(--ac-a35)',
                                cursor: 'default', userSelect: 'none',
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}
                        >
                            {isMobile ? 'LORENZO FILES' : 'DEPARTMENT OF LORENZO'}
                        </div>
                        {!isMobile && (
                            <div style={{
                                fontFamily: 'var(--font-display)', fontSize: '0.7rem',
                                letterSpacing: '0.4em', color: 'var(--c-tx2)', marginTop: 4, textTransform: 'uppercase',
                            }}>
                                INTELLIGENCE MANAGEMENT SYSTEM // DELOS NETWORK NODE 7
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: status cells (desktop only) + agent */}
                <div style={{ display: 'flex', alignItems: 'center', borderLeft: '1px solid var(--ac-a12)' }}>
                    {[
                        { label: 'ENCRYPTION', val: 'AES-256', valColor: 'var(--c-tx2)' },
                        { label: 'SIGNAL', val: 'ACTIVE', valColor: '#00ff88' },
                        { label: 'ONLINE', val: onlineCount == null ? '—' : String(onlineCount), valColor: '#00ff88' },
                        { label: 'XP', val: experiencePoints == null ? '0' : String(experiencePoints), valColor: 'var(--c-ac)' },
                        { label: 'UTC', val: utc, valColor: 'var(--c-ac)' },
                    ].map((s, i) => (
                        <div key={i} className="header-status-cell" style={{
                            padding: '0 20px',
                            borderRight: '1px solid var(--ac-a12)',
                            display: 'flex', flexDirection: 'column', justifyContent: 'center',
                            gap: 4, height: '100%',
                        }}>
                            <div style={{
                                fontSize: 8, letterSpacing: '0.2em', color: 'var(--c-tx3)',
                                textTransform: 'uppercase', fontFamily: 'var(--font-display)',
                            }}>
                                {s.label}
                            </div>
                            <div style={{ fontSize: 10, letterSpacing: '0.12em', color: s.valColor, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                                {s.val}
                            </div>
                        </div>
                    ))}

                    {/* Agent + controls */}
                    <div className="header-agent-cell" style={{
                        padding: isMobile ? '0 0 0 10px' : '0 16px 0 20px',
                        display: 'flex', flexDirection: 'column', justifyContent: 'center',
                        gap: 4, height: '100%',
                    }}>
                        {username && (
                            <button onClick={onShowProfile} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
                                <div style={{ fontSize: 8, letterSpacing: '0.2em', color: 'var(--c-tx3)', fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>OPERATOR</div>
                                <div style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--c-ac)', fontFamily: 'var(--font-mono)', transition: 'text-shadow 150ms' }}
                                    onMouseOver={e => e.currentTarget.style.textShadow = '0 0 10px var(--ac-a35)'}
                                    onMouseOut={e => e.currentTarget.style.textShadow = 'none'}
                                >{username.toUpperCase()}</div>
                            </button>
                        )}
                        {/* XP badge — visible on mobile only (status cells are hidden) */}
                        {isMobile && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ fontSize: 7, letterSpacing: '0.18em', color: 'var(--c-tx3)', fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>XP</span>
                                <span style={{ fontSize: 9, letterSpacing: '0.1em', color: 'var(--c-ac)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{experiencePoints ?? 0}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                            {/* Leaderboard button */}
                            <button
                                onClick={onShowLeaderboard}
                                title="XP Leaderboard"
                                style={{
                                    background: 'rgba(255,215,0,0.08)', color: '#ffd700',
                                    border: '1px solid rgba(255,215,0,0.25)',
                                    padding: isMobile ? '5px 8px' : '5px 10px', borderRadius: 2,
                                    display: 'flex', alignItems: 'center', gap: 4,
                                    cursor: 'pointer', transition: 'all 150ms',
                                    fontFamily: 'var(--font-display)', fontWeight: 600,
                                }}
                                onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,215,0,0.15)'; e.currentTarget.style.borderColor = '#ffd700'; }}
                                onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,215,0,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,215,0,0.25)'; }}
                            >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                                    <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                                    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                                </svg>
                                {!isMobile && <span style={{ fontSize: 9, letterSpacing: '0.1em' }}>BOARD</span>}
                            </button>
                            <ThemeToggle lightMode={lightMode} onToggle={onToggleLightMode} />

                            <button
                                onClick={handleSignOut}
                                style={{
                                    background: 'rgba(255,45,85,0.1)', color: '#ff2d55',
                                    border: '1px solid rgba(255,45,85,0.25)',
                                    padding: isMobile ? '5px 8px' : '5px 12px', borderRadius: 2,
                                    fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
                                    display: 'flex', alignItems: 'center', gap: 5,
                                    cursor: 'pointer', transition: 'all 150ms',
                                    fontFamily: 'var(--font-display)', fontWeight: 600,
                                }}
                                onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,45,85,0.18)'; e.currentTarget.style.borderColor = '#ff2d55'; }}
                                onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,45,85,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,45,85,0.25)'; }}
                            >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                                {!isMobile && 'EXFIL'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
