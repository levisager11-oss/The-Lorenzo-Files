import { useEffect, useMemo, useRef, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ArrowDownToLine, ShieldAlert, Trash2, X } from 'lucide-react';
import RedactedBox from './RedactedBox';
import VoteButtons from './VoteButtons';

function getSuspects(file) {
  return file.suspectNames?.length
    ? file.suspectNames
    : file.suspectName
      ? [file.suspectName]
      : ['Lorenzo'];
}

function formatLoggedAt(file) {
  const timestamp = Number(file.id);
  const date = Number.isFinite(timestamp) ? new Date(timestamp) : null;

  if (date && !Number.isNaN(date.getTime())) {
    const formatted = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);

    return `LOGGED: ${formatted.replace(',', '').toUpperCase()}`;
  }

  return `LOGGED: ${String(file.date || 'UNKNOWN').toUpperCase()}`;
}

function FeedSlide({ file, isVisible, onRedactedClick, user, onDelete, isDeleting }) {
  const suspects = useMemo(() => getSuspects(file), [file]);
  const agentId = file.uploadedById ? file.uploadedById.slice(0, 8).toUpperCase() : 'UNKNOWN';
  const isOwner = file.uploadedById === user?.uid;

  return (
    <section className="feed-slide relative min-h-screen snap-start px-4 pb-6 pt-28 sm:px-6 sm:pb-8 sm:pt-32 lg:px-10 lg:pb-10 lg:pt-36">
      <div className="feed-slide-grain" />
      <div className="feed-slide-scanlines" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative z-10 mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl flex-col rounded-[2rem] border border-doj-gold/15 bg-slate-950/75 p-6 shadow-[0_0_45px_rgba(10,14,26,0.55)] backdrop-blur-md sm:p-8 lg:p-10"
      >
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-4xl">
            <div className="mb-3 inline-flex items-center rounded-full border border-red-500/30 bg-red-950/40 px-3 py-1 text-[10px] font-mono tracking-[0.45em] text-red-300 uppercase">
              TOP SECRET
            </div>
            <h2 className="text-2xl font-black uppercase tracking-[0.28em] text-doj-gold font-mono sm:text-4xl lg:text-5xl">
              {file.name}
            </h2>
          </div>
          {file.downloadURL && (
            <a
              href={file.downloadURL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono uppercase tracking-[0.3em] text-slate-400 hover:text-doj-gold"
            >
              OPEN DOSSIER
            </a>
          )}
        </div>

        <div className="grid flex-1 gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)] lg:grid-rows-[1fr_auto]">
          <div className="space-y-3 self-start">
            {[
              formatLoggedAt(file),
              `SIZE: ${String(file.size || 'UNKNOWN').toUpperCase()}`,
              `AGENT: ${agentId}`,
            ].map((line) => (
              <div
                key={line}
                className="rounded-2xl border border-slate-800/80 bg-slate-900/70 px-4 py-3 text-xs font-mono tracking-[0.28em] text-slate-300 uppercase shadow-inner shadow-black/20 sm:text-sm"
              >
                {line}
              </div>
            ))}

            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-950/40 px-4 py-2 text-[11px] font-mono font-semibold tracking-[0.35em] text-red-300 uppercase">
              <span className="text-red-400">◈</span>
              <span>CLASSIFIED</span>
            </div>
          </div>

          <div className="self-start justify-self-stretch rounded-[1.5rem] border border-doj-gold/20 bg-slate-900/60 p-5">
            <div className="mb-4 text-[11px] font-mono uppercase tracking-[0.4em] text-doj-gold/80">
              Suspect Tags
            </div>
            <div className="flex flex-wrap gap-3">
              {suspects.map((suspect) => (
                <span
                  key={`${file.id}-${suspect}`}
                  className="rounded-full border border-doj-gold/40 px-4 py-2 text-xs font-mono uppercase tracking-[0.28em] text-doj-gold"
                >
                  {suspect}
                </span>
              ))}
            </div>
          </div>

          <div className="self-end rounded-[1.75rem] border border-slate-800/80 bg-slate-900/70 p-5 sm:p-6">
            <div className="mb-4 text-[11px] font-mono uppercase tracking-[0.4em] text-slate-500">
              Classified Intel
            </div>
            <div className="max-w-full overflow-hidden">
              <RedactedBox text={file.redactedText || 'NO INTEL PROVIDED'} onRedactedClick={onRedactedClick} />
            </div>
          </div>

          <div className="self-end justify-self-end">
            <div className="flex items-end gap-4 rounded-[1.75rem] border border-slate-800/80 bg-slate-900/72 px-4 py-5 sm:px-5">
              <VoteButtons file={file} user={user} variant="feed" />

              <div className="flex flex-col items-center gap-4">
                <motion.a
                  href={file.downloadURL || '#'}
                  target={file.downloadURL ? '_blank' : undefined}
                  rel={file.downloadURL ? 'noopener noreferrer' : undefined}
                  whileHover={file.downloadURL ? { scale: 1.08 } : {}}
                  whileTap={file.downloadURL ? { scale: 0.92 } : {}}
                  className={`flex h-14 w-14 items-center justify-center rounded-full border transition-colors ${
                    file.downloadURL
                      ? 'border-doj-gold/40 bg-doj-gold/10 text-doj-gold hover:border-doj-gold/70 hover:bg-doj-gold/15'
                      : 'pointer-events-none border-slate-800/80 bg-slate-900/80 text-slate-600'
                  }`}
                  aria-label="Download file"
                >
                  <ArrowDownToLine className="h-5 w-5" />
                </motion.a>

                {isOwner && (
                  <motion.button
                    type="button"
                    whileHover={!isDeleting ? { scale: 1.08 } : {}}
                    whileTap={!isDeleting ? { scale: 0.92 } : {}}
                    onClick={() => !isDeleting && onDelete(file)}
                    disabled={isDeleting}
                    className={`flex h-14 w-14 items-center justify-center rounded-full border transition-colors ${
                      isDeleting
                        ? 'cursor-not-allowed border-slate-800/80 bg-slate-900/80 text-slate-500'
                        : 'border-red-500/30 bg-red-950/40 text-red-400 hover:border-red-400/60 hover:bg-red-950/70'
                    }`}
                    aria-label="Purge file"
                  >
                    {isDeleting ? <ShieldAlert className="h-5 w-5 animate-pulse" /> : <Trash2 className="h-5 w-5" />}
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default function FeedView({ files, user, onRedactedClick, onDelete, deletingId, onClose }) {
  const containerRef = useRef(null);
  const slideRefs = useRef([]);
  const ratiosRef = useRef(new Map());
  const [visibleSlides, setVisibleSlides] = useState(() => new Set());
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTop = 0;
    }
    slideRefs.current = [];
  }, [files]);

  useEffect(() => {
    if (!files.length) return undefined;

    ratiosRef.current = new Map();
    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleSlides((current) => {
          const next = new Set(current);
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              next.add(Number(entry.target.dataset.index));
            }
          });
          return next;
        });

        entries.forEach((entry) => {
          ratiosRef.current.set(Number(entry.target.dataset.index), entry.isIntersecting ? entry.intersectionRatio : 0);
        });

        let nextIndex = 0;
        let maxRatio = 0;
        ratiosRef.current.forEach((ratio, index) => {
          if (ratio > maxRatio) {
            maxRatio = ratio;
            nextIndex = index;
          }
        });

        if (maxRatio > 0) {
          setCurrentIndex((current) => (current === nextIndex ? current : nextIndex));
        }
      },
      {
        root: containerRef.current,
        threshold: [0.25, 0.5, 0.75]
      }
    );

    slideRefs.current.forEach((slide) => {
      if (slide) observer.observe(slide);
    });

    return () => observer.disconnect();
  }, [files]);

  useEffect(() => {
    if (!files.length) return undefined;

    const handleKeyDown = (event) => {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;

      event.preventDefault();
      const nextIndex = event.key === 'ArrowDown'
        ? Math.min(currentIndex + 1, files.length - 1)
        : Math.max(currentIndex - 1, 0);

      slideRefs.current[nextIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, files.length]);

  const progressHeight = files.length ? `${100 / files.length}%` : '0%';
  const progressTop = files.length ? `${(currentIndex / files.length) * 100}%` : '0%';

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0e1a]/96">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-24 z-[60] flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-950/80 px-3 py-2 text-xs font-mono uppercase tracking-[0.3em] text-slate-300 backdrop-blur-sm hover:border-doj-gold/40 hover:text-doj-gold sm:right-6 sm:top-28"
      >
        <X className="h-4 w-4" />
        <span className="hidden sm:inline">Close</span>
      </button>

      {files.length > 0 && (
        <div className="pointer-events-none absolute right-4 top-1/2 z-[60] flex -translate-y-1/2 items-center gap-3 sm:right-6">
          <div className="relative h-32 w-px bg-doj-gold/20">
            <div
              className="absolute left-0 w-px bg-doj-gold shadow-[0_0_8px_rgba(201,168,76,0.55)] transition-all duration-300"
              style={{ height: progressHeight, top: progressTop }}
            />
          </div>
          <div className="text-right font-mono text-[10px] tracking-[0.3em] text-doj-gold/85">
            <div>{String(currentIndex + 1).padStart(2, '0')}</div>
            <div className="text-slate-500">/</div>
            <div>{String(files.length).padStart(2, '0')}</div>
          </div>
        </div>
      )}

      <div ref={containerRef} className="feed-scroll h-full overflow-y-scroll scroll-smooth snap-y snap-mandatory">
        {files.length > 0 ? (
          files.map((file, index) => (
            <div
              key={file.docId || file.id}
              className="snap-start"
              ref={(node) => {
                slideRefs.current[index] = node;
              }}
              data-index={index}
            >
              <FeedSlide
                file={file}
                isVisible={visibleSlides.has(index)}
                onRedactedClick={onRedactedClick}
                user={user}
                onDelete={onDelete}
                isDeleting={deletingId === (file.docId || file.id?.toString())}
              />
            </div>
          ))
        ) : (
          <div className="flex min-h-screen items-center justify-center px-6 pt-24">
            <div className="max-w-xl rounded-[2rem] border border-doj-gold/20 bg-slate-950/80 p-8 text-center shadow-2xl backdrop-blur-md">
              <p className="text-sm font-mono uppercase tracking-[0.35em] text-doj-gold">No matching evidence in feed</p>
              <p className="mt-3 text-sm font-mono text-slate-400">
                Adjust the archive search, sort, or suspect filters, then reopen the feed.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 rounded-full border border-doj-gold/30 px-5 py-2 text-xs font-mono uppercase tracking-[0.3em] text-doj-gold hover:bg-doj-gold/10"
              >
                Return to Archive
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
