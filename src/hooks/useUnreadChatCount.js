import { useEffect, useRef, useState } from "react";
import {
    ref as dbRef,
    query,
    orderByChild,
    startAt,
    onChildAdded,
    off,
} from "firebase/database";
import { rtdb } from "../lib/firebase";

export default function useUnreadChatCount(dbId, isOpen) {
    const [count, setCount] = useState(0);
    const isOpenRef = useRef(isOpen);

    useEffect(() => {
        isOpenRef.current = isOpen;
        if (isOpen) setCount(0);
    }, [isOpen]);

    useEffect(() => {
        if (!rtdb || !dbId) return undefined;

        setCount(0);
        // Subscribe only to messages arriving after this moment
        const startTime = Date.now();
        const q = query(
            dbRef(rtdb, `departments/${dbId}/chat`),
            orderByChild("createdAt"),
            startAt(startTime)
        );

        const handler = onChildAdded(q, () => {
            if (!isOpenRef.current) {
                setCount((c) => c + 1);
            }
        });

        return () => off(q, "child_added", handler);
    }, [dbId]);

    return count;
}
