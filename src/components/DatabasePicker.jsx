import { useState } from 'react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { createDatabase, joinDatabase, normalizeCode } from '../lib/databases';
import ThemeToggle from './ThemeToggle';
import useTheme from '../hooks/useTheme';

const inputStyle = {
    width: '100%', padding: '11px 12px', borderRadius: 3,
    fontFamily: 'var(--font-display)', fontSize: 12, letterSpacing: '0.06em',
    boxSizing: 'border-box',
};

const labelStyle = {
    display: 'block', fontFamily: 'var(--font-display)', fontSize: 8,
    letterSpacing: '0.28em', color: 'var(--c-tx3)', textTransform: 'uppercase', marginBottom: 5,
};

export default function DatabasePicker({ user, userProfile, onJoined }) {
    const [lightMode, toggleLightMode] = useTheme();
    const [mode, setMode] = useState('choose'); // 'choose' | 'join' | 'create'
    const [code, setCode] = useState('');
    const [sitePassword, setSitePassword] = useState('');
    const [needsSitePassword, setNeedsSitePassword] = useState(false);
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const reset = () => {
        setMode('choose'); setCode(''); setSitePassword('');
        setNeedsSitePassword(false); setName(''); setError('');
    };

    const handleSignOut = () => signOut(auth).catch(console.error);

    const handleJoinSubmit = async (e) => {
        e.preventDefault(); setError(''); setLoading(true);
        try {
            const result = await joinDatabase({
                user, userProfile,
                code: normalizeCode(code),
                sitePassword: needsSitePassword ? sitePassword : undefined,
            });
            if (onJoined) onJoined(result);
        } catch (err) {
            if (err.message === 'invalid-code') setError('ENTER A VALID 4-CHARACTER CODE.');
            else if (err.message === 'not-found') setError('NO DATABASE FOUND FOR THAT CODE.');
            else if (err.message === 'invalid-site-password') {
                setNeedsSitePassword(true);
                setError(needsSitePassword ? 'INVALID UNIVERSAL PASSWORD.' : 'THIS DATABASE REQUIRES A UNIVERSAL PASSWORD.');
            } else {
                console.error(err); setError('FAILED TO JOIN. TRY AGAIN.');
            }
        } finally { setLoading(false); }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault(); setError(''); setLoading(true);
        try {
            const result = await createDatabase({ user, userProfile, name });
            if (onJoined) onJoined(result);
        } catch (err) {
            if (err.message === 'invalid-name') setError('NAME MUST BE 3–40 CHARACTERS.');
            else { console.error(err); setError('FAILED TO CREATE DATABASE. TRY AGAIN.'); }
        } finally { setLoading(false); }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, position: 'relative' }}>
            <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 200 }}>
                <ThemeToggle lightMode={lightMode} onToggle={toggleLightMode} />
            </div>

            <div className="slide-up" style={{ width: '100%', maxWidth: 480, position: 'relative' }}>
                <div style={{ position: 'absolute', inset: -1, borderRadius: 4, border: '1px solid var(--ac-a28)', boxShadow: '0 0 80px var(--ac-a35)', pointerEvents: 'none' }} />
                <div className="hud-corners" style={{ borderRadius: 4, overflow: 'hidden' }}>
                    <div className="hud-br" />
                    <div style={{ background: 'var(--c-bg-card)', backdropFilter: 'blur(24px)' }}>
                        <div className="top-bar" />
                        <div style={{ padding: '32px 32px 26px' }}>
                            <div style={{ textAlign: 'center', marginBottom: 22 }}>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--c-ac)', letterSpacing: '0.18em', textShadow: '0 0 16px var(--ac-a35)' }}>
                                    SELECT DEPARTMENT
                                </div>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', letterSpacing: '0.4em', color: 'var(--c-tx2)', marginTop: 6, textTransform: 'uppercase' }}>
                                    JOIN OR ESTABLISH AN ARCHIVE
                                </div>
                            </div>

                            {error && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', border: '1px solid rgba(255,45,85,0.4)', background: 'rgba(255,45,85,0.1)', borderRadius: 3, marginBottom: 14, fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.12em', color: '#ff2d55' }}>
                                    {error}
                                </div>
                            )}

                            {mode === 'choose' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <button onClick={() => { setMode('join'); setError(''); }}
                                        style={{ width: '100%', padding: '14px', borderRadius: 3, background: 'var(--ac-a08)', border: '1px solid var(--ac-a28)', color: 'var(--c-ac)', fontFamily: 'var(--font-display)', fontSize: 12, letterSpacing: '0.18em', fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer', transition: 'all 150ms' }}
                                        onMouseOver={e => { e.currentTarget.style.background = 'var(--ac-a12)'; e.currentTarget.style.boxShadow = '0 0 18px var(--ac-a35)'; }}
                                        onMouseOut={e => { e.currentTarget.style.background = 'var(--ac-a08)'; e.currentTarget.style.boxShadow = 'none'; }}>
                                        ▸ JOIN WITH CODE
                                    </button>
                                    <button onClick={() => { setMode('create'); setError(''); }}
                                        style={{ width: '100%', padding: '14px', borderRadius: 3, background: 'transparent', border: '1px solid var(--ac-a28)', color: 'var(--c-tx2)', fontFamily: 'var(--font-display)', fontSize: 12, letterSpacing: '0.18em', fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer', transition: 'all 150ms' }}
                                        onMouseOver={e => { e.currentTarget.style.color = 'var(--c-ac)'; e.currentTarget.style.borderColor = 'var(--c-ac)'; }}
                                        onMouseOut={e => { e.currentTarget.style.color = 'var(--c-tx2)'; e.currentTarget.style.borderColor = 'var(--ac-a28)'; }}>
                                        + ESTABLISH NEW DEPARTMENT
                                    </button>
                                    <div style={{ marginTop: 8, paddingTop: 14, borderTop: '1px solid var(--ac-a12)', textAlign: 'center' }}>
                                        <button type="button" onClick={handleSignOut}
                                            style={{ background: 'transparent', border: 'none', color: 'var(--c-tx3)', fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', cursor: 'pointer' }}>
                                            &gt; SIGN OUT
                                        </button>
                                    </div>
                                </div>
                            )}

                            {mode === 'join' && (
                                <form onSubmit={handleJoinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    <div>
                                        <label style={labelStyle}>DEPARTMENT CODE</label>
                                        <input
                                            type="text" value={code}
                                            onChange={e => setCode(e.target.value.toUpperCase())}
                                            placeholder="XXXX" required autoFocus maxLength={6}
                                            style={{ ...inputStyle, letterSpacing: '0.4em', textAlign: 'center', fontSize: 18, fontWeight: 700 }}
                                        />
                                    </div>
                                    {needsSitePassword && (
                                        <div>
                                            <label style={labelStyle}>UNIVERSAL PASSWORD</label>
                                            <input type="password" value={sitePassword}
                                                onChange={e => setSitePassword(e.target.value)}
                                                placeholder="••••••••" required autoFocus
                                                style={{ ...inputStyle, letterSpacing: '0.2em' }} />
                                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 7, letterSpacing: '0.18em', color: 'var(--c-tx3)', marginTop: 4, textTransform: 'uppercase' }}>
                                                The original Lorenzo Files requires a universal password.
                                            </div>
                                        </div>
                                    )}
                                    <button type="submit" disabled={loading || !code.trim()}
                                        style={{ width: '100%', padding: '13px', borderRadius: 3, background: 'var(--c-ac)', color: lightMode ? '#fff' : '#020608', border: 'none', fontFamily: 'var(--font-display)', fontSize: 12, letterSpacing: '0.2em', fontWeight: 700, textTransform: 'uppercase', cursor: loading ? 'wait' : 'pointer', opacity: loading || !code.trim() ? 0.5 : 1, transition: 'all 150ms', marginTop: 4 }}>
                                        {loading ? 'JOINING...' : 'JOIN DEPARTMENT'}
                                    </button>
                                    <div style={{ textAlign: 'center' }}>
                                        <button type="button" onClick={reset}
                                            style={{ background: 'transparent', border: 'none', color: 'var(--c-tx3)', fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', cursor: 'pointer' }}>
                                            &gt; BACK
                                        </button>
                                    </div>
                                </form>
                            )}

                            {mode === 'create' && (
                                <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    <div>
                                        <label style={labelStyle}>DEPARTMENT NAME</label>
                                        <input type="text" value={name}
                                            onChange={e => setName(e.target.value)}
                                            placeholder="e.g. THE WHARTON FILES" required autoFocus maxLength={40}
                                            style={inputStyle} />
                                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 7, letterSpacing: '0.18em', color: 'var(--c-tx3)', marginTop: 4, textTransform: 'uppercase' }}>
                                            3–40 chars · You will receive a join code to share.
                                        </div>
                                    </div>
                                    <button type="submit" disabled={loading || !name.trim()}
                                        style={{ width: '100%', padding: '13px', borderRadius: 3, background: 'var(--c-ac)', color: lightMode ? '#fff' : '#020608', border: 'none', fontFamily: 'var(--font-display)', fontSize: 12, letterSpacing: '0.2em', fontWeight: 700, textTransform: 'uppercase', cursor: loading ? 'wait' : 'pointer', opacity: loading || !name.trim() ? 0.5 : 1, transition: 'all 150ms', marginTop: 4 }}>
                                        {loading ? 'ESTABLISHING...' : 'ESTABLISH'}
                                    </button>
                                    <div style={{ textAlign: 'center' }}>
                                        <button type="button" onClick={reset}
                                            style={{ background: 'transparent', border: 'none', color: 'var(--c-tx3)', fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', cursor: 'pointer' }}>
                                            &gt; BACK
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
