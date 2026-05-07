import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Cast or retract a vote on a comment atomically.
 * @param {string} fileId   - Firestore document ID
 * @param {string} reportId - Firestore comment ID
 * @param {string} uid      - Firebase Auth user UID
 * @param {"up"} newVote
 * @returns {Promise<"added"|"changed"|"removed">}
 */
export async function voteOnComment(fileId, reportId, uid, newVote) {
    const fileRef  = doc(db, "evidenceFiles", fileId, "intelReports", reportId);
    const voterRef = doc(db, "evidenceFiles", fileId, "intelReports", reportId, "voters", uid);

    return runTransaction(db, async (tx) => {
        const voterSnap = await tx.get(voterRef);
        const fileSnap  = await tx.get(fileRef);

        if (!fileSnap.exists()) throw new Error("Comment not found");

        const existing = voterSnap.exists() ? voterSnap.data().vote : null;

        // --- Retract same vote (toggle off) ---
        if (existing === newVote) {
            tx.delete(voterRef);
            tx.update(fileRef, {
                upvotes: Math.max(0, (fileSnap.data().upvotes || 0) - 1)
            });
            return "removed";
        }

        // --- Fresh vote ---
        tx.set(voterRef, { vote: newVote, timestamp: serverTimestamp() });
        tx.update(fileRef, {
            upvotes: (fileSnap.data().upvotes || 0) + 1
        });
        return "added";
    });
}
