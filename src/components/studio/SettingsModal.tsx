import React from 'react';
import { X, Palette, Sun, Moon, Sparkles, ShieldCheck, DollarSign, RotateCcw, Check, Copy } from 'lucide-react';
import { AppTheme, UnlockLicense } from '../../types/template';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appTheme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
  license: UnlockLicense;
  onOpenUnlockModal: () => void;
}

const THEME_OPTIONS: Array<{
  id: AppTheme;
  name: string;
  description: string;
  previewBg: string;
  previewBorder: string;
  previewText: string;
  previewAccent: string;
  isLight: boolean;
}> = [
  {
    id: 'pure-white',
    name: 'Pure White (Light)',
    description: 'Clean high-contrast daylight theme with crisp slate text',
    previewBg: '#FFFFFF',
    previewBorder: '#E2E8F0',
    previewText: '#0F172A',
    previewAccent: '#0D9488',
    isLight: true,
  },
  {
    id: 'sky-blue',
    name: 'Sky Blue (Fresh)',
    description: 'Light sky blue atmospheric theme for easy daytime reading',
    previewBg: '#F0F9FF',
    previewBorder: '#BAE6FD',
    previewText: '#0C4A6E',
    previewAccent: '#0284C7',
    isLight: true,
  },
  {
    id: 'warm-linen',
    name: 'Warm Linen / Cream',
    description: 'Natural cathedral stone and warm parchment with deep charcoal ink',
    previewBg: '#FDFBF7',
    previewBorder: '#E7E5E4',
    previewText: '#1C1917',
    previewAccent: '#92400E',
    isLight: true,
  },
  {
    id: 'soft-mint',
    name: 'Soft Mint (Pastel)',
    description: 'Fresh soothing green tinted surface with emerald accents',
    previewBg: '#F0FDF4',
    previewBorder: '#BBF7D0',
    previewText: '#14532D',
    previewAccent: '#16A34A',
    isLight: true,
  },
  {
    id: 'rose-quartz',
    name: 'Rose Blush',
    description: 'Gentle rose quartz light background for celebrations and weddings',
    previewBg: '#FFF1F2',
    previewBorder: '#FECDD3',
    previewText: '#881337',
    previewAccent: '#E11D48',
    isLight: true,
  },
  {
    id: 'dark-slate',
    name: 'Dark Slate (Default)',
    description: 'Rich dark slate surface with teal & gold accents',
    previewBg: '#0F172A',
    previewBorder: '#334155',
    previewText: '#F8FAFC',
    previewAccent: '#2DD4BF',
    isLight: false,
  },
  {
    id: 'forest-emerald',
    name: 'Forest Emerald',
    description: 'Deep African emerald green with warm gold highlights',
    previewBg: '#042F2E',
    previewBorder: '#134E4A',
    previewText: '#F0FDFA',
    previewAccent: '#F59E0B',
    isLight: false,
  },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  appTheme,
  onThemeChange,
  license,
  onOpenUnlockModal,
}) => {
  const [copiedDevId, setCopiedDevId] = React.useState(false);

  if (!isOpen) return null;

  const handleCopyDevId = () => {
    navigator.clipboard.writeText(license.deviceId);
    setCopiedDevId(true);
    setTimeout(() => setCopiedDevId(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0F172A]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1E293B] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#334155] relative my-8 text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400 mb-1 font-body">
            <span>App Preferences & Appearance</span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span className="text-amber-400">Personalize</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white font-heading">
            App Settings & Themes
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-body">
            Choose your app interface appearance, check your Pro license, and adjust preferences.
          </p>
        </div>

        <div className="space-y-6">
          {/* Section 1: App Interface Theme */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-body flex items-center gap-2">
                <Palette className="w-4 h-4 text-teal-400" />
                <span>App Background & Surface Theme</span>
              </label>
              <span className="text-[11px] text-amber-400 font-medium">Light & Dark Options</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {THEME_OPTIONS.map((theme) => {
                const isSelected = appTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => onThemeChange(theme.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer min-h-[72px] flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'border-teal-500 bg-teal-950/40 ring-2 ring-teal-500/60 shadow-md'
                        : 'border-[#334155] bg-[#0F172A] hover:border-slate-500'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div
                          style={{
                            backgroundColor: theme.previewBg,
                            borderColor: theme.previewBorder,
                          }}
                          className="w-5 h-5 rounded-full border shadow-xs shrink-0 flex items-center justify-center"
                        >
                          <div
                            style={{ backgroundColor: theme.previewAccent }}
                            className="w-2 h-2 rounded-full"
                          />
                        </div>
                        <span className="text-xs font-bold text-white truncate font-body">
                          {theme.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight line-clamp-2">
                        {theme.description}
                      </p>
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: License Tier & Pro Upgrade */}
          <div className="p-4 bg-[#0F172A] border border-[#334155] rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className={`w-4 h-4 ${license.isUnlocked ? 'text-teal-400' : 'text-amber-400'}`} />
                <span className="text-xs font-bold text-white uppercase tracking-wider font-body">
                  License Status: {license.isUnlocked ? (license.tier === 'unlocked' ? 'Pro Lifetime ($2)' : 'Pro Event Pass ($1.50)') : 'Free Starter Plan'}
                </span>
              </div>

              {!license.isUnlocked ? (
                <button
                  onClick={() => {
                    onClose();
                    onOpenUnlockModal();
                  }}
                  className="px-3 py-1.5 min-h-[36px] bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Upgrade to Pro ($2)</span>
                </button>
              ) : (
                <span className="text-[11px] font-semibold text-teal-400 bg-teal-950/60 border border-teal-500/40 px-2.5 py-1 rounded-full">
                  Watermark Removed
                </span>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-[#334155]/60 font-body">
              <span>Your Unique Device ID: <code className="text-teal-300 font-mono font-bold">{license.deviceId}</code></span>
              <button
                onClick={handleCopyDevId}
                className="text-xs text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {copiedDevId ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedDevId ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[#334155] flex justify-end">
          <button
            onClick={onClose}
            className="min-h-[44px] px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-md cursor-pointer font-body"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
