import { useState, useRef, useEffect } from 'react';
import { participantNames } from '../data/names';

const XIcon = () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);
const CheckIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 13 4 10" />
    </svg>
);
const SearchIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

export default function UploadModal({ file, onClose, onConfirm }) {
    const [context, setContext] = useState('');
    const [suspectNames, setSuspectNames] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showNameList, setShowNameList] = useState(false);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    useEffect(() => { inputRef.current?.focus(); }, []);
    useEffect(() => {
        const h = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowNameList(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (suspectNames.length === 0) return;
        onConfirm(context.trim() || 'No context provided.', suspectNames);
    };

    const toggleSuspect = (name) => {
        setSuspectNames(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
    };

    const filteredNames = participantNames.filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()));
    const canSubmit = suspectNames.length > 0 && context.trim();

    if (!file) return null;

    return (
        <div
            style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
            onClick={onClose}
        >
            <div
                className="slide-up glass-card hud-corners"
                onClick={e => e.stopPropagation()}
                style={{ maxWidth: 520, width: '100%', borderRadius: 4, boxShadow: '0 0 60px var(--ac-a35), 0 24px 80px rgba(0,0,0,0.6)', overflow: 'visible' }}
            >
                <div className="hud-br" />
                <div className="top-bar" />

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--ac-a12)', background: 'var(--ac-a03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--c-ac)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--c-ac)', letterSpacing: '0.15em' }}>EVIDENCE ACQUISITION PROTOCOL</span>
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', color: 'var(--c-tx2)', padding: 4, border: 'none', cursor: 'pointer', transition: 'color 150ms' }} onMouseOver={e => e.currentTarget.style.color = 'var(--c-tx)'} onMouseOut={e => e.currentTarget.style.color = 'var(--c-tx2)'}>
                        <XIcon />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* File info */}
                    <div style={{ background: 'var(--ac-a05)', border: '1px solid var(--ac-a12)', borderRadius: 3, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--c-ac)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.7 }}>
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                        </svg>
                        <div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 8, letterSpacing: '0.22em', color: 'var(--c-tx3)', textTransform: 'uppercase', marginBottom: 3 }}>TARGET FILE SOURCE</div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: 'var(--c-tx)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 360 }}>{file.name}</div>
                            <div style={{ fontSize: 9, color: 'var(--c-tx3)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>BYTES: {file.size?.toLocaleString()}</div>
                        </div>
                    </div>

                    {/* Suspect selector */}
                    <div style={{ position: 'relative' }} ref={dropdownRef}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.22em', color: 'var(--c-tx2)', textTransform: 'uppercase', marginBottom: 6 }}>TARGET SUSPECT(S)</div>
                        <div
                            onClick={() => setShowNameList(v => !v)}
                            style={{
                                background: 'var(--c-bg-input)', border: `1px solid ${suspectNames.length > 0 ? 'var(--ac-a28)' : 'var(--ac-a12)'}`,
                                borderRadius: 3, padding: '10px 12px', cursor: 'pointer',
                                minHeight: 46, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center',
                                transition: 'border-color 150ms',
                            }}
                        >
                            {suspectNames.length === 0 && <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: 'var(--c-tx3)', letterSpacing: '0.08em' }}>SELECT SUBJECTS...</span>}
                            {suspectNames.map(n => (
                                <span key={n} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--ac-a08)', border: '1px solid var(--ac-a28)', borderRadius: 2, padding: '2px 8px', fontFamily: 'var(--font-display)', fontSize: 9, color: 'var(--c-ac)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                                    {n}
                                    <button type="button" onClick={e => { e.stopPropagation(); toggleSuspect(n); }} style={{ background: 'transparent', color: 'var(--c-ac)', padding: 0, border: 'none', cursor: 'pointer', lineHeight: 1, display: 'flex' }}>
                                        <XIcon />
                                    </button>
                                </span>
                            ))}
                        </div>
                        {showNameList && (
                            <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'var(--c-bg-header)', border: '1px solid var(--ac-a28)', borderRadius: 4, boxShadow: '0 16px 48px rgba(0,0,0,0.4)', zIndex: 200, overflow: 'hidden' }}>
                                <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--ac-a12)', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--ac-a03)', color: 'var(--c-tx3)' }}>
                                    <SearchIcon />
                                    <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="SEARCH SUSPECT..." autoFocus
                                        style={{ background: 'transparent', border: 'none', fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.08em', color: 'var(--c-tx)', flex: 1, boxShadow: 'none', outline: 'none' }} />
                                </div>
                                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                                    {filteredNames.map(n => {
                                        const sel = suspectNames.includes(n);
                                        return (
                                            <div key={n} onClick={() => toggleSuspect(n)}
                                                style={{ padding: '9px 14px', fontFamily: 'var(--font-display)', fontSize: 11, cursor: 'pointer', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: sel ? 'var(--ac-a08)' : 'transparent', color: sel ? 'var(--c-ac)' : 'var(--c-tx2)', transition: 'all 100ms' }}
                                                onMouseOver={e => { if (!sel) { e.currentTarget.style.background = 'var(--ac-a05)'; e.currentTarget.style.color = 'var(--c-tx)'; }}}
                                                onMouseOut={e => { if (!sel) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--c-tx2)'; }}}
                                            >
                                                {n}{sel && <CheckIcon />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Context */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.22em', color: 'var(--c-tx2)', textTransform: 'uppercase' }}>CLASSIFIED INTEL CONTEXT</div>
                            <span style={{ fontSize: 9, color: context.length >= 35 ? '#ff2d55' : 'var(--c-tx3)', fontFamily: 'var(--font-mono)' }}>[{String(context.length).padStart(2, '0')}/35]</span>
                        </div>
                        <textarea
                            ref={inputRef} value={context} onChange={e => setContext(e.target.value)}
                            maxLength={35} placeholder="REDACTED DETAILS..." required
                            style={{ width: '100%', height: 76, padding: '10px 12px', borderRadius: 3, fontSize: 11, letterSpacing: '0.04em', resize: 'none', lineHeight: 1.5 }}
                        />
                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 4 }}>
                        <button type="button" onClick={onClose}
                            style={{ background: 'transparent', color: 'var(--c-tx2)', padding: '8px 16px', borderRadius: 3, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', transition: 'color 150ms' }}
                            onMouseOver={e => e.currentTarget.style.color = 'var(--c-tx)'} onMouseOut={e => e.currentTarget.style.color = 'var(--c-tx2)'}>
                            ABORT
                        </button>
                        <button type="submit" disabled={!canSubmit}
                            style={{ background: 'var(--c-ac)', color: '#020608', padding: '8px 20px', borderRadius: 3, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', border: 'none', cursor: canSubmit ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-display)', fontWeight: 700, opacity: canSubmit ? 1 : 0.35, transition: 'all 150ms' }}
                            onMouseOver={e => { if (canSubmit) e.currentTarget.style.boxShadow = '0 0 24px var(--ac-a35)'; }}
                            onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}>
                            AUTHORIZE
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
