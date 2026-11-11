import React, { useState } from 'react';
import { STARTER_TEMPLATES } from '../lib/templates';
import { CardTemplate, OccasionType } from '../types/template';
import { ArrowRight, Church, Heart, Moon, Cake, BookOpen, PiggyBank, FileText, Sparkles } from 'lucide-react';

interface TemplateGalleryProps {
  onSelectTemplate: (template: CardTemplate) => void;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onSelectTemplate }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | OccasionType>('all');

  const filteredTemplates =
    activeFilter === 'all'
      ? STARTER_TEMPLATES
      : STARTER_TEMPLATES.filter((t) => t.occasion === activeFilter);

  const getOccasionIcon = (occasion: OccasionType) => {
    switch (occasion) {
      case 'church':
        return <Church className="w-4 h-4 text-teal-400" />;
      case 'wedding':
        return <Heart className="w-4 h-4 text-amber-400" />;
      case 'funeral':
        return <Moon className="w-4 h-4 text-slate-400" />;
      case 'birthday':
        return <Cake className="w-4 h-4 text-sky-400" />;
      case 'savings':
        return <PiggyBank className="w-4 h-4 text-emerald-400" />;
      case 'lists':
        return <FileText className="w-4 h-4 text-orange-400" />;
    }
  };

  return (
    <section id="templates-section" className="py-16 sm:py-24 bg-[#0F172A] border-b border-[#334155] text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-semibold tracking-wide font-body">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Ready-Made Catalog</span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span>Version 1.0 Starter Set</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-heading">
            Twelve ready-made templates for every occasion
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-body">
            Fill in the blanks and export a sharp 1080×1080 JPG card in under 2 minutes.
            Every template includes 4 saturated print palettes and 2 font pairs.
          </p>
        </div>

        {/* Interactive Filter Control Tabs (Min 44px tap targets) */}
        <div className="flex items-center gap-2 p-1.5 bg-[#1E293B] border border-[#334155] rounded-2xl max-w-full overflow-x-auto scrollbar-none mb-10">
          <button
            onClick={() => setActiveFilter('all')}
            className={`min-h-[44px] px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            All 12 Templates
          </button>
          <button
            onClick={() => setActiveFilter('church')}
            className={`min-h-[44px] px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === 'church'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            Church & Revival (3)
          </button>
          <button
            onClick={() => setActiveFilter('wedding')}
            className={`min-h-[44px] px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === 'wedding'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            Weddings & Parties (2)
          </button>
          <button
            onClick={() => setActiveFilter('funeral')}
            className={`min-h-[44px] px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === 'funeral'
                ? 'bg-slate-700 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            Funeral Notice (1)
          </button>
          <button
            onClick={() => setActiveFilter('birthday')}
            className={`min-h-[44px] px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === 'birthday'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            Birthday & School (2)
          </button>
          <button
            onClick={() => setActiveFilter('savings')}
            className={`min-h-[44px] px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === 'savings'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            Mukando & Records (2)
          </button>
          <button
            onClick={() => setActiveFilter('lists')}
            className={`min-h-[44px] px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === 'lists'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            Lists & Notes (2)
          </button>
        </div>

        {/* 12 Templates Grid (Solid #1E293B Cards with #334155 Hairline Borders) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredTemplates.map((template) => {
            const primaryPalette = template.palettes[0];
            return (
              <div
                key={template.id}
                className="bg-[#1E293B] rounded-3xl border border-[#334155] overflow-hidden flex flex-col justify-between hover:border-slate-500 transition-all shadow-lg hover:shadow-2xl group"
              >
                {/* Visual miniature mockup */}
                <div
                  style={{
                    backgroundColor: primaryPalette.background,
                    color: primaryPalette.text,
                  }}
                  className="p-6 relative aspect-[16/11] flex flex-col justify-between overflow-hidden border-b border-[#334155]"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span style={{ color: primaryPalette.accent }} className="font-semibold text-[11px] truncate max-w-[180px]">
                      {template.occasionName}
                    </span>
                    <span className="opacity-60 text-[10px]">1080×1080</span>
                  </div>

                  <div className="text-center py-2 space-y-1">
                    <h4
                      style={{
                        fontFamily: '"Playfair Display", Georgia, serif',
                      }}
                      className="text-lg font-bold leading-tight line-clamp-2"
                    >
                      {template.name}
                    </h4>
                    <p style={{ color: primaryPalette.secondaryText }} className="text-xs line-clamp-1 font-body">
                      {template.fields[2]?.default || template.tagline}
                    </p>
                  </div>

                  {/* Sample footer in mockup */}
                  <div className="flex items-center justify-between text-[10px] opacity-70 border-t border-current/15 pt-2">
                    <span>{template.fields.length} form fields</span>
                    <span>QuickCard</span>
                  </div>
                </div>

                {/* Card Info & Details */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium font-body">
                      {getOccasionIcon(template.occasion)}
                      <span className="text-slate-300">{template.occasionName}</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="text-teal-400">{template.isTable ? 'Auto-calculating Table' : 'Card Design'}</span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors font-heading">
                      {template.name}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed font-body">
                      {template.tagline}
                    </p>
                  </div>

                  {/* Palettes indicator & Action */}
                  <div className="pt-3 border-t border-[#334155] flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-400 mr-1 font-body">Palettes:</span>
                      {template.palettes.map((p) => (
                        <div
                          key={p.id}
                          style={{ backgroundColor: p.background }}
                          title={p.name}
                          className="w-4 h-4 rounded-full border border-slate-600 shadow-xs"
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => onSelectTemplate(template)}
                      className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-teal-300 hover:text-white bg-teal-950/60 hover:bg-teal-900/80 border border-teal-500/40 rounded-xl transition-all cursor-pointer font-body"
                    >
                      <span>Open in Studio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
