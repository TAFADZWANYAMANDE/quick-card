import React, { useRef, useState } from 'react';
import { DraftCard } from '../../types/template';
import { STARTER_TEMPLATES } from '../../lib/templates';
import { exportAllBackupJson, importAllBackupJson, loadSavedDrafts } from '../../lib/storage';
import { X, Trash2, FolderOpen, Clock, Download, Upload, CheckCircle2, AlertCircle } from 'lucide-react';

interface DraftsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  drafts: DraftCard[];
  onLoadDraft: (draft: DraftCard) => void;
  onDeleteDraft: (id: string) => void;
  onDraftsRestored?: (drafts: DraftCard[]) => void;
}

export const DraftsDrawer: React.FC<DraftsDrawerProps> = ({
  isOpen,
  onClose,
  drafts,
  onLoadDraft,
  onDeleteDraft,
  onDraftsRestored,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backupNotice, setBackupNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleExportBackup = () => {
    const json = exportAllBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `quickcard-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setBackupNotice({ type: 'success', text: 'Full offline backup (.json) downloaded!' });
    setTimeout(() => setBackupNotice(null), 4000);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const result = importAllBackupJson(content || '');
      if (result.success) {
        if (onDraftsRestored) {
          onDraftsRestored(loadSavedDrafts());
        }
        setBackupNotice({ type: 'success', text: result.message });
      } else {
        setBackupNotice({ type: 'error', text: result.message });
      }
      setTimeout(() => setBackupNotice(null), 5000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

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
              type="button"
              onClick={onClose}
              className="p-2 min-h-[44px] min-w-[44px] rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {backupNotice && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                backupNotice.type === 'success'
                  ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/70 border border-rose-500/40 text-rose-200'
              }`}
            >
              {backupNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{backupNotice.text}</span>
            </div>
          )}

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
                        type="button"
                        onClick={() => {
                          onLoadDraft(draft);
                          onClose();
                        }}
                        className="min-h-[44px] px-3.5 py-1 text-xs font-semibold text-teal-300 bg-teal-950/60 hover:bg-teal-900/80 border border-teal-500/40 rounded-xl transition-colors cursor-pointer flex items-center"
                      >
                        Load
                      </button>
                      <button
                        type="button"
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

        {/* Backup & Close */}
        <div className="pt-4 border-t border-[#334155] space-y-3">
          <div className="p-3 bg-[#0F172A] border border-[#334155] rounded-2xl space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Device Transfer & Offline Backup
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImportBackup}
              className="hidden"
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleExportBackup}
                className="min-h-[42px] px-3 py-1.5 bg-[#1E293B] hover:bg-slate-700 text-teal-300 border border-[#334155] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="min-h-[42px] px-3 py-1.5 bg-[#1E293B] hover:bg-slate-700 text-amber-300 border border-[#334155] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Restore JSON</span>
              </button>
            </div>
          </div>

          <button
            type="button"
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
