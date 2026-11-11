import React, { useState } from 'react';
import { Recipient, UnlockLicense, CardTemplate, Palette, FontPair } from '../../types/template';
import { parseRecipientList, createWhatsAppLink } from '../../lib/phoneUtils';
import { mergeTemplateText, generateDefaultWhatsAppMessage } from '../../lib/mergeUtils';
import { drawCardToCanvas, downloadCardImage } from '../../lib/cardRenderer';
import { X, Send, Users, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft, Download, ShieldCheck } from 'lucide-react';

interface WhatsAppQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: CardTemplate;
  fieldValues: Record<string, string>;
  palette: Palette;
  fontPair: FontPair;
  license: UnlockLicense;
  onOpenUnlockModal: () => void;
}

const SAMPLE_GUEST_TEXT = `Rudo Chidzero, 0771234567
Farai Moyo, 0782345678
Tariro Ndlovu, 0712345678
Uncle Tapiwa, 0731234567
Mai Chenai, 0779998888
Baba Munashe, 0773111222`;

export const WhatsAppQueueModal: React.FC<WhatsAppQueueModalProps> = ({
  isOpen,
  onClose,
  template,
  fieldValues,
  palette,
  fontPair,
  license,
  onOpenUnlockModal,
}) => {
  const [step, setStep] = useState<'input' | 'queue' | 'finished'>('input');
  const [rawText, setRawText] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [consentAcknowledged, setConsentAcknowledged] = useState(false);
  const [messageTemplate, setMessageTemplate] = useState('');

  // Setup default message template when modal opens
  React.useEffect(() => {
    if (!isOpen) return;
    const cardTitle = fieldValues.title || template.name;
    const cardDate = fieldValues.when || fieldValues.dateTime || fieldValues.dateVenue;
    const cardVenue = fieldValues.venue || fieldValues.location;
    setMessageTemplate(generateDefaultWhatsAppMessage(cardTitle, cardDate, cardVenue));
  }, [isOpen, template.id]);

  if (!isOpen) return null;

  // Tier limits
  const maxRecipients = license.isUnlocked
    ? license.tier === 'event_pass'
      ? 1000
      : 100
    : 5;

  const handleParseAndStart = () => {
    const parsed = parseRecipientList(rawText);
    if (parsed.length === 0) {
      alert('Please enter at least one recipient line in the format: Name, Phone');
      return;
    }
    setRecipients(parsed);
    setCurrentIndex(0);
    setStep('queue');
  };

  const currentRecipient = recipients[currentIndex];
  const isOverLimit = recipients.length > maxRecipients;
  const activeRecipients = recipients.slice(0, maxRecipients);

  const currentMessage = currentRecipient
    ? mergeTemplateText(messageTemplate, { name: currentRecipient.name })
    : '';

  const currentWhatsAppLink = currentRecipient?.isValid
    ? createWhatsAppLink(currentRecipient.phone, currentMessage)
    : '';

  const handleNext = () => {
    if (currentIndex < activeRecipients.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setStep('finished');
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleDownloadPersonalisedCard = async () => {
    if (!currentRecipient) return;
    const tempCanvas = document.createElement('canvas');
    drawCardToCanvas(tempCanvas, {
      template,
      fieldValues,
      palette,
      fontPair,
      isUnlocked: license.isUnlocked,
      personalisedName: currentRecipient.name,
    });
    await downloadCardImage(tempCanvas, `${template.name}-${currentRecipient.name}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0F172A]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1E293B] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#334155] relative my-8 text-slate-100">
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
            <span>WhatsApp Personalised Queue</span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span className="text-amber-400">The User Always Taps Send</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white font-heading">
            Personalised WhatsApp Sending
          </h3>
        </div>

        {/* Step 1: Input & Number Cleaning */}
        {step === 'input' && (
          <div className="space-y-5">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 font-body">
                  Recipient List (One person per line)
                </label>
                <div className="flex items-center gap-2">
                  {rawText ? (
                    <button
                      onClick={() => setRawText('')}
                      className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  ) : (
                    <button
                      onClick={() => setRawText(SAMPLE_GUEST_TEXT)}
                      className="text-[11px] text-teal-400 hover:text-teal-300 font-medium cursor-pointer"
                    >
                      Fill sample format
                    </button>
                  )}
                </div>
              </div>

              {/* Semi-transparent non-editable format guide */}
              <div className="p-3.5 bg-[#0F172A]/70 border border-[#334155] rounded-xl text-xs space-y-1.5 select-none pointer-events-none">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                  <span>How to write: Name, Phone</span>
                  <span className="font-mono text-slate-500 text-[10px]">Non-editable format guide</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] font-mono text-slate-300/80">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                    <span>Name, 0771234567 <span className="font-sans text-[10px] text-slate-400">(Econet)</span></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                    <span>Name, 0712345678 <span className="font-sans text-[10px] text-slate-400">(NetOne)</span></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                    <span>Name, 0731234567 <span className="font-sans text-[10px] text-slate-400">(Telecel)</span></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                    <span>Name, +263771234567 <span className="font-sans text-[10px] text-slate-400">(Intl)</span></span>
                  </div>
                </div>
              </div>

              <textarea
                rows={5}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl p-3 font-mono text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-teal-500 transition-all placeholder:text-slate-500 placeholder:italic"
                placeholder="Paste or type your recipient names and numbers here..."
              />
              <p className="text-[11px] text-slate-400 font-body">
                Numbers are cleaned locally: strips spaces, normalizes 077/078 to +263, and checks length.
              </p>
            </div>

            {/* Custom Message Template with {name} */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5 font-body">
                WhatsApp Message Template (contains <code className="text-teal-400">{'{name}'}</code>)
              </label>
              <textarea
                rows={3}
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl p-3 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-teal-500 transition-all font-body"
              />
            </div>

            {/* Tier Limit Notice */}
            <div className="p-3.5 bg-[#0F172A] border border-[#334155] rounded-2xl flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-200">
                  Limit for {license.isUnlocked ? license.tier : 'Free tier'}: {maxRecipients} recipients
                </span>
                <span className="block text-slate-400 text-[11px]">
                  {!license.isUnlocked && 'Unlock for $2 to increase limit to 100 recipients per list.'}
                </span>
              </div>

              {!license.isUnlocked && (
                <button
                  onClick={onOpenUnlockModal}
                  className="px-3.5 py-1.5 min-h-[44px] text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  Unlock ($2)
                </button>
              )}
            </div>

            {/* Consent Checklist */}
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentAcknowledged}
                  onChange={(e) => setConsentAcknowledged(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-teal-600 focus:ring-teal-500 bg-[#0F172A] border-[#334155]"
                />
                <span className="text-xs text-emerald-200 leading-relaxed font-body">
                  <strong className="text-emerald-300">Consent reminder:</strong> “I confirm I will only message people who expect to hear from me.”
                  I will review each message and tap Send personally in WhatsApp.
                </span>
              </label>
            </div>

            <button
              onClick={handleParseAndStart}
              disabled={!consentAcknowledged}
              className="w-full min-h-[48px] py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 disabled:opacity-40 text-white font-semibold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer font-body"
            >
              <span>Begin Step-by-Step Send Queue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Active Send Queue */}
        {step === 'queue' && currentRecipient && (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
                <span>
                  Guest {currentIndex + 1} of {activeRecipients.length}
                </span>
                <span className="text-teal-400 font-mono">
                  {Math.round(((currentIndex + 1) / activeRecipients.length) * 100)}% Complete
                </span>
              </div>
              <div className="w-full h-2 bg-[#0F172A] rounded-full overflow-hidden border border-[#334155]">
                <div
                  style={{ width: `${((currentIndex + 1) / activeRecipients.length) * 100}%` }}
                  className="h-full bg-teal-500 transition-all duration-300 rounded-full"
                />
              </div>
            </div>

            {/* Current Recipient Card */}
            <div className="p-5 bg-[#0F172A] border border-[#334155] rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider block font-body">
                    Now Messaging:
                  </span>
                  <h4 className="text-lg font-bold text-white font-heading">
                    {currentRecipient.name}
                  </h4>
                  <span className="text-xs font-mono text-slate-300">
                    {currentRecipient.phone}
                  </span>
                </div>

                <div className="text-right">
                  {currentRecipient.isValid ? (
                    <span className="px-2.5 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[11px] font-semibold rounded-lg">
                      Valid Zimbabwe Mobile
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-semibold rounded-lg">
                      Invalid Format
                    </span>
                  )}
                </div>
              </div>

              {/* Personalised WhatsApp text preview */}
              <div className="p-3.5 bg-[#1E293B] border border-[#334155] rounded-xl text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed font-body">
                {currentMessage}
              </div>

              {/* Action Buttons for this recipient */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href={currentWhatsAppLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[48px] px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer font-body"
                >
                  <Send className="w-4 h-4 text-teal-200" />
                  <span>Open WhatsApp Chat for {currentRecipient.name}</span>
                </a>

                <button
                  onClick={handleDownloadPersonalisedCard}
                  className="min-h-[48px] px-3.5 py-2.5 bg-[#1E293B] hover:bg-slate-700 text-slate-200 border border-[#334155] font-medium text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                  title="Export card with this person's name badge"
                >
                  <Download className="w-4 h-4 text-teal-400" />
                  <span>Download Card for {currentRecipient.name}</span>
                </button>
              </div>
            </div>

            {/* Stepper Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-[#334155]">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="min-h-[48px] px-4 py-2 text-xs font-semibold text-slate-300 bg-[#0F172A] hover:bg-slate-800 disabled:opacity-40 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer border border-[#334155]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={() => setStep('input')}
                className="text-xs text-slate-400 hover:text-white"
              >
                Edit List
              </button>

              <button
                onClick={handleNext}
                className="min-h-[48px] px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md font-body"
              >
                <span>
                  {currentIndex === activeRecipients.length - 1 ? 'Finish Queue' : 'Next Person'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Finished */}
        {step === 'finished' && (
          <div className="text-center py-8 space-y-4">
            <div className="w-14 h-14 bg-teal-500/20 border border-teal-500/40 text-teal-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h4 className="text-xl font-bold text-white font-heading">
              All {activeRecipients.length} Messages Prepared!
            </h4>

            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto font-body">
              You reviewed each guest, generated individual cards, and tapped Send in WhatsApp according to the Golden Rule.
            </p>

            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => setStep('input')}
                className="min-h-[48px] px-4 py-2 text-xs font-semibold text-slate-300 bg-[#0F172A] hover:bg-slate-800 rounded-xl transition-colors cursor-pointer border border-[#334155]"
              >
                Send to Another Batch
              </button>
              <button
                onClick={onClose}
                className="min-h-[48px] px-6 py-2 text-xs sm:text-sm font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-xl transition-colors cursor-pointer shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
