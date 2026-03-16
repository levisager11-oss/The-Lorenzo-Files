import { useState, useMemo } from 'react';
import { AlertTriangle, Database, FileText, Upload } from 'lucide-react';
import Header from './components/Header';
import SearchPortal from './components/SearchPortal';
import FileRow from './components/FileRow';
import SecurityBreach from './components/SecurityBreach';
import { evidenceFiles } from './data/files';

export default function App() {
  const [files, setFiles] = useState(evidenceFiles);
  const [searchQuery, setSearchQuery] = useState('');
  const [securityLevel, setSecurityLevel] = useState(0);
  const [breached, setBreached] = useState(false);

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files;
    const q = searchQuery.toLowerCase();
    return files.filter((f) => f.name.toLowerCase().includes(q));
  }, [searchQuery, files]);

  const handleRedactedClick = () => {
    const next = securityLevel + 1;
    setSecurityLevel(next);
    if (next > 3) {
      setBreached(true);
    }
  };

  const handleDismissBreach = () => {
    setBreached(false);
    setSecurityLevel(0);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Calculate nice file size
    const sizeInBytes = file.size;
    let sizeStr = sizeInBytes + " B";
    if (sizeInBytes >= 1024 * 1024) {
      sizeStr = (sizeInBytes / (1024 * 1024)).toFixed(1) + " MB";
    } else if (sizeInBytes >= 1024) {
      sizeStr = (sizeInBytes / 1024).toFixed(0) + " KB";
    }

    // Format today's date
    const today = new Date().toISOString().split('T')[0];

    // Mock redacted texts for new files
    const mockRedactedTexts = [
      "Unauthorized chicken nugget acquisition",
      "It's just a picture of a stapler",
      "He forgot his password again",
      "Definitely not aliens",
      "Just a very suspicious looking rock"
    ];
    const randomRedactedText = mockRedactedTexts[Math.floor(Math.random() * mockRedactedTexts.length)];

    const newEvidence = {
      id: Date.now(),
      name: file.name,
      date: today,
      size: sizeStr,
      status: "CLASSIFIED",
      redactedText: randomRedactedText,
    };

    setFiles((prev) => [newEvidence, ...prev]);

    // reset input
    event.target.value = '';
  };

  return (
    <div className="relative min-h-screen bg-slate-900 font-sans">
      {/* Grain overlay */}
      <div className="grain-overlay" />
      {/* Scanlines */}
      <div className="scanlines" />
      {/* CONFIDENTIAL watermark */}
      <div className="watermark">
        <span className="watermark-text">CONFIDENTIAL</span>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        <Header />

        {/* Classification Banner */}
        <div className="bg-red-950/40 border-y border-red-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-center gap-3">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <p className="text-xs font-mono text-red-400 tracking-widest">
              TOP SECRET // LORENZO EYES ONLY // CLASSIFICATION LEVEL: ULTRA
            </p>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
        </div>

        {/* Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search */}
          <div className="mb-8">
            <SearchPortal query={searchQuery} onQueryChange={setSearchQuery} />
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                <Database className="w-3.5 h-3.5" />
                <span>{files.length} FILES IN ARCHIVE</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                <FileText className="w-3.5 h-3.5" />
                <span>{filteredFiles.length} SHOWING</span>
              </div>

              {/* Upload Button */}
              <div className="ml-4">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 rounded cursor-pointer transition-colors duration-200 text-xs font-mono text-slate-300"
                >
                  <Upload className="w-3.5 h-3.5 text-doj-gold" />
                  <span>UPLOAD U.R.D.</span>
                </label>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-600">SECURITY LEVEL:</span>
              <div className="flex gap-1">
                {[1, 2, 3].map((level) => (
                  <div
                    key={level}
                    className={`w-2.5 h-2.5 rounded-sm transition-colors duration-300 ${securityLevel >= level
                      ? 'bg-red-500 shadow-sm shadow-red-500/50'
                      : 'bg-slate-700'
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Evidence Table */}
          <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl overflow-hidden backdrop-blur-sm">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 items-center px-4 sm:px-6 py-3 bg-slate-800/50 border-b border-slate-700/40 text-[10px] font-mono text-slate-500 tracking-widest uppercase">
              <div className="col-span-1">#</div>
              <div className="col-span-4 sm:col-span-3">File Name</div>
              <div className="col-span-2 hidden sm:block">Date</div>
              <div className="col-span-1 hidden sm:block">Size</div>
              <div className="col-span-3 sm:col-span-2 text-center">Status</div>
              <div className="col-span-4 sm:col-span-3 text-right">Intel</div>
            </div>

            {/* File Rows */}
            {filteredFiles.length > 0 ? (
              filteredFiles.map((file, index) => (
                <FileRow
                  key={file.id}
                  file={file}
                  index={index}
                  onRedactedClick={handleRedactedClick}
                />
              ))
            ) : (
              <div className="py-16 text-center">
                <p className="text-sm font-mono text-slate-600">
                  NO MATCHING FILES FOUND
                </p>
                <p className="text-xs font-mono text-slate-700 mt-1">
                  Try adjusting your search query
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="mt-8 pb-8 text-center">
            <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-6" />
            <p className="text-xs font-mono text-slate-600 tracking-wider">
              DEPARTMENT OF LORENZO — EVIDENCE MANAGEMENT SYSTEM v4.2.0
            </p>
            <p className="text-[10px] font-mono text-slate-700 mt-1 tracking-wider">
              UNAUTHORIZED ACCESS IS PUNISHABLE BY HAVING TO LISTEN TO LORENZO'S KARAOKE
            </p>
          </footer>
        </main>
      </div>

      {/* Security Breach Overlay */}
      {breached && <SecurityBreach onDismiss={handleDismissBreach} />}
    </div>
  );
}
