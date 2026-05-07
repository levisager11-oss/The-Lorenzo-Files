import { useEffect, useRef, useState } from 'react';
import { Trash2, Loader2, Send } from 'lucide-react';
import useIsMobile from '../hooks/useIsMobile';
import useChat from '../hooks/useChat';

function getCallsign(authorUsername, authorId) {
    if (authorUsername) return authorUsername.toUpperCase();
    return 'AGENT-' + (authorId || '').slice(0, 6).toUpperCase();
}

function formatTime(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    const HH = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${HH}:${mm}`;
}

export default function ChatPanel({ user, userProfile, dbId, databaseName, onClose }) {
    const isMobile = useIsMobile();
    const { messages, ready, sendMessage, deleteMessage } = useChat(dbId, user, userProfile);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const scrollRef = useRef(null);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = text.trim();
        if (!trimmed || sending) return;
        setSending(true);
        setError('');
        try {
            await sendMessage(trimmed);
            setText('');
        } catch (err) {
            console.error('Chat send failed:', err);
            setError(err.message === 'too-long' ? 'MESSAGE TOO LONG (MAX 500).' : 'TRANSMISSION FAILED.');
        } finally {
            setSending(false);
        }
    };

    const handleDelete = async (msgId) => {
        try {
            await deleteMessage(msgId);
        } catch (err) {
            console.error('Chat delete failed:', err);
        }
    };

    const wrapperStyle = isMobile
        ? { position: 'fixed', inset: 0, zIndex: 85, display: 'flex', flexDirection: 'column' }
        : {
            position: 'fixed', right: 24, bottom: 24, zIndex: 85,
            width: 380, maxWidth: 'calc(100vw - 48px)',
            height: 560, maxHeight: 'calc(100vh - 100px)',
            display: 'flex', flexDirection: 'column',
        };

    return (
        <div style={wrapperStyle} onClick={(e) => e.stopPropagation()}>
            <div className="hud-corners slide-up" style={{
                position: 'relative', flex: 1, display: 'flex', flexDirection: 'column',
                background: 'rgba(8,12,18,0.97)', backdropFilter: 'blur(18px)',
                border: '1px solid var(--ac-a28)', borderRadius: isMobile ? 0 : 4,
                boxShadow: '0 0 60px var(--ac-a35), 0 24px 80px rgba(0,0,0,0.7)',
                overflow: 'hidden',
            }}>
                <div className="top-bar" />
                <div className="hud-br" />

                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', borderBottom: '1px solid var(--ac-a12)',
                    background: 'var(--ac-a05)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 8px #00ff88' }} />
                        <span style={{
                            fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.22em',
                            color: 'var(--c-ac)', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                            COMMS{databaseName ? ` · ${databaseName.toUpperCase()}` : ''}
                        </span>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'transparent', border: '1px solid var(--ac-a28)', color: 'var(--c-tx2)',
                        padding: '4px 10px', borderRadius: 2, cursor: 'pointer',
                        fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                    }}>
                        ✕ CLOSE
                    </button>
                </div>

                {/* Messages */}
                <div ref={scrollRef} style={{
                    flex: 1, overflowY: 'auto', padding: '14px 14px 8px',
                    display: 'flex', flexDirection: 'column', gap: 10,
                }}>
                    {!ready && (
                        <div style={{ textAlign: 'center', color: 'var(--c-tx3)', fontFamily: 'var(--font-mono)', fontSize: 11, padding: 20 }}>
                            <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite', display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }} />
                            ESTABLISHING CHANNEL…
                        </div>
                    )}
                    {ready && messages.length === 0 && (
                        <div style={{ textAlign: 'center', color: 'var(--c-tx3)', fontFamily: 'var(--font-mono)', fontSize: 11, padding: 28 }}>
                            NO TRANSMISSIONS ON RECORD.<br />
                            <span style={{ opacity: 0.6 }}>BE THE FIRST TO BREAK SILENCE.</span>
                        </div>
                    )}
                    {messages.map((m) => {
                        const isMine = m.authorId === user.uid;
                        return (
                            <div key={m.id} style={{
                                display: 'flex', flexDirection: 'column', gap: 2,
                                alignItems: isMine ? 'flex-end' : 'flex-start',
                            }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--c-tx3)',
                                }}>
                                    <span style={{ color: isMine ? 'var(--c-ac)' : 'var(--c-tx2)', fontWeight: 600, letterSpacing: '0.08em' }}>
                                        {isMine ? 'YOU' : getCallsign(m.authorUsername, m.authorId)}
                                    </span>
                                    <span>·</span>
                                    <span>{formatTime(m.createdAt)}</span>
                                    {isMine && (
                                        <button
                                            onClick={() => handleDelete(m.id)}
                                            title="Delete message"
                                            style={{
                                                background: 'transparent', border: 'none', color: 'var(--c-tx3)',
                                                padding: 2, cursor: 'pointer', display: 'flex',
                                            }}
                                            onMouseOver={e => e.currentTarget.style.color = '#ff2d55'}
                                            onMouseOut={e => e.currentTarget.style.color = 'var(--c-tx3)'}
                                        >
                                            <Trash2 style={{ width: 11, height: 11 }} />
                                        </button>
                                    )}
                                </div>
                                <div style={{
                                    maxWidth: '85%',
                                    padding: '8px 12px',
                                    borderRadius: 6,
                                    background: isMine ? 'var(--ac-a12)' : 'var(--ac-a05)',
                                    border: `1px solid ${isMine ? 'var(--ac-a28)' : 'var(--ac-a12)'}`,
                                    fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.5,
                                    color: 'var(--c-tx)',
                                    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                                }}>
                                    {m.text}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Composer */}
                <form onSubmit={handleSubmit} style={{
                    display: 'flex', gap: 8, padding: '10px 12px',
                    borderTop: '1px solid var(--ac-a12)', background: 'var(--ac-a05)',
                }}>
                    <input
                        type="text" value={text}
                        onChange={(e) => { setText(e.target.value); if (error) setError(''); }}
                        placeholder="TRANSMIT MESSAGE..."
                        maxLength={500}
                        disabled={sending || !ready}
                        style={{
                            flex: 1, padding: '9px 12px', borderRadius: 3,
                            fontFamily: 'var(--font-mono)', fontSize: 13,
                            boxSizing: 'border-box',
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!text.trim() || sending || !ready}
                        style={{
                            padding: '0 14px', borderRadius: 3,
                            background: 'var(--ac-a08)', border: '1px solid var(--ac-a28)',
                            color: 'var(--c-ac)', cursor: !text.trim() || sending ? 'not-allowed' : 'pointer',
                            opacity: !text.trim() || sending || !ready ? 0.5 : 1,
                            display: 'flex', alignItems: 'center', gap: 6,
                            fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.15em',
                            textTransform: 'uppercase', fontWeight: 600,
                            transition: 'all 150ms',
                        }}
                    >
                        {sending
                            ? <Loader2 style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} />
                            : <Send style={{ width: 13, height: 13 }} />}
                        SEND
                    </button>
                </form>
                {error && (
                    <div style={{
                        padding: '6px 14px', background: 'rgba(255,45,85,0.08)',
                        borderTop: '1px solid rgba(255,45,85,0.2)',
                        fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.18em',
                        color: '#ff2d55', textAlign: 'center',
                    }}>
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
