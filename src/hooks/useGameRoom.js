import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function useGameRoom(code) {
    const [state, setState] = useState({
        room: null,
        loading: Boolean(code),
        error: null,
    });

    useEffect(() => {
        if (!code) return undefined;
        const unsub = onSnapshot(
            doc(db, 'gameRooms', code),
            (snap) => {
                if (!snap.exists()) {
                    setState({ room: null, loading: false, error: 'Room no longer exists' });
                } else {
                    setState({ room: { id: snap.id, ...snap.data() }, loading: false, error: null });
                }
            },
            (err) => setState({ room: null, loading: false, error: err.message }),
        );
        return unsub;
    }, [code]);

    return state;
}
