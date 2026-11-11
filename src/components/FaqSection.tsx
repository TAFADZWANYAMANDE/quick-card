import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'Does QuickCard consume mobile data or require an internet bundle?',
    answer:
      'No. QuickCard is strictly offline-first. All 12 templates, fonts, borders, canvas drawing code, and cryptographic verification engines are bundled directly inside the app. Once installed, it works completely in airplane mode with mobile data switched off.',
  },
  {
    question: 'How does personalised sending work without violating WhatsApp policies?',
    answer:
      'QuickCard strictly honors the Golden Rule: the user always taps Send. We never automate clicks, never use accessibility exploits, and never bot messages. The app renders a personalised card with that guest’s name, prepares an official wa.me chat link with your greeting, and lets you tap Send in WhatsApp. You retain complete control over every single message.',
  },
  {
    question: 'How does phone number cleaning work for Zimbabwe mobile networks?',
    answer:
      'You can paste numbers in any common local format: 0771234567, 078..., 071..., 073..., or with spaces and dashes. QuickCard automatically strips symbols, adds the international Zimbabwe country code +263, and flags invalid digit counts before you start sending.',
  },
  {
    question: 'Can I type cards in Shona, Ndebele, or other languages?',
    answer:
      'Yes, absolutely. The card editor accepts any text you type, including Shona, Ndebele, English, and Portuguese. Diacritics and apostrophes are rendered crisply using our bundled open-license fonts.',
  },
  {
    question: 'What is the “Made with QuickCard” tag and how is it removed?',
    answer:
      'Free cards include a tiny, elegant “Made with QuickCard” mark in the bottom corner. A one-time $2 USD (or EcoCash equivalent) unlock code removes the tag permanently and expands your personalised recipient limit to 100 people per send.',
  },
  {
    question: 'How does an offline unlock code work without a server?',
    answer:
      'QuickCard uses Ed25519 digital signature cryptography. When you purchase an unlock, the seller signs your phone’s unique Device ID using their private key on an offline laptop. When you paste that code into QuickCard, the app checks the signature with its bundled public key offline. No server or internet connection is required to verify your license.',
  },
  {
    question: 'How do auto-calculating tables work for Savings Groups (Mukando)?',
    answer:
      'Templates like the Contributions Record and Grocery List feature dynamic table rows. As you type amounts for each member (e.g., $50 for Mai Nyasha, $50 for Baba Munashe), QuickCard automatically sums the total and paints a neat, tamper-resistant financial summary card.',
  },
];

export const FaqSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="py-16 sm:py-24 bg-[#0F172A] border-b border-[#334155] text-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-semibold tracking-wide font-body">
            <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
            <span>Frequently Asked Questions</span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span>Clear Answers</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-heading">
            Everything you need to know about QuickCard
          </h2>
        </div>

        <div className="divide-y divide-[#334155] bg-[#1E293B] rounded-3xl border border-[#334155] p-5 sm:p-7 shadow-xl">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className="py-4 first:pt-2 last:pb-2">
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full min-h-[48px] text-left flex items-center justify-between gap-4 text-white hover:text-teal-300 transition-colors focus:outline-none cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-semibold leading-snug font-heading">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-teal-400' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed pr-6 font-body">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
