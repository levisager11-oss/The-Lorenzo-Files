import { useState } from 'react';
import RedactedBox from './RedactedBox';
import VoteButtons from './VoteButtons';
import IntelReportPanel from './IntelReportPanel';

const statusBadgeClass = {
    CLASSIFIED: 'badge-classified',
    SEALED: 'badge-sealed',
    REDACTED: 'badge-redacted',
    'UNDER REVIEW': 'badge-review',
};

export default function MobileFileCard({ file, fileNumber, onRedactedClick, user, userProfile, onDelete, isDeleting, dbId }) {
    const [showReports, setShowReports] = useState(false);
    const isOwner = file.uploadedById === user?.uid;
    const badgeClass = statusBadgeClass[file.status] || 'badge-redacted';
    const suspects = (file.suspectNames || (file.suspectName ? [file.suspectName] : ['Lorenzo'])).join(', ');
    const fileNum = String(fileNumber).padStart(3, '0');

    const handleDownload = async () => {
        if (!file.downloadURL) return;
        try {
            const response = await fetch(file.downloadURL);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl; a.download = file.name;
            document.body.appendChild(a); a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
        } catch { /* ignore */ }
    };

    return (
        <div className="glass-card fade-in" style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}>
            {/* Top: num + filename + badge */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 14px 10px',
                borderBottom: '1px solid var(--ac-a05)',
                opacity: isDeleting ? 0.3 : 1, transition: 'opacity 300ms',
            }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: 'var(--c-tx3)', fontWeight: 600, flexShrink: 0 }}>{fileNum}</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--c-ac)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><rect width="6" height="5" x="9" y="13" rx="1" /><path d="M10 13v-1a2 2 0 0 1 4 0v1" />
                </svg>
                <div style={{ flex: 1, minWidth: 0 }}>
                    {file.downloadURL ? (
                        <a
                            href={file.downloadURL} target="_blank" rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            style={{
                                fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--c-ac)',
                                fontWeight: 600, textDecoration: 'none', overflow: 'hidden',
                                textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block',
                                letterSpacing: '0.03em', textShadow: '0 0 8px var(--ac-a08)',
                            }}
                        >{file.name}</a>
                    ) : (
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--c-tx)', fontWeight: 600, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {file.name}
                        </span>
                    )}
                    {file.uploaderUsername && (
                        <div style={{ fontSize: 8, color: 'var(--c-tx3)', letterSpacing: '0.18em', marginTop: 2, fontFamily: 'var(--font-display)' }}>
                            BY: {file.uploaderUsername.toUpperCase()}
                        </div>
                    )}
                </div>
                <span className={`badge ${badgeClass}`} style={{ flexShrink: 0 }}>{file.status}</span>
            </div>

            {/* Middle: suspect + date/size */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--ac-a05)' }}>
                <div style={{ padding: '8px 14px', borderRight: '1px solid var(--ac-a05)' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 7, letterSpacing: '0.25em', color: 'var(--c-tx3)', textTransform: 'uppercase', marginBottom: 3 }}>SUSPECT</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: 'var(--c-tx2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{suspects}</div>
                </div>
                <div style={{ padding: '8px 14px' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 7, letterSpacing: '0.25em', color: 'var(--c-tx3)', textTransform: 'uppercase', marginBottom: 3 }}>DATE / SIZE</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: '#7aa8cc' }}>{file.date} · {file.size}</div>
                </div>
            </div>

            {/* Bottom: votes + redacted + actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px' }}>
                <VoteButtons file={file} user={user} dbId={dbId} />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <RedactedBox text={file.redactedText} onRedactedClick={onRedactedClick} />
                </div>
                <button
                    onClick={e => { e.stopPropagation(); setShowReports(v => !v); }}
                    style={{
                        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: showReports ? 'var(--ac-a08)' : 'transparent',
                        color: showReports ? 'var(--c-ac)' : 'var(--c-tx3)',
                        padding: '7px 10px', borderRadius: 2,
                        border: `1px solid ${showReports ? 'var(--ac-a28)' : 'var(--ac-a12)'}`,
                        transition: 'all 150ms', cursor: 'pointer',
                    }}
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                </button>
                {isOwner && (
                    <button
                        onClick={e => { e.stopPropagation(); if (!isDeleting) onDelete(file); }}
                        disabled={isDeleting}
                        style={{
                            flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(255,45,85,0.1)', color: '#ff2d55',
                            border: '1px solid rgba(255,45,85,0.25)',
                            padding: '7px 10px', borderRadius: 2,
                            cursor: isDeleting ? 'not-allowed' : 'pointer',
                            transition: 'all 150ms',
                        }}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                    </button>
                )}
            </div>
            {showReports && (
                <IntelReportPanel file={file} user={user} userProfile={userProfile} dbId={dbId} />
            )}
        </div>
    );
}
