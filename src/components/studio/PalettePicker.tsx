import React, { useState } from 'react';
import { Palette } from '../../types/template';
import { UNIVERSAL_LIGHT_PALETTES } from '../../lib/templates';
import { Check, Sun, Moon } from 'lucide-react';

interface PalettePickerProps {
  palettes: Palette[];
  selectedPaletteId: string;
  onSelectPalette: (palette: Palette) => void;
}

export const PalettePicker: React.FC<PalettePickerProps> = ({
  palettes,
  selectedPaletteId,
  onSelectPalette,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'curated' | 'light'>('all');

  const lightList = UNIVERSAL_LIGHT_PALETTES;
  
  // Combine unique palettes
  const combinedList: Palette[] = [
    ...palettes,
    ...lightList.filter((lp) => !palettes.some((p) => p.id === lp.id)),
  ];

  const displayedList =
    filterMode === 'curated'
      ? palettes
      : filterMode === 'light'
      ? lightList
      : combinedList;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-body">
          Colour Palette ({displayedList.length} Options)
        </label>
        
        {/* Toggle between All, Light Colors (White/Sky Blue), and Curated */}
        <div className="flex items-center gap-1 bg-[#0F172A] border border-[#334155] p-1 rounded-xl text-[11px]">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
              filterMode === 'all' ? 'bg-teal-600 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterMode('light')}
            className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
              filterMode === 'light' ? 'bg-teal-600 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
            title="White, Sky Blue, Cream, Mint & Rose"
          >
            <Sun className="w-3 h-3 text-amber-300" />
            <span>Light</span>
          </button>
          <button
            onClick={() => setFilterMode('curated')}
            className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
              filterMode === 'curated' ? 'bg-teal-600 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Moon className="w-3 h-3 text-teal-400" />
            <span>Curated</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
        {displayedList.map((palette) => {
          const isSelected = palette.id === selectedPaletteId;
          return (
            <button
              key={palette.id}
              onClick={() => onSelectPalette(palette)}
              className={`p-2.5 min-h-[48px] rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                isSelected
                  ? 'border-teal-500 bg-teal-950/40 ring-1 ring-teal-500/60 shadow-inner'
                  : 'border-[#334155] bg-[#0F172A] hover:border-slate-500 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex items-center -space-x-1.5 shrink-0">
                  <div
                    style={{ backgroundColor: palette.background }}
                    className="w-4 h-4 rounded-full border border-slate-600 shadow-xs"
                    title={`Background: ${palette.background}`}
                  />
                  <div
                    style={{ backgroundColor: palette.accent }}
                    className="w-4 h-4 rounded-full border border-[#0F172A] shadow-xs"
                    title={`Accent: ${palette.accent}`}
                  />
                  <div
                    style={{ backgroundColor: palette.text }}
                    className="w-3.5 h-3.5 rounded-full border border-[#0F172A] shadow-xs"
                    title={`Text: ${palette.text}`}
                  />
                </div>
                <div className="truncate">
                  <span className="text-xs font-medium text-slate-200 truncate font-body block">
                    {palette.name}
                  </span>
                  {palette.isLight && (
                    <span className="text-[10px] text-amber-400/90 font-mono block">Light surface</span>
                  )}
                </div>
              </div>

              {isSelected && <Check className="w-4 h-4 text-teal-400 shrink-0 ml-1" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
