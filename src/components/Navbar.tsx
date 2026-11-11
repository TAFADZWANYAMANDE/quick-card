import React from 'react';
import { Smartphone, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { UnlockLicense } from '../types/template';

interface NavbarProps {
  activeView: 'website' | 'studio';
  onViewChange: (view: 'website' | 'studio') => void;
  onOpenUnlockModal: () => void;
  onOpenApkModal: () => void;
  license: UnlockLicense;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onViewChange,
  onOpenUnlockModal,
  onOpenApkModal,
  license,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0F172A]/95 backdrop-blur-md border-b border-[#334155] text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark & Offline Indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onViewChange('website')}
            className="text-left group flex items-center gap-3 focus:outline-none min-h-[48px] py-1 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#042F2E] border border-emerald-500/40 text-amber-400 font-heading font-bold text-2xl flex items-center justify-center shadow-inner">
              Q
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white font-heading group-hover:text-teal-400 transition-colors whitespace-nowrap">
                QuickCard
              </span>
              <span className="text-[10px] text-slate-400 font-body hidden xs:inline tracking-wider uppercase">
                Offline Card Engine
              </span>
            </div>
          </button>

          {/* Requested Offline Ready green pill indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 text-xs font-medium tracking-wide">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="whitespace-nowrap font-medium text-[11px] sm:text-xs">Offline Ready</span>
          </div>
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300 font-body">
          <button
            onClick={() => {
              onViewChange('website');
              document.getElementById('templates-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[48px] flex items-center"
          >
            12 Templates
          </button>
          <button
            onClick={() => {
              onViewChange('website');
              document.getElementById('how-it-works-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[48px] flex items-center"
          >
            How Sending Works
          </button>
          <button
            onClick={() => {
              onViewChange('website');
              document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[48px] flex items-center"
          >
            Pricing & EcoCash
          </button>
          <button
            onClick={() => {
              onViewChange('website');
              document.getElementById('privacy-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[48px] flex items-center"
          >
            Offline Security
          </button>
        </nav>

        {/* Zone 3: Primary Action & License Status */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* License Status Badge */}
          <button
            onClick={onOpenUnlockModal}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 min-h-[48px] text-xs font-semibold rounded-xl transition-all border ${
              license.isUnlocked
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/80'
                : 'bg-slate-800/80 text-amber-300 border-amber-500/30 hover:bg-slate-800'
            }`}
            title="Manage Offline Ed25519 Unlock"
          >
            {license.isUnlocked ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{license.tier === 'unlocked' ? 'Lifetime Unlocked' : '30-Day Event Pass'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Free Plan ($2 Unlock)</span>
              </>
            )}
          </button>

          {/* Offline Export / APK Modal Button */}
          <button
            onClick={onOpenApkModal}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 min-h-[48px] text-xs font-semibold text-slate-200 bg-[#1E293B] hover:bg-slate-700/80 border border-[#334155] rounded-xl transition-colors cursor-pointer"
          >
            <Smartphone className="w-4 h-4 text-teal-400" />
            <span>Export Offline / APK</span>
          </button>

          {/* View Toggle CTA Button (min 48px tap target) */}
          {activeView === 'website' ? (
            <button
              onClick={() => onViewChange('studio')}
              className="px-4 py-2.5 min-h-[48px] text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 rounded-xl transition-all shadow-md hover:shadow-teal-900/30 whitespace-nowrap shrink-0 cursor-pointer flex items-center justify-center font-body"
            >
              Open Card Studio
            </button>
          ) : (
            <button
              onClick={() => onViewChange('website')}
              className="px-4 py-2.5 min-h-[48px] text-xs sm:text-sm font-semibold text-slate-200 bg-[#1E293B] hover:bg-slate-700 border border-[#334155] rounded-xl transition-colors shadow-sm whitespace-nowrap shrink-0 cursor-pointer flex items-center justify-center font-body"
            >
              Back to Overview
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
