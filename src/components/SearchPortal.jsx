import { useState } from 'react';

export default function SearchPortal({ query, onQueryChange }) {
    const [focused, setFocused] = useState(false);

    return (
        <div style={{ position: 'relative', maxWidth: 680, margin: '0 auto' }}>
            <div className="hud-corners" style={{ borderRadius: 0 }}>
                <div className="hud-br" />
                <div style={{
                    display: 'flex', alignItems: 'center',
                    background: 'rgba(14,24,40,0.6)', backdropFilter: 'blur(20px)',
                    border: `1px solid ${focused ? '#00d4ff' : 'rgba(0,212,255,0.12)'}`,
                    boxShadow: focused ? '0 0 0 1px rgba(0,212,255,0.08), 0 0 32px rgba(0,212,255,0.35)' : undefined,
                    transition: 'all 150ms',
                }}>
                    <div style={{
                        width: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: focused ? '#00d4ff' : '#3d5a78', transition: 'color 150ms',
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        placeholder="QUERY EVIDENCE DATABASE..."
                        style={{
                            flex: 1, background: 'transparent', border: 'none',
                            padding: '14px 0', fontSize: 13, letterSpacing: '0.06em',
                            color: '#dceeff', boxShadow: 'none',
                            fontFamily: 'var(--font-display)', fontWeight: 500,
                            outline: 'none',
                        }}
                    />
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        paddingRight: 16, fontSize: 9, letterSpacing: '0.2em',
                        color: '#3d5a78', fontFamily: 'var(--font-display)',
                    }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="2" />
                            <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
                        </svg>
                        PORTAL v3.7
                    </div>
                </div>
            </div>
            <div className="animated-border" />
            <div style={{
                textAlign: 'center', marginTop: 7,
                fontSize: 9, letterSpacing: '0.25em', fontFamily: 'var(--font-display)',
                textTransform: 'uppercase', color: '#7aa8cc',
            }}>
                All queries are logged — Authorized personnel only
            </div>
        </div>
    );
}
