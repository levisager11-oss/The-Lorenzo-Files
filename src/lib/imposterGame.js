import {
    ref as dbRef,
    get,
    set,
    update,
    remove,
    serverTimestamp,
    onDisconnect,
} from 'firebase/database';
import { rtdb } from './firebase';
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

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function requireRtdb() {
    if (!rtdb) throw new Error('Firebase Realtime Database is not configured. Add VITE_FIREBASE_DATABASE_URL to your .env.local file.');
    return rtdb;
}

export const DEFAULT_SETTINGS = {
    category: 'random',
    imposterMode: 'blank',
    clueRounds: 1,
};

function attachPresence(code, uid) {
    const db = requireRtdb();
    const playerRef = dbRef(db, `gameRooms/${code}/players/${uid}`);
    onDisconnect(playerRef).remove();
}

export async function createRoom({ uid, username }) {
    if (!uid) throw new Error('Not signed in');
    for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
        const code = randomCode();
        const roomRef = dbRef(requireRtdb(), `gameRooms/${code}`);
        const snap = await get(roomRef);
        if (snap.exists()) continue;
        const playerName = username || 'AGENT';
        await set(roomRef, {
            code,
            hostUid: uid,
            hostUsername: playerName,
            status: 'lobby',
            settings: DEFAULT_SETTINGS,
            players: {
                [uid]: {
                    username: playerName,
                    joinedAt: serverTimestamp(),
                    lastSeen: serverTimestamp(),
                    hasVoted: false,
                },
            },
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        attachPresence(code, uid);
        return code;
    }
    throw new Error('Could not allocate room code, try again');
}

export async function joinRoom({ code, uid, username }) {
    if (!uid) throw new Error('Not signed in');
    if (!code) throw new Error('Room code required');
    const roomRef = dbRef(requireRtdb(), `gameRooms/${code}`);
    const snap = await get(roomRef);
    if (!snap.exists()) throw new Error('Room not found');
    const data = snap.val();
    const existing = data.players?.[uid];
    if (data.status !== 'lobby' && !existing) {
        throw new Error('Round in progress, ask the host to reset');
    }
    const playerName = username || 'AGENT';
    await set(dbRef(requireRtdb(), `gameRooms/${code}/players/${uid}`), {
        username: playerName,
        joinedAt: existing?.joinedAt || serverTimestamp(),
        lastSeen: serverTimestamp(),
        hasVoted: false,
    });
    await set(dbRef(requireRtdb(), `gameRooms/${code}/updatedAt`), serverTimestamp());
    attachPresence(code, uid);
}

export async function leaveRoom({ code, uid }) {
    if (!uid || !code) return;
    const roomRef = dbRef(requireRtdb(), `gameRooms/${code}`);
    const snap = await get(roomRef);
    if (!snap.exists()) return;
    const data = snap.val();
    if (data.hostUid === uid) {
        await deleteRoom(code);
        return;
    }
    await update(dbRef(requireRtdb(), `gameRooms/${code}`), {
        [`players/${uid}`]: null,
        [`votes/${uid}`]: null,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteRoom(code) {
    if (!code) return;
    await Promise.all([
        remove(dbRef(requireRtdb(), `gameRooms/${code}`)),
        remove(dbRef(requireRtdb(), `gameSecrets/${code}`)),
    ]);
}

export async function updateSettings({ code, settings }) {
    await update(dbRef(requireRtdb(), `gameRooms/${code}`), {
        settings,
        updatedAt: serverTimestamp(),
    });
}

export async function heartbeat({ code, uid }) {
    if (!code || !uid) return;
    try {
        await set(dbRef(requireRtdb(), `gameRooms/${code}/players/${uid}/lastSeen`), serverTimestamp());
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
    const clueOrder = shuffle(playerUids);
    const rounds = Math.max(1, settings.clueRounds || 1);

    const updates = {};

    // Wipe any previous secrets for this room and write fresh per-player ones
    updates[`gameSecrets/${code}`] = null;
    playerUids.forEach((puid) => {
        const isImposter = puid === imposterUid;
        updates[`gameSecrets/${code}/${puid}`] = {
            word: isImposter ? decoyWord : word,
            isImposter,
            createdAt: serverTimestamp(),
        };
    });

    playerUids.forEach((puid) => {
        updates[`gameRooms/${code}/players/${puid}/hasVoted`] = false;
    });

    updates[`gameRooms/${code}/status`] = 'reveal';
    updates[`gameRooms/${code}/round`] = {
        imposterUid,
        word,
        startedAt: serverTimestamp(),
        categoryLabel,
        clueOrder,
        totalRounds: rounds,
        currentTurnIdx: 0,
    };
    updates[`gameRooms/${code}/publicWord`] = null;
    updates[`gameRooms/${code}/votes`] = null;
    updates[`gameRooms/${code}/updatedAt`] = serverTimestamp();

    await update(dbRef(requireRtdb()), updates);

    return { imposterUid, word };
}

export async function advanceToClues({ code }) {
    await update(dbRef(requireRtdb(), `gameRooms/${code}`), {
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
    const nextIdx = idx + 1;
    const advance = nextIdx >= totalClues;

    const updates = {
        [`gameRooms/${code}/round/clues/${idx}`]: {
            uid,
            word: trimmed,
            round: roundNum,
            submittedAt: serverTimestamp(),
        },
        [`gameRooms/${code}/round/currentTurnIdx`]: nextIdx,
        [`gameRooms/${code}/updatedAt`]: serverTimestamp(),
    };
    if (advance) {
        updates[`gameRooms/${code}/status`] = 'voting';
        updates[`gameRooms/${code}/votes`] = null;
    }

    await update(dbRef(requireRtdb()), updates);
}

export async function advanceToVoting({ code }) {
    await update(dbRef(requireRtdb(), `gameRooms/${code}`), {
        status: 'voting',
        votes: null,
        updatedAt: serverTimestamp(),
    });
}

export async function castVote({ code, voterUid, votedUid }) {
    await update(dbRef(requireRtdb(), `gameRooms/${code}`), {
        [`votes/${voterUid}`]: votedUid,
        [`players/${voterUid}/hasVoted`]: true,
        updatedAt: serverTimestamp(),
    });
}

export async function revealResults({ code, room }) {
    await update(dbRef(requireRtdb(), `gameRooms/${code}`), {
        status: 'results',
        publicWord: room?.round?.word ?? null,
        updatedAt: serverTimestamp(),
    });
}

export async function resetToLobby({ code }) {
    await remove(dbRef(requireRtdb(), `gameSecrets/${code}`));
    await update(dbRef(requireRtdb(), `gameRooms/${code}`), {
        status: 'lobby',
        round: null,
        publicWord: null,
        votes: null,
        updatedAt: serverTimestamp(),
    });
}

export function tallyVotes(votes) {
    const counts = {};
    Object.values(votes || {}).forEach((uid) => {
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
