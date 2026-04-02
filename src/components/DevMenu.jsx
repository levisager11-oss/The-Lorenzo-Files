import { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '../lib/firebase';

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function DevMenu({
  user,
  files,
  onResetSecurity,
  onTriggerBreach,
  devBypassUploadLimit,
  onSetDevBypassUploadLimit,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [purgeConfirm, setPurgeConfirm] = useState(false);
  const [purging, setPurging] = useState(false);
  const [purgeResult, setPurgeResult] = useState(null);

  if (user?.email !== 'levi.sager11@gmail.com') return null;

  // Compute live stats from files prop
  const totalFiles = files.length;
  const totalBytes = files.reduce((sum, f) => sum + (f.sizeInBytes || 0), 0);
  const totalUpvotes = files.reduce((sum, f) => sum + (f.upvotes || 0), 0);
  const totalDownvotes = files.reduce((sum, f) => sum + (f.downvotes || 0), 0);

  // Compute agent list: uploadedById → upload count
  const agentMap = {};
  for (const f of files) {
    const uid = f.uploadedById || 'unknown';
    agentMap[uid] = (agentMap[uid] || 0) + 1;
  }
  const agents = Object.entries(agentMap).sort((a, b) => b[1] - a[1]);

  async function handlePurgeAll() {
    setPurging(true);
    setPurgeResult(null);
    try {
      const snapshot = await getDocs(collection(db, 'evidenceFiles'));
      let deleted = 0;
      let errors = 0;
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.storagePath) {
          try {
            await deleteObject(ref(storage, data.storagePath));
          } catch {
            // File may already be absent from Storage — continue
          }
        }
        try {
          await deleteDoc(doc(db, 'evidenceFiles', docSnap.id));
          deleted++;
        } catch {
          errors++;
        }
      }
      setPurgeResult(
        `Purged ${deleted} file${deleted !== 1 ? 's' : ''}${errors > 0 ? `, ${errors} error${errors !== 1 ? 's' : ''}` : ''}.`
      );
      setPurgeConfirm(false);
    } catch (e) {
      setPurgeResult(`Error: ${e.message}`);
    } finally {
      setPurging(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-[70] flex flex-col items-end gap-2">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="dev-panel"
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: 'spring', damping: 22, stiffness: 320 }}
            className="bg-slate-900 border border-doj-gold/50 rounded-xl shadow-2xl shadow-black/80 w-80 max-h-[70vh] overflow-y-auto font-mono text-xs text-slate-300"
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-doj-gold/30 bg-slate-800/60 rounded-t-xl">
              <span className="text-doj-gold font-bold tracking-widest uppercase">
                Developer Console
              </span>
              <span className="text-slate-500 text-[10px] truncate max-w-[140px]">{user.email}</span>
            </div>

            <div className="p-4 flex flex-col gap-5">

              {/* ── Archive Stats ─────────────────────────── */}
              <section>
                <div className="text-doj-gold/80 uppercase tracking-widest text-[10px] mb-2">
                  📊 Archive Stats
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <div>
                    <span className="text-slate-500">Files:</span>{' '}
                    <span className="text-white">{totalFiles}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Storage:</span>{' '}
                    <span className="text-white">{formatBytes(totalBytes)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Upvotes:</span>{' '}
                    <span className="text-green-400">{totalUpvotes}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Downvotes:</span>{' '}
                    <span className="text-red-400">{totalDownvotes}</span>
                  </div>
                </div>
              </section>

              {/* ── Agent List ────────────────────────────── */}
              <section>
                <div className="text-doj-gold/80 uppercase tracking-widest text-[10px] mb-2">
                  👤 Agent List
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 max-h-32 overflow-y-auto">
                  {agents.length === 0 ? (
                    <div className="text-slate-500 text-center italic">No agents on record</div>
                  ) : (
                    agents.map(([uid, count]) => (
                      <div
                        key={uid}
                        className="flex justify-between items-center py-0.5 border-b border-slate-700/40 last:border-0"
                      >
                        <span className="text-slate-400 truncate max-w-[200px]">{uid}</span>
                        <span className="text-doj-gold ml-2 shrink-0">{count}</span>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* ── Reset Security Level ─────────────────── */}
              <section>
                <div className="text-doj-gold/80 uppercase tracking-widest text-[10px] mb-2">
                  🔄 Reset Security Level
                </div>
                <button
                  type="button"
                  onClick={onResetSecurity}
                  className="w-full py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 font-mono text-xs uppercase tracking-wider border border-slate-600 transition-all active:scale-95"
                >
                  Reset to Level 0
                </button>
              </section>

              {/* ── Upload Limit Override ─────────────────── */}
              <section>
                <div className="text-doj-gold/80 uppercase tracking-widest text-[10px] mb-2">
                  📅 Upload Limit Override
                </div>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={devBypassUploadLimit}
                    onClick={() => onSetDevBypassUploadLimit(!devBypassUploadLimit)}
                    className={`relative w-10 h-5 rounded-full transition-colors focus:outline-none ${
                      devBypassUploadLimit ? 'bg-doj-gold' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        devBypassUploadLimit ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span className={devBypassUploadLimit ? 'text-doj-gold' : 'text-slate-500'}>
                    {devBypassUploadLimit ? 'Bypass ENABLED' : 'Bypass DISABLED'}
                  </span>
                </label>
              </section>

              {/* ── Trigger Security Breach ───────────────── */}
              <section>
                <div className="text-doj-gold/80 uppercase tracking-widest text-[10px] mb-2">
                  🧪 Trigger Security Breach
                </div>
                <button
                  type="button"
                  onClick={onTriggerBreach}
                  className="w-full py-2 rounded bg-red-900/60 hover:bg-red-700/80 text-red-300 font-mono text-xs uppercase tracking-wider border border-red-700/50 transition-all active:scale-95"
                >
                  Initiate Breach
                </button>
              </section>

              {/* ── Purge ALL Files ───────────────────────── */}
              <section>
                <div className="text-doj-gold/80 uppercase tracking-widest text-[10px] mb-2">
                  🗑️ Purge ALL Files
                </div>
                {!purgeConfirm ? (
                  <button
                    type="button"
                    onClick={() => {
                      setPurgeConfirm(true);
                      setPurgeResult(null);
                    }}
                    className="w-full py-2 rounded bg-red-900/40 hover:bg-red-900/70 text-red-400 font-mono text-xs uppercase tracking-wider border border-red-900/50 transition-all active:scale-95"
                  >
                    Purge Archive
                  </button>
                ) : (
                  <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-3">
                    <p className="text-red-400 text-[10px] mb-3 leading-relaxed uppercase tracking-wide">
                      ⚠ This will permanently delete ALL {totalFiles} file
                      {totalFiles !== 1 ? 's' : ''} from Firestore and Storage. This cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPurgeConfirm(false)}
                        disabled={purging}
                        className="flex-1 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-[10px] uppercase tracking-wider border border-slate-600 transition-all disabled:opacity-50"
                      >
                        Abort
                      </button>
                      <button
                        type="button"
                        onClick={handlePurgeAll}
                        disabled={purging}
                        className="flex-1 py-1.5 rounded bg-red-700 hover:bg-red-600 text-white text-[10px] uppercase tracking-widest border border-red-500 transition-all font-bold disabled:opacity-50"
                      >
                        {purging ? 'PURGING…' : 'CONFIRM'}
                      </button>
                    </div>
                  </div>
                )}
                {purgeResult && (
                  <p className="mt-2 text-[10px] text-slate-400">{purgeResult}</p>
                )}
              </section>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="bg-slate-900 border border-doj-gold/70 hover:border-doj-gold text-doj-gold font-mono text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg shadow-lg hover:shadow-doj-gold/20 transition-all active:scale-95"
      >
        {isOpen ? '✕ DEV' : '⚙ DEV'}
      </button>
    </div>
  );
}
