import { useState, useRef, useEffect } from 'react';
import { ShieldAlert, Terminal, Lock, KeyRound } from 'lucide-react';

export default function LoginScreen({ onLoginSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);

  // Auto-focus the input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const correctPassword = import.meta.env.VITE_SITE_PASSWORD;
    
    if (password === correctPassword) {
      setError(false);
      onLoginSuccess();
    } else {
      setError(true);
      setAttempts(prev => prev + 1);
      setShake(true);
      setPassword('');
      
      // Remove shake class after animation completes
      setTimeout(() => setShake(false), 500);
      
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 font-sans flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Grain overlay */}
      <div className="grain-overlay pointer-events-none absolute inset-0 z-0 opacity-40 mix-blend-overlay" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")'}} />
      {/* Scanlines */}
      <div className="scanlines pointer-events-none absolute inset-0 z-0 opacity-10" style={{background: 'linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.4) 51%)', backgroundSize: '100% 4px'}} />
      
      <div className={`relative z-10 max-w-md w-full space-y-8 p-8 sm:p-10 bg-slate-900/80 border-2 rounded-xl backdrop-blur-md shadow-2xl transition-all duration-300 ${error ? 'border-red-900/70 shadow-red-900/20' : 'border-slate-800 shadow-black'}`}>
        
        {/* DOJ Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-slate-950 border-2 border-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner relative overflow-hidden">
            <div className="absolute inset-0 bg-doj-gold/5 animate-pulse"></div>
            {error ? (
              <ShieldAlert className={`h-10 w-10 text-red-500`} />
            ) : (
              <Lock className="h-10 w-10 text-doj-gold opacity-90" />
            )}
          </div>
          
          <h2 className="mt-2 text-2xl font-mono font-bold text-white tracking-widest uppercase">
            RESTRICTED ARCHIVE
          </h2>
          <p className="mt-3 text-xs font-mono text-slate-400 tracking-wider">
            DEPARTMENT OF LORENZO // EVIDENCE MANAGEMENT SYSTEM
          </p>
          <div className="mt-6 flex justify-center">
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-doj-gold/40 to-transparent"></div>
          </div>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          
          <div className={`rounded-lg bg-slate-950/50 p-6 border ${error ? 'border-red-900/50' : 'border-slate-800'} ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
            
            <div className="flex items-center gap-3 mb-6">
              <Terminal className="w-5 h-5 text-slate-500" />
              <h3 className="text-sm font-mono text-slate-300 uppercase tracking-widest">
                Authentication Required
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="clearance-code" className="sr-only">
                  Clearance Code
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className={`h-4 w-4 ${error ? 'text-red-500/70' : 'text-slate-500 group-focus-within:text-doj-gold/70'} transition-colors`} />
                  </div>
                  <input
                    id="clearance-code"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    ref={inputRef}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(false);
                    }}
                    className={`block w-full pl-10 pr-3 py-3 border font-mono text-sm tracking-widest rounded bg-slate-900/80 placeholder-slate-600 focus:outline-none focus:ring-1 focus:border-transparent transition-colors
                      ${error 
                        ? 'border-red-900/50 text-red-100 focus:ring-red-500/50' 
                        : 'border-slate-700 text-slate-200 focus:ring-doj-gold/50'
                      }`}
                    placeholder="ENTER CLEARANCE CODE"
                  />
                </div>
              </div>
              
              <div className="h-6 flex items-center justify-center">
                {error ? (
                  <p className="text-xs font-mono text-red-500 tracking-widest animate-pulse uppercase">
                    Access Denied. Violation logged.
                  </p>
                ) : (
                  <p className="text-[10px] font-mono text-slate-500 tracking-widest uppercase opacity-70">
                    {attempts > 0 ? `${attempts} FAILED ATTEMPTS LOGGED` : 'AWAITING INPUT...'}
                  </p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                className={`group relative w-full flex justify-center py-3 px-4 border text-sm font-mono font-bold rounded tracking-widest uppercase transition-all
                  ${error 
                    ? 'border-red-900/50 bg-red-950/20 text-red-500 hover:bg-red-900/40' 
                    : 'border-doj-gold/50 bg-doj-gold/10 text-doj-gold hover:bg-doj-gold hover:text-slate-950 hover:shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                  }`}
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <Lock className={`h-4 w-4 ${error ? 'text-red-500/50' : 'text-doj-gold/50 group-hover:text-slate-950/50'} transition-colors`} aria-hidden="true" />
                </span>
                VERIFY CLEARANCE
              </button>
            </div>
          </div>
        </form>
        
        {/* Footer info */}
        <div className="mt-6 text-center">
          <p className="text-[9px] font-mono text-slate-600 tracking-widest">
            ATTEMPTS ARE MONITORED. UNAUTHORIZED ACCESS PROHIBITED.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}
