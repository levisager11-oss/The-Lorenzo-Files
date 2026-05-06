import { useState } from 'react';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import ThemeToggle from './ThemeToggle';
import useTheme from '../hooks/useTheme';

export default function UsernamePrompt({ user, onComplete }) {
    const [lightMode, toggleLightMode] = useTheme();
    const [username, setUsername] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = username.trim();
        if (!trimmed) { setError('CALLSIGN CANNOT BE EMPTY.'); return; }
        if (trimmed.length < 3 || trimmed.length > 20) { setError('CALLSIGN MUST BE 3–20 CHARACTERS.'); return; }
        if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) { setError('ONLY LETTERS, NUMBERS, HYPHENS AND UNDERSCORES ALLOWED.'); return; }

        setSubmitting(true);
        setError('');
        try {
            await setDoc(doc(db, "users", user.uid), { username: trimmed, createdAt: Date.now(), email: user.email, experiencePoints: 0 });
            if (onComplete) onComplete({ username: trimmed });
        } catch (err) {
            console.error("Error setting username:", err);
            setError("FAILED TO REGISTER IDENTITY. PLEASE TRY AGAIN.");
            setSubmitting(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, position: 'relative' }}>
            <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 200 }}>
                <ThemeToggle lightMode={lightMode} onToggle={toggleLightMode} />
            </div>

            <div className="slide-up" style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
                <div style={{ position: 'absolute', inset: -1, borderRadius: 4, border: '1px solid var(--ac-a28)', boxShadow: '0 0 60px var(--ac-a35)', pointerEvents: 'none' }} />
                <div className="hud-corners" style={{ borderRadius: 4, overflow: 'hidden' }}>
                    <div className="hud-br" />
                    <div style={{ background: 'var(--c-bg-card)', backdropFilter: 'blur(24px)' }}>
                        <div className="top-bar" />
                        <div style={{ padding: '36px 36px 28px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24, gap: 14 }}>
                                <div style={{ width: 64, height: 64, borderRadius: '50%', border: '2px solid var(--c-ac)', background: 'var(--ac-a08)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px var(--ac-a35)' }}>
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--c-ac)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                                    </svg>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--c-ac)', letterSpacing: '0.18em', textShadow: '0 0 16px var(--ac-a35)' }}>INITIALIZE AGENT PROFILE</div>
                                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', letterSpacing: '0.4em', color: 'var(--c-tx2)', marginTop: 5, textTransform: 'uppercase' }}>ASSIGN YOUR OPERATIVE CALLSIGN</div>
                                </div>
                            </div>

                            {error && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', border: '1px solid rgba(255,45,85,0.4)', background: 'rgba(255,45,85,0.1)', borderRadius: 3, marginBottom: 14, fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.1em', color: '#ff2d55' }}>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <div>
                                    <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 8, letterSpacing: '0.28em', color: 'var(--c-tx3)', textTransform: 'uppercase', marginBottom: 6 }}>CALLSIGN / USERNAME</label>
                                    <input
                                        type="text" value={username} onChange={e => setUsername(e.target.value)}
                                        placeholder="e.g. SHADOW-ACTUAL" autoFocus disabled={submitting}
                                        style={{ width: '100%', padding: '12px', borderRadius: 3, fontFamily: 'var(--font-display)', fontSize: 13, letterSpacing: '0.08em', boxSizing: 'border-box' }}
                                    />
                                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 7, letterSpacing: '0.15em', color: 'var(--c-tx3)', marginTop: 4, textTransform: 'uppercase' }}>3–20 chars · Letters, numbers, hyphens, underscores</div>
                                </div>

                                {username.trim().length >= 3 && (
                                    <div style={{ background: 'var(--ac-a08)', border: '1px solid var(--ac-a28)', borderRadius: 3, padding: '10px 14px' }}>
                                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 7, letterSpacing: '0.2em', color: 'var(--c-tx3)', textTransform: 'uppercase', marginBottom: 4 }}>OPERATIVE DESIGNATION</div>
                                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--c-ac)', letterSpacing: '0.15em' }}>AGENT-{username.trim().toUpperCase()}</div>
                                    </div>
                                )}

                                <button type="submit" disabled={submitting || !username.trim()}
                                    style={{ width: '100%', padding: '13px', borderRadius: 3, background: 'var(--c-ac)', color: lightMode ? '#fff' : '#020608', border: 'none', fontFamily: 'var(--font-display)', fontSize: 12, letterSpacing: '0.2em', fontWeight: 700, textTransform: 'uppercase', cursor: submitting || !username.trim() ? 'not-allowed' : 'pointer', opacity: submitting || !username.trim() ? 0.35 : 1, transition: 'all 150ms', marginTop: 4 }}
                                    onMouseOver={e => { if (!submitting && username.trim()) e.currentTarget.style.boxShadow = '0 0 24px var(--ac-a35)'; }}
                                    onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}>
                                    {submitting ? 'INITIALIZING...' : 'CONFIRM IDENTITY'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
