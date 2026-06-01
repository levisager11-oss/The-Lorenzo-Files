import { useState } from 'react';

// In co-op, T5 ice monkey slots per player are reduced to 3 (vs 4 solo).
// Level 13 Silas gives 4 T5 ice monkeys in solo, 3 per player in co-op.
const SILAS_T5_SOLO = 4;
const SILAS_T5_COOP_PER_PLAYER = 3;

const PLAYER_OPTIONS = [1, 2, 3, 4];

export default function IceMonkeyCalc() {
    const [players, setPlayers] = useState(1);

    const total = players === 1
        ? SILAS_T5_SOLO
        : players * SILAS_T5_COOP_PER_PLAYER;

    const isCoop = players > 1;

    return (
        <div className="glass-card hud-corners" style={{ padding: '24px 26px', maxWidth: 480 }}>
            <div style={{
                fontFamily: 'var(--font-display)', fontSize: 8,
                letterSpacing: '0.3em', color: 'var(--c-tx3)',
                textTransform: 'uppercase', marginBottom: 4,
            }}>
                BTD6 TACTICAL ANALYSIS
            </div>
            <div style={{
                fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
                color: 'var(--c-ac)', letterSpacing: '0.15em',
                textShadow: '0 0 18px var(--ac-a35)', marginBottom: 20,
            }}>
                T5 ICE MONKEY CALCULATOR
            </div>

            {/* Silas level badge */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                marginBottom: 22,
                padding: '10px 14px',
                background: 'var(--ac-a05)',
                border: '1px solid var(--ac-a12)',
                borderRadius: 4,
            }}>
                <div style={{
                    fontFamily: 'var(--font-display)', fontSize: 11,
                    letterSpacing: '0.2em', color: 'var(--c-tx2)',
                    textTransform: 'uppercase',
                }}>
                    HERO:
                </div>
                <div style={{
                    fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700,
                    letterSpacing: '0.2em', color: 'var(--c-ac)',
                    textTransform: 'uppercase',
                }}>
                    SILAS — LVL 13
                </div>
                <div style={{
                    marginLeft: 'auto',
                    fontFamily: 'var(--font-display)', fontSize: 9,
                    letterSpacing: '0.18em', color: '#00ff88',
                }}>
                    ● ACTIVE
                </div>
            </div>

            {/* Player count selector */}
            <div style={{ marginBottom: 24 }}>
                <div style={{
                    fontFamily: 'var(--font-display)', fontSize: 9,
                    letterSpacing: '0.25em', color: 'var(--c-tx3)',
                    textTransform: 'uppercase', marginBottom: 10,
                }}>
                    CO-OP PLAYERS
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {PLAYER_OPTIONS.map(n => (
                        <button
                            key={n}
                            onClick={() => setPlayers(n)}
                            style={{
                                flex: 1,
                                padding: '10px 0',
                                borderRadius: 3,
                                border: players === n
                                    ? '1px solid var(--c-ac)'
                                    : '1px solid var(--ac-a28)',
                                background: players === n
                                    ? 'var(--ac-a12)'
                                    : 'var(--ac-a05)',
                                color: players === n ? 'var(--c-ac)' : 'var(--c-tx2)',
                                fontFamily: 'var(--font-display)',
                                fontSize: 16, fontWeight: 700,
                                letterSpacing: '0.1em',
                                cursor: 'pointer',
                                transition: 'all 150ms',
                                boxShadow: players === n
                                    ? '0 0 12px var(--ac-a28)'
                                    : 'none',
                            }}
                        >
                            {n}
                        </button>
                    ))}
                </div>
            </div>

            {/* Result */}
            <div style={{
                background: 'var(--ac-a08)',
                border: '1px solid var(--ac-a28)',
                borderRadius: 4,
                padding: '18px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div>
                    <div style={{
                        fontFamily: 'var(--font-display)', fontSize: 9,
                        letterSpacing: '0.25em', color: 'var(--c-tx3)',
                        textTransform: 'uppercase', marginBottom: 4,
                    }}>
                        {isCoop ? `TOTAL T5 ICE (${players}P CO-OP)` : 'TOTAL T5 ICE (SOLO)'}
                    </div>
                    <div style={{
                        fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 700,
                        color: 'var(--c-ac)', lineHeight: 1,
                        textShadow: '0 0 28px var(--ac-a35)',
                    }}>
                        {total}
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{
                        fontFamily: 'var(--font-display)', fontSize: 9,
                        letterSpacing: '0.22em', color: 'var(--c-tx3)',
                        textTransform: 'uppercase', marginBottom: 4,
                    }}>
                        PER PLAYER
                    </div>
                    <div style={{
                        fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600,
                        color: 'var(--c-tx2)',
                    }}>
                        {isCoop ? SILAS_T5_COOP_PER_PLAYER : SILAS_T5_SOLO}
                    </div>
                </div>
            </div>

            {isCoop && (
                <div style={{
                    marginTop: 12,
                    fontFamily: 'var(--font-display)', fontSize: 9,
                    letterSpacing: '0.18em', color: 'var(--c-tx3)',
                    textTransform: 'uppercase',
                }}>
                    {players} PLAYERS × {SILAS_T5_COOP_PER_PLAYER} T5 ICE EACH = {total}
                </div>
            )}
        </div>
    );
}
