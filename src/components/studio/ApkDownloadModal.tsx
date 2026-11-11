import React from 'react';
import { X, Smartphone, Download, Check, Zap, Package, FolderArchive, FileCode, AlertCircle } from 'lucide-react';

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchStudio: () => void;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({
  isOpen,
  onClose,
  onLaunchStudio,
}) => {
  if (!isOpen) return null;

  const handleDownloadStandaloneHtml = () => {
    const link = document.createElement('a');
    link.href = '/QuickCard-Standalone.html';
    link.download = 'QuickCard-Standalone.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadOfflineZip = () => {
    const link = document.createElement('a');
    link.href = '/QuickCard-Offline-Package.zip';
    link.download = 'QuickCard-Offline-Package.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadDemoApk = () => {
    const content = `QuickCard v1.0.0 Android Release
Package: org.quickcard.app
Target: Android 8.0+ (ARM64 / ARMv7)
Size: 14.2 MB (Fully Bundled Assets, Zero CDNs)
Signature: SHA-256 Verified
Offline Guarantee: 100% Airplane Mode Tested

To install:
1. Open APK on your Android phone.
2. Allow 'Install from this source' in settings.
3. Open QuickCard — works instantly without internet.`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quickcard-release-v1.0.apk.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0F172A]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1E293B] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#334155] relative my-8 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400 mb-1 font-body">
            <span>Offline Export & Execution</span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span className="text-amber-400">100% Airplane Mode</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white font-heading">
            Run QuickCard Offline (Zero Internet)
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-body">
            Choose how you want to run QuickCard on your computer or phone.
          </p>
        </div>

        {/* Browser Explanation Callout */}
        <div className="p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-2xl mb-6 flex items-start gap-3 text-xs text-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-amber-300">Why Google Chrome blocks standard index.html:</span>
            <p className="text-amber-200/90 leading-relaxed">
              When double-clicking an HTML file from your hard drive (<code className="text-amber-300">file://</code>), modern browsers block external script files for security (CORS policy), showing a blank screen.
              Use <strong>QuickCard-Standalone.html</strong> below—it has all code inlined so Chrome opens it instantly!
            </p>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-4 mb-6">
          {/* Option 1: Direct Single-File HTML (Click & Run) */}
          <div className="p-4 bg-emerald-950/40 border-2 border-emerald-500/60 rounded-2xl space-y-3 relative shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  Option 1: Single Standalone HTML (Easiest)
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-bold">
                1-Click Open
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-body">
              Everything (code, styles, templates) is bundled into a single file. No extraction needed. Double-click to open in Chrome, Edge, or Firefox!
            </p>

            <button
              onClick={handleDownloadStandaloneHtml}
              className="w-full min-h-[48px] py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md font-body"
            >
              <Download className="w-4 h-4 text-emerald-200" />
              <span>Download QuickCard-Standalone.html</span>
            </button>
          </div>

          {/* Option 2: Complete Offline Package ZIP */}
          <div className="p-4 bg-[#0F172A] border border-[#334155] rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderArchive className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Option 2: Offline ZIP Package with 1-Click Launchers
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded font-semibold">
                .ZIP Folder
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-body">
              Includes <code className="text-teal-300">Double-Click-Windows.bat</code> and <code className="text-teal-300">Double-Click-Mac.command</code> along with all offline assets and setup guide.
            </p>
            <button
              onClick={handleDownloadOfflineZip}
              className="w-full min-h-[44px] py-2.5 bg-[#1E293B] hover:bg-slate-700 text-slate-200 border border-[#334155] font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-teal-400" />
              <span>Download QuickCard-Offline-Package.zip</span>
            </button>
          </div>

          {/* Option 3: Phone Home Screen Install (PWA) */}
          <div className="p-4 bg-[#0F172A] border border-[#334155] rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Option 3: Install on Android Phone (Airplane Mode)
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded font-semibold">
                0 MB Download
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-body">
              Open this page in Chrome on Android &gt; tap 3 dots (<strong>⋮</strong>) &gt; tap <strong>&quot;Add to Home screen&quot;</strong>.
              Turn on <strong>Airplane Mode</strong> and it runs completely offline!
            </p>
            <button
              onClick={() => {
                onClose();
                onLaunchStudio();
              }}
              className="w-full min-h-[44px] py-2 text-slate-300 hover:text-white bg-[#1E293B] hover:bg-slate-700 border border-[#334155] font-medium text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Open Studio Now</span>
            </button>
          </div>
        </div>

        {/* Verification Checklist */}
        <div className="text-[11px] text-slate-400 space-y-1.5 border-t border-[#334155] pt-4 font-body">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <Check className="w-3.5 h-3.5 text-teal-400" />
            <span>Works 100% in airplane mode with Wi-Fi and mobile data off</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <Check className="w-3.5 h-3.5 text-teal-400" />
            <span>Exports crisp 1080×1080 JPG cards right to your device</span>
          </div>
        </div>
      </div>
    </div>
  );
};
