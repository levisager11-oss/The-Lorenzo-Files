import { useState } from 'react';
import { advanceToVoting, submitClue } from '../../../lib/imposterGame';

export default function ImposterClues({ room, code, uid }) {
    const isHost = room.hostUid === uid;
    const players = room.players || {};
    const round = room.round || {};
    const order = round.clueOrder || [];
    const totalRounds = Math.max(1, round.totalRounds || 1);
    const idx = round.currentTurnIdx ?? 0;
    const totalTurns = order.length * totalRounds;
    const currentRoundNum = Math.min(totalRounds, Math.floor(idx / order.length) + 1);
    const currentUid = order[idx % order.length] || null;
    const isMyTurn = currentUid === uid;
    const allDone = idx >= totalTurns;

    const clues = round.clues || [];

    const [draft, setDraft] = useState('');
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');

    const handleSubmit = async () => {
        if (busy) return;
        setBusy(true);
        setErr('');
        try {
            await submitClue({ code, room, uid, word: draft });
            setDraft('');
        } catch (e) {
            setErr(e.message);
        } finally {
            setBusy(false);
        }
    };

    const handleForceVote = async () => {
        setBusy(true);
        try {
            await advanceToVoting({ code });
        } finally {
            setBusy(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Phase header */}
            <div className="glass-card" style={{
                padding: '16px 22px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexWrap: 'wrap', gap: 10,
            }}>
                <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.28em', color: 'var(--c-tx3)', textTransform: 'uppercase' }}>PHASE</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, letterSpacing: '0.22em', color: 'var(--c-ac)', fontWeight: 700 }}>INTERROGATION</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.25em', color: 'var(--c-tx3)', textTransform: 'uppercase' }}>ROUND</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--c-tx)', letterSpacing: '0.12em', fontWeight: 600 }}>
                        {Math.min(currentRoundNum, totalRounds)} / {totalRounds}
                    </div>
                </div>
            </div>

            {/* Current turn / input */}
            <div className="glass-card hud-corners" style={{ padding: '24px 24px', textAlign: 'center' }}>
                {allDone ? (
                    <>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.3em', color: 'var(--c-tx3)', textTransform: 'uppercase', marginBottom: 8 }}>
                            INTERROGATION COMPLETE
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--c-tx2)', letterSpacing: '0.18em' }}>
                            Awaiting tribunal…
                        </div>
                    </>
                ) : isMyTurn ? (
                    <>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.3em', color: 'var(--c-ac)', textTransform: 'uppercase', marginBottom: 10 }}>
                            YOUR TURN — DROP YOUR ONE-WORD CLUE
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <input
                                autoFocus
                                type="text"
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
                                placeholder="ONE WORD…"
                                maxLength={32}
                                style={{
                                    background: 'var(--c-bg-input)',
                                    border: '1px solid var(--ac-a28)',
                                    color: 'var(--c-tx)',
                                    padding: '12px 14px', borderRadius: 3,
                                    fontFamily: 'var(--font-mono)', fontSize: 18,
                                    letterSpacing: '0.15em', textAlign: 'center',
                                    width: 280, maxWidth: '100%',
                                    outline: 'none', textTransform: 'uppercase',
                                }}
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={busy || !draft.trim()}
                                style={{
                                    background: 'var(--ac-a08)', color: 'var(--c-ac)',
                                    border: '1px solid var(--ac-a28)',
                                    padding: '12px 22px', borderRadius: 3,
                                    fontFamily: 'var(--font-display)', fontSize: 11,
                                    letterSpacing: '0.22em', textTransform: 'uppercase',
                                    fontWeight: 700,
                                    cursor: busy || !draft.trim() ? 'not-allowed' : 'pointer',
                                    opacity: busy || !draft.trim() ? 0.5 : 1,
                                }}
                            >
                                {busy ? '…' : 'SUBMIT'}
                            </button>
                        </div>
                        {err && (
                            <div style={{ marginTop: 10, fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.15em', color: '#ff2d55' }}>
                                {err}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.3em', color: 'var(--c-tx3)', textTransform: 'uppercase', marginBottom: 10 }}>
                            CURRENT SPEAKER
                        </div>
                        <div style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(1.8rem, 5vw, 3rem)',
                            fontWeight: 700,
                            color: 'var(--c-ac)', letterSpacing: '0.18em',
                            textShadow: '0 0 20px var(--ac-a35)',
                        }}>
                            {(players[currentUid]?.username || 'AGENT').toUpperCase()}
                        </div>
                        <div style={{ marginTop: 10, fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--c-tx3)', textTransform: 'uppercase' }}>
                            Waiting for clue…
                        </div>
                    </>
                )}
            </div>

            {/* Speaking order */}
            <div className="glass-card" style={{ padding: '14px 18px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.25em', color: 'var(--c-tx3)', textTransform: 'uppercase', marginBottom: 10 }}>
                    SPEAKING ORDER
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {order.map((puid, i) => {
                        const isCurrent = !allDone && (i === idx % order.length) && currentRoundNum === Math.floor(idx / order.length) + 1;
                        const completed = i < idx % order.length || (currentRoundNum > 1 && i < idx % order.length);
                        return (
                            <div key={i} style={{
                                background: isCurrent ? 'var(--ac-a12)' : 'var(--ac-a04)',
                                border: isCurrent ? '1px solid var(--c-ac)' : '1px solid var(--ac-a12)',
                                borderRadius: 3, padding: '6px 12px',
                                display: 'flex', alignItems: 'center', gap: 8,
                                opacity: completed && !isCurrent ? 0.55 : 1,
                            }}>
                                <span style={{ fontFamily: 'var(--font-display)', fontSize: 9, color: 'var(--c-tx3)', letterSpacing: '0.18em' }}>
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: isCurrent ? 'var(--c-ac)' : 'var(--c-tx)', letterSpacing: '0.08em', fontWeight: 600 }}>
                                    {(players[puid]?.username || 'AGENT').toUpperCase()}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Clue log */}
            <div className="glass-card" style={{ padding: '14px 18px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.25em', color: 'var(--c-tx3)', textTransform: 'uppercase', marginBottom: 10 }}>
                    CLUE LOG — {clues.length} / {totalTurns}
                </div>
                {clues.length === 0 ? (
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.18em', color: 'var(--c-tx3)', textTransform: 'uppercase' }}>
                        No clues yet — waiting for first operative…
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {clues.map((c, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '8px 12px',
                                background: 'var(--ac-a04)', border: '1px solid var(--ac-a12)',
                                borderRadius: 2,
                            }}>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--c-tx2)', letterSpacing: '0.08em' }}>
                                    {(players[c.uid]?.username || 'AGENT').toUpperCase()}
                                    {totalRounds > 1 && (
                                        <span style={{ marginLeft: 8, color: 'var(--c-tx3)', fontSize: 9 }}>
                                            R{c.round}
                                        </span>
                                    )}
                                </span>
                                <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--c-ac)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                                    {c.word}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {isHost && !allDone && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={handleForceVote}
                        disabled={busy}
                        style={{
                            background: 'transparent', color: 'var(--c-tx2)',
                            border: '1px solid var(--ac-a28)',
                            padding: '8px 16px', borderRadius: 2,
                            fontFamily: 'var(--font-display)', fontSize: 9,
                            letterSpacing: '0.2em', textTransform: 'uppercase',
                            fontWeight: 600, cursor: busy ? 'not-allowed' : 'pointer',
                        }}
                    >
                        SKIP TO TRIBUNAL
                    </button>
                </div>
            )}
        </div>
    );
}
