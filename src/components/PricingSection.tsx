import React from 'react';
import { Check, ShieldCheck, Sparkles, Key, Zap, Banknote } from 'lucide-react';
import { UnlockLicense } from '../types/template';

interface PricingSectionProps {
  onOpenUnlockModal: () => void;
  license: UnlockLicense;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onOpenUnlockModal, license }) => {
  return (
    <section id="pricing-section" className="py-16 sm:py-24 bg-[#0F172A] border-b border-[#334155] text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-semibold tracking-wide font-body">
            <Banknote className="w-3.5 h-3.5 text-teal-400" />
            <span>Fair Offline Pricing</span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span className="text-amber-400">EcoCash & Innbucks Ready</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-heading">
            Start completely free. Unlock offline forever for $2.
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-body">
            No recurring subscriptions, no credit card required, and no internet account needed.
            Pay locally with EcoCash, receive your offline cryptographic unlock stamp, and you are set.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-14">
          {/* Free Tier */}
          <div className="bg-[#1E293B] rounded-3xl p-7 border border-[#334155] flex flex-col justify-between shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-body">
                  Starter Edition
                </span>
                <span className="text-xs font-medium px-2.5 py-0.5 bg-slate-800 text-slate-300 rounded-lg border border-[#334155]">
                  Default
                </span>
              </div>

              <div>
                <span className="text-4xl font-bold text-white font-heading">$0</span>
                <span className="text-slate-400 text-sm ml-2 font-body">Free forever</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-body">
                Everything you need to create and export cards for your family or church fellowship.
              </p>

              <div className="pt-4 border-t border-[#334155] space-y-3 text-xs text-slate-200 font-body">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>All 12 starter templates included</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Up to 5 recipients per personalised send</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>High-res 1080×1080 JPG export</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Saves drafts locally on your phone</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-400">
                  <span className="text-xs font-mono ml-0.5">•</span>
                  <span>Small “Made with QuickCard” tag</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="w-full min-h-[48px] flex items-center justify-center text-center text-xs font-semibold text-slate-400 bg-[#0F172A] border border-[#334155] rounded-xl font-body">
                Installed by Default
              </div>
            </div>
          </div>

          {/* $2 Lifetime Unlock (Highlighted Marquee in Deep Forest Emerald #042F2E) */}
          <div className="bg-[#042F2E] text-white rounded-3xl p-7 border-2 border-emerald-500/80 flex flex-col justify-between shadow-2xl relative">
            {/* Top Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-400 text-slate-950 text-[11px] font-bold uppercase tracking-wider rounded-full shadow-lg">
              Most Popular · One-Time
            </div>

            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-300 font-body">
                  Lifetime Unlock
                </span>
                <span className="text-xs font-mono px-2.5 py-0.5 bg-emerald-900/80 text-emerald-200 rounded-lg border border-emerald-500/40">
                  Single phone
                </span>
              </div>

              <div>
                <span className="text-4xl font-bold font-heading text-white">$2</span>
                <span className="text-emerald-200 text-sm ml-2 font-medium font-body">USD one-time / EcoCash</span>
              </div>

              <p className="text-xs text-emerald-100/90 leading-relaxed font-body">
                Removes all tags, unlocks up to 100 personalised recipients, and lasts forever on your device.
              </p>

              <div className="pt-4 border-t border-emerald-800/80 space-y-3 text-xs text-emerald-100 font-body">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-semibold text-white">Removes “Made with QuickCard” tag</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Up to 100 personalised recipients per send</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Cryptographic offline Ed25519 verification</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Free code re-issue if phone is wiped</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Works 100% in airplane mode</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={onOpenUnlockModal}
                className="w-full min-h-[48px] py-3 text-center text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer font-body"
              >
                <Key className="w-4 h-4" />
                <span>
                  {license.isUnlocked && license.tier === 'unlocked'
                    ? 'Verified & Unlocked'
                    : 'Enter or Generate Unlock Code'}
                </span>
              </button>
            </div>
          </div>

          {/* Event Pass */}
          <div className="bg-[#1E293B] rounded-3xl p-7 border border-[#334155] flex flex-col justify-between shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-body">
                  Event Pass
                </span>
                <span className="text-xs font-medium px-2.5 py-0.5 bg-slate-800 text-slate-300 rounded-lg border border-[#334155]">
                  30 Days
                </span>
              </div>

              <div>
                <span className="text-4xl font-bold text-white font-heading">$1.50</span>
                <span className="text-slate-400 text-sm ml-2 font-body">30-day season</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-body">
                Ideal for wedding planners, conventions, and school committees with large guest lists.
              </p>

              <div className="pt-4 border-t border-[#334155] space-y-3 text-xs text-slate-200 font-body">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-teal-400 shrink-0" />
                  <span className="font-semibold text-white">Unlimited recipients per send</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>No “Made with QuickCard” tag</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>All 12 templates & auto-calculating tables</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Valid for 30 consecutive days offline</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={onOpenUnlockModal}
                className="w-full min-h-[48px] py-2.5 text-center text-xs font-semibold text-teal-300 bg-teal-950/60 hover:bg-teal-900/80 border border-teal-500/40 rounded-xl transition-colors cursor-pointer flex items-center justify-center font-body"
              >
                Get 30-Day Pass
              </button>
            </div>
          </div>
        </div>

        {/* EcoCash Offline Payment Process Breakdown (Solid #1E293B Surface) */}
        <div className="bg-[#1E293B] rounded-3xl p-6 sm:p-8 border border-[#334155] shadow-xl">
          <h3 className="text-base sm:text-lg font-bold text-white font-heading mb-4">
            How EcoCash payment works with zero internet
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs text-slate-300 font-body">
            <div className="space-y-2">
              <span className="font-mono text-teal-400 font-bold text-sm block">1. Device ID</span>
              <p>QuickCard displays your unique Device ID (e.g. <code className="bg-[#0F172A] border border-[#334155] px-1.5 py-0.5 rounded font-mono text-teal-300">{license.deviceId}</code>).</p>
            </div>
            <div className="space-y-2">
              <span className="font-mono text-teal-400 font-bold text-sm block">2. Send EcoCash</span>
              <p>Send $2 USD via EcoCash or USD cash to our local seller agent via WhatsApp.</p>
            </div>
            <div className="space-y-2">
              <span className="font-mono text-teal-400 font-bold text-sm block">3. Signed Stamp</span>
              <p>Seller runs an offline script that signs your Device ID with the Ed25519 private key.</p>
            </div>
            <div className="space-y-2">
              <span className="font-mono text-teal-400 font-bold text-sm block">4. Paste Once</span>
              <p>Paste the signed code into QuickCard. The built-in public key validates it offline. Unlocked!</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
