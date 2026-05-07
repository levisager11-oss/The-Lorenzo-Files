import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    serverTimestamp,
    runTransaction,
    setDoc,
    updateDoc,
    deleteDoc,
    increment,
    limit,
} from "firebase/firestore";
import { db } from "./firebase";

const CODE_LEN = 4;
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1
const MAX_CODE_ATTEMPTS = 8;

export function generateJoinCode() {
    let out = "";
    for (let i = 0; i < CODE_LEN; i += 1) {
        out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
    }
    return out;
}

export function normalizeCode(raw) {
    return String(raw || "").trim().toUpperCase();
}

async function findDatabaseByCode(code) {
    const q = query(collection(db, "databases"), where("joinCode", "==", code), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() };
}

export async function getDatabaseById(dbId) {
    const ref = doc(db, "databases", dbId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
}

export async function createDatabase({ user, userProfile, name }) {
    const trimmed = String(name || "").trim();
    if (trimmed.length < 3 || trimmed.length > 40) {
        throw new Error("invalid-name");
    }

    let code = null;
    for (let i = 0; i < MAX_CODE_ATTEMPTS; i += 1) {
        const candidate = generateJoinCode();
        const existing = await findDatabaseByCode(candidate);
        if (!existing) { code = candidate; break; }
    }
    if (!code) throw new Error("could-not-generate-code");

    const dbRef = doc(collection(db, "databases"));
    const dbId = dbRef.id;

    await runTransaction(db, async (tx) => {
        tx.set(dbRef, {
            name: trimmed,
            ownerId: user.uid,
            joinCode: code,
            createdAt: serverTimestamp(),
            memberCount: 1,
        });
        tx.set(doc(db, "databases", dbId, "members", user.uid), {
            uid: user.uid,
            username: userProfile?.username || "",
            joinedAt: serverTimestamp(),
            experiencePoints: 0,
        });
        tx.set(doc(db, "users", user.uid), { currentDatabaseId: dbId }, { merge: true });
    });

    return { id: dbId, joinCode: code, name: trimmed };
}

export async function joinDatabase({ user, userProfile, code }) {
    const normalized = normalizeCode(code);
    if (normalized.length < 3) throw new Error("invalid-code");

    const target = await findDatabaseByCode(normalized);
    if (!target) throw new Error("not-found");

    const memberRef = doc(db, "databases", target.id, "members", user.uid);
    const memberSnap = await getDoc(memberRef);
    const isNewMember = !memberSnap.exists();

    if (isNewMember) {
        await setDoc(memberRef, {
            uid: user.uid,
            username: userProfile?.username || "",
            joinedAt: serverTimestamp(),
            experiencePoints: 0,
        });
        await updateDoc(doc(db, "databases", target.id), {
            memberCount: increment(1),
        }).catch(() => { /* non-fatal */ });
    }

    await setDoc(doc(db, "users", user.uid), { currentDatabaseId: target.id }, { merge: true });

    return target;
}

export async function leaveCurrentDatabase({ user, dbId }) {
    if (!dbId) return;
    const memberRef = doc(db, "databases", dbId, "members", user.uid);
    const memberSnap = await getDoc(memberRef);
    if (memberSnap.exists()) {
        await deleteDoc(memberRef);
        await updateDoc(doc(db, "databases", dbId), {
            memberCount: increment(-1),
        }).catch(() => { /* non-fatal */ });
    }
    await setDoc(doc(db, "users", user.uid), { currentDatabaseId: null }, { merge: true });
}
