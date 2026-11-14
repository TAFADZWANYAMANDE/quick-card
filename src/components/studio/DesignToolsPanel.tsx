import React, { useRef, useState } from 'react';
import {
  CardCustomizations,
  CardAspectRatio,
  BorderStyle,
} from '../../types/template';
import {
  Maximize,
  Frame,
  ImagePlus,
  QrCode,
  Trash2,
  Type,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';

interface DesignToolsPanelProps {
  customizations: CardCustomizations;
  onChange: (updated: CardCustomizations) => void;
}

const ASPECT_OPTIONS: Array<{ id: CardAspectRatio; label: string; dims: string }> = [
  { id: 'square', label: '1:1 Square', dims: '1080×1080' },
  { id: 'status', label: '9:16 Status', dims: '1080×1920' },
  { id: 'portrait', label: '4:5 Portrait', dims: '1080×1350' },
];

const BORDER_OPTIONS: Array<{ id: BorderStyle; label: string }> = [
  { id: 'double-classic', label: 'Double Classic' },
  { id: 'ornate-corners', label: 'Ornate Filigree' },
  { id: 'modern-minimal', label: 'Modern Minimal' },
  { id: 'arch-frame', label: 'Cathedral Arch' },
];

export const DesignToolsPanel: React.FC<DesignToolsPanelProps> = ({
  customizations,
  onChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleAspectChange = (aspectRatio: CardAspectRatio) => {
    onChange({ ...customizations, aspectRatio });
  };

  const handleBorderChange = (borderStyle: BorderStyle) => {
    onChange({ ...customizations, borderStyle });
  };

  const handleTextScaleChange = (scale: number) => {
    onChange({ ...customizations, textScale: scale });
  };

  const handleLogoFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a PNG, JPG, or WebP image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const rawUrl = ev.target?.result as string;
      if (!rawUrl) return;

      const img = new Image();
      img.onload = () => {
        // Downscale to <= 512px to keep drafts fast and compact in localStorage
        const maxDim = 512;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const targetW = Math.max(1, Math.round(img.width * scale));
        const targetH = Math.max(1, Math.round(img.height * scale));

        const offscreen = document.createElement('canvas');
        offscreen.width = targetW;
        offscreen.height = targetH;
        const ctx = offscreen.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, targetW, targetH);
        const compressedUrl = offscreen.toDataURL('image/png', 0.9);

        onChange({
          ...customizations,
          logo: {
            dataUrl: compressedUrl,
            placement: customizations.logo?.placement || 'top-crest',
            shape: customizations.logo?.shape || 'circle',
          },
        });
      };
      img.onerror = () => {
        setUploadError('Could not read that image. Try another PNG or JPG.');
      };
      img.src = rawUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleClearLogo = () => {
    const next = { ...customizations };
    delete next.logo;
    onChange(next);
  };

  const qrEnabled = Boolean(customizations.qr?.enabled);
  const qrValue = customizations.qr?.value ?? '';
  const qrLabel = customizations.qr?.label ?? 'Scan to RSVP';

  return (
    <div className="pt-4 border-t border-[#334155] space-y-3">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left py-1 cursor-pointer group"
      >
        <div className="flex items-center gap-2">
          <Maximize className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200 group-hover:text-teal-300 transition-colors font-body">
            Pro Layout, Logo & QR Tools
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {isExpanded && (
        <div className="space-y-4 pt-1">
          {/* 1. Canvas Size / Aspect Ratio */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-body">
              <Maximize className="w-3.5 h-3.5 text-teal-400" />
              <span>Card Size & Format</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ASPECT_OPTIONS.map((opt) => {
                const active = (customizations.aspectRatio || 'square') === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleAspectChange(opt.id)}
                    className={`min-h-[46px] px-2 py-1.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                      active
                        ? 'bg-teal-950/60 border-teal-500 text-teal-200 ring-1 ring-teal-500/50'
                        : 'bg-[#0F172A] border-[#334155] text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <span className="text-xs font-semibold leading-tight">{opt.label}</span>
                    <span className="text-[10px] font-mono text-slate-400">{opt.dims}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Frame / Border Style */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-body">
              <Frame className="w-3.5 h-3.5 text-amber-400" />
              <span>Frame & Border Style</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {BORDER_OPTIONS.map((opt) => {
                const active = (customizations.borderStyle || 'double-classic') === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleBorderChange(opt.id)}
                    className={`min-h-[42px] px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      active
                        ? 'bg-amber-950/40 border-amber-500 text-amber-200 ring-1 ring-amber-500/40'
                        : 'bg-[#0F172A] border-[#334155] text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Text Scale */}
          <div className="p-3 bg-[#0F172A] border border-[#334155] rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-teal-400" />
                <span>Typography Size</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-teal-400 font-bold">
                  {Math.round((customizations.textScale || 1) * 100)}%
                </span>
                {(customizations.textScale || 1) !== 1 && (
                  <button
                    type="button"
                    onClick={() => handleTextScaleChange(1)}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-0.5 cursor-pointer"
                    title="Reset text size to 100%"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
            <input
              type="range"
              min={0.85}
              max={1.15}
              step={0.05}
              value={customizations.textScale || 1}
              onChange={(e) => handleTextScaleChange(parseFloat(e.target.value))}
              className="w-full accent-teal-500 cursor-pointer"
            />
          </div>

          {/* 4. Custom Church Crest / Photo / Logo Upload */}
          <div className="p-3.5 bg-[#0F172A] border border-[#334155] rounded-xl space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ImagePlus className="w-4 h-4 text-teal-400 shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">
                    Church Crest, Logo or Photo
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Added locally offline. Never uploaded.
                  </span>
                </div>
              </div>

              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoFileSelected}
                className="hidden"
              />

              {!customizations.logo?.dataUrl ? (
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="min-h-[40px] px-3 py-1.5 text-xs font-semibold text-teal-300 bg-teal-950/60 hover:bg-teal-900/70 border border-teal-500/40 rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  Upload Image
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="min-h-[38px] px-2.5 py-1 text-[11px] font-semibold text-slate-200 bg-[#1E293B] hover:bg-slate-700 border border-[#334155] rounded-lg cursor-pointer"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={handleClearLogo}
                    className="min-h-[38px] min-w-[38px] p-1.5 text-slate-400 hover:text-rose-400 bg-[#1E293B] border border-[#334155] rounded-lg flex items-center justify-center cursor-pointer"
                    title="Remove logo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {uploadError && (
              <p className="text-[11px] text-rose-400">{uploadError}</p>
            )}

            {customizations.logo?.dataUrl && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                    Placement
                  </span>
                  <select
                    value={customizations.logo.placement}
                    onChange={(e) =>
                      onChange({
                        ...customizations,
                        logo: {
                          ...customizations.logo!,
                          placement: e.target.value as 'top-crest' | 'bottom-left' | 'watermark-bg',
                        },
                      })
                    }
                    className="w-full min-h-[38px] bg-[#1E293B] border border-[#334155] rounded-lg px-2.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                  >
                    <option value="top-crest">Top Crest</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="watermark-bg">Faint Watermark</option>
                  </select>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                    Shape
                  </span>
                  <select
                    value={customizations.logo.shape}
                    onChange={(e) =>
                      onChange({
                        ...customizations,
                        logo: {
                          ...customizations.logo!,
                          shape: e.target.value as 'circle' | 'rounded' | 'original',
                        },
                      })
                    }
                    className="w-full min-h-[38px] bg-[#1E293B] border border-[#334155] rounded-lg px-2.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                  >
                    <option value="circle">Circle Frame</option>
                    <option value="rounded">Rounded Square</option>
                    <option value="original">Original Ratio</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* 5. 100% Offline Scannable QR Code */}
          <div className="p-3.5 bg-[#0F172A] border border-[#334155] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">
                    Scannable QR Badge
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    RSVP link, Maps pin, or EcoCash info
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...customizations,
                    qr: {
                      enabled: !qrEnabled,
                      value: qrValue || 'https://wa.me/263771234567',
                      label: qrLabel,
                    },
                  })
                }
                className={`min-h-[36px] px-3 py-1 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  qrEnabled
                    ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                    : 'bg-[#1E293B] border-[#334155] text-slate-300 hover:border-slate-500'
                }`}
              >
                {qrEnabled ? 'Enabled' : 'Add QR'}
              </button>
            </div>

            {qrEnabled && (
              <div className="space-y-2.5 pt-1">
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        ...customizations,
                        qr: { enabled: true, value: 'https://wa.me/263771234567', label: 'WhatsApp RSVP' },
                      })
                    }
                    className="px-2 py-1 text-[10px] font-medium bg-[#1E293B] hover:bg-slate-700 border border-[#334155] rounded-md text-teal-300 cursor-pointer"
                  >
                    WhatsApp RSVP
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        ...customizations,
                        qr: { enabled: true, value: 'https://maps.google.com/?q=Harare', label: 'Venue Map' },
                      })
                    }
                    className="px-2 py-1 text-[10px] font-medium bg-[#1E293B] hover:bg-slate-700 border border-[#334155] rounded-md text-sky-300 cursor-pointer"
                  >
                    Maps Pin
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        ...customizations,
                        qr: { enabled: true, value: 'EcoCash: *151*2*2*12345#', label: 'Giving / EcoCash' },
                      })
                    }
                    className="px-2 py-1 text-[10px] font-medium bg-[#1E293B] hover:bg-slate-700 border border-[#334155] rounded-md text-amber-300 cursor-pointer"
                  >
                    EcoCash / Giving
                  </button>
                </div>

                <input
                  type="text"
                  value={qrValue}
                  onChange={(e) =>
                    onChange({
                      ...customizations,
                      qr: { enabled: true, value: e.target.value, label: qrLabel },
                    })
                  }
                  placeholder="https://wa.me/26377... or Google Maps link"
                  className="w-full min-h-[40px] bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500 font-mono"
                />

                <input
                  type="text"
                  value={qrLabel}
                  maxLength={20}
                  onChange={(e) =>
                    onChange({
                      ...customizations,
                      qr: { enabled: true, value: qrValue, label: e.target.value },
                    })
                  }
                  placeholder="Short QR label (e.g. Scan to RSVP)"
                  className="w-full min-h-[38px] bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500 font-body"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
