import { useState } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signOut, signInWithPopup } from 'firebase/auth';
import RadarSeal from './RadarSeal';
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

export default function LoginScreen() {
    const [lightMode, toggleLightMode] = useTheme();
    const [mode, setMode] = useState('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [codename, setCodename] = useState('');
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setError(''); setInfo(''); setLoading(true);
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (err) {
            let msg = "AUTHENTICATION FAILURE";
            if (err.code === 'auth/popup-closed-by-user') msg = "AUTHORIZATION ABORTED";
            else if (err.code === 'auth/popup-blocked') msg = "POPUP BLOCKED BY BROWSER";
            else if (err.code === 'auth/account-exists-with-different-credential') msg = "ACCOUNT EXISTS WITH DIFFERENT CREDENTIALS";
            setError(msg);
        } finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setInfo(''); setLoading(true);
        try {
            if (mode === 'register') {
                if (password !== confirmPassword) throw new Error('passwords-mismatch');
                const cred = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(cred.user, { displayName: codename });
                await sendEmailVerification(cred.user);
                await signOut(auth);
                setInfo('VERIFICATION LINK TRANSMITTED. CHECK YOUR EMAIL TO CONFIRM YOUR IDENTITY BEFORE SIGNING IN.');
                setLoading(false); return;
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            let msg = "AUTHENTICATION FAILURE";
            if (err.message === 'passwords-mismatch') msg = "PASSWORDS DO NOT MATCH";
            else if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') msg = "AGENT NOT FOUND OR INVALID CREDENTIALS";
            else if (err.code === 'auth/wrong-password') msg = "INVALID CREDENTIALS";
            else if (err.code === 'auth/too-many-requests') msg = "ACCESS TEMPORARILY SUSPENDED";
            else if (err.code === 'auth/email-already-in-use') msg = "AGENT IDENTITY ALREADY REGISTERED";
            else if (err.code === 'auth/weak-password') msg = "INSUFFICIENT ENCRYPTION (WEAK PASSWORD)";
            setError(msg);
        } finally { setLoading(false); }
    };

    const toggleMode = () => { setMode(m => m === 'signin' ? 'register' : 'signin'); setError(''); setInfo(''); setEmail(''); setPassword(''); setConfirmPassword(''); setCodename(''); };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, position: 'relative' }}>
            {/* Theme toggle — fixed top-right */}
            <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 200 }}>
                <ThemeToggle lightMode={lightMode} onToggle={toggleLightMode} />
            </div>

            <div className="slide-up" style={{ width: '100%', maxWidth: 460, position: 'relative' }}>
                <div style={{ position: 'absolute', inset: -1, borderRadius: 4, border: '1px solid var(--ac-a28)', boxShadow: '0 0 80px var(--ac-a35)', pointerEvents: 'none' }} />
                <div className="hud-corners" style={{ borderRadius: 4, overflow: 'hidden' }}>
                    <div className="hud-br" />
                    <div style={{ background: 'var(--c-bg-card)', backdropFilter: 'blur(24px)' }}>
                        <div className="top-bar" />
                        <div style={{ padding: '36px 36px 28px' }}>

                            {/* Logo */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28, gap: 16 }}>
                                <div style={{ position: 'relative' }}>
                                    <RadarSeal size={80} />
                                    <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: '1px solid var(--c-ac)', opacity: 0.2 }} className="ping-ring" />
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--c-ac)', letterSpacing: '0.2em', textShadow: '0 0 20px var(--ac-a35)', display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
                                        </svg>
                                        CLEARANCE REQUIRED
                                        <span className="cursor-blink">█</span>
                                    </div>
                                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.4em', color: 'var(--c-tx2)', marginTop: 5 }}>DEPARTMENT OF LORENZO // DELOS SYSTEM</div>
                                </div>
                            </div>

                            {error && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', border: '1px solid rgba(255,45,85,0.4)', background: 'rgba(255,45,85,0.1)', borderRadius: 3, marginBottom: 16, fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.12em', color: '#ff2d55' }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                                    {error}
                                </div>
                            )}
                            {info && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', border: '1px solid var(--ac-a28)', background: 'var(--ac-a08)', borderRadius: 3, marginBottom: 16, fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--c-ac)' }}>
                                    {info}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {mode === 'register' && (
                                    <div>
                                        <label style={labelStyle}>AGENT CODENAME</label>
                                        <input type="text" value={codename} onChange={e => setCodename(e.target.value)} placeholder="CODENAME..." required style={inputStyle} />
                                    </div>
                                )}
                                <div>
                                    <label style={labelStyle}>AUTHORIZED EMAIL</label>
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="IDENTIFIER..." required style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>PASSCODE</label>
                                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={{ ...inputStyle, letterSpacing: '0.2em' }} />
                                </div>
                                {mode === 'register' && (
                                    <div>
                                        <label style={labelStyle}>CONFIRM PASSCODE</label>
                                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" required style={{ ...inputStyle, letterSpacing: '0.2em' }} />
                                    </div>
                                )}
                                <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', borderRadius: 3, background: 'var(--c-ac)', color: lightMode ? '#fff' : '#020608', border: 'none', fontFamily: 'var(--font-display)', fontSize: 12, letterSpacing: '0.2em', fontWeight: 700, textTransform: 'uppercase', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 150ms', marginTop: 4 }}
                                    onMouseOver={e => { if (!loading) e.currentTarget.style.boxShadow = '0 0 24px var(--ac-a35)'; }}
                                    onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}>
                                    {loading ? <><span className="cursor-blink">█</span> AUTHENTICATING...</> : mode === 'signin' ? 'AUTHORIZE ACCESS' : 'REQUEST CLEARANCE'}
                                </button>
                            </form>

                            {mode === 'signin' && (
                                <div style={{ marginTop: 16 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                                        <div className="sep" style={{ flex: 1 }} />
                                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.22em', color: 'var(--c-tx3)' }}>OR</span>
                                        <div className="sep" style={{ flex: 1 }} />
                                    </div>
                                    <button type="button" onClick={handleGoogleSignIn} disabled={loading}
                                        style={{ width: '100%', padding: '11px', borderRadius: 3, background: 'var(--ac-a05)', border: '1px solid var(--ac-a12)', color: 'var(--c-tx)', fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 150ms', cursor: loading ? 'wait' : 'pointer' }}
                                        onMouseOver={e => { if (!loading) { e.currentTarget.style.borderColor = 'var(--c-ac)'; e.currentTarget.style.background = 'var(--ac-a08)'; }}}
                                        onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--ac-a12)'; e.currentTarget.style.background = 'var(--ac-a05)'; }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                        AUTHORIZE WITH GOOGLE
                                    </button>
                                </div>
                            )}

                            <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid var(--ac-a12)', textAlign: 'center' }}>
                                <button type="button" onClick={toggleMode}
                                    style={{ background: 'transparent', border: 'none', color: 'var(--c-tx3)', fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', cursor: 'pointer', transition: 'color 150ms' }}
                                    onMouseOver={e => e.currentTarget.style.color = 'var(--c-ac)'} onMouseOut={e => e.currentTarget.style.color = 'var(--c-tx3)'}>
                                    {mode === 'signin' ? '> REQUEST ACCESS (NEW AGENT)' : '> ALREADY CLEARED (SIGN IN)'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
