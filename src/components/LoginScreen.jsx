import { useState } from 'react';
import { Terminal, Lock, AlertTriangle, User } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signOut } from 'firebase/auth';

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

                <div className="mt-8 pt-6 border-t border-slate-800 text-center">
                    <button
                        type="button"
                        onClick={toggleMode}
                        className="text-[10px] tracking-widest text-slate-500 hover:text-doj-gold transition-colors uppercase"
                    >
                        {mode === 'signin' ? '> REQUEST ACCESS (NEW AGENT)' : '> ALREADY CLEARED (SIGN IN)'}
                    </button>
                </div>
            </div>
        </div>
    );
}
