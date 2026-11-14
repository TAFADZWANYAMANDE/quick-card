import React, { useRef, useEffect, useState } from 'react';
import { CardTemplate, Palette, FontPair } from '../../types/template';
import { drawCardToCanvas, downloadCardImage, shareCardDirectly, copyCardImageToClipboard } from '../../lib/cardRenderer';
import { generateDefaultWhatsAppMessage } from '../../lib/mergeUtils';
import { Download, Send, Maximize2, Minimize2, Check, Sparkles, AlertCircle, Bookmark, Share2, HelpCircle, Copy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CardCanvasProps {
  template: CardTemplate;
  fieldValues: Record<string, string>;
  palette: Palette;
  fontPair: FontPair;
  isUnlocked: boolean;
  personalisedName?: string;
  tableItems?: Array<{ id: string; name: string; amount: number; checked?: boolean }>;
  onOverflowChange: (overflows: boolean, fields: string[]) => void;
  onOpenSendQueue: () => void;
  onSaveDraft: () => void;
}

export const CardCanvas: React.FC<CardCanvasProps> = ({
  template,
  fieldValues,
  palette,
  fontPair,
  isUnlocked,
  personalisedName,
  tableItems,
  onOverflowChange,
  onOpenSendQueue,
  onSaveDraft,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isZoom100, setIsZoom100] = useState(false);

  // Keep a stable ref for onOverflowChange to prevent re-triggering the effect
  const onOverflowChangeRef = useRef(onOverflowChange);
  useEffect(() => {
    onOverflowChangeRef.current = onOverflowChange;
  });

  const prevOverflowKeyRef = useRef<string | null>(null);

  // Re-draw whenever inputs change
  useEffect(() => {
    if (!canvasRef.current) return;

    const { hasOverflow, overflowFields } = drawCardToCanvas(canvasRef.current, {
      template,
      fieldValues,
      palette,
      fontPair,
      isUnlocked,
      personalisedName,
      tableItems,
    });

    const key = `${hasOverflow}:${overflowFields.join(',')}`;
    if (prevOverflowKeyRef.current !== key) {
      prevOverflowKeyRef.current = key;
      onOverflowChangeRef.current(hasOverflow, overflowFields);
    }
  }, [
    template,
    fieldValues,
    palette,
    fontPair,
    isUnlocked,
    personalisedName,
    tableItems,
  ]);

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    setIsExporting(true);

    try {
      await downloadCardImage(canvasRef.current, template.name);
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.8 },
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const [showSendingTips, setShowSendingTips] = useState(false);
  const [isSharingCard, setIsSharingCard] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const handleQuickWhatsAppShare = async () => {
    if (!canvasRef.current) return;
    setIsSharingCard(true);
    setShareFeedback(null);

    try {
      const cardTitle = fieldValues.title || template.name;
      const cardDate = fieldValues.when || fieldValues.dateTime || fieldValues.dateVenue || '';
      const cardVenue = fieldValues.venue || fieldValues.location || '';
      const message = generateDefaultWhatsAppMessage(cardTitle, cardDate, cardVenue);

      const res = await shareCardDirectly(canvasRef.current, template.name, message);
      if (res.method === 'web-share' && res.success) {
        setShareFeedback('Opened WhatsApp share sheet with card image document!');
      } else {
        setShareFeedback(
          res.clipboardCopied
            ? 'Card image copied to clipboard & downloaded! In WhatsApp Web, press Ctrl + V (Paste) to attach!'
            : 'Card picture downloaded! In WhatsApp, tap 📎 (Paperclip) to attach.'
        );
      }
      setTimeout(() => setShareFeedback(null), 6000);
    } catch (err: any) {
      console.error('Share error:', err);
    } finally {
      setIsSharingCard(false);
    }
  };

  const handleCopyCardImage = async () => {
    if (!canvasRef.current) return;
    const copied = await copyCardImageToClipboard(canvasRef.current);
    if (copied) {
      setShareFeedback('Card picture copied to clipboard! In WhatsApp, press Ctrl + V (Paste) to attach!');
    } else {
      await downloadCardImage(canvasRef.current, template.name);
      setShareFeedback('Card downloaded! In WhatsApp, tap 📎 (Paperclip) to attach.');
    }
    setTimeout(() => setShareFeedback(null), 6000);
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      {/* Canvas viewport container with double-line styling vibe */}
      <div className="relative w-full max-w-[540px] aspect-square rounded-2xl overflow-hidden shadow-2xl border border-[#334155] bg-[#0F172A] flex items-center justify-center p-2 sm:p-4">
        {/* Real 1080x1080 canvas element scaled with CSS */}
        <div className={`w-full h-full flex items-center justify-center overflow-auto ${isZoom100 ? 'cursor-grab' : ''}`}>
          <canvas
            ref={canvasRef}
            className={`shadow-2xl rounded-lg transition-transform ${
              isZoom100 ? 'w-[1080px] h-[1080px] min-w-[1080px]' : 'w-full h-full object-contain'
            }`}
            style={{
              imageRendering: 'auto',
            }}
          />
        </div>

        {/* Floating zoom control (min 48px touch target) */}
        <button
          onClick={() => setIsZoom100(!isZoom100)}
          className="absolute bottom-4 left-4 min-h-[44px] px-3 rounded-xl bg-[#0F172A]/85 hover:bg-[#0F172A] text-slate-200 border border-[#334155] backdrop-blur-md transition-colors text-xs flex items-center gap-1.5 shadow-lg cursor-pointer"
          title={isZoom100 ? 'Fit to view' : 'View full 1080x1080'}
        >
          {isZoom100 ? <Minimize2 className="w-4 h-4 text-teal-400" /> : <Maximize2 className="w-4 h-4 text-teal-400" />}
          <span className="font-medium">{isZoom100 ? 'Fit' : '100%'}</span>
        </button>

        {/* Translucent Watermark Tag status badge in top corner */}
        <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-[#0F172A]/85 text-slate-200 border border-[#334155] backdrop-blur-md text-[11px] font-medium flex items-center gap-1.5 shadow-lg">
          {isUnlocked ? (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-300 font-semibold">Watermark Free</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              <span className="text-slate-400">Tag: “Made with QuickCard”</span>
            </>
          )}
        </div>
      </div>

      {/* Share feedback toast */}
      {shareFeedback && (
        <div className="w-full max-w-[540px] p-3 rounded-xl bg-teal-950/90 border border-teal-500/60 text-teal-200 text-xs flex items-start gap-2 shadow-lg">
          <Check className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <span className="font-medium leading-relaxed">{shareFeedback}</span>
        </div>
      )}

      {/* Primary Action Buttons (Min 48px touch targets) */}
      <div className="w-full max-w-[540px] flex flex-wrap items-center justify-between gap-2.5 pt-1">
        {/* Quick Send to WhatsApp */}
        <button
          onClick={handleQuickWhatsAppShare}
          disabled={isSharingCard}
          className="flex-1 min-h-[48px] px-4 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ring-2 ring-emerald-400/30"
          title="Send this card directly as an image document to WhatsApp"
        >
          <Share2 className="w-4 h-4 text-emerald-200" />
          <span>{isSharingCard ? 'Preparing Document...' : 'Send via WhatsApp'}</span>
        </button>

        {/* Copy Image (Ctrl+V) */}
        <button
          onClick={handleCopyCardImage}
          className="min-h-[48px] px-3.5 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-amber-300 text-xs sm:text-sm font-semibold rounded-xl border border-amber-500/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          title="Copy image to clipboard (paste with Ctrl+V into WhatsApp)"
        >
          <Copy className="w-4 h-4 text-amber-400" />
          <span>Copy Image (Ctrl+V)</span>
        </button>

        {/* Export / Download */}
        <button
          onClick={handleDownload}
          disabled={isExporting}
          className="min-h-[48px] px-3.5 py-2.5 bg-[#1E293B] hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold rounded-xl border border-[#334155] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          title="Save 1080x1080 picture to device"
        >
          {downloadSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 text-teal-400" />
              <span>Save</span>
            </>
          )}
        </button>

        {/* Guest Queue Trigger */}
        <button
          onClick={onOpenSendQueue}
          className="min-h-[48px] px-3.5 py-2.5 bg-[#042F2E] hover:bg-[#064e4b] text-teal-200 border border-teal-500/40 text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
          title="Personalised cards with each recipient's name"
        >
          <Send className="w-4 h-4 text-amber-400" />
          <span className="hidden xs:inline">Guest Queue</span>
          <span className="xs:hidden">Queue</span>
        </button>
      </div>

      {/* Helpful Collapsible "How to send via WhatsApp" Guide */}
      <div className="w-full max-w-[540px]">
        <button
          onClick={() => setShowSendingTips(!showSendingTips)}
          className="w-full text-xs text-slate-400 hover:text-teal-300 flex items-center justify-center gap-1.5 py-1.5 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
          <span>{showSendingTips ? 'Hide WhatsApp Sending Guide' : 'How to send as an uncompressed document in WhatsApp'}</span>
        </button>

        {showSendingTips && (
          <div className="mt-2 p-4 bg-[#1E293B] rounded-2xl border border-[#334155] text-xs space-y-3 text-slate-200">
            <h5 className="font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>2 Ways to Send via WhatsApp</span>
            </h5>

            <div className="space-y-2 text-[11px] leading-relaxed">
              <div className="p-2.5 bg-[#0F172A] rounded-xl border border-[#334155]">
                <strong className="text-teal-300 block mb-0.5">Method 1: Direct One-Tap Share</strong>
                Tap the green <strong>“Send via WhatsApp”</strong> button above. Choose any friend or group in WhatsApp. The card is attached with event details ready to send!
              </div>

              <div className="p-2.5 bg-[#0F172A] rounded-xl border border-[#334155]">
                <strong className="text-amber-300 block mb-0.5">Method 2: Send as a Lossless “Document” in WhatsApp</strong>
                1. Tap <strong>“Save Picture”</strong> to download the crisp 1080×1080 JPEG.<br />
                2. Open any WhatsApp chat and tap the <strong>📎 (Paperclip) or +</strong> icon.<br />
                3. Choose <strong>“Document”</strong> &rarr; Select your downloaded QuickCard. WhatsApp will send it in 100% full uncompressed studio quality! (Or choose <strong>“Gallery”</strong> for picture preview).
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="text-[12px] text-slate-400 text-center max-w-md font-body">
        Exports directly to crisp 1080×1080 JPEG for WhatsApp status, groups, and direct contacts. 100% offline.
      </div>
    </div>
  );
};
