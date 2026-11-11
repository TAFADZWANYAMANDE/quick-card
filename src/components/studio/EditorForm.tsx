import React from 'react';
import { CardTemplate } from '../../types/template';
import { Plus, Trash2, RotateCcw, AlertTriangle } from 'lucide-react';

interface EditorFormProps {
  template: CardTemplate;
  fieldValues: Record<string, string>;
  onFieldChange: (key: string, value: string) => void;
  tableItems?: Array<{ id: string; name: string; amount: number; checked?: boolean }>;
  onTableItemsChange?: (items: Array<{ id: string; name: string; amount: number; checked?: boolean }>) => void;
  overflowFields: string[];
  onResetDefaults: () => void;
}

export const EditorForm: React.FC<EditorFormProps> = ({
  template,
  fieldValues,
  onFieldChange,
  tableItems = [],
  onTableItemsChange,
  overflowFields,
  onResetDefaults,
}) => {
  // Table row management for Contributions and Groceries
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

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
        <div>
          <h3 className="text-sm font-bold text-slate-100 font-heading">
            Card Details & Content
          </h3>
          <p className="text-[12px] text-slate-400 font-body">
            Edit text fields. Changes render instantly onto the 1080×1080 canvas.
          </p>
        </div>

        <button
          onClick={onResetDefaults}
          className="min-h-[44px] px-3 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer border border-[#334155]"
          title="Reset all fields to template defaults"
        >
          <RotateCcw className="w-3.5 h-3.5 text-teal-400" />
          <span>Reset</span>
        </button>
      </div>

      {/* Overflow Warning if any */}
      {overflowFields.length > 0 && (
        <div className="p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-xl flex items-start gap-2.5 text-xs text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-300">Text too long for card frame:</span>
            <span className="block mt-0.5 text-amber-200/90">
              {overflowFields.join(', ')}. Please shorten slightly so it fits inside the double-border flourishes without crowding.
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
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 block font-body">
                {template.tableConfig?.itemLabel || 'Table Rows'} (Auto Total)
              </span>
              <span className="text-[12px] text-teal-400 font-mono font-bold">
                Total:{' '}
                {template.tableConfig?.isCurrency
                  ? `$${totalTableSum.toFixed(2)} USD`
                  : `${totalTableSum} items`}
              </span>
            </div>

            <button
              onClick={handleAddTableRow}
              className="min-h-[44px] px-3 py-1.5 text-xs font-semibold text-teal-300 bg-teal-950/50 hover:bg-teal-900/60 border border-teal-500/40 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Row</span>
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {tableItems.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-2 bg-[#0F172A] border border-[#334155] rounded-xl"
              >
                <span className="text-xs font-mono text-slate-400 w-5 text-center">
                  {idx + 1}
                </span>

                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleUpdateTableRow(idx, { name: e.target.value })}
                  className="flex-1 min-h-[40px] bg-[#1E293B] border border-[#334155] rounded-lg px-2.5 py-1 text-xs text-slate-100 focus:outline-none focus:border-teal-500 font-body"
                  placeholder="Name / Item"
                />

                <div className="w-24 relative">
                  <span className="absolute left-2.5 top-2.5 text-xs text-slate-400 font-mono">
                    {template.tableConfig?.unit || '$'}
                  </span>
                  <input
                    type="number"
                    value={item.amount}
                    onChange={(e) =>
                      handleUpdateTableRow(idx, { amount: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full min-h-[40px] bg-[#1E293B] border border-[#334155] rounded-lg pl-6 pr-2 py-1 text-xs font-mono text-right text-slate-100 focus:outline-none focus:border-teal-500"
                    placeholder="0"
                  />
                </div>

                <button
                  onClick={() => handleDeleteTableRow(idx)}
                  className="p-2 min-h-[40px] text-slate-400 hover:text-rose-400 transition-colors"
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
