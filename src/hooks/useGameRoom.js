import { useEffect, useState } from 'react';
import { ref as dbRef, onValue } from 'firebase/database';
import { rtdb } from '../lib/firebase';

export default function useGameRoom(code) {
    const [state, setState] = useState({
        room: null,
        loading: Boolean(code),
        error: null,
    });

    useEffect(() => {
        if (!code) return undefined;
        const roomRef = dbRef(rtdb, `gameRooms/${code}`);
        const unsub = onValue(
            roomRef,
            (snap) => {
                if (!snap.exists()) {
                    setState({ room: null, loading: false, error: 'Room no longer exists' });
                } else {
                    setState({ room: { id: code, ...snap.val() }, loading: false, error: null });
                }
            },
            (err) => setState({ room: null, loading: false, error: err.message }),
        );
        return unsub;
    }, [code]);

    return state;
}
