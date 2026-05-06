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

export default function FileRow({ file, fileNumber, onRedactedClick, user, userProfile, onDelete, isDeleting }) {
    const [showReports, setShowReports] = useState(false);
    const isOwner = file.uploadedById === user?.uid;
    const badgeClass = statusBadgeClass[file.status] || 'badge-redacted';
    const commentCount = file.commentCount || 0;
    const fileNum = String(fileNumber).padStart(3, '0');
    const suspects = (file.suspectNames || (file.suspectName ? [file.suspectName] : ['Lorenzo'])).join(', ');

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
            <div
                className="tbl-row"
                style={{ opacity: isDeleting ? 0.3 : 1, transition: 'opacity 300ms', cursor: file.downloadURL ? 'pointer' : 'default' }}
                onDoubleClick={handleDownload}
                title={file.downloadURL ? 'Double-click to download' : undefined}
            >
                {/* # */}
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: 'var(--c-tx3)', fontWeight: 600 }}>{fileNum}</div>

                {/* Votes */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <VoteButtons file={file} user={user} />
                </div>

                {/* File name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--c-ac)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><rect width="6" height="5" x="9" y="13" rx="1" /><path d="M10 13v-1a2 2 0 0 1 4 0v1" />
                    </svg>
                    <div style={{ minWidth: 0 }}>
                        {file.downloadURL ? (
                            <a
                                href={file.downloadURL} target="_blank" rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                style={{
                                    fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--c-ac)',
                                    fontWeight: 600, letterSpacing: '0.05em', textDecoration: 'none',
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    display: 'block', textShadow: '0 0 8px rgba(0,212,255,0.08)',
                                }}
                            >{file.name}</a>
                        ) : (
                            <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--c-tx)', fontWeight: 600, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {file.name}
                            </span>
                        )}
                        {file.uploaderUsername && (
                            <div style={{ fontSize: 9, color: 'var(--c-tx3)', letterSpacing: '0.15em', marginTop: 1, fontFamily: 'var(--font-display)' }}>
                                BY: {file.uploaderUsername.toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>

                {/* Suspect */}
                <div style={{ fontSize: 10, color: 'var(--c-tx2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-display)' }} title={suspects}>
                    {suspects}
                </div>

                {/* Date / Size */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: 10, color: 'var(--c-tx2)', fontFamily: 'var(--font-display)' }}>{file.date}</span>
                    <span style={{ fontSize: 9, color: 'var(--c-tx3)', fontFamily: 'var(--font-mono)' }}>{file.size}</span>
                </div>

                {/* Intel (redacted + badge + comment button) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <RedactedBox text={file.redactedText} onRedactedClick={onRedactedClick} />
                    <button
                        onClick={e => { e.stopPropagation(); setShowReports(v => !v); }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
                            background: showReports ? 'var(--ac-a08)' : 'transparent',
                            color: showReports ? 'var(--c-ac)' : 'var(--c-tx3)',
                            padding: '5px 8px', borderRadius: 2, fontSize: 9,
                            border: `1px solid ${showReports ? 'var(--ac-a28)' : 'var(--ac-a12)'}`,
                            transition: 'all 150ms', cursor: 'pointer',
                        }}
                        title="Toggle Intel Reports"
                    >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <span>{commentCount}</span>
                    </button>
                </div>

                {/* Action */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {isOwner ? (
                        <button
                            onClick={e => { e.stopPropagation(); if (!isDeleting) onDelete(file); }}
                            disabled={isDeleting}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                background: 'rgba(255,45,85,0.1)', color: '#ff2d55',
                                border: '1px solid rgba(255,45,85,0.25)',
                                padding: '5px 12px', borderRadius: 2, fontSize: 9,
                                letterSpacing: '0.1em', textTransform: 'uppercase',
                                cursor: isDeleting ? 'not-allowed' : 'pointer',
                                transition: 'all 150ms', fontFamily: 'var(--font-display)', fontWeight: 600,
                            }}
                            onMouseOver={e => { if (!isDeleting) { e.currentTarget.style.background = 'rgba(255,45,85,0.18)'; e.currentTarget.style.borderColor = '#ff2d55'; }}}
                            onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,45,85,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,45,85,0.25)'; }}
                        >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                            PURGE
                        </button>
                    ) : (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--c-tx3)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    )}
                </div>
            </div>
            {showReports && (
                <IntelReportPanel file={file} user={user} userProfile={userProfile} />
            )}
        </div>
    );
}
