import { Folder, FileLock, Trash2, Loader2, ShieldAlert } from 'lucide-react';
import RedactedBox from './RedactedBox';
import VoteButtons from './VoteButtons';

const statusBadge = {
    CLASSIFIED: 'badge-classified',
    SEALED: 'badge-sealed',
    REDACTED: 'badge-redacted',
    'UNDER REVIEW': 'badge-review',
};

const statusIcon = {
    CLASSIFIED: FileLock,
    SEALED: FileLock,
    REDACTED: FileLock,
    'UNDER REVIEW': Folder,
};

export default function MobileFileCard({ file, index, fileNumber, onRedactedClick, user, onDelete, isDeleting }) {
    const Icon = statusIcon[file.status] || Folder;
    const isOwner = file.uploadedById === user?.uid;

    const handleDoubleClick = async () => {
        if (!file.downloadURL) return;

        try {
            // Fetch the file as a Blob
            const response = await fetch(file.downloadURL);
            const blob = await response.blob();

            // Create a temporary Blob URL
            const blobUrl = window.URL.createObjectURL(blob);

            // Create a hidden anchor to force download
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();

            // Cleanup
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Error downloading file:", error);
            alert("Failed to download the file.");
        }
    };

    return (
        <div
            className={`flex flex-col gap-3 p-4 border-b border-slate-800/60 transition-opacity duration-300 ${isDeleting ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}
            onDoubleClick={(e) => {
                if (isDeleting) return;
                handleDoubleClick(e);
            }}
        >
            {/* Header: Name and Status */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-xs font-mono text-slate-600 shrink-0">
                        {String(fileNumber).padStart(3, '0')}
                    </span>
                    {file.downloadURL ? (
                        <a
                            href={file.downloadURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 min-w-0 hover:underline decoration-doj-gold underline-offset-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Icon className="w-4 h-4 text-doj-gold shrink-0" />
                            <span className="text-sm font-mono text-doj-gold truncate block">
                                {file.name}
                            </span>
                        </a>
                    ) : (
                        <div className="flex items-center gap-2 min-w-0">
                            <Icon className="w-4 h-4 text-slate-500 shrink-0" />
                            <span className="text-sm font-mono text-slate-300 truncate block">
                                {file.name}
                            </span>
                        </div>
                    )}
                </div>
                <div className="shrink-0 flex items-center gap-2">
                    <VoteButtons file={file} user={user} />
                </div>
            </div>

            {/* Middle row: Date, Size, Status */}
            <div className="grid grid-cols-2 gap-2 mt-1">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Suspect</span>
                    <span className="text-xs font-mono text-slate-300 truncate" title={file.suspectNames ? file.suspectNames.join(', ') : (file.suspectName || 'LORENZO')}>
                        {file.suspectNames ? file.suspectNames.join(', ') : (file.suspectName || 'LORENZO')}
                    </span>
                </div>
                <div className="flex flex-col gap-1 items-end">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Status</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider whitespace-nowrap ${statusBadge[file.status]}`}>
                        {file.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Date</span>
                    <span className="text-xs font-mono text-slate-400">
                        {file.date}
                    </span>
                </div>
                <div className="flex flex-col gap-1 items-end">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Size</span>
                    <span className="text-xs font-mono text-slate-400">
                        {file.size}
                    </span>
                </div>
            </div>

            {/* Bottom Row: Redacted Box & Action */}
            <div className="flex items-center justify-between gap-3 mt-2">
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (isOwner && !isDeleting) onDelete(file);
                    }}
                    disabled={!isOwner || isDeleting}
                    className={`shrink-0 p-2 flex items-center justify-center border rounded transition-all outline-none
                        ${isDeleting
                            ? 'border-slate-700 bg-slate-800/50 text-slate-500 cursor-not-allowed'
                            : isOwner
                                ? 'border-red-900/40 bg-red-950/20 text-red-500 active:scale-95'
                                : 'border-slate-800/60 bg-slate-900/40 text-slate-600 cursor-not-allowed'
                        }`}
                    title={
                        isDeleting
                            ? "Purging record..."
                            : isOwner
                                ? "Purge from Archive"
                                : "OWNERSHIP UNVERIFIED - CANNOT PURGE"
                    }
                >
                    {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : !isOwner ? (
                        <ShieldAlert className="w-4 h-4 opacity-50" />
                    ) : (
                        <Trash2 className="w-4 h-4" />
                    )}
                </button>
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 w-full overflow-hidden"
                >
                    <RedactedBox text={file.redactedText} onRedactedClick={onRedactedClick} />
                </div>
            </div>
        </div>
    );
}