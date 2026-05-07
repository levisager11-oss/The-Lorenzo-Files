import { useCallback, useEffect, useRef, useState } from "react";
import {
    ref as dbRef,
    onChildAdded,
    onChildRemoved,
    onValue,
    push,
    remove,
    set,
    serverTimestamp,
    query,
    limitToLast,
    off,
} from "firebase/database";
import { rtdb } from "../lib/firebase";

const MESSAGE_LIMIT = 100;
const TYPING_TIMEOUT_MS = 3000;

export default function useChat(dbId, user, userProfile) {
    const [messages, setMessages] = useState([]);
    const [ready, setReady] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);

    const isTypingRef = useRef(false);
    const typingTimerRef = useRef(null);

    useEffect(() => {
        if (!rtdb || !dbId) return undefined;

        const path = `departments/${dbId}/chat`;
        const baseRef = dbRef(rtdb, path);
        const q = query(baseRef, limitToLast(MESSAGE_LIMIT));

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

    // Listen to typing indicators from other users
    useEffect(() => {
        if (!rtdb || !dbId || !user) return undefined;

        const typingRef = dbRef(rtdb, `departments/${dbId}/typing`);
        const typingHandler = onValue(typingRef, (snap) => {
            const data = snap.val() || {};
            const now = Date.now();
            const active = Object.entries(data)
                .filter(([uid, v]) =>
                    uid !== user.uid &&
                    v?.ts &&
                    typeof v.ts === "number" &&
                    now - v.ts < TYPING_TIMEOUT_MS + 2000
                )
                .map(([, v]) => v.username || "UNKNOWN")
                .filter(Boolean);
            setTypingUsers(active);
        });

        return () => off(typingRef, "value", typingHandler);
    }, [dbId, user]);

    // Remove own typing status on unmount/dbId change
    useEffect(() => {
        return () => {
            clearTimeout(typingTimerRef.current);
            if (rtdb && dbId && user) {
                remove(dbRef(rtdb, `departments/${dbId}/typing/${user.uid}`)).catch(() => {});
            }
        };
    }, [dbId, user]);

    const setTyping = useCallback(
        (isTyping) => {
            if (!rtdb || !dbId || !user) return;
            const typingUserRef = dbRef(rtdb, `departments/${dbId}/typing/${user.uid}`);

            if (isTyping) {
                // Only write to RTDB on the transition not-typing → typing
                if (!isTypingRef.current) {
                    isTypingRef.current = true;
                    set(typingUserRef, {
                        username: userProfile?.username || "",
                        ts: serverTimestamp(),
                    }).catch(() => {});
                }
                // Reset auto-clear timer on every keystroke
                clearTimeout(typingTimerRef.current);
                typingTimerRef.current = setTimeout(() => {
                    isTypingRef.current = false;
                    remove(typingUserRef).catch(() => {});
                }, TYPING_TIMEOUT_MS);
            } else {
                clearTimeout(typingTimerRef.current);
                if (isTypingRef.current) {
                    isTypingRef.current = false;
                    remove(typingUserRef).catch(() => {});
                }
            }
        },
        [dbId, user, userProfile]
    );

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

    return { messages, ready, sendMessage, deleteMessage, typingUsers, setTyping };
}
