import React, { useState } from 'react';
import { Send, Smartphone, ShieldCheck, CheckCircle2, MessageSquare, AlertCircle, HeartHandshake } from 'lucide-react';
import { createWhatsAppLink } from '../lib/phoneUtils';
import { mergeTemplateText } from '../lib/mergeUtils';

export const HowSendingWorks: React.FC = () => {
  const [demoName, setDemoName] = useState('');
  const [demoPhone, setDemoPhone] = useState('');
  const [demoMsg] = useState(
    'Warm greetings {name}! 🌟\nYou are warmly invited to our Church Fellowship this Wednesday at 18:00.\nPlease see our card attached.'
  );

  const displayName = demoName.trim();
  const displayPhone = demoPhone.trim();

  const previewMessage = mergeTemplateText(demoMsg, { name: displayName || '[Guest Name]' });
  const previewLink = displayPhone ? createWhatsAppLink(displayPhone, previewMessage) : '';

  return (
    <section id="how-it-works-section" className="py-16 sm:py-24 bg-[#0F172A] border-b border-[#334155] text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-semibold tracking-wide font-body">
            <HeartHandshake className="w-3.5 h-3.5 text-teal-400" />
            <span>WhatsApp Sending Flow</span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span>Consent-First Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-heading">
            The Golden Rule: You always tap Send
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-body">
            QuickCard never automates sending, never scrapes your contacts, and never puts your WhatsApp account at risk.
            Instead, it prepares a personalised card and greeting for each person, and you tap Send one by one.
          </p>
        </div>

        {/* 3 Steps Bento Grid (Solid #1E293B Containers with #334155 Hairline Borders) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12">
          {/* Step 1 */}
          <div className="p-7 rounded-3xl bg-[#1E293B] border border-[#334155] flex flex-col justify-between space-y-5 shadow-lg">
            <div className="space-y-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#042F2E] text-teal-300 border border-teal-500/40 font-mono font-bold text-base flex items-center justify-center shadow-inner">
                01
              </div>
              <h3 className="text-lg font-bold text-white font-heading">Fill in the Blanks</h3>
              <p className="text-sm text-slate-300 leading-relaxed font-body">
                Choose from 12 templates. Type your event title, day, venue, and theme.
                Text auto-shrinks to fit inside the card borders without clipping.
              </p>
            </div>
            <div className="pt-3 border-t border-[#334155] text-xs text-slate-400 font-body">
              Takes under 2 minutes · 4 colour palettes
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-7 rounded-3xl bg-[#1E293B] border border-[#334155] flex flex-col justify-between space-y-5 shadow-lg">
            <div className="space-y-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#042F2E] text-teal-300 border border-teal-500/40 font-mono font-bold text-base flex items-center justify-center shadow-inner">
                02
              </div>
              <h3 className="text-lg font-bold text-white font-heading">Paste Your Guest List</h3>
              <p className="text-sm text-slate-300 leading-relaxed font-body">
                Paste simple lines in the format <code className="bg-[#0F172A] border border-[#334155] px-2 py-0.5 rounded text-teal-300 text-xs font-mono">[Name], [Number]</code>.
                Numbers are cleaned to standard Zimbabwe format <code className="bg-[#0F172A] border border-[#334155] px-2 py-0.5 rounded text-amber-300 text-xs font-mono">+263...</code> automatically.
              </p>
            </div>
            <div className="pt-3 border-t border-[#334155] text-xs text-slate-400 font-body">
              No contacts access required · Stored on phone only
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-7 rounded-3xl bg-[#1E293B] border border-[#334155] flex flex-col justify-between space-y-5 shadow-lg">
            <div className="space-y-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#042F2E] text-teal-300 border border-teal-500/40 font-mono font-bold text-base flex items-center justify-center shadow-inner">
                03
              </div>
              <h3 className="text-lg font-bold text-white font-heading">Step-by-Step WhatsApp Queue</h3>
              <p className="text-sm text-slate-300 leading-relaxed font-body">
                QuickCard prepares each person&apos;s custom card and individual WhatsApp link.
                Tap Send in WhatsApp, return to the app, and tap Next.
              </p>
            </div>
            <div className="pt-3 border-t border-[#334155] text-xs text-slate-400 font-body">
              Safe from spam bans · Official wa.me links
            </div>
          </div>
        </div>

        {/* Interactive Simulator Box (Solid #1E293B Surface) */}
        <div className="bg-[#1E293B] border border-[#334155] text-slate-100 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl">
          <div className="max-w-2xl mb-8 space-y-1.5">
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider font-body">
              Interactive WhatsApp Queue Simulator
            </span>
            <h3 className="text-xl sm:text-2xl font-bold font-heading text-white">
              Try the {'{name}'} personaliser
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-body">
              Type any name and number below to see how QuickCard formats the individual greeting and wa.me link.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Input Controls */}
            <div className="lg:col-span-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5 font-body">
                  Recipient Name (replaces {'{name}'})
                </label>
                <input
                  type="text"
                  value={demoName}
                  onChange={(e) => setDemoName(e.target.value)}
                  className="w-full min-h-[48px] bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 font-medium font-body"
                  placeholder="Type a recipient name here..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-200 font-body">
                    Recipient Phone Number
                  </label>
                  <span className="text-[11px] text-teal-400 font-mono">
                    Zimbabwe 077... or +263...
                  </span>
                </div>
                <input
                  type="text"
                  value={demoPhone}
                  onChange={(e) => setDemoPhone(e.target.value)}
                  className="w-full min-h-[48px] bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 font-mono"
                  placeholder="e.g. 0771 234 567"
                />
                {/* Non-editable format preview strip */}
                <div className="mt-2 px-3 py-1.5 rounded-xl bg-[#0F172A]/70 border border-[#334155] text-[11px] text-slate-400 flex items-center justify-between pointer-events-none select-none font-body">
                  <span className="opacity-80">Cleaned prefixes:</span>
                  <span className="font-mono text-teal-300">077 · 078 · 071 · 073 · +263</span>
                </div>
              </div>

              {/* Consent Notice Warning */}
              <div className="p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-xl flex items-start gap-2.5 text-xs text-amber-200">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="font-body">
                  Consent Reminder: <strong className="text-amber-300">“Only message people who expect to hear from you.”</strong>
                  QuickCard encourages thoughtful, small-batch community messaging.
                </span>
              </div>
            </div>

            {/* Generated WhatsApp Chat Preview */}
            <div className="lg:col-span-7 bg-[#0F172A] border border-[#334155] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#334155] pb-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs transition-colors ${
                    displayName ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400 border border-[#334155]'
                  }`}>
                    {displayName ? displayName[0].toUpperCase() : '?'}
                  </div>
                  <div>
                    {displayName ? (
                      <span className="font-semibold text-white block font-heading">{displayName}</span>
                    ) : (
                      <span className="text-slate-400 italic text-xs block select-none">
                        [Recipient name appears here]
                      </span>
                    )}

                    {displayPhone ? (
                      <span className="block text-[11px] text-teal-300 font-mono">{displayPhone}</span>
                    ) : (
                      <span className="block text-[11px] text-slate-500 font-mono opacity-60 select-none">
                        +263 •• ••• ••••
                      </span>
                    )}
                  </div>
                </div>

                {displayPhone ? (
                  <span className="text-[11px] text-teal-300 font-medium flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/15 border border-teal-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Ready to send
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500 font-medium">
                    Awaiting number input
                  </span>
                )}
              </div>

              {/* Chat Bubble */}
              <div className="bg-[#042F2E]/80 border border-teal-500/40 rounded-2xl p-4 text-xs sm:text-sm text-teal-100 font-body leading-relaxed whitespace-pre-wrap">
                {previewMessage}
              </div>

              {/* Action Button (Min 48px tap target) */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                {previewLink ? (
                  <a
                    href={previewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[48px] px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md font-body"
                  >
                    <Send className="w-4 h-4 text-teal-200" />
                    <span>Open wa.me Link for {displayName || 'Guest'}</span>
                  </a>
                ) : (
                  <div className="min-h-[48px] px-4 py-2.5 bg-slate-800 text-slate-500 border border-[#334155] text-xs sm:text-sm rounded-xl flex items-center gap-2 cursor-not-allowed select-none font-body">
                    <Send className="w-4 h-4 opacity-50" />
                    <span>Type a phone number to preview link</span>
                  </div>
                )}

                <span className="text-[11px] text-slate-400 font-mono truncate max-w-[280px]">
                  {previewLink || (
                    <span className="opacity-50 italic select-none">https://wa.me/[number]?text=...</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
