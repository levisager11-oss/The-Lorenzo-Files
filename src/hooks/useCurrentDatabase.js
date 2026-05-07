import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function useCurrentDatabase(user, dbId) {
    const [database, setDatabase] = useState(null);
    const [membership, setMembership] = useState(null);
    const [loading, setLoading] = useState(!!dbId);

    useEffect(() => {
        if (!user || !dbId) return undefined;

        const dbRef = doc(db, "databases", dbId);
        const unsubDb = onSnapshot(dbRef, (snap) => {
            if (snap.exists()) {
                setDatabase({ id: snap.id, ...snap.data() });
            } else {
                setDatabase(null);
            }
            setLoading(false);
        });

        const memberRef = doc(db, "databases", dbId, "members", user.uid);
        const unsubMember = onSnapshot(memberRef, (snap) => {
            setMembership(snap.exists() ? { id: snap.id, ...snap.data() } : null);
        });

        return () => {
            unsubDb();
            unsubMember();
            setDatabase(null);
            setMembership(null);
        };
    }, [user, dbId]);

    // Reset state synchronously when there's no active dbId so callers see a
    // clean slate without needing to inspect `loading`.
    const effectiveDatabase = dbId ? database : null;
    const effectiveMembership = dbId ? membership : null;
    const effectiveLoading = dbId ? loading : false;

    return {
        database: effectiveDatabase,
        membership: effectiveMembership,
        loading: effectiveLoading,
    };
}
