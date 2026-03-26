import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Trash2, Loader2, ShieldAlert } from 'lucide-react';
import RedactedBox from './RedactedBox';
import VoteButtons from './VoteButtons';

export default function FeedView({ files, user, onDelete, deletingId, onRedactedClick }) {
    const containerRef = useRef(null);

    // Keydown for keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!containerRef.current) return;
            const container = containerRef.current;
            const children = Array.from(container.children);

            // Find currently visible child
            const scrollTop = container.scrollTop;
            const childHeight = container.clientHeight;
            const currentIndex = Math.round(scrollTop / childHeight);

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (currentIndex < children.length - 1) {
                    children[currentIndex + 1].scrollIntoView({ behavior: 'smooth' });
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (currentIndex > 0) {
                    children[currentIndex - 1].scrollIntoView({ behavior: 'smooth' });
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [files]);

    if (!files || files.length === 0) {
        return (
            <div className="fixed inset-0 top-[73px] sm:top-[85px] z-40 bg-slate-900/95 backdrop-blur flex items-center justify-center">
                <div className="text-center">
                    <p className="text-sm font-mono text-slate-600">NO MATCHING FILES FOUND</p>
                    <p className="text-xs font-mono text-slate-700 mt-1">Try adjusting your search query</p>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 top-[73px] sm:top-[85px] z-40 overflow-y-scroll snap-y snap-mandatory scrollbar-none bg-slate-900"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
            {files.map((file, index) => (
                <FeedSlide
                    key={file.id}
                    file={file}
                    index={index}
                    totalFiles={files.length}
                    user={user}
                    onDelete={onDelete}
                    isDeleting={deletingId === (file.docId || file.id.toString())}
                    onRedactedClick={onRedactedClick}
                />
            ))}
        </div>
    );
}

function FeedSlide({ file, index, totalFiles, user, onDelete, isDeleting, onRedactedClick }) {
    const slideRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const isOwner = file.uploadedById === user?.uid;

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                } else {
                    setIsVisible(false);
                }
            },
            { threshold: 0.5 }
        );

        if (slideRef.current) {
            observer.observe(slideRef.current);
        }

        return () => {
            if (slideRef.current) observer.unobserve(slideRef.current);
        };
    }, []);

    const handleDownload = async () => {
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
            console.error("Error downloading file:", error);
            alert("Failed to download the file.");
        }
    };

    const displayId = file.uploadedById ? file.uploadedById.slice(0, 8) : 'UNKNOWN';

    return (
        <div
            ref={slideRef}
            className="w-full h-[100vh] snap-start relative flex flex-col justify-center items-center px-4 sm:px-12 py-20 overflow-hidden"
        >
            {/* Background effects */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="scanlines opacity-20"></div>
                <div className="bg-[url('/noise.png')] opacity-[0.03] absolute inset-0 mix-blend-overlay"></div>
            </div>

            <motion.div
                className="relative z-10 w-full max-w-4xl h-full flex flex-col justify-between"
                initial={{ opacity: 0, y: 40 }}
                animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                {/* TOP: File name */}
                <div className="w-full text-center mt-8">
                    <h2 className="text-3xl sm:text-5xl font-mono font-bold text-doj-gold tracking-widest uppercase border-4 border-doj-gold/30 inline-block px-6 py-4 bg-doj-gold/5 shadow-[0_0_30px_rgba(201,168,76,0.1)] transform -rotate-1">
                        {file.name}
                    </h2>
                </div>

                {/* MIDDLE */}
                <div className="flex justify-between items-center w-full my-auto flex-col sm:flex-row gap-8">
                    {/* MIDDLE-LEFT: Metadata stack */}
                    <div className="flex flex-col gap-4 text-left border-l-2 border-slate-700/50 pl-4 py-2">
                        <div className="font-mono text-xs sm:text-sm text-slate-400">
                            <span className="text-slate-500 mr-2">LOGGED:</span>
                            {(() => {
                                // Default date in DB is YYYY-MM-DD
                                const d = new Date(file.date);
                                if (!isNaN(d)) {
                                    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                                    return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()} 00:00`;
                                }
                                return file.date;
                            })()}
                        </div>
                        <div className="font-mono text-xs sm:text-sm text-slate-400">
                            <span className="text-slate-500 mr-2">SIZE:</span>
                            {file.size}
                        </div>
                        <div className="font-mono text-xs sm:text-sm text-slate-400">
                            <span className="text-slate-500 mr-2">AGENT:</span>
                            {displayId}
                        </div>
                        <div className="mt-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-950/40 border border-red-900/50 rounded-sm text-xs font-mono text-red-500 tracking-widest font-bold">
                                <span className="text-[10px]">◈</span> CLASSIFIED
                            </span>
                        </div>
                    </div>

                    {/* MIDDLE-RIGHT: Suspect tags */}
                    <div className="flex flex-col items-end gap-2">
                        <div className="font-mono text-[10px] text-slate-500 tracking-widest mb-1">SUSPECT SUBJECTS</div>
                        <div className="flex flex-wrap justify-end gap-2 max-w-xs">
                            {(file.suspectNames || (file.suspectName ? [file.suspectName] : ['LORENZO'])).map((name, i) => (
                                <span key={i} className="px-3 py-1 border border-doj-gold/50 rounded-full text-xs font-mono text-doj-gold bg-doj-gold/5 shadow-[0_0_10px_rgba(201,168,76,0.1)]">
                                    {name}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* BOTTOM */}
                <div className="w-full flex justify-between items-end mb-8 relative">
                    {/* BOTTOM-LEFT: Classified intel box */}
                    <div className="max-w-[60%]">
                        <div className="font-mono text-[10px] text-slate-500 tracking-widest mb-2">INTEL REPORT</div>
                        <RedactedBox text={file.redactedText || "NO INTEL PROVIDED"} onRedactedClick={onRedactedClick} />
                    </div>

                    {/* BOTTOM-RIGHT: Vertical action column */}
                    <div className="flex flex-col gap-6 items-center absolute right-0 bottom-0 bg-slate-900/60 p-3 rounded-xl border border-slate-800/60 backdrop-blur-sm">

                        {/* Upvote/Downvote via VoteButtons but we need them vertically. The component VoteButtons is already vertical! */}
                        <div className="scale-125 transform origin-right">
                            <VoteButtons file={file} user={user} />
                        </div>

                        <div className="w-8 h-px bg-slate-800" />

                        {/* Download button */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleDownload}
                            className="p-3 bg-slate-800/80 hover:bg-doj-gold/20 text-slate-400 hover:text-doj-gold border border-slate-700 hover:border-doj-gold/50 rounded-full transition-colors shadow-lg"
                            title="Download Evidence"
                        >
                            <ArrowDown className="w-5 h-5" />
                        </motion.button>

                        {/* Purge button (only if uploader) */}
                        {isOwner && (
                            <motion.button
                                whileHover={!isDeleting ? { scale: 1.1 } : {}}
                                whileTap={!isDeleting ? { scale: 0.9 } : {}}
                                onClick={() => !isDeleting && onDelete(file)}
                                disabled={isDeleting}
                                className={`p-3 rounded-full border transition-all shadow-lg ${
                                    isDeleting
                                        ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                                        : 'bg-red-950/40 border-red-900/50 text-red-500 hover:bg-red-900/60 hover:text-red-400'
                                }`}
                                title={isDeleting ? "Purging..." : "Purge Record"}
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

            {/* Vertical progress indicator */}
            <div className="absolute right-0 top-0 bottom-0 w-1 flex flex-col pointer-events-none opacity-50">
                <div
                    className="w-full bg-doj-gold transition-all duration-300"
                    style={{ height: `${((index + 1) / totalFiles) * 100}%` }}
                />
            </div>

            {/* Progress Text */}
            <div className="absolute right-4 top-24 font-mono text-[10px] text-doj-gold tracking-widest opacity-50 rotate-90 origin-right">
                {index + 1} / {totalFiles}
            </div>
        </div>
    );
}
