import { useState } from 'react';
import { resetToLobby, tallyVotes } from '../../../lib/imposterGame';

export default function ImposterResults({ room, code, uid, onExit }) {
    const isHost = room.hostUid === uid;
    const players = room.players || {};
    const votes = room.votes || {};
    const imposterUid = room.round?.imposterUid;
    const word = room.publicWord || room.round?.word || '???';
    const { topUid, tied } = tallyVotes(votes);

    const caught = !tied && topUid === imposterUid;
    const accused = topUid ? players[topUid]?.username : null;
    const imposter = imposterUid ? players[imposterUid]?.username : 'UNKNOWN';

    const [busy, setBusy] = useState(false);

    const handlePlayAgain = async () => {
        setBusy(true);
        try {
            await resetToLobby({ code });
        } finally {
            setBusy(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Verdict banner */}
            <div className="glass-card hud-corners" style={{
                padding: '32px 24px', textAlign: 'center',
                borderColor: caught ? 'rgba(0,255,136,0.4)' : 'rgba(255,45,85,0.4)',
            }}>
                <div style={{
                    fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.32em',
                    color: 'var(--c-tx3)', textTransform: 'uppercase', marginBottom: 10,
                }}>
                    DECLASSIFIED
                </div>
                <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(2rem, 6vw, 3.5rem)',
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    color: caught ? '#00ff88' : '#ff2d55',
                    textShadow: caught
                        ? '0 0 30px rgba(0,255,136,0.5)'
                        : '0 0 30px rgba(255,45,85,0.5)',
                    lineHeight: 1.1,
                }}>
                    {tied ? 'HUNG TRIBUNAL' : caught ? 'AGENTS WIN' : 'IMPOSTER WINS'}
                </div>
                <div style={{ marginTop: 12, fontFamily: 'var(--font-display)', fontSize: 12, letterSpacing: '0.18em', color: 'var(--c-tx2)', textTransform: 'uppercase' }}>
                    {tied
                        ? 'Vote was split — no conviction'
                        : caught
                            ? `${(accused || '').toUpperCase()} was caught`
                            : `Tribunal accused ${(accused || '—').toUpperCase()}`}
                </div>
            </div>

            {/* The truth */}
            <div className="glass-card" style={{ padding: '20px 22px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: 16,
                }}>
                    <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.25em', color: 'var(--c-tx3)', textTransform: 'uppercase', marginBottom: 6 }}>
                            THE WORD WAS
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--c-ac)', letterSpacing: '0.1em' }}>
                            {word.toUpperCase()}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.25em', color: 'var(--c-tx3)', textTransform: 'uppercase', marginBottom: 6 }}>
                            THE IMPOSTER WAS
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: '#ff2d55', letterSpacing: '0.1em' }}>
                            {(imposter || '—').toUpperCase()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Vote breakdown */}
            <div className="glass-card" style={{ padding: '16px 18px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.25em', color: 'var(--c-tx3)', textTransform: 'uppercase', marginBottom: 12 }}>
                    VOTE LOG
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {Object.entries(players).map(([puid, p]) => {
                        const votedUid = votes[puid];
                        const votedName = votedUid ? players[votedUid]?.username : null;
                        return (
                            <div key={puid} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '6px 10px',
                                background: puid === imposterUid ? 'rgba(255,45,85,0.06)' : 'var(--ac-a04)',
                                border: '1px solid var(--ac-a12)',
                                borderRadius: 2,
                            }}>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: puid === imposterUid ? '#ff2d55' : 'var(--c-tx)', letterSpacing: '0.08em', fontWeight: 600 }}>
                                    {(p.username || 'AGENT').toUpperCase()}
                                    {puid === imposterUid && (
                                        <span style={{ marginLeft: 8, fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.2em' }}>(IMPOSTER)</span>
                                    )}
                                </span>
                                <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: 'var(--c-tx3)', letterSpacing: '0.18em' }}>
                                    {votedName ? `→ ${votedName.toUpperCase()}` : 'NO VOTE'}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
                <button
                    onClick={onExit}
                    style={{
                        background: 'transparent', color: 'var(--c-tx2)',
                        border: '1px solid var(--ac-a28)',
                        padding: '9px 18px', borderRadius: 2,
                        fontFamily: 'var(--font-display)', fontSize: 10,
                        letterSpacing: '0.18em', textTransform: 'uppercase',
                        fontWeight: 600, cursor: 'pointer',
                    }}
                >
                    BACK TO HUB
                </button>
                {isHost && (
                    <button
                        onClick={handlePlayAgain}
                        disabled={busy}
                        style={{
                            background: 'var(--ac-a08)', color: 'var(--c-ac)',
                            border: '1px solid var(--ac-a28)',
                            padding: '9px 22px', borderRadius: 2,
                            fontFamily: 'var(--font-display)', fontSize: 10,
                            letterSpacing: '0.22em', textTransform: 'uppercase',
                            fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer',
                            opacity: busy ? 0.5 : 1,
                        }}
                    >
                        {busy ? 'RESETTING…' : '↻ NEW ROUND'}
                    </button>
                )}
            </div>
        </div>
    );
}
