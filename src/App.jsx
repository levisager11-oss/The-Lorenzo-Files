import { useEffect, useState, useMemo } from 'react';
import useTheme from './hooks/useTheme';
import RadarSeal from './components/RadarSeal';
import Header from './components/Header';
import SearchPortal from './components/SearchPortal';
import FileRow from './components/FileRow';
import MobileFileCard from './components/MobileFileCard';
import SecurityBreach from './components/SecurityBreach';
import useIsMobile from './hooks/useIsMobile';
import UploadModal from './components/UploadModal';
import UsernamePrompt from './components/UsernamePrompt';
import { participantNames } from './data/names';
import { db, storage, auth, onAuthStateChanged } from './lib/firebase';
import useOnlineCount from './hooks/useOnlineCount';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  query,
  orderBy,
  deleteDoc,
  increment
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

import LoginScreen from './components/LoginScreen';
import EmailVerificationGate from './components/EmailVerificationGate';
import DevMenu from './components/DevMenu';
import MemeEasterEgg from './components/MemeEasterEgg';
import AdSenseAd from './components/AdSenseAd';
import ProfilePage from './components/ProfilePage';
import LeaderboardPage from './components/LeaderboardPage';
import ChatPanel from './components/ChatPanel';
import DatabasePicker from './components/DatabasePicker';
import useUnreadChatCount from './hooks/useUnreadChatCount';
import useCurrentDatabase from './hooks/useCurrentDatabase';
import { leaveCurrentDatabase } from './lib/databases';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

function LoadingScreen({ message }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
      <RadarSeal size={90} />
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 5vw, 3.5rem)', fontWeight: 700, color: 'var(--c-ac)', letterSpacing: '0.25em', textShadow: '0 0 30px var(--ac-a35)' }}>
        THE LORENZO FILES
      </div>
      <div style={{ fontSize: 10, letterSpacing: '0.3em', color: 'var(--c-tx2)', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>
        {message} <span className="cursor-blink">█</span>
      </div>
    </div>
  );
}

function ClassificationBanner() {
  const [tick, setTick] = useState(true);
  useEffect(() => { const t = setInterval(() => setTick(v => !v), 900); return () => clearInterval(t); }, []);
  return (
    <div style={{ background: 'rgba(255,45,85,0.05)', borderBottom: '1px solid rgba(255,45,85,0.15)', padding: '6px 0' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <span style={{ color: '#ff2d55', opacity: tick ? 1 : 0.3, transition: 'opacity 150ms' }}>◆</span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.28em', color: 'rgba(255,45,85,0.9)', textTransform: 'uppercase' }}>
          TOP SECRET — LORENZO EYES ONLY — CLASSIFICATION LEVEL: ULTRA — UNAUTHORIZED ACCESS IS A FEDERAL OFFENSE
        </span>
        <span style={{ color: '#ff2d55', opacity: tick ? 0.3 : 1, transition: 'opacity 150ms' }}>◆</span>
      </div>
    </div>
  );
}

const selStyle = {
  padding: '7px 32px 7px 12px', borderRadius: 3, fontSize: 9, letterSpacing: '0.12em',
  fontFamily: 'var(--font-display)', fontWeight: 500,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%235a7a9a'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
  backgroundPosition: 'right 8px center', backgroundRepeat: 'no-repeat', backgroundSize: '13px',
};

// Helper to convert stored size values to bytes for sorting
function parseSize(file) {
  if (file.sizeInBytes != null) return file.sizeInBytes;
  const str = String(file.size || '').trim().toUpperCase();
  const num = parseFloat(str);
  if (isNaN(num)) return 0;
  if (str.includes('GB')) return num * 1024 * 1024 * 1024;
  if (str.includes('MB')) return num * 1024 * 1024;
  if (str.includes('KB')) return num * 1024;
  return num; // bytes (handles "B" suffix or bare numbers)
}

export default function App() {
  const [lightMode, toggleLightMode] = useTheme();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  const [files, setFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSuspect, setSelectedSuspect] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [securityLevel, setSecurityLevel] = useState(0);
  const [breached, setBreached] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('date-desc');

  // Upload State
  const [uploading, setUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Purge State
  const [fileToPurge, setFileToPurge] = useState(null);

  // Page navigation
  const [currentPage, setCurrentPage] = useState('main'); // 'main' | 'profile' | 'leaderboard'
  const [chatOpen, setChatOpen] = useState(false);
  const chatUnreadCount = useUnreadChatCount(currentDbId, chatOpen);

  // Dev Menu State
  const [devBypassUploadLimit, setDevBypassUploadLimit] = useState(false);

  const isMobile = useIsMobile();
  const onlineCount = useOnlineCount(user?.uid);

  const currentDbId = userProfile?.currentDatabaseId || null;
  const { database: currentDatabase, membership: currentMembership, loading: dbLoading } = useCurrentDatabase(user, currentDbId);

  // Auth Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // User Profile Listener
  useEffect(() => {
    if (!user || window.MOCK_FIREBASE) {
      if (window.MOCK_FIREBASE) {
        setUserProfile({ username: 'AGENT-MOCK' });
        setProfileLoading(false);
      }
      return;
    }

    const docRef = doc(db, "users", user.uid);
    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
      } else {
        setUserProfile(null);
      }
      setProfileLoading(false);
    });
    return unsub;
  }, [user]);

  useEffect(() => {
    if (!user || !currentDbId) {
      setFiles([]);
      return;
    }

    // Listen to Firebase evidenceFiles collection scoped to the current database
    const filesCollection = collection(db, "databases", currentDbId, "evidenceFiles");
    const q = query(filesCollection, orderBy("id", "desc"));

    // MOCK FOR PLAYWRIGHT
    if (window.MOCK_FIREBASE) {
      setTimeout(() => {
        setFiles([]);
        setLoading(false);
      }, 100);
      return () => {};
    }

    setLoading(true);
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        setFiles([]);
        setLoading(false);
      } else {
        const evidenceData = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          if (data.upvotes === undefined || data.downvotes === undefined) {
            updateDoc(docSnap.ref, {
              upvotes: data.upvotes || 0,
              downvotes: data.downvotes || 0
            }).catch(console.error);
          }
          return {
            docId: docSnap.id,
            ...data
          };
        });
        setFiles(evidenceData);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [user, currentDbId]);

  const filteredFiles = useMemo(() => {
    let result = [...files];
    
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

    // Sort files
    if (sortBy === 'votes-desc') {
      result.sort((a, b) => {
        const scoreA = (a.upvotes || 0) - (a.downvotes || 0);
        const scoreB = (b.upvotes || 0) - (b.downvotes || 0);
        if (scoreB !== scoreA) return scoreB - scoreA;
        return b.id - a.id;
      });
    } else if (sortBy === 'votes-asc') {
      result.sort((a, b) => {
        const scoreA = (a.upvotes || 0) - (a.downvotes || 0);
        const scoreB = (b.upvotes || 0) - (b.downvotes || 0);
        if (scoreA !== scoreB) return scoreA - scoreB;
        return a.id - b.id;
      });
    } else if (sortBy === 'size-desc') {
      result.sort((a, b) => parseSize(b) - parseSize(a) || b.id - a.id);
    } else if (sortBy === 'size-asc') {
      result.sort((a, b) => parseSize(a) - parseSize(b) || a.id - b.id);
    } else if (sortBy === 'date-asc') {
      result.sort((a, b) => a.id - b.id);
    } else {
      // date-desc (default)
      result.sort((a, b) => b.id - a.id);
    }
    
    return result;
  }, [searchQuery, selectedSuspect, files, sortBy]);

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
    // Enforce 3 uploads per day per user
    if (user) {
      const d = new Date();
      const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const todayUploads = files.filter(f => f.uploadedById === user.uid && f.date === today);
      if (todayUploads.length >= 3 && !devBypassUploadLimit) {
        alert("SECURITY PROTOCOL VIOLATION: YOU HAVE REACHED YOUR DAILY UPLOAD LIMIT OF 3 FILES.");
        event.target.value = '';
        return;
      }
    }

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
    if (!fileToUpload || !user || !currentDbId) return;

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
      const d = new Date();
      const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

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
        sizeInBytes,
        status: "CLASSIFIED",
        redactedText: contextText, // Use user-provided context
        suspectNames: suspectNames, // Store array of suspect names
        downloadURL: downloadURL,
        uploadedById: user.uid,     // Track owner via Firebase Auth
        uploaderUsername: userProfile?.username || '', // Track uploader username
        storagePath: storagePath,   // Facilitate deletion
        upvotes: 0,
        downvotes: 0
      };

      await setDoc(doc(db, "databases", currentDbId, "evidenceFiles", newEvidence.id.toString()), newEvidence);

      await updateDoc(doc(db, "databases", currentDbId, "members", user.uid), {
        experiencePoints: increment(50)
      });
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
    if (!file || !currentDbId) return;

    const docId = file.docId || file.id.toString();
    setDeletingId(docId);

    try {
      // 1. Delete from Storage if storagePath exists
      if (file.storagePath) {
        const storageRef = ref(storage, file.storagePath);
        await deleteObject(storageRef);
      }

      // 2. Delete from Firestore
      await deleteDoc(doc(db, "databases", currentDbId, "evidenceFiles", docId));
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("CRITICAL ERROR: Failed to purge record from archive.");
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading) {
    return <LoadingScreen message="AUTHENTICATING" />;
  }

  if (!user) {
    return <LoginScreen />;
  }

  if (!user.emailVerified) {
    return <EmailVerificationGate user={user} setUser={setUser} />;
  }

  if (profileLoading) {
    return <LoadingScreen message="LOADING AGENT PROFILE" />;
  }

  if (!userProfile) {
    return <UsernamePrompt user={user} onComplete={setUserProfile} />;
  }

  if (!currentDbId) {
    return <DatabasePicker user={user} userProfile={userProfile} />;
  }

  if (dbLoading) {
    return <LoadingScreen message="ESTABLISHING SECURE CHANNEL" />;
  }

  if (!currentDatabase) {
    // Stale ref to a database that no longer exists — drop the user back to the picker.
    return <DatabasePicker user={user} userProfile={userProfile} />;
  }

  if (loading) {
    return <LoadingScreen message="ACCESSING CLOUD EVIDENCE ARCHIVE" />;
  }

  const handleSwitchDatabase = async () => {
    try {
      await leaveCurrentDatabase({ user, dbId: currentDbId });
    } catch (e) {
      console.error('Failed to leave database:', e);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent' }}>
      <Analytics />
      <SpeedInsights />

      <div className="relative z-10">
        <Header
            username={userProfile?.username}
            experiencePoints={currentMembership?.experiencePoints}
            lightMode={lightMode}
            onToggleLightMode={toggleLightMode}
            onlineCount={onlineCount}
            onShowProfile={() => setCurrentPage('profile')}
            onShowLeaderboard={() => setCurrentPage('leaderboard')}
            onShowChat={() => setChatOpen(true)}
            chatUnreadCount={chatUnreadCount}
            databaseName={currentDatabase?.name}
            joinCode={currentDatabase?.joinCode}
            onSwitchDatabase={handleSwitchDatabase}
          />

        {/* Classification Banner */}
        <ClassificationBanner />

        <main style={{ maxWidth: 1400, margin: '0 auto', padding: isMobile ? '16px 12px' : '28px 28px' }}>
          {/* Search */}
          <div style={{ marginBottom: 24 }}>
            <SearchPortal query={searchQuery} onQueryChange={setSearchQuery} />
          </div>

          {/* Controls bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14, padding: '0 2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--c-tx3)' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>
                {files.length} FILES IN ARCHIVE
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--c-tx3)' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                {filteredFiles.length} SHOWING
              </div>
              {/* Security indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.2em', color: 'var(--c-tx3)' }}>SEC:</span>
                {[1, 2, 3].map(l => (
                  <div key={l} style={{ width: 7, height: 7, borderRadius: 1, background: securityLevel >= l ? '#ff2d55' : 'rgba(0,212,255,0.12)', transition: 'all 300ms', boxShadow: securityLevel >= l ? '0 0 6px rgba(255,45,85,0.6)' : 'none' }} />
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={selStyle} title="Sort files">
                <option value="date-desc">NEWEST</option>
                <option value="date-asc">OLDEST</option>
                <option value="votes-desc">MOST UPVOTES</option>
                <option value="votes-asc">LEAST UPVOTES</option>
                <option value="size-desc">BIGGEST FILE</option>
                <option value="size-asc">SMALLEST FILE</option>
              </select>
              <select value={selectedSuspect} onChange={e => setSelectedSuspect(e.target.value)} style={{ ...selStyle, minWidth: 150 }}>
                <option value="">ALL SUSPECTS</option>
                {participantNames.map(name => <option key={name} value={name}>{name.toUpperCase()}</option>)}
              </select>
              <div>
                <input type="file" id="file-upload" style={{ display: 'none' }} onChange={handleFileSelect} disabled={uploading || showUploadModal} />
                <label htmlFor="file-upload"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '7px 14px', borderRadius: 3,
                    fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.18em',
                    background: 'var(--ac-a08)', border: '1px solid var(--ac-a28)',
                    color: 'var(--c-ac)', cursor: uploading ? 'not-allowed' : 'pointer',
                    transition: 'all 150ms', textTransform: 'uppercase', fontWeight: 600,
                    opacity: uploading || showUploadModal ? 0.5 : 1,
                  }}
                  onMouseOver={e => { if (!uploading) { e.currentTarget.style.background = 'var(--ac-a12)'; e.currentTarget.style.boxShadow = '0 0 12px var(--ac-a35)'; }}}
                  onMouseOut={e => { e.currentTarget.style.background = 'rgba(0,212,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                  </svg>
                  {uploading ? 'UPLOADING...' : 'UPLOAD U.R.D.'}
                </label>
              </div>
            </div>
          </div>

          {/* Evidence table */}
          <div className="glass-card" style={{ borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 20, right: 28, pointerEvents: 'none', fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color: 'var(--ac-a08)', transform: 'rotate(-10deg)', letterSpacing: '0.2em', zIndex: 1 }}>CLASSIFIED</div>

            {!isMobile && (
              <div className="tbl-head">
                <div>#</div>
                <div style={{ textAlign: 'center' }}>VOTES</div>
                <div>FILE NAME</div>
                <div>SUSPECT</div>
                <div>DATE / SIZE</div>
                <div>INTEL</div>
                <div style={{ textAlign: 'right' }}>ACTION</div>
              </div>
            )}

            {filteredFiles.length > 0 ? filteredFiles.flatMap((file, index) => {
              const row = isMobile ? (
                <MobileFileCard key={file.id} file={file} index={index} fileNumber={filteredFiles.length - index} onRedactedClick={handleRedactedClick} user={user} userProfile={userProfile} onDelete={handleDeleteFile} isDeleting={deletingId === (file.docId || file.id.toString())} dbId={currentDbId} />
              ) : (
                <FileRow key={file.id} file={file} index={index} fileNumber={filteredFiles.length - index} onRedactedClick={handleRedactedClick} user={user} userProfile={userProfile} onDelete={handleDeleteFile} isDeleting={deletingId === (file.docId || file.id.toString())} dbId={currentDbId} />
              );
              const showAd = (index + 1) % 5 === 0 && index + 1 < filteredFiles.length;
              return showAd ? [
                row,
                <div key={`ad-${index}`} style={{ padding: '8px 12px', background: 'rgba(0,212,255,0.02)', borderTop: '1px solid rgba(0,212,255,0.06)', borderBottom: '1px solid rgba(0,212,255,0.06)' }}>
                  <AdSenseAd adSlot="3814703645" adFormat="auto" style={{ minHeight: 90 }} />
                </div>
              ] : [row];
            }) : (
              <div style={{ padding: '64px 24px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, letterSpacing: '0.28em', color: 'var(--c-tx3)', textTransform: 'uppercase', marginBottom: 8 }}>NO MATCHING FILES FOUND</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.18em', color: 'var(--c-tx3)', opacity: 0.5 }}>ADJUST SEARCH PARAMETERS</div>
              </div>
            )}
          </div>

          {/* Footer */}
          <footer style={{ marginTop: 32, paddingBottom: 28, textAlign: 'center' }}>
            <div style={{ marginBottom: 20 }}>
              <AdSenseAd adSlot="3814703645" adFormat="auto" style={{ minHeight: 90 }} />
            </div>
            <div className="animated-border" style={{ marginBottom: 20 }} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.3em', color: 'var(--c-tx3)', textTransform: 'uppercase', marginBottom: 5 }}>
              DEPARTMENT OF LORENZO — INTELLIGENCE MANAGEMENT SYSTEM v4.2.0 // DELOS NETWORK
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 8, letterSpacing: '0.22em', color: 'var(--c-tx3)', opacity: 0.4, textTransform: 'uppercase' }}>
              UNAUTHORIZED ACCESS IS PUNISHABLE BY HAVING TO LISTEN TO LORENZO&apos;S KARAOKE
            </div>
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

      {/* Meme Easter Egg — trigger: Konami Code ↑↑↓↓←→←→BA */}
      <MemeEasterEgg />

      {currentPage === 'profile' && (
        <ProfilePage user={user} userProfile={userProfile} files={files} membership={currentMembership} database={currentDatabase} onClose={() => setCurrentPage('main')} />
      )}
      {currentPage === 'leaderboard' && (
        <LeaderboardPage user={user} files={files} dbId={currentDbId} database={currentDatabase} onClose={() => setCurrentPage('main')} />
      )}

      {chatOpen && (
        <ChatPanel
          key={currentDbId}
          user={user}
          userProfile={userProfile}
          dbId={currentDbId}
          databaseName={currentDatabase?.name}
          onClose={() => setChatOpen(false)}
        />
      )}

      {/* Developer Menu (levi.sager11@gmail.com only) */}
      <DevMenu
        user={user}
        files={files}
        onResetSecurity={() => { setSecurityLevel(0); setBreached(false); }}
        onSetSecurityLevel={(lvl) => { setSecurityLevel(lvl); if (lvl > 3) setBreached(true); else setBreached(false); }}
        onTriggerBreach={() => setBreached(true)}
        devBypassUploadLimit={devBypassUploadLimit}
        onSetDevBypassUploadLimit={setDevBypassUploadLimit}
        dbId={currentDbId}
      />

      {/* Purge Confirmation Modal */}
      {fileToPurge && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setFileToPurge(null)}>
          <div className="slide-up" onClick={e => e.stopPropagation()} style={{ background: 'rgba(8,4,6,0.95)', border: '1px solid rgba(255,45,85,0.4)', borderRadius: 4, maxWidth: 400, width: '100%', padding: 24, boxShadow: '0 0 48px rgba(255,45,85,0.15), 0 24px 80px rgba(0,0,0,0.9)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff2d55" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: '#ff2d55', letterSpacing: '0.15em' }}>CONFIRM PURGE</span>
            </div>
            <div style={{ fontSize: 11, color: '#7aa8cc', lineHeight: 1.7, marginBottom: 20, letterSpacing: '0.03em', fontFamily: 'var(--font-mono)' }}>
              Permanently purge <span style={{ color: '#ff2d55', fontWeight: 600 }}>&quot;{fileToPurge.name}&quot;</span> from the archive? This action is <strong style={{ color: '#ff2d55' }}>irreversible</strong>.
            </div>
            <div style={{ textAlign: 'center', marginBottom: 18, opacity: 0.08 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: '#ff2d55', letterSpacing: '0.3em', transform: 'rotate(-6deg)', display: 'inline-block' }}>PURGE AUTHORIZED</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setFileToPurge(null)} style={{ background: 'transparent', color: '#7aa8cc', padding: '8px 16px', borderRadius: 3, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', transition: 'color 150ms' }} onMouseOver={e => e.currentTarget.style.color = '#dceeff'} onMouseOut={e => e.currentTarget.style.color = '#7aa8cc'}>ABORT</button>
              <button onClick={confirmPurge} style={{ background: 'rgba(255,45,85,0.1)', color: '#ff2d55', border: '1px solid rgba(255,45,85,0.25)', padding: '8px 20px', borderRadius: 3, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-display)', transition: 'all 150ms' }} onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,45,85,0.18)'; e.currentTarget.style.borderColor = '#ff2d55'; }} onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,45,85,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,45,85,0.25)'; }}>EXECUTE PURGE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
