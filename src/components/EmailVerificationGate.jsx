import { useState } from 'react';
import { auth } from '../lib/firebase';
import { sendEmailVerification, signOut } from 'firebase/auth';
import RadarSeal from './RadarSeal';
import ThemeToggle from './ThemeToggle';
import useTheme from '../hooks/useTheme';

export default function EmailVerificationGate({ user, setUser }) {
    const [lightMode, toggleLightMode] = useTheme();
    const [statusMsg, setStatusMsg] = useState('');
    const [statusType, setStatusType] = useState('');

    const handleResendVerification = async () => {
        setStatusMsg('');
        try {
            await sendEmailVerification(auth.currentUser);
            setStatusType('info');
            setStatusMsg('VERIFICATION LINK RE-TRANSMITTED. CHECK YOUR EMAIL.');
        } catch (err) {
            setStatusType('error');
            setStatusMsg(err.code === 'auth/too-many-requests' ? 'TOO MANY REQUESTS. TRY AGAIN LATER.' : 'UNABLE TO SEND VERIFICATION. TRY AGAIN LATER.');
        }
    };

    const handleRefreshStatus = async () => {
        setStatusMsg('');
        try {
            await auth.currentUser.reload();
            if (auth.currentUser.emailVerified) {
                setUser({ ...auth.currentUser });
            } else {
                setStatusType('error');
                setStatusMsg('EMAIL NOT YET VERIFIED. CHECK YOUR INBOX.');
            }
        } catch {
            setStatusType('error');
            setStatusMsg('UNABLE TO CHECK STATUS. TRY AGAIN.');
        }
    };

    const handleSignOut = () => { signOut(auth).catch(console.error); };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, position: 'relative' }}>
            <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 200 }}>
                <ThemeToggle lightMode={lightMode} onToggle={toggleLightMode} />
            </div>

            <div className="slide-up" style={{ width: '100%', maxWidth: 440, position: 'relative' }}>
                <div style={{ position: 'absolute', inset: -1, borderRadius: 4, border: '1px solid var(--ac-a28)', boxShadow: '0 0 60px var(--ac-a35)', pointerEvents: 'none' }} />
                <div className="hud-corners" style={{ borderRadius: 4, overflow: 'hidden' }}>
                    <div className="hud-br" />
                    <div style={{ background: 'var(--c-bg-card)', backdropFilter: 'blur(24px)' }}>
                        <div className="top-bar" />
                        <div style={{ padding: '36px 36px 28px', textAlign: 'center' }}>
                            <div style={{ position: 'relative', display: 'inline-flex', marginBottom: 20 }}>
                                <div style={{ width: 72, height: 72, borderRadius: '50%', border: '2px solid var(--c-ac)', background: 'var(--ac-a08)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px var(--ac-a35)' }}>
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--c-ac)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                                    </svg>
                                </div>
                                <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: '1px solid var(--c-ac)', opacity: 0.2 }} className="ping-ring" />
                            </div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--c-ac)', letterSpacing: '0.15em', textShadow: '0 0 20px var(--ac-a35)', marginBottom: 6 }}>EMAIL VERIFICATION REQUIRED</div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', letterSpacing: '0.4em', color: 'var(--c-tx2)', marginBottom: 24, textTransform: 'uppercase' }}>DEPARTMENT OF LORENZO // DELOS SYSTEM</div>

                            <div style={{ background: 'var(--ac-a08)', border: '1px solid var(--ac-a28)', borderRadius: 4, padding: '14px 16px', marginBottom: 16, textAlign: 'left' }}>
                                <div style={{ fontSize: 11, color: 'var(--c-tx2)', lineHeight: 1.7, fontFamily: 'var(--font-mono)' }}>
                                    A verification link has been transmitted to{' '}
                                    <span style={{ color: 'var(--c-ac)', fontWeight: 600 }}>{user?.email || 'your email'}</span>.{' '}
                                    Confirm your identity to gain archive access.
                                </div>
                            </div>

                            {statusMsg && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                                    border: `1px solid ${statusType === 'error' ? 'rgba(255,45,85,0.4)' : 'var(--ac-a28)'}`,
                                    background: statusType === 'error' ? 'rgba(255,45,85,0.1)' : 'var(--ac-a08)',
                                    borderRadius: 3, marginBottom: 16,
                                    fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.1em',
                                    color: statusType === 'error' ? '#ff2d55' : 'var(--c-ac)', textAlign: 'left',
                                }}>
                                    {statusMsg}
                                </div>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <button onClick={handleRefreshStatus}
                                    style={{ width: '100%', padding: '12px', borderRadius: 3, background: 'var(--c-ac)', color: lightMode ? '#fff' : '#020608', border: 'none', fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 150ms' }}
                                    onMouseOver={e => e.currentTarget.style.boxShadow = '0 0 24px var(--ac-a35)'}
                                    onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}>
                                    I&apos;VE VERIFIED — CHECK STATUS
                                </button>
                                <button onClick={handleResendVerification}
                                    style={{ width: '100%', padding: '11px', borderRadius: 3, background: 'transparent', border: '1px solid var(--ac-a28)', color: 'var(--c-tx2)', fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 150ms' }}
                                    onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--c-ac)'; e.currentTarget.style.color = 'var(--c-ac)'; }}
                                    onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--ac-a28)'; e.currentTarget.style.color = 'var(--c-tx2)'; }}>
                                    RESEND VERIFICATION EMAIL
                                </button>
                                <button onClick={handleSignOut}
                                    style={{ width: '100%', padding: '10px', borderRadius: 3, background: 'rgba(255,45,85,0.1)', color: '#ff2d55', border: '1px solid rgba(255,45,85,0.25)', fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 150ms' }}
                                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,45,85,0.18)'; e.currentTarget.style.borderColor = '#ff2d55'; }}
                                    onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,45,85,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,45,85,0.25)'; }}>
                                    SIGN OUT
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
