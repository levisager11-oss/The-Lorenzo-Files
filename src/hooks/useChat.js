import { useEffect, useRef, useState } from "react";
import {
    ref as dbRef,
    onChildAdded,
    onChildRemoved,
    push,
    remove,
    serverTimestamp,
    query,
    limitToLast,
    off,
} from "firebase/database";
import { rtdb } from "../lib/firebase";

const MESSAGE_LIMIT = 100;

export default function useChat(dbId, user, userProfile) {
    const [messages, setMessages] = useState([]);
    const [ready, setReady] = useState(false);
    const messagesRef = useRef(null);

    useEffect(() => {
        if (!rtdb || !dbId) return undefined;

        const path = `departments/${dbId}/chat`;
        const baseRef = dbRef(rtdb, path);
        messagesRef.current = baseRef;
        const q = query(baseRef, limitToLast(MESSAGE_LIMIT));

        // Use onChildAdded so we can append messages efficiently as they arrive
        const localMessages = [];
        const addedHandler = onChildAdded(q, (snap) => {
            localMessages.push({ id: snap.key, ...snap.val() });
            setMessages([...localMessages].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)));
            setReady(true);
        });
        const removedHandler = onChildRemoved(q, (snap) => {
            const idx = localMessages.findIndex((m) => m.id === snap.key);
            if (idx !== -1) localMessages.splice(idx, 1);
            setMessages([...localMessages]);
        });

        // RTDB doesn't fire any event when the path is empty, so flag ready after a brief delay
        const t = setTimeout(() => setReady(true), 600);

        return () => {
            clearTimeout(t);
            off(q, "child_added", addedHandler);
            off(q, "child_removed", removedHandler);
        };
    }, [dbId]);

    const sendMessage = async (text) => {
        if (!rtdb || !dbId || !user) throw new Error("not-connected");
        const trimmed = String(text || "").trim();
        if (!trimmed) return;
        if (trimmed.length > 500) throw new Error("too-long");

        await push(dbRef(rtdb, `departments/${dbId}/chat`), {
            text: trimmed,
            authorId: user.uid,
            authorUsername: userProfile?.username || "",
            createdAt: serverTimestamp(),
        });
    };

    const deleteMessage = async (msgId) => {
        if (!rtdb || !dbId) return;
        await remove(dbRef(rtdb, `departments/${dbId}/chat/${msgId}`));
    };

    return { messages, ready, sendMessage, deleteMessage };
}
