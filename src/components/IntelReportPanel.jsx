import { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import { Trash2, Loader2, ChevronUp } from 'lucide-react';
import { db } from '../lib/firebase';
import {
    collection,
    collectionGroup,
    onSnapshot,
    doc,
    setDoc,
    deleteDoc,
    query,
    orderBy,
    where,
    getDocs,
    increment,
    updateDoc
} from 'firebase/firestore';
import { voteOnComment } from '../lib/voteOnComment';

function CommentVoteButton({ dbId, fileId, report, user }) {
    const [myVote, setMyVote] = useState(null);
    const [isVoting, setIsVoting] = useState(false);

    useEffect(() => {
        if (!user || !fileId || !report.id || !dbId) return;
        const ref = doc(db, "databases", dbId, "evidenceFiles", fileId, "intelReports", report.id, "voters", user.uid);
        const unsub = onSnapshot(ref, (snap) => {
            setMyVote(snap.exists() ? snap.data().vote : null);
        });
        return unsub;
    }, [dbId, fileId, report.id, user]);

    const handleVote = async (type) => {
        if (isVoting || !user || !dbId) return;
        setIsVoting(true);
        try { await voteOnComment(dbId, fileId, report.id, user.uid, type); }
        catch (error) { console.error("Voting failed:", error); }
        finally { setIsVoting(false); }
    };

    const upvotes = report.upvotes || 0;
    const hasVoted = myVote === 'up';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, opacity: isVoting ? 0.4 : 1 }}>
            <motion.button
                whileHover={!isVoting ? { scale: 1.2 } : {}}
                whileTap={!isVoting ? { scale: 0.9 } : {}}
                onClick={(e) => { e.stopPropagation(); handleVote('up'); }}
                disabled={isVoting}
                style={{
                    padding: 4, borderRadius: 4, border: 'none', cursor: isVoting ? 'not-allowed' : 'pointer',
                    background: hasVoted ? 'var(--ac-a08)' : 'transparent',
                    color: hasVoted ? 'var(--c-ac)' : 'var(--c-tx3)',
                    transition: 'all 150ms', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: hasVoted ? '0 0 10px var(--ac-a12)' : 'none',
                }}
            >
                <ChevronUp style={{ width: 16, height: 16 }} strokeWidth={hasVoted ? 3 : 2} />
            </motion.button>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, width: 24, textAlign: 'center', color: hasVoted ? 'var(--c-ac)' : 'var(--c-tx3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isVoting ? <Loader2 style={{ width: 10, height: 10, animation: 'spin 1s linear infinite' }} /> : upvotes}
            </div>
        </div>
    );
}

function getCallsign(authorUsername, authorEmail, authorId) {
    if (authorUsername) return authorUsername.toUpperCase();
    if (authorEmail) return 'AGENT-' + authorEmail.split('@')[0].toUpperCase().replace(/\./g, '-');
    return 'AGENT-' + authorId.slice(0, 6).toUpperCase();
}

function formatTimestamp(ts) {
    const d = new Date(ts);
    const yyyy = d.getFullYear();
    const MM = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const HH = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}-${MM}-${dd} ${HH}:${mm}`;
}

export default function IntelReportPanel({ file, user, userProfile, dbId }) {
    const [reports, setReports] = useState([]);
    const [text, setText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fileDocId = file.docId || file.id.toString();

    useEffect(() => {
        if (!dbId) return;
        const reportsRef = collection(db, "databases", dbId, "evidenceFiles", fileDocId, "intelReports");
        const q = query(reportsRef, orderBy("createdAt", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [dbId, fileDocId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = text.trim();
        if (!trimmed) return;

        setSubmitting(true);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfDay = today.getTime();

        if (!dbId) { setSubmitting(false); return; }

        try {
            const reportsGroupRef = collectionGroup(db, 'intelReports');
            const dailyQ = query(reportsGroupRef, where("authorId", "==", user.uid), where("createdAt", ">=", startOfDay));
            const dailySnap = await getDocs(dailyQ);
            if (dailySnap.size >= 5) {
                alert("SECURITY PROTOCOL VIOLATION: YOU HAVE REACHED YOUR DAILY INTEL REPORT LIMIT (5).");
                setSubmitting(false);
                return;
            }
        } catch (err) {
            console.error("Failed to check daily limit:", err);
            const todayStr = new Date().toDateString();
            const todaysReports = reports.filter(r => r.authorId === user.uid && new Date(r.createdAt).toDateString() === todayStr);
            if (todaysReports.length >= 5) {
                alert("SECURITY PROTOCOL VIOLATION: YOU HAVE REACHED YOUR DAILY INTEL REPORT LIMIT (5) FOR THIS FILE.");
                setSubmitting(false);
                return;
            }
        }

        try {
            const reportId = Date.now().toString();
            await setDoc(doc(db, "databases", dbId, "evidenceFiles", fileDocId, "intelReports", reportId), {
                id: reportId, text: trimmed,
                authorId: user.uid, authorEmail: user.email || "",
                authorUsername: userProfile?.username || "",
                createdAt: Date.now(), upvotes: 0,
            });
            await updateDoc(doc(db, "databases", dbId, "evidenceFiles", fileDocId), { commentCount: increment(1) });
            setText("");
        } catch (err) {
            console.error("Failed to submit report:", err);
            alert("Error submitting intel report.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (reportId) => {
        if (!dbId) return;
        try {
            await deleteDoc(doc(db, "databases", dbId, "evidenceFiles", fileDocId, "intelReports", reportId));
            await updateDoc(doc(db, "databases", dbId, "evidenceFiles", fileDocId), { commentCount: increment(-1) });
        } catch (err) {
            console.error("Failed to delete report:", err);
            alert("Error deleting intel report.");
        }
    };

    return (
        <div className="intel-panel" style={{ padding: 16 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ marginBottom: 14 }}>
                <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--c-tx3)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    ▸ INTEL REPORTS [{reports.length}]
                </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                <AnimatePresence>
                    {reports.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--c-tx3)', padding: '6px 0' }}
                        >
                            NO INTEL REPORTS ON FILE
                        </motion.div>
                    ) : (
                        reports.map(report => (
                            <motion.div
                                key={report.id}
                                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                style={{
                                    display: 'flex', gap: 10,
                                    border: '1px solid var(--ac-a12)',
                                    borderLeft: '2px solid var(--ac-a28)',
                                    borderRadius: 4,
                                    background: 'var(--ac-a03)',
                                    padding: 12, position: 'relative',
                                }}
                            >
                                <div style={{ flexShrink: 0 }}>
                                    <CommentVoteButton dbId={dbId} fileId={fileDocId} report={report} user={user} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--c-ac)', letterSpacing: '0.1em', fontWeight: 600 }}>
                                                {getCallsign(report.authorUsername, report.authorEmail, report.authorId)}
                                            </span>
                                            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--c-tx3)', flexShrink: 0 }}>
                                                {formatTimestamp(report.createdAt)}
                                            </span>
                                        </div>
                                        {report.authorId === user.uid && (
                                            <button
                                                onClick={() => handleDelete(report.id)}
                                                style={{ background: 'transparent', border: 'none', color: 'var(--c-tx3)', padding: 4, cursor: 'pointer', transition: 'color 150ms', display: 'flex' }}
                                                title="Delete Report"
                                                onMouseOver={e => e.currentTarget.style.color = '#ff2d55'}
                                                onMouseOut={e => e.currentTarget.style.color = 'var(--c-tx3)'}
                                            >
                                                <Trash2 style={{ width: 14, height: 14 }} />
                                            </button>
                                        )}
                                    </div>
                                    <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--c-tx)', fontSize: 13, whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6 }}>
                                        {report.text}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Compose Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    maxLength={280}
                    placeholder="SUBMIT INTEL REPORT..."
                    style={{
                        width: '100%', padding: '10px 12px', borderRadius: 3,
                        fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--c-tx)',
                        resize: 'vertical', minHeight: 80, lineHeight: 1.6,
                        boxSizing: 'border-box',
                    }}
                />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--c-tx3)' }}>{text.length}/280</span>
                    <button
                        type="submit"
                        disabled={!text.trim() || submitting}
                        style={{
                            padding: '6px 16px', borderRadius: 3,
                            background: 'var(--ac-a08)', border: '1px solid var(--ac-a12)',
                            color: 'var(--c-tx2)', fontFamily: 'var(--font-mono)', fontSize: 11,
                            cursor: !text.trim() || submitting ? 'not-allowed' : 'pointer',
                            opacity: !text.trim() || submitting ? 0.5 : 1,
                            transition: 'all 150ms', display: 'flex', alignItems: 'center', gap: 6,
                            letterSpacing: '0.08em', textTransform: 'uppercase',
                        }}
                        onMouseOver={e => { if (text.trim() && !submitting) { e.currentTarget.style.borderColor = 'var(--c-ac)'; e.currentTarget.style.color = 'var(--c-ac)'; }}}
                        onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--ac-a12)'; e.currentTarget.style.color = 'var(--c-tx2)'; }}
                    >
                        {submitting && <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />}
                        TRANSMIT REPORT
                    </button>
                </div>
            </form>
        </div>
    );
}
