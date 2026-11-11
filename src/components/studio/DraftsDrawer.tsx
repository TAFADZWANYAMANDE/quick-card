import React from 'react';
import { DraftCard } from '../../types/template';
import { STARTER_TEMPLATES } from '../../lib/templates';
import { X, Trash2, FolderOpen, Clock } from 'lucide-react';

interface DraftsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  drafts: DraftCard[];
  onLoadDraft: (draft: DraftCard) => void;
  onDeleteDraft: (id: string) => void;
}

export const DraftsDrawer: React.FC<DraftsDrawerProps> = ({
  isOpen,
  onClose,
  drafts,
  onLoadDraft,
  onDeleteDraft,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0F172A]/80 backdrop-blur-md flex justify-end">
      <div className="bg-[#1E293B] border-l border-[#334155] w-full max-w-md h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto text-slate-100">
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
            <div>
              <h3 className="text-lg font-bold text-white font-heading">
                Saved Local Drafts
              </h3>
              <p className="text-xs text-slate-400 font-body">
                Stored strictly on your phone / browser.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 min-h-[44px] min-w-[44px] rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {drafts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <FolderOpen className="w-10 h-10 mx-auto text-slate-600 stroke-[1.5]" />
              <p className="text-xs font-medium text-slate-300">No saved drafts yet.</p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Click “Save Draft” in the Card Studio to preserve cards on this device.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {drafts.map((draft) => {
                const template = STARTER_TEMPLATES.find((t) => t.id === draft.templateId);
                const title = draft.fieldValues.title || draft.name || 'Untitled Card';
                return (
                  <div
                    key={draft.id}
                    className="p-3.5 bg-[#0F172A] border border-[#334155] rounded-2xl hover:border-slate-500 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-white truncate font-heading">
                        {title}
                      </div>
                      <div className="text-[11px] text-teal-400 truncate font-body">
                        {template?.name || 'Template'}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(draft.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          onLoadDraft(draft);
                          onClose();
                        }}
                        className="min-h-[44px] px-3.5 py-1 text-xs font-semibold text-teal-300 bg-teal-950/60 hover:bg-teal-900/80 border border-teal-500/40 rounded-xl transition-colors cursor-pointer flex items-center"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => onDeleteDraft(draft.id)}
                        className="p-2 min-h-[44px] min-w-[44px] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer flex items-center justify-center"
                        title="Delete draft"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-[#334155] text-center">
          <button
            onClick={onClose}
            className="w-full min-h-[48px] py-2.5 bg-[#0F172A] hover:bg-slate-800 text-slate-300 border border-[#334155] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
