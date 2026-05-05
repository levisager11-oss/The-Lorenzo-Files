export default function RedactedBox({ text, onRedactedClick }) {
    return (
        <div
            className="redacted-bar"
            onClick={(e) => { e.stopPropagation(); onRedactedClick?.(); }}
            title="Hover to declassify"
        >
            <span className="redacted-label">[REDACTED]</span>
            <span className="redacted-text">{text}</span>
        </div>
    );
}
