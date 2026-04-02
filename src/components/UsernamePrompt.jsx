import { useState } from 'react';
import { Loader2, UserPlus } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function UsernamePrompt({ user, onComplete }) {
    const [username, setUsername] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = username.trim();
        if (!trimmed) {
            setError("Username cannot be empty.");
            return;
        }
        if (trimmed.length < 3 || trimmed.length > 20) {
            setError("Username must be between 3 and 20 characters.");
            return;
        }
        // Basic alphanumeric validation with hyphens/underscores
        if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
            setError("Only letters, numbers, hyphens, and underscores are allowed.");
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            await setDoc(doc(db, "users", user.uid), {
                username: trimmed,
                createdAt: Date.now(),
                email: user.email
            });
            if (onComplete) {
                onComplete({ username: trimmed });
            }
        } catch (err) {
            console.error("Error setting username:", err);
            setError("Failed to register identity. Please try again.");
            setSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-[#0a0e1a] font-sans flex items-center justify-center px-4">
            <div className="grain-overlay" />
            <div className="scanlines" />

            <div className="relative z-10 max-w-sm w-full">
                <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-6 sm:p-8 backdrop-blur-sm shadow-2xl shadow-black/50">
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-12 h-12 rounded-full border border-doj-gold/50 flex items-center justify-center bg-doj-gold/10 mb-4 shadow-[0_0_15px_rgba(201,168,76,0.2)]">
                            <UserPlus className="w-6 h-6 text-doj-gold" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-mono font-bold text-doj-gold tracking-widest uppercase text-center">
                            INITIALIZE AGENT PROFILE
                        </h2>
                        <p className="text-[10px] font-mono text-slate-500 mt-2 tracking-widest text-center">
                            DEPARTMENT OF LORENZO
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="username" className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                                CALLSIGN / USERNAME
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="bg-slate-800/50 border border-slate-700 rounded px-3 py-2 text-sm font-mono text-slate-200 focus:outline-none focus:border-doj-gold/50 focus:bg-slate-800 transition-colors"
                                placeholder="e.g. SHADOW-ACTUAL"
                                disabled={submitting}
                                autoFocus
                            />
                        </div>

                        {error && (
                            <div className="text-xs font-mono text-red-400 bg-red-950/30 border border-red-900/50 rounded p-2 text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting || !username.trim()}
                            className="w-full mt-2 bg-doj-gold/10 hover:bg-doj-gold/20 text-doj-gold border border-doj-gold/50 rounded py-2 text-xs font-mono font-bold tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            {submitting ? 'INITIALIZING...' : 'CONFIRM IDENTITY'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
