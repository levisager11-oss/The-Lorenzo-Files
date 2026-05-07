import { useState } from 'react';
import usePlayerSecret from '../../../hooks/usePlayerSecret';
import { advanceToClues } from '../../../lib/imposterGame';

export default function ImposterReveal({ room, code, uid }) {
    const isHost = room.hostUid === uid;
    const { secret, loading } = usePlayerSecret(code, uid);
    const [revealed, setRevealed] = useState(false);
    const [advancing, setAdvancing] = useState(false);

    const playerCount = Object.keys(room.players || {}).length;
    const category = room.round?.categoryLabel || '—';

    const handleAdvance = async () => {
        setAdvancing(true);
        try {
            await advanceToClues({ code });
        } finally {
            setAdvancing(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="glass-card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.25em', color: 'var(--c-tx3)', textTransform: 'uppercase' }}>PHASE</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, letterSpacing: '0.22em', color: 'var(--c-ac)', fontWeight: 700 }}>INTEL DROP</div>
                </div>
                <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.25em', color: 'var(--c-tx3)', textTransform: 'uppercase' }}>CATEGORY</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--c-tx)', letterSpacing: '0.12em', fontWeight: 600 }}>{category}</div>
                </div>
                <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.25em', color: 'var(--c-tx3)', textTransform: 'uppercase' }}>OPERATIVES</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--c-tx)', letterSpacing: '0.12em', fontWeight: 600 }}>{playerCount}</div>
                </div>
            </div>

            <div className="glass-card hud-corners" style={{ padding: '40px 24px', textAlign: 'center', minHeight: 220 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.3em', color: 'var(--c-tx3)', textTransform: 'uppercase', marginBottom: 14 }}>
                    YOUR CLASSIFIED INTEL
                </div>
                {loading ? (
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, letterSpacing: '0.2em', color: 'var(--c-tx2)' }}>
                        DECRYPTING…
                    </div>
                ) : !secret ? (
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, letterSpacing: '0.2em', color: '#ff2d55' }}>
                        NO INTEL FOUND — ASK HOST TO RESET
                    </div>
                ) : !revealed ? (
                    <button
                        onClick={() => setRevealed(true)}
                        style={{
                            background: 'var(--ac-a08)', color: 'var(--c-ac)',
                            border: '1px solid var(--ac-a28)',
                            padding: '14px 28px', borderRadius: 3,
                            fontFamily: 'var(--font-display)', fontSize: 12,
                            letterSpacing: '0.28em', textTransform: 'uppercase',
                            fontWeight: 700, cursor: 'pointer',
                            transition: 'all 150ms',
                        }}
                        onMouseOver={e => {
                            e.currentTarget.style.background = 'var(--ac-a12)';
                            e.currentTarget.style.boxShadow = '0 0 24px var(--ac-a35)';
                        }}
                        onMouseOut={e => {
                            e.currentTarget.style.background = 'var(--ac-a08)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        ▸ TAP TO DECRYPT
                    </button>
                ) : (
                    <>
                        <div style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(2.4rem, 7vw, 4.5rem)',
                            fontWeight: 700,
                            color: secret.isImposter && secret.word === '???' ? '#ff2d55' : 'var(--c-ac)',
                            letterSpacing: '0.12em',
                            textShadow: secret.isImposter && secret.word === '???'
                                ? '0 0 30px rgba(255,45,85,0.5)'
                                : '0 0 30px var(--ac-a35)',
                            wordBreak: 'break-word',
                        }}>
                            {secret.word}
                        </div>
                        <div style={{ marginTop: 16, fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.22em', color: 'var(--c-tx3)', textTransform: 'uppercase' }}>
                            {secret.isImposter
                                ? 'You are the IMPOSTER. Blend in. Bluff convincingly.'
                                : 'Give a one-word clue. Don\'t be too obvious.'}
                        </div>
                        <button
                            onClick={() => setRevealed(false)}
                            style={{
                                marginTop: 20,
                                background: 'transparent', color: 'var(--c-tx2)',
                                border: '1px solid var(--ac-a28)',
                                padding: '7px 16px', borderRadius: 2,
                                fontFamily: 'var(--font-display)', fontSize: 9,
                                letterSpacing: '0.2em', textTransform: 'uppercase',
                                cursor: 'pointer',
                            }}
                        >
                            HIDE
                        </button>
                    </>
                )}
            </div>

            {isHost ? (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={handleAdvance}
                        disabled={advancing}
                        style={{
                            background: 'var(--ac-a08)', color: 'var(--c-ac)',
                            border: '1px solid var(--ac-a28)',
                            padding: '9px 22px', borderRadius: 2,
                            fontFamily: 'var(--font-display)', fontSize: 10,
                            letterSpacing: '0.22em', textTransform: 'uppercase',
                            fontWeight: 700, cursor: advancing ? 'not-allowed' : 'pointer',
                            opacity: advancing ? 0.5 : 1,
                        }}
                    >
                        {advancing ? 'ADVANCING…' : '▶ START INTERROGATION'}
                    </button>
                </div>
            ) : (
                <div style={{
                    fontFamily: 'var(--font-display)', fontSize: 10,
                    letterSpacing: '0.2em', color: 'var(--c-tx3)',
                    textAlign: 'center', textTransform: 'uppercase',
                }}>
                    Waiting for host to start interrogation…
                </div>
            )}
        </div>
    );
}
