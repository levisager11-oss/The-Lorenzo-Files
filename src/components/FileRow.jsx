import { useState } from 'react';
import { Folder, FileLock, Trash2, Loader2, ShieldAlert, MessageSquare } from 'lucide-react';
import RedactedBox from './RedactedBox';
import VoteButtons from './VoteButtons';
import IntelReportPanel from './IntelReportPanel';

const statusIcon = {
    CLASSIFIED: FileLock,
    SEALED: FileLock,
    REDACTED: FileLock,
    'UNDER REVIEW': Folder,
};

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
export default function FileRow({ file, index, fileNumber, onRedactedClick, user, userProfile, onDelete, isDeleting }) {
    const Icon = statusIcon[file.status] || Folder;
    const isOwner = file.uploadedById === user?.uid;
    const [showReports, setShowReports] = useState(false);

    const commentCount = file.commentCount || 0;

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
        <div className="flex flex-col border-b border-slate-800/60">
            <div
                className={`file-row grid grid-cols-[40px_60px_1fr_100px_150px] sm:grid-cols-[40px_60px_1fr_120px_100px_180px] lg:grid-cols-[40px_60px_1fr_120px_120px_220px] gap-2 items-center px-4 sm:px-6 py-3 group cursor-pointer transition-opacity duration-300 ${isDeleting ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}
                onDoubleClick={(e) => {
                    if (isDeleting) return;
                    handleDoubleClick(e);
                }}
                title={file.downloadURL ? "Double-click to download" : undefined}
            >
            {/* Index */}
            <div className="text-xs font-mono text-slate-600">
                {String(fileNumber).padStart(3, '0')}
            </div>

            {/* Votes */}
            <div className="flex justify-center items-center h-full">
                <VoteButtons file={file} user={user} />
            </div>

            {/* Icon + File Name */}
            <div className="flex items-center min-w-0">
                {file.downloadURL ? (
                    <a
                        href={file.downloadURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 min-w-0 hover:underline decoration-doj-gold underline-offset-4"
                        title="Open in new tab"
                        onClick={(e) => e.stopPropagation()} // Prevent double-click trigger when clicking link directly
                    >
                        <Icon className="w-4 h-4 text-doj-gold shrink-0 transition-colors" />
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-mono text-doj-gold truncate transition-colors block">
                                {file.name}
                            </span>
                            {file.uploaderUsername && (
                                <span className="text-[10px] font-mono text-slate-500 truncate">
                                    BY: {file.uploaderUsername.toUpperCase()}
                                </span>
                            )}
                        </div>
                    </a>
                ) : (
                    <div className="flex items-center gap-3 min-w-0">
                        <Icon className="w-4 h-4 text-slate-500 shrink-0 group-hover:text-doj-gold transition-colors" />
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-mono text-slate-300 truncate group-hover:text-slate-100 transition-colors block">
                                {file.name}
                            </span>
                            {file.uploaderUsername && (
                                <span className="text-[10px] font-mono text-slate-500 truncate">
                                    BY: {file.uploaderUsername.toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Suspect */}
            <div className="hidden sm:flex items-center text-xs font-mono text-slate-400 min-w-0">
                <span className="truncate block w-full" title={file.suspectNames ? file.suspectNames.join(', ') : (file.suspectName || 'LORENZO')}>
                    {file.suspectNames ? file.suspectNames.join(', ') : (file.suspectName || 'LORENZO')}
                </span>
            </div>

            {/* Date / Size */}
            <div className="hidden sm:flex flex-col gap-0.5 text-xs font-mono text-slate-500 whitespace-nowrap">
                <span>{file.date}</span>
                <span className="text-slate-500">{file.size}</span>
            </div>

            {/* Action / Intel Area */}
            <div className="flex justify-end items-center gap-2 sm:gap-4 min-w-0 w-full overflow-hidden">
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowReports(!showReports);
                    }}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-doj-gold font-mono text-xs transition-colors shrink-0 outline-none"
                    title="Toggle Intel Reports"
                >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{commentCount}</span>
                </button>
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (isOwner && !isDeleting) onDelete(file);
                    }}
                    disabled={!isOwner || isDeleting}
                    className={`shrink-0 p-1.5 px-3 flex items-center gap-2 border rounded transition-all group/purge z-20 outline-none
                        ${isDeleting 
                            ? 'border-slate-700 bg-slate-800/50 text-slate-500 cursor-not-allowed' 
                            : isOwner
                                ? 'border-red-900/40 bg-red-950/20 text-red-500 hover:bg-red-900/40 hover:text-red-400 hover:scale-105 active:scale-95'
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
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : !isOwner ? (
                        <ShieldAlert className="w-3.5 h-3.5 opacity-50" />
                    ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                    )}
                    <span className="text-[10px] font-mono tracking-tighter hidden xl:block">
                        {isDeleting ? 'PURGING...' : 'PURGE'}
                    </span>
                </button>
                <div 
                    onClick={(e) => e.stopPropagation()} 
                    className={`min-w-0 overflow-hidden w-full flex justify-end transition-opacity ${isDeleting ? 'opacity-50' : 'opacity-100'}`}
                >
                    <RedactedBox text={file.redactedText} onRedactedClick={onRedactedClick} />
                </div>
            </div>
            </div>
            {showReports && (
                <IntelReportPanel
                    file={file}
                    user={user}
                    userProfile={userProfile}
                />
            )}
        </div>
    );
}
