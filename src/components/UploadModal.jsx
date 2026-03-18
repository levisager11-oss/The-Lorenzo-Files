import { X, FileText, AlertTriangle, Search, User, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { participantNames } from '../data/names';

export default function UploadModal({ file, onClose, onConfirm }) {
    const [context, setContext] = useState('');
    const [suspectNames, setSuspectNames] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showNameList, setShowNameList] = useState(false);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    // Auto-focus the input on mount
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowNameList(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (suspectNames.length === 0) return;
        onConfirm(context.trim() || 'No context provided.', suspectNames);
    };

    const toggleSuspect = (name) => {
        setSuspectNames(prev =>
            prev.includes(name)
                ? prev.filter(n => n !== name)
                : [...prev, name]
        );
    };

    const filteredNames = participantNames.filter(name =>
        name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!file) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md px-4">
            <div
                className="bg-slate-900 border-2 border-slate-700/50 rounded-xl shadow-2xl shadow-black max-w-lg w-full overflow-hidden animate-in fade-in scale-in-95 duration-300"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-doj-gold animate-pulse" />
                        <h3 className="font-mono text-doj-gold text-sm tracking-widest font-semibold uppercase">
                            Evidence Acquisition Protocol
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors p-1"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="bg-slate-950/50 rounded-lg p-4 flex items-start gap-4 border border-slate-800/50">
                        <FileText className="w-8 h-8 text-doj-gold shrink-0 mt-1 opacity-80" />
                        <div className="min-w-0">
                            <p className="font-mono text-[10px] text-slate-500 mb-1 uppercase tracking-tighter">TARGET FILE SOURCE</p>
                            <p className="font-mono text-sm text-slate-200 truncate font-medium" title={file.name}>
                                {file.name}
                            </p>
                            <p className="font-mono text-[10px] text-slate-400 mt-1">
                                BYTES: {file.size.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Suspect Name Selection */}
                    <div className="space-y-2 relative" ref={dropdownRef}>
                        <label className="block font-mono text-xs text-slate-400 tracking-wider uppercase">
                            Target Suspect(s):
                        </label>
                        <div className="relative">
                            <div
                                onClick={() => setShowNameList(!showNameList)}
                                className={`w-full bg-slate-800/50 border ${suspectNames.length > 0 ? 'border-doj-gold/40' : 'border-slate-700'} rounded-lg p-3 font-mono text-sm cursor-pointer flex items-center justify-between transition-all hover:bg-slate-800/80`}
                            >
                                <div className="flex items-center gap-3">
                                    <User className={`w-4 h-4 ${suspectNames.length > 0 ? 'text-doj-gold' : 'text-slate-500'}`} />
                                    <span className={suspectNames.length > 0 ? 'text-slate-100 truncate pr-4' : 'text-slate-500'} style={{maxWidth: '300px'}}>
                                        {suspectNames.length > 0 ? suspectNames.join(', ') : 'SELECT SUSPECTS...'}
                                    </span>
                                </div>
                                {suspectNames.length > 0 && <span className="text-doj-gold text-xs font-bold bg-doj-gold/20 px-2 py-0.5 rounded">{suspectNames.length}</span>}
                            </div>

                            {showNameList && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border-2 border-slate-700 rounded-lg shadow-2xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="p-2 border-b border-slate-700 bg-slate-900/50 flex items-center gap-2">
                                        <Search className="w-4 h-4 text-slate-500" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="SEARCH SUSPECTS..."
                                            className="bg-transparent border-none focus:ring-0 text-xs font-mono text-slate-200 w-full placeholder:text-slate-600"
                                            autoFocus
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                    <div className="max-h-48 overflow-y-auto custom-scrollbar">
                                        {filteredNames.length > 0 ? (
                                            filteredNames.map(name => {
                                                const isSelected = suspectNames.includes(name);
                                                return (
                                                    <div
                                                        key={name}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleSuspect(name);
                                                        }}
                                                        className={`px-4 py-2.5 font-mono text-xs cursor-pointer hover:bg-slate-700/50 transition-colors flex items-center justify-between ${isSelected ? 'bg-doj-gold/10 text-doj-gold' : 'text-slate-300 hover:text-white'}`}
                                                    >
                                                        {name}
                                                        {isSelected && <Check className="w-3 h-3" />}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="px-4 py-4 font-mono text-[10px] text-red-500/70 text-center uppercase tracking-widest">
                                                NO CLEARANCE FOUND
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center mb-1">
                            <label htmlFor="context-input" className="block font-mono text-xs text-slate-400 tracking-wider uppercase">
                                Classified intel context:
                            </label>
                            <span className={`font-mono text-[10px] tabular-nums ${context.length >= 35 ? 'text-red-500' : 'text-slate-500'}`}>
                                [{context.length.toString().padStart(2, '0')} / 35]
                            </span>
                        </div>
                        <textarea
                            id="context-input"
                            ref={inputRef}
                            value={context}
                            onChange={(e) => setContext(e.target.value)}
                            maxLength={35}
                            placeholder="REDACTED DETAILS..."
                            className="w-full h-24 bg-slate-800/50 border border-slate-700 rounded-lg p-3 font-mono text-sm text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-doj-gold focus:ring-1 focus:ring-doj-gold transition-colors resize-none"
                            required
                        />
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 font-mono text-xs text-slate-500 hover:text-slate-300 transition-colors uppercase"
                        >
                            Abort
                        </button>
                        <button
                            type="submit"
                            disabled={suspectNames.length === 0 || !context.trim()}
                            className={`font-mono text-xs font-bold px-6 py-2.5 rounded border transition-all tracking-widest uppercase shadow-lg select-none ${
                                suspectNames.length === 0 || !context.trim()
                                    ? 'bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed'
                                    : 'bg-doj-gold text-slate-950 border-doj-gold hover:bg-yellow-500 hover:border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)] active:scale-95'
                            }`}
                        >
                            Authorize
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

