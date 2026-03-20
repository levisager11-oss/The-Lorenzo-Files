import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Cast or retract a vote atomically.
 * @param {string} fileId   - Firestore document ID
 * @param {string} uid      - Firebase Auth user UID
 * @param {"up"|"down"} newVote
 * @returns {Promise<"added"|"changed"|"removed">}
 */
export async function voteOnFile(fileId, uid, newVote) {
    const fileRef  = doc(db, "evidenceFiles", fileId);
    const voterRef = doc(db, "evidenceFiles", fileId, "voters", uid);

    return runTransaction(db, async (tx) => {
        const voterSnap = await tx.get(voterRef);
        const fileSnap  = await tx.get(fileRef);

        if (!fileSnap.exists()) throw new Error("File not found");

        const existing = voterSnap.exists() ? voterSnap.data().vote : null;

        // --- Retract same vote (toggle off) ---
        if (existing === newVote) {
            tx.delete(voterRef);
            tx.update(fileRef, {
                [newVote === "up" ? "upvotes" : "downvotes"]: 
                    Math.max(0, (fileSnap.data()[newVote === "up" ? "upvotes" : "downvotes"] || 0) - 1)
            });
            return "removed";
        }

        // --- Switch vote ---
        if (existing !== null) {
            const oldField = existing === "up" ? "upvotes" : "downvotes";
            const newField = newVote  === "up" ? "upvotes" : "downvotes";
            tx.set(voterRef, { vote: newVote, timestamp: serverTimestamp() });
            tx.update(fileRef, {
                [oldField]: Math.max(0, (fileSnap.data()[oldField] || 0) - 1),
                [newField]: (fileSnap.data()[newField] || 0) + 1,
            });
            return "changed";
        }

        // --- Fresh vote ---
        tx.set(voterRef, { vote: newVote, timestamp: serverTimestamp() });
        tx.update(fileRef, {
            [newVote === "up" ? "upvotes" : "downvotes"]: 
                (fileSnap.data()[newVote === "up" ? "upvotes" : "downvotes"] || 0) + 1
        });
        return "added";
    });
}
