import { useState } from 'react';
import useIsMobile from '../hooks/useIsMobile';
import ImposterRoom from './games/imposter/ImposterRoom';
import { createRoom, joinRoom } from '../lib/imposterGame';

const GAMES = [
    {
        id: 'imposter',
        name: 'IMPOSTER',
        codename: 'OPERATION: DECEPTION',
        tagline: 'One operative is lying. Find them before time runs out.',
        live: true,
    },
];

const inputStyle = {
    background: 'var(--c-bg-input)',
    border: '1px solid var(--ac-a28)',
    color: 'var(--c-tx)',
    padding: '10px 12px', borderRadius: 3,
    fontFamily: 'var(--font-mono)', fontSize: 14,
    letterSpacing: '0.3em',
    textTransform: 'uppercase',
    width: 200,
    outline: 'none',
};

function GamesHub({ user, userProfile, onOpenImposter }) {
    const isMobile = useIsMobile();
    const [code, setCode] = useState('');
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');

    const username = userProfile?.username || 'AGENT';

    const handleCreate = async () => {
        if (busy) return;
        setBusy(true);
        setErr('');
        try {
            const newCode = await createRoom({ uid: user.uid, username });
            onOpenImposter(newCode);
        } catch (e) {
            setErr(e.message);
        } finally {
            setBusy(false);
        }
    };

    const handleJoin = async () => {
        if (busy) return;
        const trimmed = code.trim().toUpperCase();
        if (!trimmed) {
            setErr('Enter a room code');
            return;
        }
        setBusy(true);
        setErr('');
        try {
            await joinRoom({ code: trimmed, uid: user.uid, username });
            onOpenImposter(trimmed);
        } catch (e) {
            setErr(e.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {/* Game cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 14,
            }}>
                {GAMES.map(g => (
                    <div
                        key={g.id}
                        className="glass-card hud-corners"
                        style={{
                            padding: '20px 22px',
                            opacity: g.live ? 1 : 0.5,
                            transition: 'all 200ms',
                        }}
                    >
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 8, letterSpacing: '0.3em', color: 'var(--c-tx3)', textTransform: 'uppercase' }}>
                            {g.codename}
                        </div>
                        <div style={{
                            fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700,
                            color: 'var(--c-ac)', letterSpacing: '0.18em', marginTop: 4,
                            textShadow: '0 0 20px var(--ac-a35)',
                        }}>
                            {g.name}
                        </div>
                        <div style={{
                            marginTop: 10,
                            fontFamily: 'var(--font-display)', fontSize: 11,
                            letterSpacing: '0.12em', color: 'var(--c-tx2)',
                            lineHeight: 1.4,
                        }}>
                            {g.tagline}
                        </div>
                        <div style={{
                            marginTop: 16,
                            fontFamily: 'var(--font-display)', fontSize: 9,
                            letterSpacing: '0.25em',
                            color: g.live ? '#00ff88' : 'var(--c-tx3)',
                            textTransform: 'uppercase',
                        }}>
                            {g.live ? '● ACTIVE' : '○ COMING SOON'}
                        </div>
                    </div>
                ))}
            </div>

            {/* Imposter create / join */}
            <div className="glass-card" style={{ padding: '22px 24px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.28em', color: 'var(--c-tx3)', textTransform: 'uppercase', marginBottom: 14 }}>
                    OPERATION: DECEPTION — ENLIST
                </div>
                <div style={{
                    display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end',
                    justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.22em', color: 'var(--c-tx3)', textTransform: 'uppercase' }}>
                            ROOM CODE
                        </label>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 4))}
                                placeholder="ABCD"
                                maxLength={4}
                                style={inputStyle}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleJoin(); }}
                            />
                            <button
                                onClick={handleJoin}
                                disabled={busy}
                                style={{
                                    background: 'var(--ac-a08)', color: 'var(--c-ac)',
                                    border: '1px solid var(--ac-a28)',
                                    padding: '10px 18px', borderRadius: 3,
                                    fontFamily: 'var(--font-display)', fontSize: 10,
                                    letterSpacing: '0.22em', textTransform: 'uppercase',
                                    fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer',
                                    opacity: busy ? 0.5 : 1,
                                }}
                            >
                                JOIN
                            </button>
                        </div>
                    </div>

                    <div style={{
                        fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.25em',
                        color: 'var(--c-tx3)', textTransform: 'uppercase', alignSelf: 'center',
                    }}>
                        — OR —
                    </div>

                    <button
                        onClick={handleCreate}
                        disabled={busy}
                        style={{
                            background: 'rgba(255,215,0,0.08)', color: '#ffd700',
                            border: '1px solid rgba(255,215,0,0.4)',
                            padding: '12px 22px', borderRadius: 3,
                            fontFamily: 'var(--font-display)', fontSize: 11,
                            letterSpacing: '0.22em', textTransform: 'uppercase',
                            fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer',
                            opacity: busy ? 0.5 : 1,
                            transition: 'all 150ms',
                        }}
                        onMouseOver={e => {
                            if (busy) return;
                            e.currentTarget.style.background = 'rgba(255,215,0,0.18)';
                            e.currentTarget.style.boxShadow = '0 0 16px rgba(255,215,0,0.3)';
                        }}
                        onMouseOut={e => {
                            e.currentTarget.style.background = 'rgba(255,215,0,0.08)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        ▶ HOST NEW MISSION
                    </button>
                </div>
                {err && (
                    <div style={{
                        marginTop: 12,
                        fontFamily: 'var(--font-display)', fontSize: 11,
                        letterSpacing: '0.15em', color: '#ff2d55',
                    }}>
                        {err}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function GamesPage({ user, userProfile, onClose }) {
    const isMobile = useIsMobile();
    const [activeRoom, setActiveRoom] = useState(null); // room code

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 80,
            background: 'rgba(5,7,9,0.96)', backdropFilter: 'blur(16px)',
            overflowY: 'auto',
        }}>
            <div className="top-bar" />

            <div style={{
                position: 'sticky', top: 0, zIndex: 10,
                background: 'var(--c-bg-header)', borderBottom: '1px solid var(--ac-a12)',
                backdropFilter: 'blur(20px)',
            }}>
                <div style={{ maxWidth: 960, margin: '0 auto', padding: isMobile ? '0 12px' : '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--c-ac)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="6" y1="11" x2="10" y2="11" /><line x1="8" y1="9" x2="8" y2="13" />
                            <line x1="15" y1="12" x2="15.01" y2="12" /><line x1="18" y1="10" x2="18.01" y2="10" />
                            <rect x="2" y="6" width="20" height="12" rx="2" />
                        </svg>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.28em', color: 'var(--c-ac)', textTransform: 'uppercase' }}>
                            RECREATIONAL PROTOCOLS
                        </span>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'transparent', border: '1px solid var(--ac-a28)', color: 'var(--c-tx2)',
                        padding: '5px 14px', borderRadius: 2, cursor: 'pointer',
                        fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.18em',
                        textTransform: 'uppercase', transition: 'all 150ms',
                    }}
                        onMouseOver={e => { e.currentTarget.style.color = 'var(--c-ac)'; e.currentTarget.style.borderColor = 'var(--c-ac)'; }}
                        onMouseOut={e => { e.currentTarget.style.color = 'var(--c-tx2)'; e.currentTarget.style.borderColor = 'var(--ac-a28)'; }}
                    >
                        ← BACK
                    </button>
                </div>
            </div>

            <div style={{ maxWidth: 960, margin: '0 auto', padding: isMobile ? '20px 12px 40px' : '32px 28px 60px' }}>
                {activeRoom ? (
                    <ImposterRoom
                        code={activeRoom}
                        uid={user.uid}
                        onExit={() => setActiveRoom(null)}
                    />
                ) : (
                    <GamesHub
                        user={user}
                        userProfile={userProfile}
                        onOpenImposter={(roomCode) => setActiveRoom(roomCode)}
                    />
                )}
            </div>
        </div>
    );
}
