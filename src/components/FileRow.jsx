import { Folder, FileLock } from 'lucide-react';
import RedactedBox from './RedactedBox';

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

export default function FileRow({ file, index, onRedactedClick }) {
    const Icon = statusIcon[file.status] || Folder;

    return (
        <div className="file-row grid grid-cols-12 gap-2 items-center px-4 sm:px-6 py-3 border-b border-slate-800/60 group">
            {/* Index */}
            <div className="col-span-1 text-xs font-mono text-slate-600">
                {String(index + 1).padStart(3, '0')}
            </div>

            {/* Icon + File Name */}
            <div className="col-span-4 sm:col-span-3 flex items-center gap-3 min-w-0">
                <Icon className="w-4 h-4 text-slate-500 shrink-0 group-hover:text-doj-gold transition-colors" />
                <span className="text-sm font-mono text-slate-300 truncate group-hover:text-slate-100 transition-colors">
                    {file.name}
                </span>
            </div>

            {/* Date */}
            <div className="col-span-2 hidden sm:block text-xs font-mono text-slate-500">
                {file.date}
            </div>

            {/* Size */}
            <div className="col-span-1 hidden sm:block text-xs font-mono text-slate-500">
                {file.size}
            </div>

            {/* Status Badge */}
            <div className="col-span-3 sm:col-span-2 flex justify-center">
                <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider ${statusBadge[file.status]}`}
                >
                    {file.status}
                </span>
            </div>

            {/* Redacted Box */}
            <div className="col-span-4 sm:col-span-3 flex justify-end">
                <RedactedBox text={file.redactedText} onRedactedClick={onRedactedClick} />
            </div>
        </div>
    );
}
