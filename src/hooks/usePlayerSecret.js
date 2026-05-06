import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function usePlayerSecret(code, uid) {
    const [state, setState] = useState({
        secret: null,
        loading: Boolean(code && uid),
    });

    useEffect(() => {
        if (!code || !uid) return undefined;
        const unsub = onSnapshot(
            doc(db, 'gameRooms', code, 'secrets', uid),
            (snap) => setState({ secret: snap.exists() ? snap.data() : null, loading: false }),
            () => setState({ secret: null, loading: false }),
        );
        return unsub;
    }, [code, uid]);

    return state;
}
