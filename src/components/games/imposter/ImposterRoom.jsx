import { useEffect } from 'react';
import useGameRoom from '../../../hooks/useGameRoom';
import { heartbeat, leaveRoom } from '../../../lib/imposterGame';
import ImposterLobby from './ImposterLobby';
import ImposterReveal from './ImposterReveal';
import ImposterClues from './ImposterClues';
import ImposterVoting from './ImposterVoting';
import ImposterResults from './ImposterResults';

const HEARTBEAT_MS = 25_000;

export default function ImposterRoom({ code, uid, onExit }) {
    const { room, loading, error } = useGameRoom(code);

    // Heartbeat presence on the room
    useEffect(() => {
        if (!code || !uid) return undefined;
        heartbeat({ code, uid });
        const t = setInterval(() => heartbeat({ code, uid }), HEARTBEAT_MS);
        const onUnload = () => leaveRoom({ code, uid }).catch(() => {});
        window.addEventListener('beforeunload', onUnload);
        return () => {
            clearInterval(t);
            window.removeEventListener('beforeunload', onUnload);
        };
    }, [code, uid]);

    if (loading) {
        return (
            <div style={{
                fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.25em',
                color: 'var(--c-tx2)', textAlign: 'center', padding: '60px 0',
                textTransform: 'uppercase',
            }}>
                CONNECTING TO ROOM…
            </div>
        );
    }

    if (error || !room) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', padding: '40px 0' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, letterSpacing: '0.2em', color: '#ff2d55', textTransform: 'uppercase' }}>
                    ROOM CLOSED
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.18em', color: 'var(--c-tx3)' }}>
                    {error || 'The host ended this session.'}
                </div>
                <button
                    onClick={onExit}
                    style={{
                        marginTop: 8,
                        background: 'transparent', color: 'var(--c-ac)',
                        border: '1px solid var(--ac-a28)',
                        padding: '9px 18px', borderRadius: 2,
                        fontFamily: 'var(--font-display)', fontSize: 10,
                        letterSpacing: '0.18em', textTransform: 'uppercase',
                        fontWeight: 600, cursor: 'pointer',
                    }}
                >
                    ← BACK TO HUB
                </button>
            </div>
        );
    }

    if (!room.players?.[uid]) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', padding: '40px 0' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, letterSpacing: '0.2em', color: '#ff2d55', textTransform: 'uppercase' }}>
                    REMOVED FROM ROOM
                </div>
                <button
                    onClick={onExit}
                    style={{
                        background: 'transparent', color: 'var(--c-ac)',
                        border: '1px solid var(--ac-a28)',
                        padding: '9px 18px', borderRadius: 2,
                        fontFamily: 'var(--font-display)', fontSize: 10,
                        letterSpacing: '0.18em', textTransform: 'uppercase',
                        fontWeight: 600, cursor: 'pointer',
                    }}
                >
                    ← BACK TO HUB
                </button>
            </div>
        );
    }

    switch (room.status) {
        case 'lobby':
            return <ImposterLobby room={room} code={code} uid={uid} onExit={onExit} />;
        case 'reveal':
            return <ImposterReveal room={room} code={code} uid={uid} />;
        case 'clues':
            return <ImposterClues room={room} code={code} uid={uid} />;
        case 'voting':
            return <ImposterVoting room={room} code={code} uid={uid} />;
        case 'results':
            return <ImposterResults room={room} code={code} uid={uid} onExit={onExit} />;
        default:
            return null;
    }
}
