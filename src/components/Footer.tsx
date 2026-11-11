import React from 'react';
import { WifiOff, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onOpenStudio: () => void;
  onOpenApkModal: () => void;
  onOpenUnlockModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenStudio,
  onOpenApkModal,
  onOpenUnlockModal,
}) => {
  return (
    <footer className="bg-[#0F172A] text-slate-300 py-12 sm:py-16 border-t border-[#334155]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-[#334155]">
          {/* Brand & Mission */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#042F2E] border border-emerald-500/40 text-amber-400 font-heading font-bold text-2xl flex items-center justify-center shadow-inner">
                Q
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-heading">
                QuickCard
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-sm leading-relaxed font-body">
              The offline Android card and notice engine. Turns typed lines into print-grade double-bordered cards
              for church fellowships, weddings, funeral notices, and savings clubs.
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-400 font-body">
              <WifiOff className="w-4 h-4 text-teal-400" />
              <span>100% Offline · No cloud servers · No contact harvesting</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3 font-body">
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">
              Occasions
            </span>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Church Midweek & Revival Notice</li>
              <li>Wedding & Kitchen Parties</li>
              <li>Solemn Funeral & Memorial Notices</li>
              <li>Mukando & Savings Club Rounds</li>
              <li>Family Grocery & Market Lists</li>
            </ul>
          </div>

          {/* Action Links */}
          <div className="md:col-span-4 space-y-3 font-body">
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">
              App & Utilities
            </span>
            <div className="flex flex-col gap-2 text-xs">
              <button
                onClick={onOpenStudio}
                className="text-left text-teal-400 hover:text-teal-300 transition-colors cursor-pointer py-1 min-h-[36px] flex items-center"
              >
                Launch In-Browser Card Studio
              </button>
              <button
                onClick={onOpenApkModal}
                className="text-left text-slate-300 hover:text-white transition-colors cursor-pointer py-1 min-h-[36px] flex items-center"
              >
                Download Standalone Offline Package (.ZIP)
              </button>
              <button
                onClick={onOpenUnlockModal}
                className="text-left text-slate-300 hover:text-white transition-colors cursor-pointer py-1 min-h-[36px] flex items-center"
              >
                Ed25519 Offline Unlock Stamp Manager
              </button>
            </div>
          </div>
        </div>

        {/* Quiet Legal & Copyright Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-body">
          <div>
            © 2026 QuickCard. Designed for Zimbabwean & Southern African communities.
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="text-teal-400 font-medium">100% Offline</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Zero Analytics</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Airplane Mode Certified</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
