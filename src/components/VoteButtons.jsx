import { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { voteOnFile } from '../lib/voteOnFile';

export default function VoteButtons({ file, user }) {
    const [myVote, setMyVote] = useState(null);
    const [isVoting, setIsVoting] = useState(false);

    // Sync myVote from Firestore
    useEffect(() => {
        if (!user || !file.id) return;
        const ref = doc(db, "evidenceFiles", file.docId || file.id.toString(), "voters", user.uid);
        const unsub = onSnapshot(ref, (snap) => {
            setMyVote(snap.exists() ? snap.data().vote : null);
        });
        return unsub;
    }, [file.id, file.docId, user]);

    const handleVote = async (type) => {
        if (isVoting || !user) return;
        setIsVoting(true);
        try {
            await voteOnFile(file.docId || file.id.toString(), user.uid, type);
        } catch (error) {
            console.error("Voting failed:", error);
            // Re-throw or show alert depending on strictness
        } finally {
            setIsVoting(false);
        }
    };

    const upvotes = file.upvotes || 0;
    const downvotes = file.downvotes || 0;
    const score = upvotes - downvotes;

    // Determine color of the score
    let scoreColor = 'text-slate-500';
    if (score > 0) scoreColor = 'text-doj-gold';
    if (score < 0) scoreColor = 'text-red-500';

    return (
        <div className={`flex flex-col items-center justify-center gap-1 ${isVoting ? 'opacity-40 cursor-not-allowed' : ''}`}>
            <motion.button
                whileHover={!isVoting ? { scale: 1.2 } : {}}
                whileTap={!isVoting ? { scale: 0.9 } : {}}
                onClick={(e) => { e.stopPropagation(); handleVote('up'); }}
                disabled={isVoting}
                className={`p-1 rounded transition-colors ${
                    myVote === 'up' 
                        ? 'text-doj-gold bg-doj-gold/10 shadow-[0_0_10px_rgba(245,158,11,0.2)]' 
                        : 'text-slate-500 hover:text-doj-gold hover:bg-slate-800'
                }`}
            >
                <ChevronUp className="w-5 h-5" strokeWidth={myVote === 'up' ? 3 : 2} />
            </motion.button>
            
            <div className={`font-mono text-xs font-bold w-8 text-center flex items-center justify-center ${scoreColor}`}>
                {isVoting ? <Loader2 className="w-3 h-3 animate-spin text-slate-400" /> : score}
            </div>

            <motion.button
                whileHover={!isVoting ? { scale: 1.2 } : {}}
                whileTap={!isVoting ? { scale: 0.9 } : {}}
                onClick={(e) => { e.stopPropagation(); handleVote('down'); }}
                disabled={isVoting}
                className={`p-1 rounded transition-colors ${
                    myVote === 'down' 
                        ? 'text-red-500 bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.2)]' 
                        : 'text-slate-500 hover:text-red-500 hover:bg-slate-800'
                }`}
            >
                <ChevronDown className="w-5 h-5" strokeWidth={myVote === 'down' ? 3 : 2} />
            </motion.button>
        </div>
    );
}
