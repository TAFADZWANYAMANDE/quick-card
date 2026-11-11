import React, { useState } from 'react';
import { ArrowRight, Smartphone, Sparkles, Send, ShieldCheck, Check, Gem } from 'lucide-react';
import { STARTER_TEMPLATES } from '../lib/templates';
import { CardTemplate } from '../types/template';

interface HeroProps {
  onOpenStudio: (template?: CardTemplate) => void;
  onOpenApkModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenStudio, onOpenApkModal }) => {
  // Highlight templates for the hero interactive teaser
  const showcaseIds = [
    'church-midweek-01',
    'wedding-invite-04',
    'funeral-notice-06',
    'savings-meeting-09',
  ];
  const heroTemplates = STARTER_TEMPLATES.filter((t) => showcaseIds.includes(t.id));
  const [selectedTemplate, setSelectedTemplate] = useState<CardTemplate>(heroTemplates[0] || STARTER_TEMPLATES[0]);

  return (
    <section className="relative overflow-hidden pt-10 pb-16 lg:py-20 border-b border-[#334155] bg-radial-[at_top_center] from-[#1E293B]/70 via-[#0F172A] to-[#0F172A] text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Value Proposition & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            {/* Translucent pill badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-semibold tracking-wide font-body">
              <span className="w-2 h-2 rounded-full bg-teal-400"></span>
              <span>100% Offline Engine</span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span>Print-Grade Saturated Cards</span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span>WhatsApp Personalised</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white font-heading leading-[1.14] text-balance">
              Turn typed lines into print-grade cards. Send via WhatsApp.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed font-body">
              Designed for church notices, wedding invitations, funeral notices, and mukando contributions.
              Runs 100% offline in airplane mode with zero mobile data required. Double-line borders, corner diamonds, and individual names.
            </p>

            {/* Value checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm text-slate-300 font-body">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span>Works in airplane mode (zero internet)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span>Personalised card & text for every person</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span>Crisp 1080×1080 JPEG export</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span>Zimbabwe 077/078 & international cleaning</span>
              </div>
            </div>

            {/* CTAs (Min 48px touch targets) */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <button
                onClick={() => onOpenStudio(selectedTemplate)}
                className="min-h-[48px] px-6 py-3.5 text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-teal-600 via-emerald-600 to-amber-600 hover:from-teal-500 hover:to-amber-500 rounded-xl transition-all shadow-lg hover:shadow-teal-900/40 flex items-center gap-2.5 cursor-pointer font-body"
              >
                <span>Launch Card Studio</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenApkModal}
                className="min-h-[48px] px-5 py-3.5 text-sm sm:text-base font-medium text-slate-200 bg-[#1E293B] hover:bg-slate-700 border border-[#334155] rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer font-body"
              >
                <Smartphone className="w-4 h-4 text-teal-400" />
                <span>Get Android App (Offline APK)</span>
              </button>
            </div>

            {/* Regional & Trust markers */}
            <div className="pt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400 border-t border-[#334155] font-body">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                Zero contact upload
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-amber-300 font-medium">EcoCash & Innbucks friendly</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>English, Shona & Ndebele ready</span>
            </div>
          </div>

          {/* Right Column: Live Interactive Card Showcase (Solid #1E293B Container) */}
          <div className="lg:col-span-5">
            <div className="bg-[#1E293B] rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#334155]">
              {/* Category selector tabs */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#334155]">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-body">
                  Interactive Card Preview
                </span>
                <span className="text-xs text-teal-400 font-medium font-mono">1080 × 1080 Output</span>
              </div>

              {/* Template quick switches (Min 44px tap targets) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {heroTemplates.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl)}
                    className={`min-h-[44px] px-2.5 py-1.5 text-xs font-medium rounded-xl text-center truncate transition-colors cursor-pointer border ${
                      selectedTemplate.id === tpl.id
                        ? 'bg-teal-600/30 border-teal-500 text-teal-200 shadow-sm'
                        : 'bg-[#0F172A] border-[#334155] text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {tpl.occasionName.split(' ')[0]}
                  </button>
                ))}
              </div>

              {/* Visual Card Representation with Double-Line Border & Diamond Corners */}
              <div
                style={{
                  backgroundColor: selectedTemplate.palettes[0].background,
                  color: selectedTemplate.palettes[0].text,
                  borderColor: selectedTemplate.palettes[0].border,
                }}
                className="aspect-square w-full rounded-2xl p-6 sm:p-7 flex flex-col justify-between border-4 relative overflow-hidden shadow-2xl transition-all duration-300"
              >
                {/* Inner Inset Accent Border (Rule 2: 16px inset line with corner diamond knots) */}
                <div
                  style={{ borderColor: selectedTemplate.palettes[0].accent }}
                  className="absolute inset-4 border pointer-events-none opacity-80 rounded-sm"
                />

                {/* 4 Corner Diamonds */}
                <div style={{ backgroundColor: selectedTemplate.palettes[0].accent }} className="absolute top-4 left-4 w-2 h-2 rotate-45 transform -translate-x-1/2 -translate-y-1/2" />
                <div style={{ backgroundColor: selectedTemplate.palettes[0].accent }} className="absolute top-4 right-4 w-2 h-2 rotate-45 transform translate-x-1/2 -translate-y-1/2" />
                <div style={{ backgroundColor: selectedTemplate.palettes[0].accent }} className="absolute bottom-4 left-4 w-2 h-2 rotate-45 transform -translate-x-1/2 translate-y-1/2" />
                <div style={{ backgroundColor: selectedTemplate.palettes[0].accent }} className="absolute bottom-4 right-4 w-2 h-2 rotate-45 transform translate-x-1/2 translate-y-1/2" />

                {/* Top Section */}
                <div className="relative z-10 text-center space-y-1.5 pt-2">
                  <div
                    style={{ color: selectedTemplate.palettes[0].accent }}
                    className="text-[11px] font-bold tracking-widest uppercase font-mono"
                  >
                    {selectedTemplate.fields[0]?.default || 'QUICKCARD NOTICE'}
                  </div>

                  <h3
                    style={{
                      color: selectedTemplate.palettes[0].text,
                      fontFamily: '"Playfair Display", Georgia, serif',
                    }}
                    className="text-lg sm:text-2xl font-bold leading-tight"
                  >
                    {selectedTemplate.fields[1]?.default || selectedTemplate.name}
                  </h3>
                </div>

                {/* Central divider with diamond knot */}
                <div className="relative z-10 flex items-center justify-center my-1">
                  <div style={{ backgroundColor: selectedTemplate.palettes[0].accent }} className="h-[1px] flex-1 max-w-[100px] opacity-60" />
                  <div style={{ backgroundColor: selectedTemplate.palettes[0].accent }} className="w-1.5 h-1.5 rotate-45 mx-2" />
                  <div style={{ backgroundColor: selectedTemplate.palettes[0].accent }} className="h-[1px] flex-1 max-w-[100px] opacity-60" />
                </div>

                {/* Middle Section */}
                <div className="relative z-10 text-center space-y-1.5 py-1">
                  <div
                    style={{ color: selectedTemplate.palettes[0].accent }}
                    className="text-xs sm:text-sm font-semibold font-body"
                  >
                    {selectedTemplate.fields[2]?.default || 'Wednesday, 18:00 HRS'}
                  </div>

                  <p
                    style={{ color: selectedTemplate.palettes[0].secondaryText }}
                    className="text-xs line-clamp-3 leading-relaxed px-2 font-body"
                  >
                    {selectedTemplate.fields[3]?.default || selectedTemplate.tagline}
                  </p>
                </div>

                {/* Bottom Section */}
                <div className="relative z-10 text-center pt-2 border-t border-current/15">
                  <div className="text-[11px] sm:text-xs opacity-85 font-body">
                    {selectedTemplate.fields[selectedTemplate.fields.length - 1]?.default || 'RSVP via WhatsApp'}
                  </div>
                  <div className="text-[10px] opacity-60 mt-1 font-mono">
                    Made with QuickCard
                  </div>
                </div>
              </div>

              {/* Action bar below preview */}
              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-400 font-body">
                  <span className="font-semibold text-white block">{selectedTemplate.name}</span>
                  <span className="text-[11px] text-teal-400">4 saturated palettes · Playfair & Lato</span>
                </div>

                <button
                  onClick={() => onOpenStudio(selectedTemplate)}
                  className="min-h-[44px] px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-md font-body"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Customize in Studio</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
