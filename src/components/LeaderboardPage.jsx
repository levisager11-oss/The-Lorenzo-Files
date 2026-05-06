import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import useIsMobile from '../hooks/useIsMobile';

const RANK_COLORS = ['#ffd700', '#c0c0c0', '#cd7f32'];
const RANK_LABELS = ['1ST', '2ND', '3RD'];

export default function LeaderboardPage({ user, files, onClose }) {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);
    const isMobile = useIsMobile();

    useEffect(() => {
        const fetch = async () => {
            try {
                const q = query(collection(db, "users"), orderBy("experiencePoints", "desc"), limit(50));
                const snap = await getDocs(q);
                setLeaders(snap.docs.map(d => ({ uid: d.id, ...d.data() })));
            } catch (e) {
                console.error("Leaderboard fetch failed:", e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const uploadCounts = {};
    files.forEach(f => {
        if (f.uploadedById) uploadCounts[f.uploadedById] = (uploadCounts[f.uploadedById] || 0) + 1;
    });

    const upvoteTotals = {};
    files.forEach(f => {
        if (f.uploadedById) upvoteTotals[f.uploadedById] = (upvoteTotals[f.uploadedById] || 0) + (f.upvotes || 0);
    });

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 80,
            background: 'rgba(5,7,9,0.96)', backdropFilter: 'blur(16px)',
            overflowY: 'auto',
        }}>
            <div className="top-bar" />

            {/* Header bar */}
            <div style={{
                position: 'sticky', top: 0, zIndex: 10,
                background: 'var(--c-bg-header)', borderBottom: '1px solid var(--ac-a12)',
                backdropFilter: 'blur(20px)',
            }}>
                <div style={{ maxWidth: 700, margin: '0 auto', padding: isMobile ? '0 12px' : '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffd700" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                            <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                        </svg>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.28em', color: '#ffd700', textTransform: 'uppercase' }}>XP LEADERBOARD</span>
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

            <div style={{ maxWidth: 700, margin: '0 auto', padding: isMobile ? '20px 12px 40px' : '32px 28px 60px' }}>

                {/* Top 3 podium */}
                {!loading && leaders.length >= 3 && (
                    <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24,
                    }}>
                        {[leaders[1], leaders[0], leaders[2]].map((agent, visualIdx) => {
                            const rankIdx = visualIdx === 0 ? 1 : visualIdx === 1 ? 0 : 2;
                            const isMe = agent?.uid === user.uid;
                            const color = RANK_COLORS[rankIdx];
                            const isCenter = visualIdx === 1;
                            return (
                                <div key={agent?.uid} style={{
                                    background: 'var(--ac-a04)', border: `1px solid ${isMe ? 'var(--c-ac)' : color + '44'}`,
                                    borderRadius: 3, padding: isCenter ? '20px 12px' : '14px 12px',
                                    textAlign: 'center', alignSelf: isCenter ? 'flex-start' : 'flex-start',
                                    marginTop: isCenter ? 0 : 16,
                                    boxShadow: isCenter ? `0 0 24px ${color}22` : 'none',
                                    position: 'relative', overflow: 'hidden',
                                }}>
                                    {isMe && (
                                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--c-ac)' }} />
                                    )}
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: isCenter ? 18 : 13, fontWeight: 700, color, marginBottom: 4 }}>
                                        {RANK_LABELS[rankIdx]}
                                    </div>
                                    <div style={{
                                        fontFamily: 'var(--font-display)', fontSize: isMobile ? 10 : 12, fontWeight: 700,
                                        color: isMe ? 'var(--c-ac)' : 'var(--c-tx)', letterSpacing: '0.08em',
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        marginBottom: 6,
                                    }}>
                                        {agent?.username?.toUpperCase() || '—'}
                                        {isMe && <span style={{ color: 'var(--c-ac)', fontSize: 7, marginLeft: 4 }}>YOU</span>}
                                    </div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: isCenter ? 22 : 16, fontWeight: 700, color, lineHeight: 1 }}>
                                        {(agent?.experiencePoints ?? 0).toLocaleString()}
                                    </div>
                                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 7, letterSpacing: '0.2em', color: 'var(--c-tx3)', marginTop: 2 }}>XP</div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Full ranked list */}
                <div className="glass-card" style={{ borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--ac-a12)', display: 'flex', gap: 8 }}>
                        {['#', 'CALLSIGN', 'XP', 'UPLOADS', 'UPVOTES'].map((h, i) => (
                            <div key={h} style={{
                                fontFamily: 'var(--font-display)', fontSize: 8, letterSpacing: '0.22em',
                                color: 'var(--c-tx3)', textTransform: 'uppercase',
                                flex: i === 1 ? 1 : 'none',
                                width: i === 0 ? 28 : i === 2 ? (isMobile ? 56 : 80) : (isMobile ? 48 : 72),
                                textAlign: i > 1 ? 'right' : 'left',
                            }}>{h}</div>
                        ))}
                    </div>

                    {loading ? (
                        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.25em', color: 'var(--c-tx3)' }}>
                                RETRIEVING INTEL <span className="cursor-blink">█</span>
                            </div>
                        </div>
                    ) : leaders.length === 0 ? (
                        <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--c-tx3)' }}>
                            NO AGENTS ON RECORD
                        </div>
                    ) : leaders.map((agent, i) => {
                        const isMe = agent.uid === user.uid;
                        const rankColor = i < 3 ? RANK_COLORS[i] : 'var(--c-tx3)';
                        const uploads = uploadCounts[agent.uid] || 0;
                        const upvotes = upvoteTotals[agent.uid] || 0;

                        return (
                            <div key={agent.uid} style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '11px 20px',
                                borderBottom: i < leaders.length - 1 ? '1px solid var(--ac-a05)' : 'none',
                                background: isMe ? 'var(--ac-a04)' : 'transparent',
                                borderLeft: isMe ? '2px solid var(--c-ac)' : '2px solid transparent',
                                transition: 'background 150ms',
                            }}
                                onMouseOver={e => { if (!isMe) e.currentTarget.style.background = 'var(--ac-a03)'; }}
                                onMouseOut={e => { if (!isMe) e.currentTarget.style.background = 'transparent'; }}
                            >
                                <div style={{ width: 28, flexShrink: 0, fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: rankColor }}>
                                    {i < 3 ? ['①', '②', '③'][i] : String(i + 1).padStart(2, '0')}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 600,
                                        color: isMe ? 'var(--c-ac)' : 'var(--c-tx)',
                                        letterSpacing: '0.06em',
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        display: 'flex', alignItems: 'center', gap: 6,
                                    }}>
                                        {agent.username?.toUpperCase() || '—'}
                                        {isMe && <span style={{ fontSize: 7, letterSpacing: '0.18em', color: 'var(--c-ac)', background: 'var(--ac-a08)', border: '1px solid var(--ac-a28)', padding: '1px 5px', borderRadius: 2 }}>YOU</span>}
                                    </div>
                                </div>
                                <div style={{ width: isMobile ? 56 : 80, textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: isMe ? 'var(--c-ac)' : rankColor, flexShrink: 0 }}>
                                    {(agent.experiencePoints ?? 0).toLocaleString()}
                                </div>
                                <div style={{ width: isMobile ? 48 : 72, textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--c-tx2)', flexShrink: 0 }}>
                                    {uploads}
                                </div>
                                <div style={{ width: isMobile ? 48 : 72, textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#00ff88', flexShrink: 0 }}>
                                    {upvotes}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div style={{ marginTop: 14, textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 8, letterSpacing: '0.22em', color: 'var(--c-tx3)' }}>
                    XP AWARDED: 50 PER UPLOAD — RANKINGS UPDATED IN REAL TIME
                </div>
            </div>
        </div>
    );
}
