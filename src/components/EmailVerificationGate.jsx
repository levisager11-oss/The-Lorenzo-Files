import { useState } from 'react';
import { Mail, RefreshCw, LogOut, AlertTriangle } from 'lucide-react';
import { auth } from '../lib/firebase';
import { sendEmailVerification, signOut } from 'firebase/auth';

export default function EmailVerificationGate({ user, setUser }) {
    const [statusMsg, setStatusMsg] = useState('');
    const [statusType, setStatusType] = useState(''); // 'info' | 'error'

    const handleResendVerification = async () => {
        setStatusMsg('');
        try {
            await sendEmailVerification(auth.currentUser);
            setStatusType('info');
            setStatusMsg('VERIFICATION LINK RE-TRANSMITTED. CHECK YOUR EMAIL.');
        } catch (err) {
            setStatusType('error');
            if (err.code === 'auth/too-many-requests') {
                setStatusMsg('TOO MANY REQUESTS. TRY AGAIN LATER.');
            } else {
                setStatusMsg('UNABLE TO SEND VERIFICATION. TRY AGAIN LATER.');
            }
        }
    };

    const handleRefreshStatus = async () => {
        setStatusMsg('');
        try {
            // reload() updates the current user's profile data from the server
            // but does NOT trigger onAuthStateChanged, so we must manually update state
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

    const handleSignOut = () => {
        signOut(auth).catch(console.error);
    };

    return (
        <div className="relative min-h-screen bg-[#0a0e1a] flex items-center justify-center font-mono overflow-hidden">
            <div className="absolute inset-0 scanlines pointer-events-none opacity-20" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/50 via-[#0a0e1a] to-[#0a0e1a] pointer-events-none" />

            <div className="relative z-10 w-full max-w-md p-8 border-2 border-doj-gold/30 bg-[#0a0e1a]/80 backdrop-blur-md shadow-2xl shadow-doj-gold/10 rounded-lg text-center">
                <div className="flex flex-col items-center mb-6">
                    <div className="relative flex items-center justify-center w-20 h-20 rounded-full border-2 border-doj-gold bg-[#0a0e1a] shadow-[0_0_20px_rgba(245,158,11,0.2)] mb-4">
                        <Mail className="w-10 h-10 text-doj-gold" />
                        <div className="absolute inset-0 rounded-full border border-doj-gold/50 animate-ping opacity-20" />
                    </div>
                    <h1 className="text-xl font-bold tracking-widest text-doj-gold uppercase">
                        EMAIL VERIFICATION REQUIRED
                    </h1>
                    <p className="text-xs tracking-[0.2em] text-slate-500 mt-2 uppercase">
                        Department of Lorenzo
                    </p>
                </div>

                <div className="p-4 border border-doj-gold/30 bg-doj-gold/5 rounded mb-6">
                    <p className="text-sm text-slate-300 leading-relaxed">
                        A verification link has been sent to{' '}
                        <span className="text-doj-gold font-bold">{user.email}</span>.
                        <br />
                        Confirm your identity to gain access.
                    </p>
                </div>

                {statusMsg && (
                    <div className={`flex items-center gap-2 p-3 rounded mb-4 text-xs tracking-widest ${
                        statusType === 'error'
                            ? 'border border-red-500/50 bg-red-500/10 text-red-500'
                            : 'border border-doj-gold/50 bg-doj-gold/10 text-doj-gold'
                    }`}>
                        {statusType === 'error'
                            ? <AlertTriangle className="w-4 h-4 shrink-0" />
                            : <Mail className="w-4 h-4 shrink-0" />
                        }
                        <p>{statusMsg}</p>
                    </div>
                )}

                <div className="space-y-3">
                    <button
                        onClick={handleRefreshStatus}
                        className="w-full flex items-center justify-center gap-2 bg-doj-gold hover:bg-yellow-500 text-slate-950 font-bold py-3 rounded uppercase tracking-[0.2em] text-xs transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] active:scale-[0.98]"
                    >
                        <RefreshCw className="w-4 h-4" />
                        I&apos;VE VERIFIED — CHECK STATUS
                    </button>
                    <button
                        onClick={handleResendVerification}
                        className="w-full flex items-center justify-center gap-2 bg-transparent border border-doj-gold/50 text-doj-gold hover:bg-doj-gold/10 font-bold py-3 rounded uppercase tracking-[0.2em] text-xs transition-all active:scale-[0.98]"
                    >
                        <Mail className="w-4 h-4" />
                        RESEND VERIFICATION EMAIL
                    </button>
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center gap-2 bg-transparent border border-slate-700 text-slate-500 hover:text-red-400 hover:border-red-500/50 font-bold py-3 rounded uppercase tracking-[0.2em] text-xs transition-all active:scale-[0.98]"
                    >
                        <LogOut className="w-4 h-4" />
                        SIGN OUT
                    </button>
                </div>
            </div>
        </div>
    );
}
