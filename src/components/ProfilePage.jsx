import useIsMobile from '../hooks/useIsMobile';

function fmtBytes(b) {
    if (b >= 1073741824) return (b / 1073741824).toFixed(1) + ' GB';
    if (b >= 1048576) return (b / 1048576).toFixed(1) + ' MB';
    if (b >= 1024) return (b / 1024).toFixed(0) + ' KB';
    return b + ' B';
}

function StatCell({ label, value, color }) {
    return (
        <div style={{
            background: 'var(--ac-a04)', border: '1px solid var(--ac-a12)',
            borderRadius: 3, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6,
        }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 8, letterSpacing: '0.25em', color: 'var(--c-tx3)', textTransform: 'uppercase' }}>{label}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: color || 'var(--c-ac)', lineHeight: 1 }}>{value}</div>
        </div>
    );
}

export default function ProfilePage({ user, userProfile, files, onClose }) {
    const isMobile = useIsMobile();

    const myFiles = files.filter(f => f.uploadedById === user.uid);
    const totalUpvotes = myFiles.reduce((s, f) => s + (f.upvotes || 0), 0);
    const totalDownvotes = myFiles.reduce((s, f) => s + (f.downvotes || 0), 0);
    const netScore = totalUpvotes - totalDownvotes;
    const totalBytes = myFiles.reduce((s, f) => s + (f.sizeInBytes || 0), 0);
    const xp = userProfile.experiencePoints ?? 0;
    const memberDays = userProfile.createdAt
        ? Math.max(1, Math.floor((Date.now() - userProfile.createdAt) / 86400000))
        : 1;

    const recentFiles = [...myFiles].sort((a, b) => b.id - a.id).slice(0, 10);

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
                <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '0 12px' : '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--c-ac)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                        </svg>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.28em', color: 'var(--c-ac)', textTransform: 'uppercase' }}>AGENT DOSSIER</span>
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

            <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '20px 12px 40px' : '32px 28px 60px' }}>

                {/* Identity card */}
                <div className="glass-card" style={{
                    borderRadius: 4, padding: isMobile ? '20px 16px' : '28px 32px',
                    marginBottom: 20, display: 'flex', alignItems: isMobile ? 'flex-start' : 'center',
                    gap: isMobile ? 16 : 28, flexDirection: isMobile ? 'column' : 'row',
                }}>
                    <div style={{
                        width: isMobile ? 60 : 80, height: isMobile ? 60 : 80, flexShrink: 0,
                        borderRadius: '50%', border: '2px solid var(--c-ac)',
                        background: 'var(--ac-a08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 24px var(--ac-a35)',
                    }}>
                        <svg width={isMobile ? 26 : 34} height={isMobile ? 26 : 34} viewBox="0 0 24 24" fill="none" stroke="var(--c-ac)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 8, letterSpacing: '0.28em', color: 'var(--c-tx3)', textTransform: 'uppercase', marginBottom: 4 }}>OPERATIVE CALLSIGN</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: isMobile ? '1.6rem' : '2.2rem', fontWeight: 700, color: 'var(--c-ac)', letterSpacing: '0.1em', lineHeight: 1, textShadow: '0 0 20px var(--ac-a35)', wordBreak: 'break-all' }}>
                            {userProfile.username?.toUpperCase()}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 10 }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.18em', color: 'var(--c-tx3)' }}>
                                STATUS: <span style={{ color: '#00ff88' }}>ACTIVE</span>
                            </div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.18em', color: 'var(--c-tx3)' }}>
                                TENURE: <span style={{ color: 'var(--c-tx2)' }}>{memberDays}D</span>
                            </div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.18em', color: 'var(--c-tx3)' }}>
                                UID: <span style={{ color: 'var(--c-tx2)', fontFamily: 'var(--font-mono)' }}>{user.uid.slice(0, 8).toUpperCase()}</span>
                            </div>
                        </div>
                    </div>
                    {/* XP badge */}
                    <div style={{
                        flexShrink: 0, textAlign: 'center',
                        background: 'var(--ac-a08)', border: '1px solid var(--ac-a28)',
                        borderRadius: 3, padding: '14px 20px',
                        boxShadow: '0 0 24px var(--ac-a12)',
                    }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 8, letterSpacing: '0.28em', color: 'var(--c-tx3)', textTransform: 'uppercase', marginBottom: 4 }}>EXPERIENCE</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: isMobile ? 28 : 36, fontWeight: 700, color: 'var(--c-ac)', lineHeight: 1, textShadow: '0 0 20px var(--ac-a35)' }}>
                            {xp.toLocaleString()}
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 8, letterSpacing: '0.22em', color: 'var(--c-tx3)', marginTop: 4 }}>XP</div>
                    </div>
                </div>

                {/* Stats grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                    gap: 10, marginBottom: 20,
                }}>
                    <StatCell label="Total Uploads" value={myFiles.length} />
                    <StatCell label="Upvotes Recv'd" value={totalUpvotes} color="#00ff88" />
                    <StatCell label="Downvotes Recv'd" value={totalDownvotes} color="#ff2d55" />
                    <StatCell label="Net Score" value={netScore >= 0 ? `+${netScore}` : netScore} color={netScore >= 0 ? '#00ff88' : '#ff2d55'} />
                    <StatCell label="Data Uploaded" value={totalBytes > 0 ? fmtBytes(totalBytes) : '—'} />
                    <StatCell label="XP Earned" value={xp.toLocaleString()} />
                </div>

                {/* Upload history */}
                <div className="glass-card" style={{ borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--ac-a12)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--c-ac)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                        </svg>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.25em', color: 'var(--c-tx3)', textTransform: 'uppercase' }}>
                            UPLOAD HISTORY — {myFiles.length} FILES
                        </span>
                    </div>
                    {recentFiles.length === 0 ? (
                        <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--c-tx3)' }}>
                            NO FILES UPLOADED YET
                        </div>
                    ) : recentFiles.map((f, i) => (
                        <div key={f.id} style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '10px 20px', borderBottom: i < recentFiles.length - 1 ? '1px solid var(--ac-a05)' : 'none',
                            transition: 'background 150ms',
                        }}
                            onMouseOver={e => e.currentTarget.style.background = 'var(--ac-a03)'}
                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <span style={{ fontFamily: 'var(--font-display)', fontSize: 9, color: 'var(--c-tx3)', flexShrink: 0, width: 20 }}>{String(i + 1).padStart(2, '0')}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                {f.downloadURL ? (
                                    <a href={f.downloadURL} target="_blank" rel="noopener noreferrer"
                                        style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--c-ac)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                                        {f.name}
                                    </a>
                                ) : (
                                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--c-tx)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{f.name}</span>
                                )}
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: 8, color: 'var(--c-tx3)', marginTop: 2, letterSpacing: '0.15em' }}>
                                    {f.date} · {f.size}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#00ff88' }}>+{f.upvotes || 0}</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#ff2d55' }}>-{f.downvotes || 0}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
