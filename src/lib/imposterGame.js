import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    collection,
    getDocs,
    writeBatch,
    serverTimestamp,
    deleteField,
} from 'firebase/firestore';
import { db } from './firebase';
import { pickWordPair } from '../data/games/imposterWords';

const ROOM_CODE_LEN = 4;
const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1
const MAX_CODE_ATTEMPTS = 8;

function randomCode() {
    let out = '';
    for (let i = 0; i < ROOM_CODE_LEN; i += 1) {
        out += ROOM_CODE_ALPHABET[Math.floor(Math.random() * ROOM_CODE_ALPHABET.length)];
    }
    return out;
}

export const DEFAULT_SETTINGS = {
    category: 'random',
    imposterMode: 'blank',
    clueRounds: 1,
};

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export async function createRoom({ uid, username }) {
    if (!uid) throw new Error('Not signed in');
    for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
        const code = randomCode();
        const ref = doc(db, 'gameRooms', code);
        const snap = await getDoc(ref);
        if (snap.exists()) continue;
        const playerName = username || 'AGENT';
        await setDoc(ref, {
            code,
            hostUid: uid,
            hostUsername: playerName,
            status: 'lobby',
            settings: DEFAULT_SETTINGS,
            players: {
                [uid]: {
                    username: playerName,
                    joinedAt: Date.now(),
                    lastSeen: Date.now(),
                    hasVoted: false,
                },
            },
            round: null,
            publicWord: null,
            votes: {},
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return code;
    }
    throw new Error('Could not allocate room code, try again');
}

export async function joinRoom({ code, uid, username }) {
    if (!uid) throw new Error('Not signed in');
    if (!code) throw new Error('Room code required');
    const ref = doc(db, 'gameRooms', code);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Room not found');
    const data = snap.data();
    if (data.status !== 'lobby' && !data.players?.[uid]) {
        throw new Error('Round in progress, ask the host to reset');
    }
    await updateDoc(ref, {
        [`players.${uid}`]: {
            username: username || 'AGENT',
            joinedAt: data.players?.[uid]?.joinedAt || Date.now(),
            lastSeen: Date.now(),
            hasVoted: false,
        },
        updatedAt: serverTimestamp(),
    });
}

export async function leaveRoom({ code, uid }) {
    if (!uid || !code) return;
    const ref = doc(db, 'gameRooms', code);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data();
    if (data.hostUid === uid) {
        await deleteRoom(code);
        return;
    }
    await updateDoc(ref, {
        [`players.${uid}`]: deleteField(),
        [`votes.${uid}`]: deleteField(),
        updatedAt: serverTimestamp(),
    });
}

export async function deleteRoom(code) {
    if (!code) return;
    const secretsCol = collection(db, 'gameRooms', code, 'secrets');
    const secretSnap = await getDocs(secretsCol);
    const batch = writeBatch(db);
    secretSnap.docs.forEach(d => batch.delete(d.ref));
    batch.delete(doc(db, 'gameRooms', code));
    await batch.commit();
}

export async function updateSettings({ code, settings }) {
    await updateDoc(doc(db, 'gameRooms', code), {
        settings,
        updatedAt: serverTimestamp(),
    });
}

export async function heartbeat({ code, uid }) {
    if (!code || !uid) return;
    try {
        await updateDoc(doc(db, 'gameRooms', code), {
            [`players.${uid}.lastSeen`]: Date.now(),
        });
    } catch {
        // ignore — room may have been deleted
    }
}

export async function startRound({ code, room }) {
    const playerUids = Object.keys(room.players || {});
    if (playerUids.length < 3) throw new Error('Need at least 3 players');
    const settings = room.settings || DEFAULT_SETTINGS;
    const categoryId = settings.category === 'random' ? null : settings.category;
    const { word, decoyWord, categoryLabel } = pickWordPair(categoryId, settings.imposterMode);
    const imposterUid = playerUids[Math.floor(Math.random() * playerUids.length)];

    const batch = writeBatch(db);

    // Wipe stale secrets from any previous round
    const stale = await getDocs(collection(db, 'gameRooms', code, 'secrets'));
    stale.docs.forEach(d => batch.delete(d.ref));

    playerUids.forEach(uid => {
        const isImposter = uid === imposterUid;
        batch.set(doc(db, 'gameRooms', code, 'secrets', uid), {
            word: isImposter ? decoyWord : word,
            isImposter,
            createdAt: Date.now(),
        });
    });

    const playerUpdates = {};
    playerUids.forEach(uid => {
        playerUpdates[`players.${uid}.hasVoted`] = false;
    });

    const clueOrder = shuffle(playerUids);
    const rounds = Math.max(1, settings.clueRounds || 1);

    batch.update(doc(db, 'gameRooms', code), {
        ...playerUpdates,
        status: 'reveal',
        round: {
            imposterUid,
            word,
            startedAt: Date.now(),
            categoryLabel,
            clueOrder,
            totalRounds: rounds,
            currentTurnIdx: 0,
            clues: [], // append-only log of { uid, word, round, submittedAt }
        },
        publicWord: null,
        votes: {},
        updatedAt: serverTimestamp(),
    });

    await batch.commit();
    return { imposterUid, word };
}

export async function advanceToClues({ code }) {
    await updateDoc(doc(db, 'gameRooms', code), {
        status: 'clues',
        updatedAt: serverTimestamp(),
    });
}

export async function submitClue({ code, room, uid, word }) {
    const round = room.round || {};
    const order = round.clueOrder || [];
    const idx = round.currentTurnIdx ?? 0;
    if (order[idx % order.length] !== uid) throw new Error('Not your turn');
    const trimmed = (word || '').trim();
    if (!trimmed) throw new Error('Enter a clue word');
    if (trimmed.split(/\s+/).length > 2) throw new Error('One word only');
    const totalRounds = Math.max(1, round.totalRounds || 1);
    const totalClues = order.length * totalRounds;
    const roundNum = Math.floor(idx / order.length) + 1;
    const newClues = [...(round.clues || []), {
        uid,
        word: trimmed,
        round: roundNum,
        submittedAt: Date.now(),
    }];
    const nextIdx = idx + 1;
    const advance = nextIdx >= totalClues;
    await updateDoc(doc(db, 'gameRooms', code), {
        'round.clues': newClues,
        'round.currentTurnIdx': nextIdx,
        ...(advance ? { status: 'voting', votes: {} } : {}),
        updatedAt: serverTimestamp(),
    });
}

export async function advanceToVoting({ code }) {
    await updateDoc(doc(db, 'gameRooms', code), {
        status: 'voting',
        votes: {},
        updatedAt: serverTimestamp(),
    });
}

export async function castVote({ code, voterUid, votedUid }) {
    await updateDoc(doc(db, 'gameRooms', code), {
        [`votes.${voterUid}`]: votedUid,
        [`players.${voterUid}.hasVoted`]: true,
        updatedAt: serverTimestamp(),
    });
}

export async function revealResults({ code, room }) {
    await updateDoc(doc(db, 'gameRooms', code), {
        status: 'results',
        publicWord: room?.round?.word ?? null,
        updatedAt: serverTimestamp(),
    });
}

export async function resetToLobby({ code }) {
    const secretsCol = collection(db, 'gameRooms', code, 'secrets');
    const secretSnap = await getDocs(secretsCol);
    const batch = writeBatch(db);
    secretSnap.docs.forEach(d => batch.delete(d.ref));
    batch.update(doc(db, 'gameRooms', code), {
        status: 'lobby',
        round: null,
        publicWord: null,
        votes: {},
        updatedAt: serverTimestamp(),
    });
    await batch.commit();
}

export function tallyVotes(votes) {
    const counts = {};
    Object.values(votes || {}).forEach(uid => {
        if (!uid) return;
        counts[uid] = (counts[uid] || 0) + 1;
    });
    let topUid = null;
    let topCount = 0;
    let tied = false;
    Object.entries(counts).forEach(([uid, c]) => {
        if (c > topCount) {
            topUid = uid;
            topCount = c;
            tied = false;
        } else if (c === topCount && uid !== topUid) {
            tied = true;
        }
    });
    return { counts, topUid, topCount, tied };
}
