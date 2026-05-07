import { useEffect, useState } from 'react';
import { ref as dbRef, onValue } from 'firebase/database';
import { rtdb } from '../lib/firebase';

export default function usePlayerSecret(code, uid) {
    const [state, setState] = useState({
        secret: null,
        loading: Boolean(code && uid),
    });

    useEffect(() => {
        if (!code || !uid) return undefined;
        const secretRef = dbRef(rtdb, `gameSecrets/${code}/${uid}`);
        const unsub = onValue(
            secretRef,
            (snap) => setState({ secret: snap.exists() ? snap.val() : null, loading: false }),
            () => setState({ secret: null, loading: false }),
        );
        return unsub;
    }, [code, uid]);

    return state;
}
