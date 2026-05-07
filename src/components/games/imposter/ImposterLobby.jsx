import { useState } from 'react';
import { imposterCategories } from '../../../data/games/imposterWords';
import {
    DEFAULT_SETTINGS,
    leaveRoom,
    startRound,
    updateSettings,
} from '../../../lib/imposterGame';

const cardStyle = {
    background: 'var(--ac-a04)',
    border: '1px solid var(--ac-a12)',
    borderRadius: 4,
    padding: '14px 16px',
};

const labelStyle = {
    fontFamily: 'var(--font-display)',
    fontSize: 9,
    letterSpacing: '0.25em',
    color: 'var(--c-tx3)',
    textTransform: 'uppercase',
    marginBottom: 8,
    display: 'block',
};

const selectStyle = {
    background: 'var(--c-bg-input)',
    border: '1px solid var(--ac-a28)',
    color: 'var(--c-tx)',
    padding: '8px 10px',
    borderRadius: 3,
    fontFamily: 'var(--font-display)',
    fontSize: 11,
    letterSpacing: '0.12em',
    width: '100%',
    cursor: 'pointer',
};

export default function ImposterLobby({ room, code, uid }) {
    const isHost = room.hostUid === uid;
    const players = Object.entries(room.players || {});
    const settings = room.settings || DEFAULT_SETTINGS;
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');

    const updateSetting = (patch) => {
        if (!isHost) return;
        updateSettings({ code, settings: { ...settings, ...patch } }).catch((e) =>
            setErr(e.message),
        );
    };

    const handleStart = async () => {
        if (!isHost) return;
        setBusy(true);
        setErr('');
        try {
            await startRound({ code, room });
        } catch (e) {
            setErr(e.message);
        } finally {
            setBusy(false);
        }
    };

    const handleLeave = async () => {
        await leaveRoom({ code, uid });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Room code banner */}
            <div className="glass-card hud-corners" style={{ padding: '20px 24px', textAlign: 'center' }}>
                <div style={{ ...labelStyle, marginBottom: 4 }}>ROOM CODE</div>
                <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 44, fontWeight: 700,
                    color: 'var(--c-ac)', letterSpacing: '0.4em',
                    textShadow: '0 0 24px var(--ac-a35)',
                }}>
                    {code}
                </div>
                <div style={{
                    fontFamily: 'var(--font-display)', fontSize: 9,
                    letterSpacing: '0.22em', color: 'var(--c-tx3)',
                    textTransform: 'uppercase', marginTop: 6,
                }}>
                    Share this code with your operatives
                </div>
            </div>

            {/* Players */}
            <div className="glass-card" style={{ padding: '16px 18px' }}>
                <div style={{ ...labelStyle, marginBottom: 12 }}>
                    OPERATIVES — {players.length}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {players.map(([puid, p]) => {
                        const isYou = puid === uid;
                        const isThisHost = puid === room.hostUid;
                        return (
                            <div key={puid} style={{
                                ...cardStyle,
                                padding: '6px 12px',
                                display: 'flex', alignItems: 'center', gap: 8,
                                borderColor: isThisHost ? 'rgba(255,215,0,0.4)' : 'var(--ac-a12)',
                                background: isThisHost ? 'rgba(255,215,0,0.06)' : 'var(--ac-a04)',
                            }}>
                                <span style={{
                                    fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600,
                                    color: isThisHost ? '#ffd700' : 'var(--c-tx)',
                                    letterSpacing: '0.08em',
                                }}>
                                    {(p.username || 'AGENT').toUpperCase()}
                                </span>
                                {isThisHost && (
                                    <span style={{
                                        fontFamily: 'var(--font-display)', fontSize: 8,
                                        letterSpacing: '0.2em', color: '#ffd700',
                                    }}>HOST</span>
                                )}
                                {isYou && (
                                    <span style={{
                                        fontFamily: 'var(--font-display)', fontSize: 8,
                                        letterSpacing: '0.2em', color: 'var(--c-ac)',
                                    }}>YOU</span>
                                )}
                            </div>
                        );
                    })}
                </div>
                {players.length < 3 && (
                    <div style={{
                        marginTop: 12,
                        fontFamily: 'var(--font-display)', fontSize: 10,
                        letterSpacing: '0.18em', color: 'var(--c-tx3)',
                        textTransform: 'uppercase',
                    }}>
                        Need at least 3 operatives to begin
                    </div>
                )}
            </div>

            {/* Settings */}
            <div className="glass-card" style={{ padding: '16px 18px' }}>
                <div style={{ ...labelStyle, marginBottom: 12 }}>BRIEFING PARAMETERS</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                    <div>
                        <div style={labelStyle}>CATEGORY</div>
                        <select
                            value={settings.category}
                            disabled={!isHost}
                            onChange={(e) => updateSetting({ category: e.target.value })}
                            style={selectStyle}
                        >
                            <option value="random">RANDOM</option>
                            {imposterCategories.map(c => (
                                <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <div style={labelStyle}>IMPOSTER MODE</div>
                        <select
                            value={settings.imposterMode}
                            disabled={!isHost}
                            onChange={(e) => updateSetting({ imposterMode: e.target.value })}
                            style={selectStyle}
                        >
                            <option value="blank">BLANK (sees ???)</option>
                            <option value="decoy">DECOY (sees similar word)</option>
                        </select>
                    </div>
                    <div>
                        <div style={labelStyle}>CLUE ROUNDS</div>
                        <select
                            value={settings.clueRounds || 1}
                            disabled={!isHost}
                            onChange={(e) => updateSetting({ clueRounds: Number(e.target.value) })}
                            style={selectStyle}
                        >
                            <option value={1}>1 ROUND</option>
                            <option value={2}>2 ROUNDS</option>
                            <option value={3}>3 ROUNDS</option>
                        </select>
                    </div>
                </div>
                {!isHost && (
                    <div style={{
                        marginTop: 10,
                        fontFamily: 'var(--font-display)', fontSize: 9,
                        letterSpacing: '0.2em', color: 'var(--c-tx3)',
                        textTransform: 'uppercase',
                    }}>
                        Host controls the briefing
                    </div>
                )}
            </div>

            {err && (
                <div style={{
                    color: '#ff2d55',
                    fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.15em',
                }}>
                    {err}
                </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button
                    onClick={handleLeave}
                    style={{
                        background: 'rgba(255,45,85,0.1)', color: '#ff2d55',
                        border: '1px solid rgba(255,45,85,0.25)',
                        padding: '9px 16px', borderRadius: 2,
                        fontFamily: 'var(--font-display)', fontSize: 10,
                        letterSpacing: '0.18em', textTransform: 'uppercase',
                        fontWeight: 600, cursor: 'pointer',
                    }}
                >
                    {room.hostUid === uid ? 'CLOSE ROOM' : 'LEAVE'}
                </button>
                {isHost && (
                    <button
                        onClick={handleStart}
                        disabled={busy || players.length < 3}
                        style={{
                            background: 'var(--ac-a08)', color: 'var(--c-ac)',
                            border: '1px solid var(--ac-a28)',
                            padding: '9px 22px', borderRadius: 2,
                            fontFamily: 'var(--font-display)', fontSize: 10,
                            letterSpacing: '0.22em', textTransform: 'uppercase',
                            fontWeight: 700, cursor: busy || players.length < 3 ? 'not-allowed' : 'pointer',
                            opacity: busy || players.length < 3 ? 0.4 : 1,
                            transition: 'all 150ms',
                        }}
                        onMouseOver={e => {
                            if (busy || players.length < 3) return;
                            e.currentTarget.style.background = 'var(--ac-a12)';
                            e.currentTarget.style.boxShadow = '0 0 16px var(--ac-a35)';
                        }}
                        onMouseOut={e => {
                            e.currentTarget.style.background = 'var(--ac-a08)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        {busy ? 'STARTING…' : '▶ DEPLOY MISSION'}
                    </button>
                )}
            </div>
        </div>
    );
}
