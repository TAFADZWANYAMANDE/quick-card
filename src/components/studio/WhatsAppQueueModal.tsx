import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Recipient,
  UnlockLicense,
  CardTemplate,
  Palette,
  FontPair,
  CardCustomizations,
  ContactGroup,
} from '../../types/template';
import { parseRecipientList, createWhatsAppLink } from '../../lib/phoneUtils';
import { mergeTemplateText, generateDefaultWhatsAppMessage } from '../../lib/mergeUtils';
import {
  drawCardToCanvas,
  downloadCardImage,
  shareCardDirectly,
  copyCardImageToClipboard,
  DEFAULT_CUSTOMIZATIONS,
} from '../../lib/cardRenderer';
import {
  loadContactGroups,
  saveContactGroup,
  deleteContactGroup,
  loadPersistedQueue,
  savePersistedQueue,
  clearPersistedQueue,
} from '../../lib/storage';
import {
  X,
  Send,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Download,
  Upload,
  Share2,
  Paperclip,
  Copy,
  BookmarkPlus,
  Trash2,
  Users,
  SkipForward,
  Check,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';

interface WhatsAppQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: CardTemplate;
  fieldValues: Record<string, string>;
  palette: Palette;
  fontPair: FontPair;
  license: UnlockLicense;
  tableItems?: Array<{ id: string; name: string; amount: number; checked?: boolean }>;
  customizations?: CardCustomizations;
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
  tableItems,
  customizations = DEFAULT_CUSTOMIZATIONS,
  onOpenUnlockModal,
}) => {
  const [step, setStep] = useState<'input' | 'queue' | 'finished'>('input');
  const [rawText, setRawText] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [consentAcknowledged, setConsentAcknowledged] = useState(false);
  const [messageTemplate, setMessageTemplate] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  // Saved Contact Groups
  const [contactGroups, setContactGroups] = useState<ContactGroup[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [showSaveGroupInput, setShowSaveGroupInput] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [assetTick, setAssetTick] = useState(0);

  const handleAssetReady = useCallback(() => {
    setAssetTick((t) => t + 1);
  }, []);

  // Setup default message template & load saved groups / persisted queue on open
  useEffect(() => {
    if (!isOpen) return;
    setContactGroups(loadContactGroups());
    setShareFeedback(null);
    setParseError(null);

    const cardTitle = fieldValues.title || template.name;
    const cardDate = fieldValues.when || fieldValues.dateTime || fieldValues.dateVenue;
    const cardVenue = fieldValues.venue || fieldValues.location;
    const defaultMsg = generateDefaultWhatsAppMessage(cardTitle, cardDate, cardVenue);

    const savedQueue = loadPersistedQueue();
    if (savedQueue && savedQueue.recipients.length > 0 && savedQueue.step === 'queue') {
      setRawText(savedQueue.rawText);
      setMessageTemplate(savedQueue.messageTemplate || defaultMsg);
      setRecipients(savedQueue.recipients);
      setCurrentIndex(Math.min(savedQueue.currentIndex, savedQueue.recipients.length - 1));
      setConsentAcknowledged(true);
      setStep('queue');
    } else {
      setMessageTemplate(defaultMsg);
      setStep('input');
    }
  }, [isOpen, template.id]);

  // Persist active queue state automatically
  useEffect(() => {
    if (!isOpen) return;
    if (step === 'queue' && recipients.length > 0) {
      savePersistedQueue({
        rawText,
        messageTemplate,
        recipients,
        currentIndex,
        step,
        updatedAt: Date.now(),
      });
    } else if (step === 'finished') {
      clearPersistedQueue();
    }
  }, [isOpen, step, recipients, currentIndex, rawText, messageTemplate]);

  const maxRecipients = license.isUnlocked
    ? license.tier === 'event_pass'
      ? 1000
      : 100
    : 5;

  const activeRecipients = recipients.slice(0, maxRecipients);
  const currentRecipient = activeRecipients[currentIndex];

  // Draw live personalized thumbnail preview for currentRecipient
  useEffect(() => {
    if (!isOpen || step !== 'queue' || !currentRecipient || !previewCanvasRef.current) return;
    drawCardToCanvas(previewCanvasRef.current, {
      template,
      fieldValues,
      palette,
      fontPair,
      isUnlocked: license.isUnlocked,
      personalisedName: currentRecipient.name,
      tableItems,
      customizations,
      onAssetReady: handleAssetReady,
    });
  }, [
    isOpen,
    step,
    currentRecipient,
    template,
    fieldValues,
    palette,
    fontPair,
    license.isUnlocked,
    tableItems,
    customizations,
    assetTick,
    handleAssetReady,
  ]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawText((prev) => (prev ? `${prev.trim()}\n${content.trim()}` : content.trim()));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSaveGroup = () => {
    const parsed = parseRecipientList(rawText);
    if (parsed.length === 0) {
      setParseError('Enter at least one Name, Phone line before saving a group.');
      return;
    }
    setParseError(null);
    const updated = saveContactGroup(newGroupName || 'Saved Group', rawText, parsed.length);
    setContactGroups(updated);
    setNewGroupName('');
    setShowSaveGroupInput(false);
  };

  const handleLoadGroup = (group: ContactGroup) => {
    setRawText(group.rawText);
    setParseError(null);
  };

  const handleDeleteGroup = (id: string) => {
    setContactGroups(deleteContactGroup(id));
  };

  const handleParseAndStart = () => {
    const parsed = parseRecipientList(rawText);
    if (parsed.length === 0) {
      setParseError('Please enter at least one recipient line in the format: Name, Phone (e.g. Tariro, 0771234567)');
      return;
    }
    setParseError(null);
    setRecipients(parsed);
    setCurrentIndex(0);
    setStep('queue');
  };

  const handleResetQueue = () => {
    clearPersistedQueue();
    setStep('input');
    setCurrentIndex(0);
    setShareFeedback(null);
  };

  const currentMessage = currentRecipient
    ? mergeTemplateText(messageTemplate, { name: currentRecipient.name })
    : '';

  const currentWhatsAppLink = currentRecipient?.isValid
    ? createWhatsAppLink(currentRecipient.phone, currentMessage)
    : '';

  const markStatusAndAdvance = (status: 'sent' | 'skipped') => {
    setShareFeedback(null);
    setRecipients((prev) =>
      prev.map((r, idx) => (idx === currentIndex ? { ...r, status } : r))
    );
    if (currentIndex < activeRecipients.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setStep('finished');
    }
  };

  const handlePrev = () => {
    setShareFeedback(null);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const renderOffscreenPersonalisedCanvas = (): HTMLCanvasElement => {
    const tempCanvas = document.createElement('canvas');
    drawCardToCanvas(tempCanvas, {
      template,
      fieldValues,
      palette,
      fontPair,
      isUnlocked: license.isUnlocked,
      personalisedName: currentRecipient?.name,
      tableItems,
      customizations,
    });
    return tempCanvas;
  };

  const handleDownloadPersonalisedCard = async () => {
    if (!currentRecipient) return;
    const tempCanvas = renderOffscreenPersonalisedCanvas();
    await downloadCardImage(tempCanvas, `${template.name}-${currentRecipient.name}`, 'jpeg');
    setShareFeedback({
      type: 'info',
      message: `Card image for ${currentRecipient.name} downloaded to your files/gallery!`,
    });
  };

  const handleCopyImage = async () => {
    if (!currentRecipient) return;
    const tempCanvas = renderOffscreenPersonalisedCanvas();

    const copied = await copyCardImageToClipboard(tempCanvas);
    if (copied) {
      setShareFeedback({
        type: 'success',
        message: `Card image for ${currentRecipient.name} copied! Click into WhatsApp Web chat and press Ctrl + V (Paste) to attach.`,
      });
    } else {
      await downloadCardImage(tempCanvas, `${template.name}-${currentRecipient.name}`, 'jpeg');
      setShareFeedback({
        type: 'info',
        message: `Card picture downloaded! Drag it into WhatsApp or tap 📎 (Paperclip) to attach.`,
      });
    }
  };

  const handleShareDocumentAndText = async () => {
    if (!currentRecipient) return;
    setIsSharing(true);
    setShareFeedback(null);

    try {
      const tempCanvas = renderOffscreenPersonalisedCanvas();
      const res = await shareCardDirectly(
        tempCanvas,
        `${template.name}-${currentRecipient.name}`,
        currentMessage
      );

      if (res.method === 'web-share') {
        if (res.success) {
          setRecipients((prev) =>
            prev.map((r, idx) => (idx === currentIndex ? { ...r, status: 'sent' } : r))
          );
          setShareFeedback({
            type: 'success',
            message: `Card image document & message sent to share sheet for ${currentRecipient.name}!`,
          });
        }
      } else {
        if (currentWhatsAppLink) {
          window.open(currentWhatsAppLink, '_blank', 'noopener,noreferrer');
        }
        setShareFeedback({
          type: 'info',
          message: res.clipboardCopied
            ? `Card picture copied to clipboard & downloaded! Press Ctrl + V (Paste) inside WhatsApp Web to attach the picture!`
            : `Card picture downloaded! Tap 📎 (Paperclip) in WhatsApp to attach the image.`,
        });
      }
    } catch (err: any) {
      setShareFeedback({
        type: 'error',
        message: 'Could not send document directly: ' + (err?.message || 'unknown error'),
      });
    } finally {
      setIsSharing(false);
    }
  };

  const sentCount = activeRecipients.filter((r) => r.status === 'sent').length;
  const skippedCount = activeRecipients.filter((r) => r.status === 'skipped').length;

  return (
    <div className="fixed inset-0 z-50 bg-[#0F172A]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1E293B] rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-[#334155] relative my-8 text-slate-100">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 pr-12">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400 mb-1 font-body">
            <span>WhatsApp Personalised Queue</span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span className="text-amber-400">The User Always Taps Send</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white font-heading">
            Personalised WhatsApp Sending
          </h3>
        </div>

        {/* Step 1: Input & Contact Groups */}
        {step === 'input' && (
          <div className="space-y-5">
            {/* Saved Contact Groups Strip */}
            <div className="p-3.5 bg-[#0F172A] border border-[#334155] rounded-2xl space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 font-body">
                  <Users className="w-4 h-4 text-teal-400" />
                  <span>Saved Contact Groups ({contactGroups.length})</span>
                </span>

                {!showSaveGroupInput ? (
                  <button
                    type="button"
                    onClick={() => setShowSaveGroupInput(true)}
                    disabled={!rawText.trim()}
                    className="text-[11px] font-semibold text-amber-300 hover:text-amber-200 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>Save Current List as Group</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="e.g. Choir / Family VIP"
                      className="h-8 bg-[#1E293B] border border-[#334155] rounded-lg px-2.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                    />
                    <button
                      type="button"
                      onClick={handleSaveGroup}
                      className="h-8 px-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSaveGroupInput(false)}
                      className="h-8 px-2 text-xs text-slate-400 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {contactGroups.length === 0 ? (
                <p className="text-[11px] text-slate-400">
                  Save recurring church committees, mukando groups, or family lists here offline for 1-click reuse.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {contactGroups.map((grp) => (
                    <div
                      key={grp.id}
                      className="inline-flex items-center gap-1 bg-[#1E293B] border border-[#334155] rounded-xl pl-2.5 pr-1 py-1 text-xs"
                    >
                      <button
                        type="button"
                        onClick={() => handleLoadGroup(grp)}
                        className="text-teal-300 hover:text-white font-medium cursor-pointer"
                      >
                        {grp.name} <span className="text-slate-400 font-mono text-[10px]">({grp.count})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteGroup(grp.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                        title="Delete group"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 font-body">
                  Recipient List (One person per line)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".csv,.txt"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] text-teal-400 hover:text-teal-300 font-medium cursor-pointer flex items-center gap-1 border border-teal-500/30 px-2.5 py-1 rounded-lg bg-teal-950/40"
                    title="Upload contacts from a CSV or TXT file"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload CSV/TXT</span>
                  </button>

                  {rawText ? (
                    <button
                      type="button"
                      onClick={() => setRawText('')}
                      className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer px-2 py-1"
                    >
                      Clear
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setRawText(SAMPLE_GUEST_TEXT)}
                      className="text-[11px] text-slate-300 hover:text-white font-medium cursor-pointer px-2 py-1"
                    >
                      Fill sample format
                    </button>
                  )}
                </div>
              </div>

              <div className="p-3 bg-[#0F172A]/70 border border-[#334155] rounded-xl text-xs space-y-1.5 select-none pointer-events-none">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                  <span>Format: Name, Phone</span>
                  <span className="font-mono text-slate-500 text-[10px]">Zimbabwe 077 / 078 / 071 / 073 & Intl</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px] font-mono text-slate-300/80">
                  <span>Name, 0771234567</span>
                  <span>Name, 0782345678</span>
                  <span>Name, 0712345678</span>
                  <span>Name, +263771234567</span>
                </div>
              </div>

              <textarea
                rows={5}
                value={rawText}
                onChange={(e) => {
                  setRawText(e.target.value);
                  setParseError(null);
                }}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl p-3 font-mono text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-teal-500 transition-all placeholder:text-slate-500 placeholder:italic"
                placeholder="Paste, type, or upload CSV/TXT with recipient names and numbers here..."
              />
            </div>

            {parseError && (
              <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}

            {/* Custom Message Template */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5 font-body">
                WhatsApp Message Template (uses <code className="text-teal-400">{'{name}'}</code>)
              </label>
              <textarea
                rows={3}
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl p-3 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-teal-500 transition-all font-body"
              />
            </div>

            {/* Tier Limit Notice */}
            <div className="p-3.5 bg-[#0F172A] border border-[#334155] rounded-2xl flex items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-200">
                  Limit for {license.isUnlocked ? (license.tier === 'unlocked' ? 'Pro Lifetime' : 'Pro Event Pass') : 'Free Plan'}: {maxRecipients} recipients
                </span>
                <span className="block text-slate-400 text-[11px]">
                  {!license.isUnlocked && 'Upgrade to Pro Plan ($2) to increase limit to 100 recipients per list.'}
                </span>
              </div>

              {!license.isUnlocked && (
                <button
                  type="button"
                  onClick={onOpenUnlockModal}
                  className="px-3.5 py-1.5 min-h-[44px] text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  Upgrade to Pro ($2)
                </button>
              )}
            </div>

            {/* Consent Checklist */}
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl">
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
              type="button"
              onClick={handleParseAndStart}
              disabled={!consentAcknowledged}
              className="w-full min-h-[48px] py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 disabled:opacity-40 text-white font-semibold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer font-body"
            >
              <span>Begin Step-by-Step Send Queue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Active Send Queue with Live Mini Card Preview */}
        {step === 'queue' && currentRecipient && (
          <div className="space-y-5">
            {/* Progress Bar */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-300 mb-1.5">
                <span>
                  Guest {currentIndex + 1} of {activeRecipients.length}
                  <span className="text-slate-500 font-normal ml-2">
                    ({sentCount} sent · {skippedCount} skipped)
                  </span>
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetQueue}
                    className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                    title="Reset & start a different list"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>New List</span>
                  </button>
                  <span className="text-teal-400 font-mono">
                    {Math.round(((currentIndex + 1) / activeRecipients.length) * 100)}%
                  </span>
                </div>
              </div>
              <div className="w-full h-2 bg-[#0F172A] rounded-full overflow-hidden border border-[#334155]">
                <div
                  style={{ width: `${((currentIndex + 1) / activeRecipients.length) * 100}%` }}
                  className="h-full bg-teal-500 transition-all duration-300 rounded-full"
                />
              </div>
            </div>

            {/* Current Recipient Card + Live Canvas Preview */}
            <div className="p-4 sm:p-5 bg-[#0F172A] border border-[#334155] rounded-2xl space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Live Personalized Card Canvas Thumbnail */}
                <div className="md:col-span-5 flex flex-col items-center">
                  <div className="w-full max-w-[220px] rounded-xl overflow-hidden border border-[#334155] shadow-lg bg-[#1E293B] p-1.5">
                    <canvas
                      ref={previewCanvasRef}
                      className="w-full h-auto rounded-lg block"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1.5 font-mono">
                    Personalised for {currentRecipient.name}
                  </span>
                </div>

                {/* Recipient Meta & WhatsApp Caption */}
                <div className="md:col-span-7 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-body">
                        Now Messaging:
                      </span>
                      <h4 className="text-lg font-bold text-white font-heading">
                        {currentRecipient.name}
                      </h4>
                      <span className="text-xs font-mono text-slate-300">
                        {currentRecipient.phone}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {currentRecipient.isValid ? (
                        <span className="px-2.5 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[11px] font-semibold rounded-lg">
                          Valid Mobile
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-semibold rounded-lg">
                          Invalid Format
                        </span>
                      )}
                      {currentRecipient.status !== 'pending' && (
                        <span className="text-[10px] uppercase tracking-wider font-mono text-amber-300">
                          Status: {currentRecipient.status}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-[#1E293B] border border-[#334155] rounded-xl text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-body max-h-36 overflow-y-auto">
                    {currentMessage}
                  </div>
                </div>
              </div>

              {shareFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                    shareFeedback.type === 'success'
                      ? 'bg-emerald-950/70 text-emerald-200 border border-emerald-500/50'
                      : shareFeedback.type === 'info'
                      ? 'bg-sky-950/70 text-sky-200 border border-sky-500/50'
                      : 'bg-rose-950/70 text-rose-200 border border-rose-500/50'
                  }`}
                >
                  <Paperclip className="w-4 h-4 shrink-0 mt-0.5 text-teal-400" />
                  <p className="font-medium leading-relaxed">{shareFeedback.message}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleShareDocumentAndText}
                  disabled={isSharing}
                  className="w-full min-h-[48px] px-5 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer font-body ring-2 ring-emerald-400/40"
                >
                  <Share2 className="w-4 h-4 text-emerald-200" />
                  <span>
                    {isSharing
                      ? 'Preparing Card Document...'
                      : 'Send Card Image Document + Text to WhatsApp'}
                  </span>
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyImage}
                    className="min-h-[44px] px-3.5 py-2 bg-[#1E293B] hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-amber-400" />
                    <span>Copy Image (Ctrl+V)</span>
                  </button>

                  <a
                    href={currentWhatsAppLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-h-[44px] px-3.5 py-2 bg-[#1E293B] hover:bg-slate-700 text-slate-200 border border-[#334155] font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer font-body"
                  >
                    <Send className="w-3.5 h-3.5 text-teal-400" />
                    <span>Open Chat</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleDownloadPersonalisedCard}
                    className="min-h-[44px] px-3 py-2 bg-[#1E293B] hover:bg-slate-700 text-slate-200 border border-[#334155] font-medium text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Export card picture"
                  >
                    <Download className="w-3.5 h-3.5 text-teal-400" />
                    <span>Save</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Stepper Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#334155]">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="min-h-[46px] px-4 py-2 text-xs font-semibold text-slate-300 bg-[#0F172A] hover:bg-slate-800 disabled:opacity-40 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer border border-[#334155]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={() => setStep('input')}
                className="text-xs text-slate-400 hover:text-white cursor-pointer px-2 py-2"
              >
                Edit List
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => markStatusAndAdvance('skipped')}
                  className="min-h-[46px] px-3.5 py-2 text-xs font-semibold text-slate-300 bg-[#0F172A] hover:bg-slate-800 border border-[#334155] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  <span>Skip</span>
                </button>

                <button
                  type="button"
                  onClick={() => markStatusAndAdvance('sent')}
                  className="min-h-[46px] px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md font-body"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {currentIndex === activeRecipients.length - 1 ? 'Mark Sent & Finish' : 'Mark Sent & Next'}
                  </span>
                </button>
              </div>
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
              Queue Complete ({sentCount} Sent · {skippedCount} Skipped)
            </h4>

            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto font-body">
              You reviewed each guest, generated individual cards, and tapped Send in WhatsApp personally.
            </p>

            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleResetQueue}
                className="min-h-[48px] px-4 py-2 text-xs font-semibold text-slate-300 bg-[#0F172A] hover:bg-slate-800 rounded-xl transition-colors cursor-pointer border border-[#334155]"
              >
                Send to Another Batch
              </button>
              <button
                type="button"
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
