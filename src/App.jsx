import { useEffect, useState, useMemo } from 'react';
import { AlertTriangle, Database, FileText, Upload, Loader2 } from 'lucide-react';
import Header from './components/Header';
import SearchPortal from './components/SearchPortal';
import FileRow from './components/FileRow';
import SecurityBreach from './components/SecurityBreach';
import UploadModal from './components/UploadModal';
import { evidenceFiles as initialSeedData } from './data/files';
import { participantNames } from './data/names';
import { db, storage } from './lib/firebase';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  query,
  orderBy,
  deleteDoc
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

import LoginScreen from './components/LoginScreen';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('lorenzo_clearance') === 'GRANTED';
  });

  const [files, setFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSuspect, setSelectedSuspect] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [securityLevel, setSecurityLevel] = useState(0);
  const [breached, setBreached] = useState(false);
  const [loading, setLoading] = useState(true);

  // Session / Ownership State
  const [sessionId] = useState(() => {
    const saved = localStorage.getItem('lorenzo_session_id');
    if (saved) return saved;
    const newId = 'suspect_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('lorenzo_session_id', newId);
    return newId;
  });

  const handleLoginSuccess = () => {
    sessionStorage.setItem('lorenzo_clearance', 'GRANTED');
    setIsAuthenticated(true);
  };

  // Upload State
  const [uploading, setUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Purge State
  const [fileToPurge, setFileToPurge] = useState(null);

  useEffect(() => {
    // Listen to Firebase evidenceFiles collection
    const filesCollection = collection(db, "evidenceFiles");
    const q = query(filesCollection, orderBy("id", "desc"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        setFiles([]);
        setLoading(false);
      } else {
        const evidenceData = snapshot.docs.map(doc => ({
          docId: doc.id,
          ...doc.data()
        }));
        setFiles(evidenceData);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const filteredFiles = useMemo(() => {
    let result = files;
    
    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((f) => f.name.toLowerCase().includes(q));
    }
    
    // Filter by selected suspect
    if (selectedSuspect) {
      result = result.filter((f) => {
        // Support both single suspectName (string) and multiple suspectNames (array)
        const suspects = f.suspectNames || (f.suspectName ? [f.suspectName] : ['Lorenzo']);
        return suspects.includes(selectedSuspect);
      });
    }
    
    return result;
  }, [searchQuery, selectedSuspect, files]);

  const handleRedactedClick = () => {
    const next = securityLevel + 1;
    setSecurityLevel(next);
    if (next > 3) {
      setBreached(true);
    }
  };

  const handleDismissBreach = () => {
    setBreached(false);
    setSecurityLevel(0);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Limit upload size to 50MB
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert(`SECURITY PROTOCOL VIOLATION: FILE "${file.name}" EXCEEDS 50MB LIMIT. REDUCE PAYLOAD SIZE.`);
      event.target.value = '';
      return;
    }

    // Reset the input value so the same file could be selected again if cancelled
    event.target.value = '';

    // Store file and prompt for context
    setFileToUpload(file);
    setShowUploadModal(true);
  };

  const handleCancelUpload = () => {
    setFileToUpload(null);
    setShowUploadModal(false);
  };

  const processFileUpload = async (contextText, suspectNames) => {
    if (!fileToUpload) return;

    setShowUploadModal(false);
    setUploading(true);

    try {
      // Calculate nice file size
      const sizeInBytes = fileToUpload.size;
      let sizeStr = sizeInBytes + " B";
      if (sizeInBytes >= 1024 * 1024) {
        sizeStr = (sizeInBytes / (1024 * 1024)).toFixed(1) + " MB";
      } else if (sizeInBytes >= 1024) {
        sizeStr = (sizeInBytes / 1024).toFixed(0) + " KB";
      }

      // Format today's date
      const today = new Date().toISOString().split('T')[0];

      // Upload physical file to Firebase Storage
      const storagePath = `uploads/${Date.now()}_${fileToUpload.name}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, fileToUpload);
      const downloadURL = await getDownloadURL(storageRef);

      // Add metadata + downloadURL to Firestore
      const newEvidence = {
        id: Date.now(),
        name: fileToUpload.name,
        date: today,
        size: sizeStr,
        status: "CLASSIFIED",
        redactedText: contextText, // Use user-provided context
        suspectNames: suspectNames, // Store array of suspect names
        downloadURL: downloadURL,
        uploadedById: sessionId,    // Track owner
        storagePath: storagePath    // Facilitate deletion
      };

      await setDoc(doc(db, "evidenceFiles", newEvidence.id.toString()), newEvidence);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload the file to Firebase.");
    } finally {
      setUploading(false);
      setFileToUpload(null);
    }
  };

  const handleDeleteFile = (file) => {
    setFileToPurge(file);
  };

  const confirmPurge = async () => {
    const file = fileToPurge;
    setFileToPurge(null);
    if (!file) return;

    const docId = file.docId || file.id.toString();
    setDeletingId(docId);

    try {
      // 1. Delete from Storage if storagePath exists
      if (file.storagePath) {
        const storageRef = ref(storage, file.storagePath);
        await deleteObject(storageRef);
      }

      // 2. Delete from Firestore
      await deleteDoc(doc(db, "evidenceFiles", docId));
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("CRITICAL ERROR: Failed to purge record from archive.");
    } finally {
      setDeletingId(null);
    }
  };

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  if (loading) {
    return (
      <div className="relative min-h-screen bg-slate-900 font-sans flex items-center justify-center">
        <div className="grain-overlay" />
        <div className="scanlines" />
        <div className="flex flex-col items-center gap-4 text-slate-500 font-mono">
          <Loader2 className="w-8 h-8 animate-spin text-doj-gold" />
          <p className="tracking-widest">ACCESSING CLOUD EVIDENCE ARCHIVE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-900 font-sans">
      {/* Grain overlay */}
      <div className="grain-overlay" />
      {/* Scanlines */}
      <div className="scanlines" />
      {/* CONFIDENTIAL watermark */}
      <div className="watermark">
        <span className="watermark-text">CONFIDENTIAL</span>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        <Header />

        {/* Classification Banner */}
        <div className="bg-red-950/40 border-y border-red-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-center gap-3">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <p className="text-xs font-mono text-red-400 tracking-widest">
              TOP SECRET // LORENZO EYES ONLY // CLASSIFICATION LEVEL: ULTRA
            </p>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
        </div>

        {/* Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search */}
          <div className="mb-8">
            <SearchPortal query={searchQuery} onQueryChange={setSearchQuery} />
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                <Database className="w-3.5 h-3.5" />
                <span>{files.length} FILES IN ARCHIVE</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                <FileText className="w-3.5 h-3.5" />
                <span>{filteredFiles.length} SHOWING</span>
              </div>

              {/* Name Filter selector */}
              <div className="ml-4">
                <select
                  value={selectedSuspect}
                  onChange={(e) => setSelectedSuspect(e.target.value)}
                  className="px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded text-xs font-mono text-slate-300 focus:outline-none focus:border-doj-gold/50 cursor-pointer appearance-none transition-colors"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1rem',
                    paddingRight: '2rem'
                  }}
                >
                  <option value="">ALL SUSPECTS</option>
                  {participantNames.map(name => (
                    <option key={name} value={name}>{name.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              {/* Upload Button */}
              <div className="ml-2">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={uploading || showUploadModal}
                />
                <label
                  htmlFor="file-upload"
                  className={`flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded transition-colors duration-200 text-xs font-mono text-slate-300
                    ${(uploading || showUploadModal) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-700 cursor-pointer'}
                  `}
                >
                  {uploading ? (
                    <Loader2 className="w-3.5 h-3.5 text-doj-gold animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5 text-doj-gold" />
                  )}
                  <span>{uploading ? 'UPLOADING...' : 'UPLOAD U.R.D.'}</span>
                </label>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-600">SECURITY LEVEL:</span>
              <div className="flex gap-1">
                {[1, 2, 3].map((level) => (
                  <div
                    key={level}
                    className={`w-2.5 h-2.5 rounded-sm transition-colors duration-300 ${securityLevel >= level
                      ? 'bg-red-500 shadow-sm shadow-red-500/50'
                      : 'bg-slate-700'
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Evidence Table */}
          <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl overflow-hidden backdrop-blur-sm">
            {/* Table Header */}
            <div className="grid grid-cols-[30px_1fr_100px_150px] sm:grid-cols-[40px_1fr_120px_90px_70px_120px_180px] lg:grid-cols-[40px_1fr_120px_100px_80px_120px_220px] gap-2 items-center px-4 sm:px-6 py-3 bg-slate-800/50 border-b border-slate-700/40 text-[10px] font-mono text-slate-500 tracking-widest uppercase">
              <div>#</div>
              <div>File Name</div>
              <div className="hidden sm:block">Suspect</div>
              <div className="hidden sm:block">Date</div>
              <div className="hidden sm:block">Size</div>
              <div className="text-center">Status</div>
              <div className="text-right sm:pr-2">Intel</div>
            </div>

            {/* File Rows */}
            {filteredFiles.length > 0 ? (
              filteredFiles.map((file, index) => (
                <FileRow
                  key={file.id}
                  file={file}
                  index={index}
                  onRedactedClick={handleRedactedClick}
                  sessionId={sessionId}
                  onDelete={handleDeleteFile}
                  isDeleting={deletingId === (file.docId || file.id.toString())}
                />
              ))
            ) : (
              <div className="py-16 text-center">
                <p className="text-sm font-mono text-slate-600">
                  NO MATCHING FILES FOUND
                </p>
                <p className="text-xs font-mono text-slate-700 mt-1">
                  Try adjusting your search query
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="mt-8 pb-8 text-center">
            <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-6" />
            <p className="text-xs font-mono text-slate-600 tracking-wider">
              DEPARTMENT OF LORENZO — EVIDENCE MANAGEMENT SYSTEM v4.2.0
            </p>
            <p className="text-[10px] font-mono text-slate-700 mt-1 tracking-wider">
              UNAUTHORIZED ACCESS IS PUNISHABLE BY HAVING TO LISTEN TO LORENZO'S KARAOKE
            </p>
          </footer>
        </main>
      </div>

      {showUploadModal && (
        <UploadModal
          file={fileToUpload}
          onClose={handleCancelUpload}
          onConfirm={(context, suspectNames) => processFileUpload(context, suspectNames)}
        />
      )}

      {/* Security Breach Overlay */}
      {breached && <SecurityBreach onDismiss={handleDismissBreach} />}

      {/* Custom Purge Confirmation Modal */}
      {fileToPurge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-slate-900 border-2 border-red-900/50 rounded-xl p-6 max-w-sm w-full shadow-2xl shadow-red-900/20 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-mono text-xl font-bold text-red-500 mb-2 flex items-center gap-2 uppercase tracking-wider">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
              CONFIRM PURGE
            </h3>
            <p className="font-mono text-xs text-slate-400 mb-6 leading-relaxed">
              Are you sure you want to permanently purge <span className="text-red-400 font-bold">"{fileToPurge.name}"</span>? This action is irreversible and will erase the file from the archive.
            </p>
            <div className="flex justify-end gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setFileToPurge(null)}
                className="px-4 py-2 font-mono text-xs text-slate-500 hover:text-slate-300 transition-colors uppercase"
              >
                Abort
              </button>
              <button
                type="button"
                onClick={confirmPurge}
                className="px-5 py-2 rounded bg-red-900/80 text-white font-mono text-xs font-bold uppercase tracking-widest hover:bg-red-600 border border-red-500 transition-all shadow-lg active:scale-95"
              >
                EXECUTE PURGE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
