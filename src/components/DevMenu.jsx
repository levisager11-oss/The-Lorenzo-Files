import { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '../lib/firebase';

const FILE_STATUSES = ['CLASSIFIED', 'SEALED', 'REDACTED', 'UNDER REVIEW'];

const TABS = [
  { id: 'stats',    label: '📊 Stats'    },
  { id: 'files',    label: '🗂 Files'    },
  { id: 'controls', label: '⚙ Controls' },
  { id: 'agents',   label: '👤 Agents'  },
];

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors focus:outline-none shrink-0 ${
        checked ? 'bg-doj-gold' : 'bg-slate-700'
      }`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
          checked ? 'left-5' : 'left-0.5'
        }`}
      />
    </button>
  );
}

export default function DevMenu({
  user,
  files,
  onResetSecurity,
  onSetSecurityLevel,
  onTriggerBreach,
  devBypassUploadLimit,
  onSetDevBypassUploadLimit,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('stats');

  // Purge-all state
  const [purgeAllConfirm, setPurgeAllConfirm] = useState(false);
  const [purgingAll, setPurgingAll] = useState(false);
  const [purgeAllResult, setPurgeAllResult] = useState(null);

  // Per-file purge state
  const [purgeFileTarget, setPurgeFileTarget] = useState(null); // file object pending confirmation
  const [purgingFileId, setPurgingFileId] = useState(null);    // docId currently being deleted

  // Per-file status edit state: { [docId]: pendingStatus }
  const [statusEdits, setStatusEdits] = useState({});
  const [savingStatusId, setSavingStatusId] = useState(null);

  // Force security-level input
  const [forceLevel, setForceLevel] = useState('');

  if (user?.email !== 'levi.sager11@gmail.com') return null;

  // ── Derived stats ──────────────────────────────────────────
  const totalFiles  = files.length;
  const totalBytes  = files.reduce((sum, f) => sum + (f.sizeInBytes || 0), 0);
  const totalUpvotes   = files.reduce((sum, f) => sum + (f.upvotes   || 0), 0);
  const totalDownvotes = files.reduce((sum, f) => sum + (f.downvotes || 0), 0);

  const topFile = [...files].sort(
    (a, b) => ((b.upvotes || 0) - (b.downvotes || 0)) - ((a.upvotes || 0) - (a.downvotes || 0))
  )[0];

  // Agent map
  const agentMap = {};
  for (const f of files) {
    const uid = f.uploadedById || 'unknown';
    agentMap[uid] = (agentMap[uid] || 0) + 1;
  }
  const agents = Object.entries(agentMap).sort((a, b) => b[1] - a[1]);

  // ── Handlers ──────────────────────────────────────────────

  async function handlePurgeAll() {
    setPurgingAll(true);
    setPurgeAllResult(null);
    try {
      const snapshot = await getDocs(collection(db, 'evidenceFiles'));
      let deleted = 0;
      let errors = 0;
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.storagePath) {
          try { await deleteObject(ref(storage, data.storagePath)); } catch { /* already gone */ }
        }
        try {
          await deleteDoc(doc(db, 'evidenceFiles', docSnap.id));
          deleted++;
        } catch { errors++; }
      }
      setPurgeAllResult(
        `Purged ${deleted} file${deleted !== 1 ? 's' : ''}${errors > 0 ? `, ${errors} error${errors !== 1 ? 's' : ''}` : ''}.`
      );
      setPurgeAllConfirm(false);
    } catch (e) {
      setPurgeAllResult(`Error: ${e.message}`);
    } finally {
      setPurgingAll(false);
    }
  }

  async function handlePurgeSingleFile(file) {
    const id = file.docId || String(file.id);
    setPurgingFileId(id);
    setPurgeFileTarget(null);
    try {
      if (file.storagePath) {
        try { await deleteObject(ref(storage, file.storagePath)); } catch { /* already gone */ }
      }
      await deleteDoc(doc(db, 'evidenceFiles', id));
    } catch (e) {
      alert(`Failed to purge "${file.name}": ${e.message}`);
    } finally {
      setPurgingFileId(null);
    }
  }

  async function handleSaveStatus(file) {
    const id = file.docId || String(file.id);
    const newStatus = statusEdits[id];
    if (!newStatus || newStatus === file.status) {
      setStatusEdits(prev => { const n = { ...prev }; delete n[id]; return n; });
      return;
    }
    setSavingStatusId(id);
    try {
      await updateDoc(doc(db, 'evidenceFiles', id), { status: newStatus });
      setStatusEdits(prev => { const n = { ...prev }; delete n[id]; return n; });
    } catch (e) {
      alert(`Failed to update status: ${e.message}`);
    } finally {
      setSavingStatusId(null);
    }
  }

  function handleExportJSON() {
    const data = JSON.stringify(
      files.map(({ docId, id, name, date, size, sizeInBytes, status, uploadedById, upvotes, downvotes, suspectNames }) => ({
        docId, id, name, date, size, sizeInBytes, status, uploadedById, upvotes, downvotes, suspectNames,
      })),
      null,
      2
    );
    const blob = new Blob([data], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `lorenzo-archive-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Render ─────────────────────────────────────────────────
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
            className="bg-slate-900 border border-doj-gold/50 rounded-xl shadow-2xl shadow-black/80 w-80 font-mono text-xs text-slate-300 flex flex-col"
            style={{ maxHeight: 'calc(100vh - 5rem)' }}
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-doj-gold/30 bg-slate-800/60 rounded-t-xl shrink-0">
              <span className="text-doj-gold font-bold tracking-widest uppercase">
                Developer Console
              </span>
              <span className="text-slate-500 text-[10px] truncate max-w-[140px]">{user.email}</span>
            </div>

            {/* ── Tabs ── */}
            <div className="flex border-b border-slate-700/60 shrink-0 overflow-x-auto">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-fit py-2 px-1 text-[10px] uppercase tracking-wider transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-doj-gold border-b-2 border-doj-gold bg-slate-800/40'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── Tab Content ── */}
            <div className="overflow-y-auto flex-1 p-4 flex flex-col gap-5">

              {/* ════════════════════════════════════════════
                  TAB: STATS
              ════════════════════════════════════════════ */}
              {activeTab === 'stats' && (
                <>
                  <section>
                    <div className="text-doj-gold/80 uppercase tracking-widest text-[10px] mb-2">
                      📊 Archive Stats
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                      <div><span className="text-slate-500">Files:</span> <span className="text-white">{totalFiles}</span></div>
                      <div><span className="text-slate-500">Storage:</span> <span className="text-white">{formatBytes(totalBytes)}</span></div>
                      <div><span className="text-slate-500">Upvotes:</span> <span className="text-green-400">{totalUpvotes}</span></div>
                      <div><span className="text-slate-500">Downvotes:</span> <span className="text-red-400">{totalDownvotes}</span></div>
                      <div className="col-span-2">
                        <span className="text-slate-500">Avg score:</span>{' '}
                        <span className="text-doj-gold">
                          {totalFiles > 0 ? (((totalUpvotes - totalDownvotes) / totalFiles).toFixed(1)) : '—'}
                        </span>
                      </div>
                    </div>
                  </section>

                  {topFile && (
                    <section>
                      <div className="text-doj-gold/80 uppercase tracking-widest text-[10px] mb-2">
                        🏆 Top File
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <p className="text-white truncate">{topFile.name}</p>
                        <p className="text-slate-500 mt-1">
                          Score: <span className="text-green-400">+{topFile.upvotes || 0}</span>{' '}
                          / <span className="text-red-400">−{topFile.downvotes || 0}</span>
                        </p>
                      </div>
                    </section>
                  )}

                  <section>
                    <div className="text-doj-gold/80 uppercase tracking-widest text-[10px] mb-2">
                      🪪 Session Info
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 space-y-1 break-all">
                      <div><span className="text-slate-500">Email:</span> <span className="text-white">{user.email}</span></div>
                      <div><span className="text-slate-500">UID:</span> <span className="text-slate-300">{user.uid}</span></div>
                      <div><span className="text-slate-500">Verified:</span> <span className={user.emailVerified ? 'text-green-400' : 'text-red-400'}>{user.emailVerified ? 'Yes' : 'No'}</span></div>
                    </div>
                  </section>
                </>
              )}

              {/* ════════════════════════════════════════════
                  TAB: FILES
              ════════════════════════════════════════════ */}
              {activeTab === 'files' && (
                <>
                  <section>
                    <div className="text-doj-gold/80 uppercase tracking-widest text-[10px] mb-2">
                      🗂 File Browser <span className="text-slate-600 normal-case">({totalFiles})</span>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-0.5">
                      {files.length === 0 && (
                        <p className="text-slate-500 text-center italic">Archive is empty</p>
                      )}
                      {files.map(file => {
                        const id = file.docId || String(file.id);
                        const isPurgingThis = purgingFileId === id;
                        const isPendingConfirm = purgeFileTarget?.docId === file.docId && purgeFileTarget?.id === file.id;
                        const pendingStatus = statusEdits[id];
                        const isSavingStatus = savingStatusId === id;

                        return (
                          <div key={id} className="bg-slate-800/50 rounded-lg p-2.5 border border-slate-700/40">
                            {/* File name + purge button */}
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <span className="text-white text-[11px] leading-tight break-all line-clamp-2">{file.name}</span>
                              <button
                                type="button"
                                disabled={isPurgingThis}
                                onClick={() =>
                                  isPendingConfirm
                                    ? setPurgeFileTarget(null)
                                    : setPurgeFileTarget(file)
                                }
                                className="shrink-0 text-red-500 hover:text-red-400 transition-colors disabled:opacity-40 text-base leading-none"
                                title="Purge this file"
                              >
                                {isPurgingThis ? '⏳' : (isPendingConfirm ? '✕' : '🗑')}
                              </button>
                            </div>

                            {/* Meta row */}
                            <div className="flex items-center gap-2 text-slate-500 text-[10px] mb-2">
                              <span>{file.size || formatBytes(file.sizeInBytes || 0)}</span>
                              <span>·</span>
                              <span>{file.date}</span>
                            </div>

                            {/* Inline purge confirmation */}
                            {isPendingConfirm && (
                              <div className="mb-2 p-2 bg-red-900/30 border border-red-700/40 rounded text-[10px] text-red-400">
                                <p className="mb-1.5 uppercase tracking-wide">⚠ Permanently delete this file?</p>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setPurgeFileTarget(null)}
                                    className="flex-1 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 uppercase border border-slate-600 transition-all"
                                  >
                                    Abort
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handlePurgeSingleFile(file)}
                                    className="flex-1 py-1 rounded bg-red-700 hover:bg-red-600 text-white uppercase font-bold border border-red-500 transition-all"
                                  >
                                    Confirm
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Status editor */}
                            <div className="flex items-center gap-2">
                              <select
                                value={pendingStatus ?? file.status ?? 'CLASSIFIED'}
                                onChange={e => setStatusEdits(prev => ({ ...prev, [id]: e.target.value }))}
                                className="flex-1 bg-slate-700 border border-slate-600 text-slate-300 text-[10px] rounded px-1.5 py-1 focus:outline-none focus:border-doj-gold/60"
                              >
                                {FILE_STATUSES.map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                              {pendingStatus && pendingStatus !== file.status && (
                                <button
                                  type="button"
                                  disabled={isSavingStatus}
                                  onClick={() => handleSaveStatus(file)}
                                  className="shrink-0 px-2 py-1 rounded bg-doj-gold/20 hover:bg-doj-gold/40 text-doj-gold text-[10px] border border-doj-gold/30 transition-all disabled:opacity-50"
                                >
                                  {isSavingStatus ? '…' : 'Save'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* ── Purge ALL ── */}
                  <section>
                    <div className="text-doj-gold/80 uppercase tracking-widest text-[10px] mb-2">
                      🗑️ Purge ALL Files
                    </div>
                    {!purgeAllConfirm ? (
                      <button
                        type="button"
                        onClick={() => { setPurgeAllConfirm(true); setPurgeAllResult(null); }}
                        className="w-full py-2 rounded bg-red-900/40 hover:bg-red-900/70 text-red-400 uppercase tracking-wider border border-red-900/50 transition-all active:scale-95"
                      >
                        Purge Entire Archive
                      </button>
                    ) : (
                      <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-3">
                        <p className="text-red-400 text-[10px] mb-3 leading-relaxed uppercase tracking-wide">
                          ⚠ Permanently delete ALL {totalFiles} file{totalFiles !== 1 ? 's' : ''} from Firestore and Storage. Cannot be undone.
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setPurgeAllConfirm(false)}
                            disabled={purgingAll}
                            className="flex-1 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-[10px] uppercase border border-slate-600 transition-all disabled:opacity-50"
                          >
                            Abort
                          </button>
                          <button
                            type="button"
                            onClick={handlePurgeAll}
                            disabled={purgingAll}
                            className="flex-1 py-1.5 rounded bg-red-700 hover:bg-red-600 text-white text-[10px] uppercase font-bold border border-red-500 transition-all disabled:opacity-50"
                          >
                            {purgingAll ? 'PURGING…' : 'CONFIRM'}
                          </button>
                        </div>
                      </div>
                    )}
                    {purgeAllResult && (
                      <p className="mt-2 text-[10px] text-slate-400">{purgeAllResult}</p>
                    )}
                  </section>
                </>
              )}

              {/* ════════════════════════════════════════════
                  TAB: CONTROLS
              ════════════════════════════════════════════ */}
              {activeTab === 'controls' && (
                <>
                  {/* Reset Security Level */}
                  <section>
                    <div className="text-doj-gold/80 uppercase tracking-widest text-[10px] mb-2">
                      🔄 Reset Security Level
                    </div>
                    <button
                      type="button"
                      onClick={onResetSecurity}
                      className="w-full py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 uppercase tracking-wider border border-slate-600 transition-all active:scale-95"
                    >
                      Reset to Level 0
                    </button>
                  </section>

                  {/* Force Security Level */}
                  <section>
                    <div className="text-doj-gold/80 uppercase tracking-widest text-[10px] mb-2">
                      🎚 Force Security Level
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        max="4"
                        value={forceLevel}
                        onChange={e => setForceLevel(e.target.value)}
                        placeholder="0 – 4"
                        className="flex-1 bg-slate-800 border border-slate-600 text-slate-200 text-xs rounded px-2 py-1.5 focus:outline-none focus:border-doj-gold/60 placeholder-slate-600"
                      />
                      <button
                        type="button"
                        disabled={forceLevel === ''}
                        onClick={() => {
                          const parsed = parseInt(forceLevel, 10);
                          if (isNaN(parsed)) return;
                          const lvl = Math.max(0, Math.min(4, parsed));
                          onSetSecurityLevel(lvl);
                          setForceLevel('');
                        }}
                        className="px-3 py-1.5 rounded bg-doj-gold/20 hover:bg-doj-gold/40 text-doj-gold uppercase border border-doj-gold/30 transition-all disabled:opacity-40 active:scale-95"
                      >
                        Set
                      </button>
                    </div>
                    <p className="text-slate-600 text-[10px] mt-1">Values {'>'} 3 trigger a breach.</p>
                  </section>

                  {/* Upload Limit Override */}
                  <section>
                    <div className="text-doj-gold/80 uppercase tracking-widest text-[10px] mb-2">
                      📅 Upload Limit Override
                    </div>
                    <div className="flex items-center gap-3">
                      <Toggle checked={devBypassUploadLimit} onChange={onSetDevBypassUploadLimit} />
                      <span className={devBypassUploadLimit ? 'text-doj-gold' : 'text-slate-500'}>
                        {devBypassUploadLimit ? 'Bypass ENABLED' : 'Bypass DISABLED'}
                      </span>
                    </div>
                  </section>

                  {/* Trigger Security Breach */}
                  <section>
                    <div className="text-doj-gold/80 uppercase tracking-widest text-[10px] mb-2">
                      🧪 Trigger Security Breach
                    </div>
                    <button
                      type="button"
                      onClick={onTriggerBreach}
                      className="w-full py-2 rounded bg-red-900/60 hover:bg-red-700/80 text-red-300 uppercase tracking-wider border border-red-700/50 transition-all active:scale-95"
                    >
                      Initiate Breach
                    </button>
                  </section>

                  {/* Export Archive JSON */}
                  <section>
                    <div className="text-doj-gold/80 uppercase tracking-widest text-[10px] mb-2">
                      💾 Export Archive
                    </div>
                    <button
                      type="button"
                      onClick={handleExportJSON}
                      disabled={totalFiles === 0}
                      className="w-full py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 uppercase tracking-wider border border-slate-600 transition-all active:scale-95 disabled:opacity-40"
                    >
                      Download JSON ({totalFiles} files)
                    </button>
                  </section>
                </>
              )}

              {/* ════════════════════════════════════════════
                  TAB: AGENTS
              ════════════════════════════════════════════ */}
              {activeTab === 'agents' && (
                <section>
                  <div className="text-doj-gold/80 uppercase tracking-widest text-[10px] mb-2">
                    👤 Agent List
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 max-h-64 overflow-y-auto">
                    {agents.length === 0 ? (
                      <div className="text-slate-500 text-center italic">No agents on record</div>
                    ) : (
                      agents.map(([uid, count]) => (
                        <div
                          key={uid}
                          className="flex justify-between items-center py-1 border-b border-slate-700/40 last:border-0 gap-2"
                        >
                          <span className="text-slate-400 break-all text-[10px]">{uid}</span>
                          <span className="text-doj-gold shrink-0 ml-1">{count} file{count !== 1 ? 's' : ''}</span>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              )}

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
