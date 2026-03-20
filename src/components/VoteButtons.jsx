import { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, runTransaction } from 'firebase/firestore';

export default function VoteButtons({ fileId, initialUpvotes = 0, initialDownvotes = 0 }) {
  const [userVote, setUserVote] = useState(0);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    const savedVote = localStorage.getItem(`lolo_vote_${fileId}`);
    if (savedVote) {
      setUserVote(parseInt(savedVote, 10));
    }
  }, [fileId]);

  const handleVote = async (type) => {
    if (isVoting) return;
    setIsVoting(true);

    const isToggleOff = userVote === type;
    const newVote = isToggleOff ? 0 : type;

    try {
      const fileRef = doc(db, "evidenceFiles", fileId.toString());

      await runTransaction(db, async (transaction) => {
        const fileDoc = await transaction.get(fileRef);
        if (!fileDoc.exists()) {
          throw new Error("Document does not exist!");
        }

        const data = fileDoc.data();
        let upvotes = data.upvotes || 0;
        let downvotes = data.downvotes || 0;

        // Revert previous vote if any
        if (userVote === 1) upvotes -= 1;
        if (userVote === -1) downvotes -= 1;

        // Apply new vote
        if (newVote === 1) upvotes += 1;
        if (newVote === -1) downvotes += 1;

        transaction.update(fileRef, { upvotes, downvotes });
      });

      // Transaction successful, update local state
      setUserVote(newVote);
      if (newVote === 0) {
        localStorage.removeItem(`lolo_vote_${fileId}`);
      } else {
        localStorage.setItem(`lolo_vote_${fileId}`, newVote.toString());
      }
    } catch (error) {
      console.error("Voting failed: ", error);
    } finally {
      setIsVoting(false);
    }
  };

  const score = initialUpvotes - initialDownvotes;
  
  let scoreColor = 'text-slate-500';
  if (score > 0) scoreColor = 'text-doj-gold';
  else if (score < 0) scoreColor = 'text-red-500';

  return (
    <div className="flex flex-col items-center justify-center gap-0.5" onClick={(e) => e.stopPropagation()}>
      <motion.button
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => handleVote(1)}
        disabled={isVoting}
        className={`p-1 rounded transition-colors ${userVote === 1 ? 'text-doj-gold' : 'text-slate-500 hover:text-slate-300'} disabled:opacity-50`}
        title="Upvote"
      >
        <ChevronUp className="w-4 h-4" />
      </motion.button>
      
      <span className={`text-[10px] font-mono font-bold leading-none ${scoreColor}`}>
        {score}
      </span>
      
      <motion.button
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => handleVote(-1)}
        disabled={isVoting}
        className={`p-1 rounded transition-colors ${userVote === -1 ? 'text-doj-gold' : 'text-slate-500 hover:text-slate-300'} disabled:opacity-50`}
        title="Downvote"
      >
        <ChevronDown className="w-4 h-4" />
      </motion.button>
    </div>
  );
}
