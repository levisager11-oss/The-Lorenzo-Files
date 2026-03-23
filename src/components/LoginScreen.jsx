import { useState } from 'react';
import { Terminal, Lock, AlertTriangle, User } from 'lucide-react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signOut, signInWithPopup, getAdditionalUserInfo } from 'firebase/auth';

export default function LoginScreen() {
    const [mode, setMode] = useState('signin'); // 'signin' | 'register'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [codename, setCodename] = useState('');
    const [sitePassword, setSitePassword] = useState('');
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [loading, setLoading] = useState(false);
    const [googlePendingStep, setGooglePendingStep] = useState(false);
    const [googleSitePassword, setGoogleSitePassword] = useState('');

    const handleGoogleSignIn = async () => {
        setError('');
        setInfo('');
        setLoading(true);

        try {
            const result = await signInWithPopup(auth, googleProvider);
            const additionalInfo = getAdditionalUserInfo(result);
            if (additionalInfo?.isNewUser) {
                await signOut(auth);
                setGooglePendingStep(true);
            }
        } catch (err) {
            let errorMsg = "AUTHENTICATION FAILURE";
            if (err.code === 'auth/popup-closed-by-user') errorMsg = "AUTHORIZATION ABORTED";
            else if (err.code === 'auth/popup-blocked') errorMsg = "POPUP BLOCKED BY BROWSER";
            else if (err.code === 'auth/account-exists-with-different-credential') errorMsg = "ACCOUNT EXISTS WITH DIFFERENT CREDENTIALS";
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleGooglePasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (googleSitePassword !== import.meta.env.VITE_SITE_PASSWORD) {
            setError('INVALID UNIVERSAL PASSWORD');
            return;
        }
        setLoading(true);
        try {
            await signInWithPopup(auth, googleProvider);
            setGooglePendingStep(false);
            setGoogleSitePassword('');
        } catch (err) {
            let errorMsg = "AUTHENTICATION FAILURE";
            if (err.code === 'auth/popup-closed-by-user') errorMsg = "AUTHORIZATION ABORTED";
            else if (err.code === 'auth/popup-blocked') errorMsg = "POPUP BLOCKED BY BROWSER";
            else if (err.code === 'auth/account-exists-with-different-credential') errorMsg = "ACCOUNT EXISTS WITH DIFFERENT CREDENTIALS";
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setInfo('');
        setLoading(true);

        try {
            if (mode === 'register') {
                if (sitePassword !== import.meta.env.VITE_SITE_PASSWORD) {
                    throw new Error('invalid-site-password');
                }
                if (password !== confirmPassword) {
                    throw new Error('passwords-mismatch');
                }
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: codename });
                await sendEmailVerification(userCredential.user);
                await signOut(auth);
                setInfo('VERIFICATION LINK TRANSMITTED. CHECK YOUR EMAIL TO CONFIRM YOUR IDENTITY BEFORE SIGNING IN.');
                setLoading(false);
                return;
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            let errorMsg = "AUTHENTICATION FAILURE";
            if (err.message === 'passwords-mismatch') errorMsg = "PASSWORDS DO NOT MATCH";
            else if (err.message === 'invalid-site-password') errorMsg = "INVALID UNIVERSAL PASSWORD";
            else if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') errorMsg = "AGENT NOT FOUND OR INVALID CREDENTIALS";
            else if (err.code === 'auth/wrong-password') errorMsg = "INVALID CREDENTIALS";
            else if (err.code === 'auth/too-many-requests') errorMsg = "ACCESS TEMPORARILY SUSPENDED";
            else if (err.code === 'auth/email-already-in-use') errorMsg = "AGENT IDENTITY ALREADY REGISTERED";
            else if (err.code === 'auth/weak-password') errorMsg = "INSUFFICIENT ENCRYPTION (WEAK PASSWORD)";
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setMode(mode === 'signin' ? 'register' : 'signin');
        setError('');
        setInfo('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setCodename('');
        setSitePassword('');
    };

    return (
        <div className="relative min-h-screen bg-[#0a0e1a] flex items-center justify-center font-mono overflow-hidden">
            {/* Tactical background elements */}
            <div className="absolute inset-0 scanlines pointer-events-none opacity-20" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/50 via-[#0a0e1a] to-[#0a0e1a] pointer-events-none" />

            <div className="relative z-10 w-full max-w-md p-8 border-2 border-doj-gold/30 bg-[#0a0e1a]/80 backdrop-blur-md shadow-2xl shadow-doj-gold/10 rounded-lg">
                <div className="flex flex-col items-center mb-8">
                    <div className="relative flex items-center justify-center w-20 h-20 rounded-full border-2 border-doj-gold bg-[#0a0e1a] shadow-[0_0_20px_rgba(245,158,11,0.2)] mb-4">
                        <Lock className="w-10 h-10 text-doj-gold" />
                        <div className="absolute inset-0 rounded-full border border-doj-gold/50 animate-ping opacity-20" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-widest text-doj-gold uppercase flex items-center gap-2">
                        <Terminal className="w-6 h-6" />
                        CLEARANCE REQUIRED
                        <span className="w-3 h-6 bg-doj-gold animate-pulse inline-block ml-1" />
                    </h1>
                    <p className="text-xs tracking-[0.3em] text-slate-500 mt-2 uppercase">
                        Department of Lorenzo
                    </p>
                </div>

                {googlePendingStep ? (
                    <form onSubmit={handleGooglePasswordSubmit} className="space-y-6">
                        <div className="flex items-center gap-2 p-3 border border-doj-gold/50 bg-doj-gold/10 text-doj-gold text-xs tracking-widest rounded">
                            <Terminal className="w-4 h-4 shrink-0" />
                            <p>GOOGLE IDENTITY VERIFIED. ENTER UNIVERSAL PASSWORD TO COMPLETE AUTHORIZATION.</p>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 border border-red-500/50 bg-red-500/10 text-red-500 text-xs tracking-widest rounded">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-[10px] tracking-widest text-slate-500 uppercase mb-1">
                                Universal Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="password"
                                    value={googleSitePassword}
                                    onChange={(e) => setGoogleSitePassword(e.target.value)}
                                    className="w-full bg-black/50 border border-slate-700 text-[#86efac] pl-10 pr-4 py-3 rounded text-sm tracking-widest focus:outline-none focus:border-doj-gold focus:ring-1 focus:ring-doj-gold transition-colors placeholder:text-slate-700"
                                    placeholder="••••••••"
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-doj-gold hover:bg-yellow-500 text-slate-950 font-bold py-3 rounded uppercase tracking-[0.2em] text-xs transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] active:scale-[0.98] ${loading ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {loading ? 'AUTHENTICATING...' : 'COMPLETE AUTHORIZATION'}
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => { setGooglePendingStep(false); setGoogleSitePassword(''); setError(''); setInfo(''); }}
                                className="text-[10px] tracking-widest text-slate-500 hover:text-doj-gold transition-colors uppercase"
                            >
                                &gt; CANCEL
                            </button>
                        </div>
                    </form>
                ) : (
                <>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="flex items-center gap-2 p-3 border border-red-500/50 bg-red-500/10 text-red-500 text-xs tracking-widest rounded">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {info && (
                        <div className="flex items-center gap-2 p-3 border border-doj-gold/50 bg-doj-gold/10 text-doj-gold text-xs tracking-widest rounded">
                            <Terminal className="w-4 h-4 shrink-0" />
                            <p>{info}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        {mode === 'register' && (
                            <div>
                                <label className="block text-[10px] tracking-widest text-slate-500 uppercase mb-1">
                                    Agent Codename
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="text"
                                        value={codename}
                                        onChange={(e) => setCodename(e.target.value)}
                                        className="w-full bg-black/50 border border-slate-700 text-[#86efac] pl-10 pr-4 py-3 rounded text-sm focus:outline-none focus:border-doj-gold focus:ring-1 focus:ring-doj-gold transition-colors placeholder:text-slate-700"
                                        placeholder="CODENAME..."
                                        required
                                    />
                                </div>
                            </div>
                        )}
                        <div>
                            <label className="block text-[10px] tracking-widest text-slate-500 uppercase mb-1">
                                Authorized Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/50 border border-slate-700 text-[#86efac] px-4 py-3 rounded text-sm focus:outline-none focus:border-doj-gold focus:ring-1 focus:ring-doj-gold transition-colors placeholder:text-slate-700"
                                placeholder="IDENTIFIER..."
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] tracking-widest text-slate-500 uppercase mb-1">
                                Passcode
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/50 border border-slate-700 text-[#86efac] px-4 py-3 rounded text-sm tracking-widest focus:outline-none focus:border-doj-gold focus:ring-1 focus:ring-doj-gold transition-colors placeholder:text-slate-700"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        {mode === 'register' && (
                            <>
                                <div>
                                    <label className="block text-[10px] tracking-widest text-slate-500 uppercase mb-1">
                                        Confirm Passcode
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-black/50 border border-slate-700 text-[#86efac] px-4 py-3 rounded text-sm tracking-widest focus:outline-none focus:border-doj-gold focus:ring-1 focus:ring-doj-gold transition-colors placeholder:text-slate-700"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] tracking-widest text-slate-500 uppercase mb-1">
                                        Universal Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="password"
                                            value={sitePassword}
                                            onChange={(e) => setSitePassword(e.target.value)}
                                            className="w-full bg-black/50 border border-slate-700 text-[#86efac] pl-10 pr-4 py-3 rounded text-sm tracking-widest focus:outline-none focus:border-doj-gold focus:ring-1 focus:ring-doj-gold transition-colors placeholder:text-slate-700"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-doj-gold hover:bg-yellow-500 text-slate-950 font-bold py-3 rounded uppercase tracking-[0.2em] text-xs transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] active:scale-[0.98] ${loading ? 'opacity-70 cursor-wait' : ''}`}
                    >
                        {loading ? 'AUTHENTICATING...' : (mode === 'signin' ? 'AUTHORIZE ACCESS' : 'REQUEST CLEARANCE')}
                    </button>
                </form>

                {mode === 'signin' && (
                    <div className="mt-4">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-700"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[#0a0e1a] px-2 text-slate-500 tracking-widest">or</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className={`mt-4 w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded uppercase tracking-[0.2em] text-xs transition-all border border-slate-700 active:scale-[0.98] flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            AUTHORIZE WITH GOOGLE
                        </button>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-slate-800 text-center">
                    <button
                        type="button"
                        onClick={toggleMode}
                        className="text-[10px] tracking-widest text-slate-500 hover:text-doj-gold transition-colors uppercase"
                    >
                        {mode === 'signin' ? '> REQUEST ACCESS (NEW AGENT)' : '> ALREADY CLEARED (SIGN IN)'}
                    </button>
                </div>
                </>
                )}
            </div>
        </div>
    );
}
