import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';

const HEARTBEAT_MS = 30_000;
const STALE_MS = 90_000;

export default function useOnlineCount(uid) {
    const [onlineCount, setOnlineCount] = useState(null);

    useEffect(() => {
        if (!uid || window.MOCK_FIREBASE) return;

        const presenceRef = doc(db, 'presence', uid);

        const writePresence = () =>
            setDoc(presenceRef, { lastSeen: serverTimestamp(), uid }, { merge: true }).catch(() => {});

        writePresence();
        const heartbeat = setInterval(writePresence, HEARTBEAT_MS);

        const handleUnload = () => {
            deleteDoc(presenceRef).catch(() => {});
        };
        window.addEventListener('beforeunload', handleUnload);

        const unsub = onSnapshot(collection(db, 'presence'), (snap) => {
            const cutoff = Date.now() - STALE_MS;
            const active = snap.docs.filter((d) => {
                const ts = d.data().lastSeen;
                return ts && ts.toMillis() > cutoff;
            });
            setOnlineCount(active.length);
        });

        return () => {
            clearInterval(heartbeat);
            window.removeEventListener('beforeunload', handleUnload);
            deleteDoc(presenceRef).catch(() => {});
            unsub();
        };
    }, [uid]);

    return onlineCount;
}
