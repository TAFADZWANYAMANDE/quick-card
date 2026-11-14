import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  CardTemplate,
  Palette,
  FontPair,
  DraftCard,
  UnlockLicense,
  CardCustomizations,
} from '../../types/template';
import {
  STARTER_TEMPLATES,
  SAMPLE_CONTRIBUTION_ITEMS,
  SAMPLE_GROCERY_ITEMS,
} from '../../lib/templates';
import { saveDraft, deleteDraft } from '../../lib/storage';
import { DEFAULT_CUSTOMIZATIONS, getCanvasDimensions } from '../../lib/cardRenderer';
import { CardCanvas } from './CardCanvas';
import { EditorForm } from './EditorForm';
import { PalettePicker } from './PalettePicker';
import { FontPicker } from './FontPicker';
import { DesignToolsPanel } from './DesignToolsPanel';
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
  Banknote,
  ClipboardList,
  BookmarkCheck,
  Settings,
  Undo2,
  Redo2,
  BookmarkPlus,
} from 'lucide-react';

interface CardStudioProps {
  initialTemplate?: CardTemplate;
  license: UnlockLicense;
  onOpenUnlockModal: () => void;
  onOpenSettingsModal: () => void;
  onBackToWebsite: () => void;
  savedDrafts: DraftCard[];
  onDraftsUpdated: (drafts: DraftCard[]) => void;
}

// Occasion categories matching OccasionType in src/lib/templates.ts
const OCCASION_CATEGORIES = [
  { id: 'all', label: 'All (12)', icon: Sparkles, color: 'text-teal-400', bg: 'bg-teal-500/15 border-teal-500/30' },
  { id: 'church', label: 'Church (3)', icon: Church, color: 'text-teal-400', bg: 'bg-teal-500/15 border-teal-500/30' },
  { id: 'wedding', label: 'Wedding (2)', icon: Heart, color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30' },
  { id: 'funeral', label: 'Funeral (1)', icon: Flame, color: 'text-rose-400', bg: 'bg-rose-900/30 border-rose-700/40' },
  { id: 'birthday', label: 'Birthday & School (2)', icon: Cake, color: 'text-sky-400', bg: 'bg-sky-500/15 border-sky-500/30' },
  { id: 'savings', label: 'Mukando (2)', icon: Banknote, color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30' },
  { id: 'lists', label: 'Lists (2)', icon: ClipboardList, color: 'text-orange-400', bg: 'bg-orange-500/15 border-orange-500/30' },
];

interface HistorySnapshot {
  fieldValues: Record<string, string>;
  tableItems: Array<{ id: string; name: string; amount: number; checked?: boolean }>;
  palette: Palette;
  fontPair: FontPair;
  customizations: CardCustomizations;
}

function getInitialTableItems(tpl: CardTemplate) {
  if (tpl.id === 'contributions-record-10') return SAMPLE_CONTRIBUTION_ITEMS;
  if (tpl.id === 'grocery-list-11') return SAMPLE_GROCERY_ITEMS;
  return [];
}

export const CardStudio: React.FC<CardStudioProps> = ({
  initialTemplate,
  license,
  onOpenUnlockModal,
  onOpenSettingsModal,
  onBackToWebsite,
  savedDrafts,
  onDraftsUpdated,
}) => {
  const [template, setTemplate] = useState<CardTemplate>(initialTemplate || STARTER_TEMPLATES[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({
    ...(initialTemplate || STARTER_TEMPLATES[0]).defaultValues,
  });
  const [palette, setPalette] = useState<Palette>((initialTemplate || STARTER_TEMPLATES[0]).palettes[0]);
  const [fontPair, setFontPair] = useState<FontPair>((initialTemplate || STARTER_TEMPLATES[0]).fontPairs[0]);
  const [tableItems, setTableItems] = useState<
    Array<{ id: string; name: string; amount: number; checked?: boolean }>
  >(getInitialTableItems(initialTemplate || STARTER_TEMPLATES[0]));
  const [customizations, setCustomizations] = useState<CardCustomizations>({
    ...DEFAULT_CUSTOMIZATIONS,
    currencySymbol: (initialTemplate || STARTER_TEMPLATES[0]).tableConfig?.isCurrency === false ? 'QTY' : '$',
  });
  const [previewGuestName, setPreviewGuestName] = useState('');

  const [overflowFields, setOverflowFields] = useState<string[]>([]);
  const [isSendQueueOpen, setIsSendQueueOpen] = useState(false);
  const [isDraftsOpen, setIsDraftsOpen] = useState(false);
  const [saveDraftNotification, setSaveDraftNotification] = useState(false);

  // Undo / Redo History Stacks
  const [pastHistory, setPastHistory] = useState<HistorySnapshot[]>([]);
  const [futureHistory, setFutureHistory] = useState<HistorySnapshot[]>([]);
  const currentSnapshotRef = useRef<HistorySnapshot>({
    fieldValues,
    tableItems,
    palette,
    fontPair,
    customizations,
  });

  useEffect(() => {
    currentSnapshotRef.current = {
      fieldValues,
      tableItems,
      palette,
      fontPair,
      customizations,
    };
  }, [fieldValues, tableItems, palette, fontPair, customizations]);

  const pushHistory = useCallback(() => {
    const snap = currentSnapshotRef.current;
    setPastHistory((prev) => [...prev.slice(-29), snap]);
    setFutureHistory([]);
  }, []);

  const handleUndo = useCallback(() => {
    setPastHistory((prev) => {
      if (prev.length === 0) return prev;
      const previous = prev[prev.length - 1];
      setFutureHistory((f) => [currentSnapshotRef.current, ...f.slice(0, 29)]);
      setFieldValues(previous.fieldValues);
      setTableItems(previous.tableItems);
      setPalette(previous.palette);
      setFontPair(previous.fontPair);
      setCustomizations(previous.customizations);
      return prev.slice(0, -1);
    });
  }, []);

  const handleRedo = useCallback(() => {
    setFutureHistory((prev) => {
      if (prev.length === 0) return prev;
      const next = prev[0];
      setPastHistory((p) => [...p.slice(-29), currentSnapshotRef.current]);
      setFieldValues(next.fieldValues);
      setTableItems(next.tableItems);
      setPalette(next.palette);
      setFontPair(next.fontPair);
      setCustomizations(next.customizations);
      return prev.slice(1);
    });
  }, []);

  // Keyboard shortcuts Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT');
      if (isInput) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleUndo, handleRedo]);

  const handleOverflowChange = useCallback((_hasOverflow: boolean, fields: string[]) => {
    setOverflowFields((prev) => {
      if (prev.length === fields.length && prev.every((f, i) => f === fields[i])) {
        return prev;
      }
      return fields;
    });
  }, []);

  const handleSelectTemplate = (newTemplate: CardTemplate) => {
    setTemplate(newTemplate);
    setFieldValues({ ...newTemplate.defaultValues });
    setPalette(newTemplate.palettes[0]);
    setFontPair(newTemplate.fontPairs[0]);
    setTableItems(getInitialTableItems(newTemplate));
    setCustomizations((prev) => ({
      ...prev,
      currencySymbol: newTemplate.tableConfig?.isCurrency === false ? 'QTY' : '$',
    }));
    setPastHistory([]);
    setFutureHistory([]);
  };

  const handleFieldChange = (key: string, value: string) => {
    pushHistory();
    setFieldValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleTableItemsChange = (items: Array<{ id: string; name: string; amount: number; checked?: boolean }>) => {
    pushHistory();
    setTableItems(items);
  };

  const handlePaletteSelect = (p: Palette) => {
    pushHistory();
    setPalette(p);
  };

  const handleFontSelect = (f: FontPair) => {
    pushHistory();
    setFontPair(f);
  };

  const handleCustomizationsChange = (next: CardCustomizations) => {
    pushHistory();
    setCustomizations(next);
  };

  const handleResetDefaults = () => {
    pushHistory();
    setFieldValues({ ...template.defaultValues });
    setTableItems(getInitialTableItems(template));
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
      customizations,
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
    setTableItems(draft.tableItems || getInitialTableItems(tpl));
    setCustomizations(draft.customizations || { ...DEFAULT_CUSTOMIZATIONS });
    setPastHistory([]);
    setFutureHistory([]);
  };

  const handleDeleteDraft = (id: string) => {
    const updated = deleteDraft(id);
    onDraftsUpdated(updated);
  };

  const filteredTemplates =
    selectedCategory === 'all'
      ? STARTER_TEMPLATES
      : STARTER_TEMPLATES.filter((t) => t.occasion === selectedCategory);

  const dims = getCanvasDimensions(customizations.aspectRatio);

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 pb-28">
      {/* Studio Top Control Strip */}
      <div className="no-print bg-[#1E293B] border-b border-[#334155] sticky top-18 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[56px] py-2 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onBackToWebsite}
              className="min-h-[46px] px-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer border border-[#334155]"
            >
              <ArrowLeft className="w-4 h-4 text-teal-400" />
              <span className="hidden sm:inline">Overview</span>
            </button>

            <select
              value={template.id}
              onChange={(e) => {
                const found = STARTER_TEMPLATES.find((t) => t.id === e.target.value);
                if (found) handleSelectTemplate(found);
              }}
              className="bg-[#0F172A] border border-[#334155] rounded-xl px-3 py-2 text-xs font-semibold text-slate-100 focus:outline-none focus:border-teal-500 max-w-[185px] sm:max-w-xs truncate cursor-pointer min-h-[46px]"
            >
              {STARTER_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id} className="bg-[#0F172A] text-slate-100">
                  {t.occasionName}: {t.name}
                </option>
              ))}
            </select>

            {/* Undo / Redo Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleUndo}
                disabled={pastHistory.length === 0}
                className="min-h-[44px] min-w-[44px] p-2 rounded-xl bg-[#0F172A] hover:bg-slate-800 disabled:opacity-35 border border-[#334155] text-slate-200 flex items-center justify-center cursor-pointer transition-colors"
                title="Undo (Ctrl+Z)"
                aria-label="Undo"
              >
                <Undo2 className="w-4 h-4 text-teal-400" />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={futureHistory.length === 0}
                className="min-h-[44px] min-w-[44px] p-2 rounded-xl bg-[#0F172A] hover:bg-slate-800 disabled:opacity-35 border border-[#334155] text-slate-200 flex items-center justify-center cursor-pointer transition-colors"
                title="Redo (Ctrl+Y)"
                aria-label="Redo"
              >
                <Redo2 className="w-4 h-4 text-teal-400" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Save Draft button (desktop & tablet) */}
            <button
              type="button"
              onClick={handleSaveDraft}
              className="hidden sm:flex min-h-[46px] px-3 py-2 text-xs font-semibold text-teal-300 bg-teal-950/50 hover:bg-teal-900/60 border border-teal-500/40 rounded-xl transition-colors items-center gap-1.5 cursor-pointer"
              title="Save current card & settings locally"
            >
              <BookmarkPlus className="w-4 h-4" />
              <span>Save Draft</span>
            </button>

            {/* Drafts Drawer Trigger */}
            <button
              type="button"
              onClick={() => setIsDraftsOpen(true)}
              className="min-h-[46px] px-3 py-2 text-xs font-medium text-slate-200 bg-[#0F172A] hover:bg-slate-800 border border-[#334155] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FolderOpen className="w-4 h-4 text-amber-400" />
              <span>Drafts ({savedDrafts.length})</span>
            </button>

            {/* License button */}
            <button
              type="button"
              onClick={onOpenUnlockModal}
              className="min-h-[46px] px-3 py-2 text-xs font-medium text-slate-200 hover:text-white bg-[#0F172A] hover:bg-slate-800 border border-[#334155] rounded-xl flex items-center gap-1.5 cursor-pointer"
              title="Manage Pro Lifetime Unlock"
            >
              <ShieldCheck className={`w-4 h-4 ${license.isUnlocked ? 'text-teal-400' : 'text-amber-400'}`} />
              <span className="hidden md:inline">
                {license.isUnlocked ? 'Pro Unlocked' : 'Pro ($2)'}
              </span>
            </button>

            {/* App Colors & Settings */}
            <button
              type="button"
              onClick={onOpenSettingsModal}
              className="min-h-[46px] min-w-[46px] p-2.5 text-xs font-medium text-slate-200 hover:text-white bg-[#0F172A] hover:bg-slate-800 border border-[#334155] rounded-xl flex items-center justify-center cursor-pointer transition-colors"
              title="App Theme & Settings (Light/Dark Colors)"
              aria-label="App Theme and Settings"
            >
              <Settings className="w-4 h-4 text-teal-400" />
            </button>

            {/* Send Queue Shortcut */}
            <button
              type="button"
              onClick={() => setIsSendQueueOpen(true)}
              className="min-h-[46px] px-3.5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Send className="w-4 h-4 text-teal-200" />
              <span className="hidden sm:inline">WhatsApp Queue</span>
              <span className="sm:hidden">Send</span>
            </button>
          </div>
        </div>

        {/* Category Filter Carousel */}
        <div className="border-t border-[#334155]/60 bg-[#0F172A]/70 px-4 sm:px-6 lg:px-8 py-2.5 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 min-w-max">
            {OCCASION_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
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
          <div className="no-print mb-6 bg-[#1E293B] border border-[#334155] rounded-2xl p-3 flex items-center gap-3 overflow-x-auto">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider shrink-0 pl-1">
              Templates:
            </span>
            <div className="flex items-center gap-2">
              {filteredTemplates.map((t) => (
                <button
                  key={t.id}
                  type="button"
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
          <div className="no-print mb-4 p-3 bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 rounded-xl text-xs flex items-center gap-2 shadow-lg">
            <BookmarkCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Card draft saved locally on this device! Find it in Drafts anytime offline.</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left / Center Column: Live Canvas Preview */}
          <div className="lg:col-span-7 bg-[#1E293B] rounded-3xl p-4 sm:p-6 shadow-xl border border-[#334155] flex flex-col items-center">
            <div className="no-print w-full flex items-center justify-between pb-3 mb-4 border-b border-[#334155]">
              <div>
                <span className="text-xs font-bold text-slate-100 uppercase tracking-wider block font-heading">
                  {template.name}
                </span>
                <span className="text-[12px] text-slate-400 font-body">{template.tagline}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-[11px] font-mono font-semibold">
                {dims.width} × {dims.height}
              </div>
            </div>

            <CardCanvas
              template={template}
              fieldValues={fieldValues}
              palette={palette}
              fontPair={fontPair}
              isUnlocked={license.isUnlocked}
              personalisedName={previewGuestName.trim() || undefined}
              tableItems={template.isTable ? tableItems : undefined}
              customizations={customizations}
              onOverflowChange={handleOverflowChange}
              onOpenSendQueue={() => setIsSendQueueOpen(true)}
              onSaveDraft={handleSaveDraft}
            />
          </div>

          {/* Right Column: Customization Controls */}
          <div className="no-print lg:col-span-5 space-y-6">
            <div className="bg-[#1E293B] rounded-3xl p-5 sm:p-6 shadow-xl border border-[#334155] space-y-6">
              <PalettePicker
                palettes={template.palettes}
                selectedPaletteId={palette.id}
                onSelectPalette={handlePaletteSelect}
              />

              <FontPicker
                fontPairs={template.fontPairs}
                selectedFontPairId={fontPair.id}
                onSelectFontPair={handleFontSelect}
              />

              <DesignToolsPanel
                customizations={customizations}
                onChange={handleCustomizationsChange}
              />

              <div className="pt-4 border-t border-[#334155]">
                <EditorForm
                  template={template}
                  fieldValues={fieldValues}
                  onFieldChange={handleFieldChange}
                  tableItems={tableItems}
                  onTableItemsChange={handleTableItemsChange}
                  overflowFields={overflowFields}
                  onResetDefaults={handleResetDefaults}
                  previewGuestName={previewGuestName}
                  onPreviewGuestNameChange={setPreviewGuestName}
                  currencySymbol={customizations.currencySymbol || '$'}
                  onCurrencySymbolChange={(symbol) =>
                    handleCustomizationsChange({ ...customizations, currencySymbol: symbol })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bottom Action Bar for Mobile */}
      <div className="no-print fixed bottom-0 inset-x-0 z-40 bg-[#0F172A]/95 backdrop-blur-md border-t border-[#334155] p-3 sm:hidden shadow-2xl">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="flex-1 min-h-[48px] px-3 py-2.5 bg-[#1E293B] hover:bg-slate-700 text-slate-200 border border-[#334155] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <BookmarkCheck className="w-4 h-4 text-amber-400" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
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
        tableItems={template.isTable ? tableItems : undefined}
        customizations={customizations}
        onOpenUnlockModal={onOpenUnlockModal}
      />

      <DraftsDrawer
        isOpen={isDraftsOpen}
        onClose={() => setIsDraftsOpen(false)}
        drafts={savedDrafts}
        onLoadDraft={handleLoadDraft}
        onDeleteDraft={handleDeleteDraft}
        onDraftsRestored={onDraftsUpdated}
      />
    </div>
  );
};
