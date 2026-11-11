import React, { useState, useCallback } from 'react';
import { CardTemplate, Palette, FontPair, DraftCard, UnlockLicense } from '../../types/template';
import { STARTER_TEMPLATES, SAMPLE_CONTRIBUTION_ITEMS, SAMPLE_GROCERY_ITEMS } from '../../lib/templates';
import { saveDraft } from '../../lib/storage';
import { CardCanvas } from './CardCanvas';
import { EditorForm } from './EditorForm';
import { PalettePicker } from './PalettePicker';
import { FontPicker } from './FontPicker';
import { WhatsAppQueueModal } from './WhatsAppQueueModal';
import { DraftsDrawer } from './DraftsDrawer';
import {
  ArrowLeft,
  FolderOpen,
  Send,
  Sparkles,
  ShieldCheck,
  Church,
  Heart,
  Flame,
  Cake,
  GraduationCap,
  Banknote,
  ClipboardList,
  Download,
  BookmarkCheck,
} from 'lucide-react';

interface CardStudioProps {
  initialTemplate?: CardTemplate;
  license: UnlockLicense;
  onOpenUnlockModal: () => void;
  onBackToWebsite: () => void;
  savedDrafts: DraftCard[];
  onDraftsUpdated: (drafts: DraftCard[]) => void;
}

// Occasion categories with solid colored icon badges as requested
const OCCASION_CATEGORIES = [
  { id: 'all', label: 'All (12)', icon: Sparkles, color: 'text-teal-400', bg: 'bg-teal-500/15 border-teal-500/30' },
  { id: 'church', label: 'Church', icon: Church, color: 'text-teal-400', bg: 'bg-teal-500/15 border-teal-500/30' },
  { id: 'wedding', label: 'Wedding', icon: Heart, color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30' },
  { id: 'funeral', label: 'Funeral', icon: Flame, color: 'text-rose-400', bg: 'bg-rose-900/30 border-rose-700/40' },
  { id: 'birthday', label: 'Birthday', icon: Cake, color: 'text-sky-400', bg: 'bg-sky-500/15 border-sky-500/30' },
  { id: 'school', label: 'School', icon: GraduationCap, color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30' },
  { id: 'business', label: 'Mukando', icon: Banknote, color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30' },
  { id: 'list', label: 'Lists', icon: ClipboardList, color: 'text-orange-400', bg: 'bg-orange-500/15 border-orange-500/30' },
];

export const CardStudio: React.FC<CardStudioProps> = ({
  initialTemplate,
  license,
  onOpenUnlockModal,
  onBackToWebsite,
  savedDrafts,
  onDraftsUpdated,
}) => {
  const [template, setTemplate] = useState<CardTemplate>(initialTemplate || STARTER_TEMPLATES[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({
    ...template.defaultValues,
  });
  const [palette, setPalette] = useState<Palette>(template.palettes[0]);
  const [fontPair, setFontPair] = useState<FontPair>(template.fontPairs[0]);
  const [overflowFields, setOverflowFields] = useState<string[]>([]);
  const [isSendQueueOpen, setIsSendQueueOpen] = useState(false);
  const [isDraftsOpen, setIsDraftsOpen] = useState(false);
  const [saveDraftNotification, setSaveDraftNotification] = useState(false);

  // Stable callback for overflow updates
  const handleOverflowChange = useCallback((_hasOverflow: boolean, fields: string[]) => {
    setOverflowFields((prev) => {
      if (prev.length === fields.length && prev.every((f, i) => f === fields[i])) {
        return prev;
      }
      return fields;
    });
  }, []);

  // Table items for Contributions or Grocery
  const [tableItems, setTableItems] = useState<
    Array<{ id: string; name: string; amount: number; checked?: boolean }>
  >(
    template.id === 'contributions-record-10'
      ? SAMPLE_CONTRIBUTION_ITEMS
      : template.id === 'grocery-list-11'
      ? SAMPLE_GROCERY_ITEMS
      : []
  );

  // When template changes, reset fields and palettes
  const handleSelectTemplate = (newTemplate: CardTemplate) => {
    setTemplate(newTemplate);
    setFieldValues({ ...newTemplate.defaultValues });
    setPalette(newTemplate.palettes[0]);
    setFontPair(newTemplate.fontPairs[0]);
    if (newTemplate.id === 'contributions-record-10') {
      setTableItems(SAMPLE_CONTRIBUTION_ITEMS);
    } else if (newTemplate.id === 'grocery-list-11') {
      setTableItems(SAMPLE_GROCERY_ITEMS);
    } else {
      setTableItems([]);
    }
  };

  const handleFieldChange = (key: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetDefaults = () => {
    setFieldValues({ ...template.defaultValues });
  };

  const handleSaveDraft = () => {
    const draft: DraftCard = {
      id: `draft-${Date.now()}`,
      templateId: template.id,
      name: fieldValues.title || template.name,
      updatedAt: Date.now(),
      paletteId: palette.id,
      fontPairId: fontPair.id,
      fieldValues,
      tableItems: template.isTable ? tableItems : undefined,
    };

    const updated = saveDraft(draft);
    onDraftsUpdated(updated);
    setSaveDraftNotification(true);
    setTimeout(() => setSaveDraftNotification(false), 3000);
  };

  const handleLoadDraft = (draft: DraftCard) => {
    const tpl = STARTER_TEMPLATES.find((t) => t.id === draft.templateId);
    if (!tpl) return;
    setTemplate(tpl);
    setFieldValues(draft.fieldValues);
    const pal = tpl.palettes.find((p) => p.id === draft.paletteId) || tpl.palettes[0];
    setPalette(pal);
    const fp = tpl.fontPairs.find((f) => f.id === draft.fontPairId) || tpl.fontPairs[0];
    setFontPair(fp);
    if (draft.tableItems) {
      setTableItems(draft.tableItems);
    }
  };

  const handleDeleteDraft = (id: string) => {
    const updated = savedDrafts.filter((d) => d.id !== id);
    localStorage.setItem('quickcard_drafts_v1', JSON.stringify(updated));
    onDraftsUpdated(updated);
  };

  const filteredTemplates = selectedCategory === 'all'
    ? STARTER_TEMPLATES
    : STARTER_TEMPLATES.filter((t) => t.occasion === selectedCategory);

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 pb-28">
      {/* Studio Top Control Strip (Solid Dark Surface #1E293B with #334155 hairline border) */}
      <div className="bg-[#1E293B] border-b border-[#334155] sticky top-18 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[56px] py-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToWebsite}
              className="min-h-[48px] px-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer border border-[#334155]"
            >
              <ArrowLeft className="w-4 h-4 text-teal-400" />
              <span>Overview</span>
            </button>

            <span className="text-slate-600">|</span>

            {/* Template selector dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 hidden sm:inline">Active Card:</span>
              <select
                value={template.id}
                onChange={(e) => {
                  const found = STARTER_TEMPLATES.find((t) => t.id === e.target.value);
                  if (found) handleSelectTemplate(found);
                }}
                className="bg-[#0F172A] border border-[#334155] rounded-xl px-3 py-2 text-xs font-semibold text-slate-100 focus:outline-none focus:border-teal-500 max-w-[210px] sm:max-w-xs truncate cursor-pointer min-h-[48px]"
              >
                {STARTER_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id} className="bg-[#0F172A] text-slate-100">
                    {t.occasionName}: {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Drafts Drawer Trigger (min 48px tap target) */}
            <button
              onClick={() => setIsDraftsOpen(true)}
              className="min-h-[48px] px-3.5 py-2 text-xs font-medium text-slate-200 bg-[#0F172A] hover:bg-slate-800 border border-[#334155] rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
            >
              <FolderOpen className="w-4 h-4 text-amber-400" />
              <span>Drafts ({savedDrafts.length})</span>
            </button>

            {/* License button (min 48px tap target) */}
            <button
              onClick={onOpenUnlockModal}
              className="min-h-[48px] px-3 py-2 text-xs font-medium text-slate-200 hover:text-white bg-[#0F172A] hover:bg-slate-800 border border-[#334155] rounded-xl flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span className="hidden sm:inline">
                {license.isUnlocked ? 'Unlocked' : 'Free ($2)'}
              </span>
            </button>

            {/* Send Queue Shortcut */}
            <button
              onClick={() => setIsSendQueueOpen(true)}
              className="min-h-[48px] px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Send className="w-4 h-4 text-teal-200" />
              <span className="hidden sm:inline">WhatsApp Queue</span>
              <span className="sm:hidden">Send</span>
            </button>
          </div>
        </div>

        {/* Category Accent Tiles Carousel (Rule 3: Solid colored accent cards with circular icon badges) */}
        <div className="border-t border-[#334155]/60 bg-[#0F172A]/70 px-4 sm:px-6 lg:px-8 py-2.5 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 min-w-max">
            {OCCASION_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`min-h-[44px] px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer border ${
                    isActive
                      ? 'bg-[#1E293B] border-teal-500 text-white shadow-sm ring-1 ring-teal-500/50'
                      : 'bg-[#1E293B]/70 hover:bg-[#1E293B] border-[#334155] text-slate-300'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${cat.bg}`}>
                    <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
                  </div>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Studio Workspace Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Template Quick Strip when Category Filter is active */}
        {selectedCategory !== 'all' && (
          <div className="mb-6 bg-[#1E293B] border border-[#334155] rounded-2xl p-3 flex items-center gap-3 overflow-x-auto">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider shrink-0 pl-1">
              Select in {selectedCategory}:
            </span>
            <div className="flex items-center gap-2">
              {filteredTemplates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSelectTemplate(t)}
                  className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                    template.id === t.id
                      ? 'bg-teal-600/30 border-teal-500 text-teal-200'
                      : 'bg-[#0F172A] border-[#334155] text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notification Toast for Saved Draft */}
        {saveDraftNotification && (
          <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 rounded-xl text-xs flex items-center gap-2 animate-fade-in shadow-lg">
            <BookmarkCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Card draft saved locally on this phone! Find it in the Drafts drawer anytime offline.</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left / Center Column: Live 1080x1080 Canvas Preview (Solid #1E293B Card with #334155 hairline border) */}
          <div className="lg:col-span-7 bg-[#1E293B] rounded-3xl p-4 sm:p-6 shadow-xl border border-[#334155] flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-3 mb-4 border-b border-[#334155]">
              <div>
                <span className="text-xs font-bold text-slate-100 uppercase tracking-wider block font-heading">
                  {template.name}
                </span>
                <span className="text-[12px] text-slate-400 font-body">{template.tagline}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-[11px] font-mono font-semibold">
                1080 × 1080 JPG
              </div>
            </div>

            <CardCanvas
              template={template}
              fieldValues={fieldValues}
              palette={palette}
              fontPair={fontPair}
              isUnlocked={license.isUnlocked}
              tableItems={template.isTable ? tableItems : undefined}
              onOverflowChange={handleOverflowChange}
              onOpenSendQueue={() => setIsSendQueueOpen(true)}
              onSaveDraft={handleSaveDraft}
            />
          </div>

          {/* Right Column: Customization Controls (Palette, Typography, Form Fields) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#1E293B] rounded-3xl p-5 sm:p-6 shadow-xl border border-[#334155] space-y-6">
              {/* Palette Picker */}
              <PalettePicker
                palettes={template.palettes}
                selectedPaletteId={palette.id}
                onSelectPalette={(p) => setPalette(p)}
              />

              {/* Font Pair Picker */}
              <FontPicker
                fontPairs={template.fontPairs}
                selectedFontPairId={fontPair.id}
                onSelectFontPair={(f) => setFontPair(f)}
              />

              {/* Form Fields Generator & Table Manager */}
              <div className="pt-4 border-t border-[#334155]">
                <EditorForm
                  template={template}
                  fieldValues={fieldValues}
                  onFieldChange={handleFieldChange}
                  tableItems={tableItems}
                  onTableItemsChange={setTableItems}
                  overflowFields={overflowFields}
                  onResetDefaults={handleResetDefaults}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bottom Action Bar for Mobile & Low-End Viewports (Rule 3) */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[#0F172A]/95 backdrop-blur-md border-t border-[#334155] p-3 sm:hidden shadow-2xl">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <button
            onClick={handleSaveDraft}
            className="flex-1 min-h-[48px] px-3 py-2.5 bg-[#1E293B] hover:bg-slate-700 text-slate-200 border border-[#334155] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <BookmarkCheck className="w-4 h-4 text-amber-400" />
            <span>Save Draft</span>
          </button>

          <button
            onClick={() => setIsSendQueueOpen(true)}
            className="flex-2 min-h-[48px] px-4 py-2.5 bg-gradient-to-r from-teal-600 via-emerald-600 to-amber-600 hover:from-teal-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Send className="w-4 h-4 text-amber-200" />
            <span>Send via WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Modals & Drawers */}
      <WhatsAppQueueModal
        isOpen={isSendQueueOpen}
        onClose={() => setIsSendQueueOpen(false)}
        template={template}
        fieldValues={fieldValues}
        palette={palette}
        fontPair={fontPair}
        license={license}
        onOpenUnlockModal={onOpenUnlockModal}
      />

      <DraftsDrawer
        isOpen={isDraftsOpen}
        onClose={() => setIsDraftsOpen(false)}
        drafts={savedDrafts}
        onLoadDraft={handleLoadDraft}
        onDeleteDraft={handleDeleteDraft}
      />
    </div>
  );
};
