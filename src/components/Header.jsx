import { ShieldAlert, Lock, Radio, LogOut } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

export default function Header() {
    const handleSignOut = () => {
        signOut(auth).catch(console.error);
    };

    return (
        <header className="relative border-b border-amber-900/30 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
            {/* Top gold accent line */}
            <div className="h-1 bg-gradient-to-r from-transparent via-doj-gold to-transparent" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    {/* Left: Seal + Title */}
                    <div className="flex items-center gap-4">
                        {/* Fake DOJ Seal */}
                        <div className="relative flex items-center justify-center w-16 h-16 rounded-full border-2 border-doj-gold/50 bg-slate-800/80 shadow-lg shadow-amber-900/20">
                            <ShieldAlert className="w-8 h-8 text-doj-gold" strokeWidth={1.5} />
                            <div className="absolute inset-0 rounded-full border border-doj-gold/20" />
                        </div>

                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg sm:text-xl font-bold tracking-widest text-doj-gold font-mono uppercase">
                                    Department of Lorenzo
                                </h1>
                            </div>
                            <p className="text-xs tracking-[0.3em] text-slate-400 font-mono uppercase mt-0.5">
                                Official Evidence Archive
                            </p>
                        </div>
                    </div>

                    {/* Right: Status indicators */}
                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex items-center gap-6">
                            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                                <Lock className="w-3.5 h-3.5" />
                                <span>ENCRYPTION: AES-256</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-mono">
                                <div className="w-2 h-2 rounded-full bg-green-500 pulse-dot" />
                                <span className="text-green-400">LIVE</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                                <Radio className="w-3.5 h-3.5" />
                                <span>SIGNAL: ACTIVE</span>
                            </div>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 px-3 py-1.5 border border-red-900/50 hover:bg-red-900/20 hover:border-red-500/50 rounded transition-colors duration-300 text-xs font-mono text-red-500/80 hover:text-red-400 uppercase tracking-widest"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Sign Out</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom border glow */}
            <div className="h-px bg-gradient-to-r from-transparent via-doj-gold/30 to-transparent" />
        </header>
    );
}
