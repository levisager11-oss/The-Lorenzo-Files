import { useState } from 'react';
import { castVote, revealResults, tallyVotes } from '../../../lib/imposterGame';

export default function ImposterVoting({ room, code, uid }) {
    const isHost = room.hostUid === uid;
    const players = Object.entries(room.players || {});
    const votes = room.votes || {};
    const myVote = votes[uid] || null;
    const { counts } = tallyVotes(votes);
    const [busy, setBusy] = useState(false);

    const totalVoted = Object.keys(votes).length;
    const allVoted = totalVoted >= players.length;

    const handleVote = async (votedUid) => {
        if (busy) return;
        setBusy(true);
        try {
            await castVote({ code, voterUid: uid, votedUid });
        } finally {
            setBusy(false);
        }
    };

    const handleReveal = async () => {
        setBusy(true);
        try {
            await revealResults({ code, room });
        } finally {
            setBusy(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="glass-card" style={{ padding: '18px 22px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.3em', color: 'var(--c-ac)', textTransform: 'uppercase', marginBottom: 4 }}>
                    TRIBUNAL
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.18em', color: 'var(--c-tx2)', textTransform: 'uppercase' }}>
                    Vote for the operative you suspect is the imposter
                </div>
                <div style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--c-tx3)', letterSpacing: '0.15em' }}>
                    {totalVoted} / {players.length} VOTES IN
                </div>
            </div>

            <div className="glass-card" style={{ padding: '18px 18px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: 10,
                }}>
                    {players.map(([puid, p]) => {
                        const isMe = puid === uid;
                        const selected = myVote === puid;
                        const voteCount = counts[puid] || 0;
                        return (
                            <button
                                key={puid}
                                onClick={() => handleVote(puid)}
                                disabled={busy || isMe}
                                title={isMe ? 'Cannot vote for yourself' : ''}
                                style={{
                                    background: selected ? 'rgba(255,45,85,0.12)' : 'var(--ac-a04)',
                                    border: selected ? '1px solid #ff2d55' : '1px solid var(--ac-a12)',
                                    color: 'var(--c-tx)',
                                    padding: '12px 14px', borderRadius: 3,
                                    fontFamily: 'var(--font-display)', fontSize: 12,
                                    letterSpacing: '0.15em', textTransform: 'uppercase',
                                    fontWeight: 600,
                                    cursor: busy || isMe ? 'not-allowed' : 'pointer',
                                    opacity: isMe ? 0.4 : 1,
                                    transition: 'all 150ms',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10,
                                }}
                                onMouseOver={e => {
                                    if (busy || isMe) return;
                                    e.currentTarget.style.borderColor = selected ? '#ff2d55' : 'var(--ac-a28)';
                                    if (!selected) e.currentTarget.style.background = 'var(--ac-a08)';
                                }}
                                onMouseOut={e => {
                                    e.currentTarget.style.borderColor = selected ? '#ff2d55' : 'var(--ac-a12)';
                                    if (!selected) e.currentTarget.style.background = 'var(--ac-a04)';
                                }}
                            >
                                <span>
                                    {(p.username || 'AGENT').toUpperCase()}
                                    {isMe && <span style={{ color: 'var(--c-tx3)', marginLeft: 6, fontSize: 9 }}>(YOU)</span>}
                                </span>
                                <span style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 14,
                                    color: voteCount > 0 ? '#ff2d55' : 'var(--c-tx3)',
                                    fontWeight: 700,
                                    minWidth: 18, textAlign: 'right',
                                }}>
                                    {voteCount}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {isHost ? (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={handleReveal}
                        disabled={busy}
                        style={{
                            background: allVoted ? 'rgba(255,45,85,0.1)' : 'var(--ac-a08)',
                            color: allVoted ? '#ff2d55' : 'var(--c-ac)',
                            border: allVoted ? '1px solid #ff2d55' : '1px solid var(--ac-a28)',
                            padding: '9px 22px', borderRadius: 2,
                            fontFamily: 'var(--font-display)', fontSize: 10,
                            letterSpacing: '0.22em', textTransform: 'uppercase',
                            fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer',
                            opacity: busy ? 0.5 : 1,
                        }}
                    >
                        {busy ? 'REVEALING…' : '▶ DECLASSIFY RESULTS'}
                    </button>
                </div>
            ) : (
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--c-tx3)', textAlign: 'center', textTransform: 'uppercase' }}>
                    Waiting for host to declassify results…
                </div>
            )}
        </div>
    );
}
