import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ShieldAlert, Skull, X } from 'lucide-react';

export default function SecurityBreach({ onDismiss }) {
    const [countdown, setCountdown] = useState(10);
    const [terminalLines, setTerminalLines] = useState([]);

    const hackerLines = useMemo(() => [
        '> INTRUSION DETECTED ON PORT 443...',
        '> TRACING NETWORK ORIGIN...',
        '> FIREWALL BREACH: SECTOR 7-G',
        '> DUMPING CLASSIFIED LORENZO FILES...',
        '> WARNING: LORENZO IS AWARE',
        '> DEPLOYING COUNTERMEASURES...',
        '> ENCRYPTING ALL PIZZA RECORDS...',
        '> ACTIVATING RUBBER DUCK PROTOCOL...',
        '> SHREDDING KARAOKE EVIDENCE...',
        '> SYSTEM LOCKDOWN IN PROGRESS...',
    ], []);

    // Countdown timer
    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    // Terminal text feed
    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            if (i < hackerLines.length) {
                setTerminalLines((prev) => [...prev, hackerLines[i]]);
                i++;
            } else {
                clearInterval(interval);
            }
        }, 800);
        return () => clearInterval(interval);
    }, [hackerLines]);

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center breach-flash"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                {/* Dark overlay behind content */}
                <div className="absolute inset-0 bg-black/40" />

                {/* Content */}
                <motion.div
                    className="relative z-10 max-w-xl w-full mx-4"
                    initial={{ scale: 0.8, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                >
                    {/* Warning Header */}
                    <div className="flex flex-col items-center mb-6">
                        <motion.div
                            animate={{ rotate: [0, -10, 10, -10, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                        >
                            <ShieldAlert className="w-20 h-20 text-white drop-shadow-lg" />
                        </motion.div>
                        <h1 className="text-4xl sm:text-5xl font-black text-white mt-4 tracking-wider text-center font-mono">
                            ⚠ SECURITY BREACH
                        </h1>
                        <p className="text-red-200 text-sm font-mono mt-2 tracking-widest">
                            UNAUTHORIZED ACCESS DETECTED
                        </p>
                    </div>

                    {/* Terminal Box */}
                    <div className="bg-black/80 border border-red-500/50 rounded-lg p-4 mb-6 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-red-900/50">
                            <Skull className="w-4 h-4 text-red-400" />
                            <span className="text-xs font-mono text-red-400">SYSTEM TERMINAL — BREACH LOG</span>
                        </div>
                        <div className="space-y-1 h-48 overflow-y-auto font-mono text-xs">
                            {terminalLines.map((line, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-green-400"
                                >
                                    {line}
                                </motion.div>
                            ))}
                            <span className="text-green-400 cursor-blink">█</span>
                        </div>
                    </div>

                    {/* Countdown */}
                    <div className="text-center mb-6">
                        <p className="text-xs font-mono text-red-200 tracking-widest mb-2">
                            SYSTEM LOCKDOWN IN
                        </p>
                        <motion.div
                            className="text-7xl font-black text-white font-mono tabular-nums"
                            key={countdown}
                            initial={{ scale: 1.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', damping: 15 }}
                        >
                            {countdown}
                        </motion.div>
                    </div>

                    {/* Dismiss Button */}
                    <div className="flex justify-center">
                        <button
                            onClick={onDismiss}
                            className="flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-white text-sm font-mono tracking-wider transition-all cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                            OVERRIDE LOCKDOWN
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
