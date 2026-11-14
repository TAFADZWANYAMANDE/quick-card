import React from 'react';
import { CardTemplate } from '../../types/template';
import { Plus, Trash2, RotateCcw, AlertTriangle, Check, UserCheck } from 'lucide-react';

interface EditorFormProps {
  template: CardTemplate;
  fieldValues: Record<string, string>;
  onFieldChange: (key: string, value: string) => void;
  tableItems?: Array<{ id: string; name: string; amount: number; checked?: boolean }>;
  onTableItemsChange?: (items: Array<{ id: string; name: string; amount: number; checked?: boolean }>) => void;
  overflowFields: string[];
  onResetDefaults: () => void;
  previewGuestName?: string;
  onPreviewGuestNameChange?: (name: string) => void;
  currencySymbol?: string;
  onCurrencySymbolChange?: (symbol: string) => void;
}

export const EditorForm: React.FC<EditorFormProps> = ({
  template,
  fieldValues,
  onFieldChange,
  tableItems = [],
  onTableItemsChange,
  overflowFields,
  onResetDefaults,
  previewGuestName = '',
  onPreviewGuestNameChange,
  currencySymbol = '$',
  onCurrencySymbolChange,
}) => {
  const handleAddTableRow = () => {
    if (!onTableItemsChange) return;
    const newItem = {
      id: `row-${Date.now()}`,
      name: 'New Member / Item',
      amount: 10,
      checked: false,
    };
    onTableItemsChange([...tableItems, newItem]);
  };

  const handleUpdateTableRow = (idx: number, updates: Partial<{ name: string; amount: number; checked?: boolean }>) => {
    if (!onTableItemsChange) return;
    const updated = [...tableItems];
    updated[idx] = { ...updated[idx], ...updates };
    onTableItemsChange(updated);
  };

  const handleDeleteTableRow = (idx: number) => {
    if (!onTableItemsChange) return;
    const updated = tableItems.filter((_, i) => i !== idx);
    onTableItemsChange(updated);
  };

  const totalTableSum = tableItems.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const hasMergePlaceholder =
    template.fields.some((f) => f.isPersonalisedName) ||
    Object.values(fieldValues).some((v) => /\{name\}/i.test(v));

  const formatSummaryTotal = () => {
    if (!template.tableConfig?.isCurrency && currencySymbol === 'QTY') {
      return `${totalTableSum} items`;
    }
    if (currencySymbol === 'QTY') return `${totalTableSum} items`;
    if (currencySymbol === 'ZiG') return `ZiG ${totalTableSum.toFixed(2)}`;
    if (currencySymbol === 'R') return `R${totalTableSum.toFixed(2)} ZAR`;
    return `$${totalTableSum.toFixed(2)} USD`;
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
        <div>
          <h3 className="text-sm font-bold text-slate-100 font-heading">
            Card Details & Content
          </h3>
          <p className="text-[12px] text-slate-400 font-body">
            Edit text fields. Changes render instantly onto the canvas.
          </p>
        </div>

        <button
          type="button"
          onClick={onResetDefaults}
          className="min-h-[44px] px-3 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer border border-[#334155]"
          title="Reset all fields to template defaults"
        >
          <RotateCcw className="w-3.5 h-3.5 text-teal-400" />
          <span>Reset</span>
        </button>
      </div>

      {/* Live Guest Name Merge Tester */}
      {hasMergePlaceholder && onPreviewGuestNameChange && (
        <div className="p-3 bg-teal-950/35 border border-teal-500/35 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-teal-300 flex items-center gap-1.5 font-body">
              <UserCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Preview <code className="font-mono">{'{name}'}</code> As Specific Guest</span>
            </label>
            {previewGuestName && (
              <button
                type="button"
                onClick={() => onPreviewGuestNameChange('')}
                className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          <input
            type="text"
            value={previewGuestName}
            onChange={(e) => onPreviewGuestNameChange(e.target.value)}
            placeholder="Type a guest name (e.g. Mai Chido) to preview..."
            className="w-full min-h-[38px] bg-[#0F172A] border border-teal-500/30 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-400"
          />
        </div>
      )}

      {/* Overflow Warning if any */}
      {overflowFields.length > 0 && (
        <div className="p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-xl flex items-start gap-2.5 text-xs text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-300">Text too long for card frame:</span>
            <span className="block mt-0.5 text-amber-200/90">
              {overflowFields.join(', ')}. Please shorten slightly or reduce Typography Size in Layout Tools.
            </span>
          </div>
        </div>
      )}

      {/* Dynamic Fields List */}
      <div className="space-y-4">
        {template.fields.map((field) => {
          const value = fieldValues[field.key] ?? field.default;
          const isOverflowing = overflowFields.includes(field.label);

          return (
            <div key={field.key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 font-body">
                  <span>{field.label}</span>
                  {field.isPersonalisedName && (
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full">
                      Personalised {'{name}'}
                    </span>
                  )}
                </label>
                <span className="text-[11px] text-slate-400 font-body">
                  max {field.maxLines} {field.maxLines === 1 ? 'line' : 'lines'}
                </span>
              </div>

              {field.isMultiline ? (
                <textarea
                  rows={field.maxLines > 4 ? 4 : 3}
                  value={value}
                  onChange={(e) => onFieldChange(field.key, e.target.value)}
                  className={`w-full bg-[#0F172A] border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none transition-colors font-body ${
                    isOverflowing
                      ? 'border-amber-500 focus:border-amber-400 ring-1 ring-amber-500'
                      : 'border-[#334155] focus:border-teal-500 focus:ring-1 focus:ring-teal-500'
                  }`}
                  placeholder={`Enter ${field.label.toLowerCase()}...`}
                />
              ) : (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => onFieldChange(field.key, e.target.value)}
                  className={`w-full min-h-[46px] bg-[#0F172A] border rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none transition-colors font-body ${
                    isOverflowing
                      ? 'border-amber-500 focus:border-amber-400 ring-1 ring-amber-500'
                      : 'border-[#334155] focus:border-teal-500 focus:ring-1 focus:ring-teal-500'
                  }`}
                  placeholder={`Enter ${field.label.toLowerCase()}...`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Table Editor (if template.isTable) */}
      {template.isTable && (
        <div className="pt-4 border-t border-[#334155] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 block font-body">
                {template.tableConfig?.itemLabel || 'Table Rows'} (Auto Total)
              </span>
              <span className="text-[12px] text-teal-400 font-mono font-bold">
                Total: {formatSummaryTotal()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {onCurrencySymbolChange && (
                <select
                  value={currencySymbol}
                  onChange={(e) => onCurrencySymbolChange(e.target.value)}
                  className="min-h-[44px] bg-[#0F172A] border border-[#334155] rounded-xl px-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
                  title="Select Currency / Unit"
                >
                  <option value="$">$ USD</option>
                  <option value="ZiG">ZiG</option>
                  <option value="R">R ZAR</option>
                  <option value="QTY">Qty / Items</option>
                </select>
              )}

              <button
                type="button"
                onClick={handleAddTableRow}
                className="min-h-[44px] px-3 py-1.5 text-xs font-semibold text-teal-300 bg-teal-950/50 hover:bg-teal-900/60 border border-teal-500/40 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Row</span>
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {tableItems.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-2 bg-[#0F172A] border border-[#334155] rounded-xl"
              >
                <button
                  type="button"
                  onClick={() => handleUpdateTableRow(idx, { checked: !item.checked })}
                  className={`min-h-[36px] min-w-[36px] rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                    item.checked
                      ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                      : 'bg-[#1E293B] border-[#334155] text-slate-500 hover:text-slate-300'
                  }`}
                  title={item.checked ? 'Marked Paid / Done (✓)' : 'Mark Paid / Done (✓)'}
                >
                  <Check className="w-3.5 h-3.5" />
                </button>

                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleUpdateTableRow(idx, { name: e.target.value })}
                  className="flex-1 min-h-[40px] bg-[#1E293B] border border-[#334155] rounded-lg px-2.5 py-1 text-xs text-slate-100 focus:outline-none focus:border-teal-500 font-body"
                  placeholder="Name / Item"
                />

                <div className="w-24 relative">
                  <span className="absolute left-2 top-2.5 text-[11px] text-slate-400 font-mono">
                    {currencySymbol === 'QTY' ? '#' : currencySymbol}
                  </span>
                  <input
                    type="number"
                    value={item.amount}
                    onChange={(e) =>
                      handleUpdateTableRow(idx, { amount: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full min-h-[40px] bg-[#1E293B] border border-[#334155] rounded-lg pl-8 pr-2 py-1 text-xs font-mono text-right text-slate-100 focus:outline-none focus:border-teal-500"
                    placeholder="0"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteTableRow(idx)}
                  className="p-2 min-h-[40px] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Remove row"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
