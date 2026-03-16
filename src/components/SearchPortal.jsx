import { Search, ScanLine } from 'lucide-react';

export default function SearchPortal({ query, onQueryChange }) {
    return (
        <div className="relative max-w-2xl mx-auto">
            {/* Outer glow container */}
            <div className="relative group">
                {/* Background glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-doj-gold/20 via-amber-500/10 to-doj-gold/20 rounded-xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />

                <div className="relative flex items-center bg-slate-800/80 border border-slate-700/60 rounded-xl overflow-hidden backdrop-blur-sm">
                    {/* Icon */}
                    <div className="flex items-center justify-center w-12 h-12 text-slate-500">
                        <Search className="w-5 h-5" />
                    </div>

                    {/* Input */}
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                        placeholder="Search evidence files..."
                        className="search-glow flex-1 bg-transparent text-slate-200 text-sm font-mono placeholder:text-slate-600 py-3 pr-4 outline-none"
                    />

                    {/* Right side indicator */}
                    <div className="flex items-center gap-2 pr-4 text-xs font-mono text-slate-600">
                        <ScanLine className="w-4 h-4" />
                        <span className="hidden sm:inline">PORTAL v3.7</span>
                    </div>
                </div>
            </div>

            {/* Helper text */}
            <p className="text-center text-xs text-slate-600 font-mono mt-2 tracking-wider">
                AUTHORIZED PERSONNEL ONLY — ALL QUERIES ARE LOGGED
            </p>
        </div>
    );
}
