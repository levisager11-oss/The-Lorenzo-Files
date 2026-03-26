import { useEffect, useRef, useState, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ArrowDown, Trash2, Loader2, X } from 'lucide-react';
import VoteButtons from './VoteButtons';
import RedactedBox from './RedactedBox';

function FeedSlide({ file, user, onDelete, isDeleting, onRedactedClick, scrollRoot }) {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const isOwner = file.uploadedById === user?.uid;

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setIsVisible(true);
            },
            { root: scrollRoot, threshold: 0.3 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [scrollRoot]);

    const suspects = file.suspectNames || (file.suspectName ? [file.suspectName] : ['Lorenzo']);

    const formatDate = (dateStr) => {
        if (!dateStr) return 'UNKNOWN';
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return `LOGGED: ${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
    };

    const handleDownload = async (e) => {
        e.stopPropagation();
        if (!file.downloadURL) return;
        try {
            const response = await fetch(file.downloadURL);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    return (
        <div
            ref={ref}
            className="feed-slide h-screen w-full flex-shrink-0 relative flex flex-col justify-between p-6 sm:p-10 lg:p-16"
            style={{ scrollSnapAlign: 'start' }}
        >
            {/* Scanlines + grain per slide */}
            <div className="absolute inset-0 pointer-events-none scanlines" style={{ zIndex: 1 }} />
            <div className="absolute inset-0 pointer-events-none grain-overlay" style={{ zIndex: 1 }} />

            <motion.div
                className="relative z-10 flex flex-col justify-between h-full"
                initial={{ opacity: 0, y: 40 }}
                animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                {/* TOP: File name as TOP SECRET stamp */}
                <div className="mb-4">
                    <div className="inline-block border-2 border-doj-gold/60 px-4 py-2 sm:px-6 sm:py-3 rotate-[-1deg]">
                        <h2 className="text-xl sm:text-3xl lg:text-4xl font-mono font-bold text-doj-gold tracking-wider uppercase break-all">
                            {file.name}
                        </h2>
                    </div>
                    <div className="mt-2 text-[10px] sm:text-xs font-mono text-red-500/80 tracking-[0.3em] uppercase">
                        ◈ TOP SECRET — DO NOT DISTRIBUTE
                    </div>
                </div>

                {/* MIDDLE section */}
                <div className="flex-1 flex flex-col sm:flex-row gap-6 sm:gap-8 items-start justify-center">
                    {/* MIDDLE-LEFT: Metadata */}
                    <div className="flex flex-col gap-3 text-xs sm:text-sm font-mono">
                        <div className="text-slate-400">
                            <span className="text-slate-600 text-[10px] uppercase tracking-widest">Date</span>
                            <div className="text-slate-300">{formatDate(file.date)}</div>
                        </div>
                        <div className="text-slate-400">
                            <span className="text-slate-600 text-[10px] uppercase tracking-widest">File Size</span>
                            <div className="text-slate-300">{file.size || 'UNKNOWN'}</div>
                        </div>
                        <div className="text-slate-400">
                            <span className="text-slate-600 text-[10px] uppercase tracking-widest">Agent</span>
                            <div className="text-slate-300">
                                AGENT:{(file.uploadedById || 'UNKNOWN').substring(0, 8)}
                            </div>
                        </div>
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-mono tracking-wider badge-classified">
                                ◈ CLASSIFIED
                            </span>
                        </div>
                    </div>

                    {/* MIDDLE-RIGHT: Suspect tags */}
                    <div className="flex flex-wrap gap-2 items-start">
                        {suspects.map((name) => (
                            <span
                                key={name}
                                className="inline-flex items-center px-3 py-1 rounded-full text-[10px] sm:text-xs font-mono text-doj-gold border border-doj-gold/40 bg-doj-gold/5 tracking-wider uppercase"
                            >
                                {name}
                            </span>
                        ))}
                    </div>
                </div>

                {/* BOTTOM section */}
                <div className="flex items-end justify-between gap-4 mt-4">
                    {/* BOTTOM-LEFT: Classified intel (RedactedBox) */}
                    <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-1">
                            Classified Intel
                        </div>
                        <div onClick={(e) => e.stopPropagation()}>
                            <RedactedBox text={file.redactedText} onRedactedClick={onRedactedClick} />
                        </div>
                    </div>

                    {/* BOTTOM-RIGHT: Vertical action column */}
                    <div className="flex flex-col items-center gap-4">
                        {/* Vote Buttons */}
                        <VoteButtons file={file} user={user} />

                        {/* Download button */}
                        {file.downloadURL && (
                            <motion.button
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleDownload}
                                className="p-2 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-400 hover:text-doj-gold hover:border-doj-gold/40 transition-colors"
                                title="Download file"
                            >
                                <ArrowDown className="w-5 h-5" />
                            </motion.button>
                        )}

                        {/* Purge button — only for owner */}
                        {isOwner && (
                            <motion.button
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isDeleting) onDelete(file);
                                }}
                                disabled={isDeleting}
                                className="p-2 rounded-full bg-red-950/40 border border-red-900/40 text-red-500 hover:bg-red-900/40 hover:text-red-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                title="Purge from Archive"
                            >
                                {isDeleting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Trash2 className="w-5 h-5" />
                                )}
                            </motion.button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default function FeedView({ files, user, onClose, onDelete, deletingId, onRedactedClick }) {
    const containerRef = useRef(null);
    const [containerEl, setContainerEl] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Callback ref to capture the container DOM element for IntersectionObserver
    const setContainerRef = useCallback((node) => {
        containerRef.current = node;
        setContainerEl(node);
    }, []);

    // Track current slide via scroll position
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const handleScroll = () => {
            const scrollTop = container.scrollTop;
            const slideHeight = container.clientHeight;
            if (slideHeight > 0) {
                setCurrentIndex(Math.round(scrollTop / slideHeight));
            }
        };
        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    // Keyboard navigation + Escape to close
    const scrollToSlide = useCallback((index) => {
        const container = containerRef.current;
        if (!container) return;
        const clamped = Math.max(0, Math.min(index, files.length - 1));
        const slides = container.querySelectorAll('.feed-slide');
        if (slides[clamped]) {
            slides[clamped].scrollIntoView({ behavior: 'smooth' });
        }
    }, [files.length]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
                return;
            }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                scrollToSlide(currentIndex + 1);
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                scrollToSlide(currentIndex - 1);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, onClose, scrollToSlide]);

    // Lock body scroll when feed is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    return (
        <div
            ref={setContainerRef}
            className="feed-container fixed inset-0 z-50 overflow-y-scroll bg-[#0a0e1a]"
            style={{
                scrollSnapType: 'y mandatory',
                scrollbarWidth: 'none',
            }}
        >
            {files.map((file) => (
                <FeedSlide
                    key={file.id}
                    file={file}
                    user={user}
                    onDelete={onDelete}
                    isDeleting={deletingId === (file.docId || file.id.toString())}
                    onRedactedClick={onRedactedClick}
                    scrollRoot={containerEl}
                />
            ))}

            {/* Empty state */}
            {files.length === 0 && (
                <div className="h-screen flex items-center justify-center">
                    <p className="text-sm font-mono text-slate-600 tracking-widest">NO FILES IN FEED</p>
                </div>
            )}

            {/* Close button */}
            <button
                onClick={onClose}
                aria-label="Close feed"
                className="fixed top-4 right-4 z-[60] p-2 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                title="Close feed (Esc)"
            >
                <X className="w-5 h-5" />
            </button>

            {/* Vertical progress indicator */}
            {files.length > 1 && (
                <div className="fixed right-2 top-1/2 -translate-y-1/2 z-[60] flex flex-col items-center gap-0.5">
                    {/* Track */}
                    <div className="relative w-0.5 bg-slate-800 rounded-full" style={{ height: `${Math.min(files.length * 16, 200)}px` }}>
                        {/* Active indicator */}
                        <div
                            className="absolute left-0 w-full bg-doj-gold rounded-full transition-all duration-300"
                            style={{
                                height: `${100 / files.length}%`,
                                top: `${(currentIndex / files.length) * 100}%`,
                            }}
                        />
                    </div>
                    <span className="text-[9px] font-mono text-slate-600 mt-1">
                        {currentIndex + 1}/{files.length}
                    </span>
                </div>
            )}
        </div>
    );
}
