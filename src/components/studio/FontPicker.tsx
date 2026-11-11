import React from 'react';
import { FontPair } from '../../types/template';
import { Check, Type } from 'lucide-react';

interface FontPickerProps {
  fontPairs: FontPair[];
  selectedFontPairId: string;
  onSelectFontPair: (fontPair: FontPair) => void;
}

export const FontPicker: React.FC<FontPickerProps> = ({
  fontPairs,
  selectedFontPairId,
  onSelectFontPair,
}) => {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 font-body">
          Typography (2 Editorial Pairs)
        </label>
        <span className="text-[11px] text-amber-400 font-medium">Playfair & Lato</span>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {fontPairs.map((pair) => {
          const isSelected = pair.id === selectedFontPairId;
          return (
            <button
              key={pair.id}
              onClick={() => onSelectFontPair(pair)}
              className={`p-3 min-h-[48px] rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                isSelected
                  ? 'border-teal-500 bg-teal-950/40 ring-1 ring-teal-500/60 shadow-inner'
                  : 'border-[#334155] bg-[#0F172A] hover:border-slate-500 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Type className="w-4 h-4 text-teal-400 shrink-0" />
                <div className="truncate">
                  <div className="text-xs font-semibold text-slate-200 truncate font-heading">
                    {pair.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate font-body">
                    {pair.headingFont} + {pair.bodyFont}
                  </div>
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
