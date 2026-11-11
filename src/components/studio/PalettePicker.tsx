import React from 'react';
import { Palette } from '../../types/template';
import { Check } from 'lucide-react';

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
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 font-body">
          Colour Palette (4 Sets)
        </label>
        <span className="text-[11px] text-teal-400 font-medium">Saturated Print Finishes</span>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {palettes.map((palette) => {
          const isSelected = palette.id === selectedPaletteId;
          return (
            <button
              key={palette.id}
              onClick={() => onSelectPalette(palette)}
              className={`p-3 min-h-[48px] rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                isSelected
                  ? 'border-teal-500 bg-teal-950/40 ring-1 ring-teal-500/60 shadow-inner'
                  : 'border-[#334155] bg-[#0F172A] hover:border-slate-500 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex items-center -space-x-1.5 shrink-0">
                  <div
                    style={{ backgroundColor: palette.background }}
                    className="w-4 h-4 rounded-full border border-slate-600 shadow-xs"
                  />
                  <div
                    style={{ backgroundColor: palette.accent }}
                    className="w-4 h-4 rounded-full border border-[#0F172A] shadow-xs"
                  />
                  <div
                    style={{ backgroundColor: palette.text }}
                    className="w-3.5 h-3.5 rounded-full border border-[#0F172A] shadow-xs"
                  />
                </div>
                <span className="text-xs font-medium text-slate-200 truncate font-body">
                  {palette.name}
                </span>
              </div>

              {isSelected && <Check className="w-4 h-4 text-teal-400 shrink-0 ml-1" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
