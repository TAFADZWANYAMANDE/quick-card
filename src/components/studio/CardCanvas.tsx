import React, { useRef, useEffect, useState } from 'react';
import { CardTemplate, Palette, FontPair } from '../../types/template';
import { drawCardToCanvas, downloadCardImage } from '../../lib/cardRenderer';
import { Download, Send, Maximize2, Minimize2, Check, Sparkles, AlertCircle, Bookmark } from 'lucide-react';
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

      {/* Primary Action Buttons (Min 48px touch targets) */}
      <div className="w-full max-w-[540px] flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="min-h-[48px] px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-200" />
                <span>Downloaded 1080×1080 JPG!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export 1080×1080 JPG</span>
              </>
            )}
          </button>

          <button
            onClick={onSaveDraft}
            className="min-h-[48px] px-4 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-slate-200 text-xs sm:text-sm font-medium border border-[#334155] rounded-xl transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <Bookmark className="w-4 h-4 text-amber-400" />
            <span>Save Draft</span>
          </button>
        </div>

        {/* WhatsApp Personalised Send Queue Trigger */}
        <button
          onClick={onOpenSendQueue}
          className="min-h-[48px] px-4 py-2.5 bg-[#042F2E] hover:bg-[#064e4b] text-teal-200 border border-teal-500/40 text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-md flex items-center gap-2 cursor-pointer ml-auto"
        >
          <Send className="w-4 h-4 text-amber-400" />
          <span>Personalised WhatsApp Send</span>
        </button>
      </div>

      <div className="text-[12px] text-slate-400 text-center max-w-md font-body">
        Exports directly to crisp 1080×1080 JPEG for WhatsApp status, groups, and direct contacts. 100% offline.
      </div>
    </div>
  );
};
