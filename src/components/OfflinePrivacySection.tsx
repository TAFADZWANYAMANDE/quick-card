import React from 'react';
import { Shield, WifiOff, Lock, Database, Trash2, CheckCircle2 } from 'lucide-react';
import { deleteAllUserData } from '../lib/storage';

interface OfflinePrivacySectionProps {
  onDataReset: () => void;
}

export const OfflinePrivacySection: React.FC<OfflinePrivacySectionProps> = ({ onDataReset }) => {
  const handleDeleteAll = () => {
    if (window.confirm('Delete all saved cards, recipient drafts, and local data? This cannot be undone.')) {
      deleteAllUserData();
      onDataReset();
      alert('All local drafts and cached data have been permanently wiped from this device.');
    }
  };

  return (
    <section id="privacy-section" className="py-16 sm:py-24 bg-[#0F172A] border-b border-[#334155] text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-semibold tracking-wide font-body">
            <Shield className="w-3.5 h-3.5 text-teal-400" />
            <span>Offline Architecture & Data Safety</span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span>Non-Negotiable Spec</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-heading">
            Built for privacy. Tested in airplane mode.
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-body">
            In an era where apps constantly leak data and require active internet bundles, QuickCard takes a radical offline stance.
            Everything runs directly inside your phone’s memory.
          </p>
        </div>

        {/* Feature Grid (Solid #1E293B Containers with #334155 Hairline Borders) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Card 1: 100% Offline */}
          <div className="p-6 rounded-3xl bg-[#1E293B] border border-[#334155] space-y-3 shadow-lg">
            <div className="w-11 h-11 rounded-2xl bg-[#042F2E] text-teal-300 border border-teal-500/40 flex items-center justify-center shadow-inner">
              <WifiOff className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white font-heading">Zero Internet Required</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-body">
              Fonts, icons, vector borders, and code are completely bundled. It opens and exports cards with mobile data turned completely off.
            </p>
          </div>

          {/* Card 2: No Contact Book Scraping */}
          <div className="p-6 rounded-3xl bg-[#1E293B] border border-[#334155] space-y-3 shadow-lg">
            <div className="w-11 h-11 rounded-2xl bg-[#042F2E] text-teal-300 border border-teal-500/40 flex items-center justify-center shadow-inner">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white font-heading">No Contact Scraping</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-body">
              We never ask for your phone’s contacts permission. You paste only the names and numbers you intend to message, line by line.
            </p>
          </div>

          {/* Card 3: Cryptographic Stamps */}
          <div className="p-6 rounded-3xl bg-[#1E293B] border border-[#334155] space-y-3 shadow-lg">
            <div className="w-11 h-11 rounded-2xl bg-[#042F2E] text-teal-300 border border-teal-500/40 flex items-center justify-center shadow-inner">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white font-heading">Ed25519 Signatures</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-body">
              Unlock codes use mathematical digital signatures (tweetnacl Ed25519). The app verifies authenticity using its built-in public key without contacting any server.
            </p>
          </div>

          {/* Card 4: Local Storage Only */}
          <div className="p-6 rounded-3xl bg-[#1E293B] border border-[#334155] space-y-3 shadow-lg">
            <div className="w-11 h-11 rounded-2xl bg-[#042F2E] text-teal-300 border border-teal-500/40 flex items-center justify-center shadow-inner">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white font-heading">Phone-Only Storage</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-body">
              Drafts and lists reside strictly in local IndexedDB storage. No accounts, no cloud sync, no tracking, and no third-party telemetry.
            </p>
          </div>
        </div>

        {/* Delete All Data & Privacy Pledge (Rule B4) */}
        <div className="p-6 sm:p-8 rounded-3xl border border-[#334155] bg-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <h4 className="text-sm font-bold text-white font-heading">Your Right to Absolute Privacy</h4>
            </div>
            <p className="text-xs text-slate-300 max-w-xl font-body">
              QuickCard does not own your guest lists, telephone numbers, or financial records. You can wipe all drafts and local caches with a single click.
            </p>
          </div>

          <button
            onClick={handleDeleteAll}
            className="min-h-[48px] px-4 py-2.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 rounded-xl transition-colors flex items-center gap-2 shrink-0 cursor-pointer shadow-sm font-body"
          >
            <Trash2 className="w-4 h-4" />
            <span>Wipe Local Data</span>
          </button>
        </div>
      </div>
    </section>
  );
};
