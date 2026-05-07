import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { voteOnFile } from '../lib/voteOnFile';

export default function VoteButtons({ file, user, dbId }) {
    const [myVote, setMyVote] = useState(null);
    const [isVoting, setIsVoting] = useState(false);

    useEffect(() => {
        if (!user || !file.id || !dbId) return;
        const ref = doc(db, "databases", dbId, "evidenceFiles", file.docId || file.id.toString(), "voters", user.uid);
        const unsub = onSnapshot(ref, (snap) => {
            setMyVote(snap.exists() ? snap.data().vote : null);
        });
        return unsub;
    }, [file.id, file.docId, user, dbId]);

    const handleVote = async (type) => {
        if (isVoting || !user || !dbId) return;
        setIsVoting(true);
        try {
            await voteOnFile(dbId, file.docId || file.id.toString(), user.uid, type);
        } catch (error) {
            console.error("Voting failed:", error);
        } finally {
            setIsVoting(false);
        }
    };

    const score = (file.upvotes || 0) - (file.downvotes || 0);
    const scoreColor = score > 0 ? '#00d4ff' : score < 0 ? '#ff2d55' : '#7aa8cc';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, opacity: isVoting ? 0.4 : 1 }}>
            <button
                onClick={(e) => { e.stopPropagation(); handleVote('up'); }}
                disabled={isVoting}
                style={{
                    background: myVote === 'up' ? 'rgba(0,212,255,0.08)' : 'transparent',
                    color: myVote === 'up' ? '#00d4ff' : '#3d5a78',
                    padding: '2px', borderRadius: 2, border: 'none',
                    display: 'flex', alignItems: 'center', cursor: 'pointer',
                    transition: 'all 150ms',
                }}
                onMouseOver={e => { if (myVote !== 'up') e.currentTarget.style.color = '#00d4ff'; }}
                onMouseOut={e => { if (myVote !== 'up') e.currentTarget.style.color = '#3d5a78'; }}
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={myVote === 'up' ? 2.5 : 1.6} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="18 15 12 9 6 15" />
                </svg>
            </button>

            <div style={{ fontSize: 10, fontWeight: 700, minWidth: 20, textAlign: 'center', color: scoreColor, fontFamily: 'var(--font-mono)' }}>
                {score}
            </div>

            <button
                onClick={(e) => { e.stopPropagation(); handleVote('down'); }}
                disabled={isVoting}
                style={{
                    background: myVote === 'down' ? 'rgba(255,45,85,0.1)' : 'transparent',
                    color: myVote === 'down' ? '#ff2d55' : '#3d5a78',
                    padding: '2px', borderRadius: 2, border: 'none',
                    display: 'flex', alignItems: 'center', cursor: 'pointer',
                    transition: 'all 150ms',
                }}
                onMouseOver={e => { if (myVote !== 'down') e.currentTarget.style.color = '#ff2d55'; }}
                onMouseOut={e => { if (myVote !== 'down') e.currentTarget.style.color = '#3d5a78'; }}
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={myVote === 'down' ? 2.5 : 1.6} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>
        </div>
    );
}
