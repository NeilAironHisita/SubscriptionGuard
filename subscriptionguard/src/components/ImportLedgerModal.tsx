import React, { useState } from 'react';

interface ImportLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (jsonData: any) => void;
}

export const ImportLedgerModal: React.FC<ImportLedgerModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        setJsonText(content);
        setError(null);
      } catch {
        setError('Failed to read file.');
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jsonText.trim()) {
      setError('Please paste JSON content or choose a file.');
      return;
    }

    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Root must be an object.');
      }
      setIsSubmitting(true);
      setTimeout(() => {
        onImport(parsed);
        setIsSubmitting(false);
        onClose();
      }, 250);
    } catch (err: any) {
      setError(`Invalid JSON: ${err.message || 'Syntax error'}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#1E2640] border border-[#2D3748] rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#2D3748]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-sm text-white leading-tight">Import Ledger JSON</h3>
              <p className="text-[10px] text-gray-400">Restore or import vault state from backup</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#0B0F17] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-gray-300 mb-1">Select JSON File:</label>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#0B0F17] file:text-[#10B981] hover:file:bg-[#10B981]/10 cursor-pointer"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-300 mb-1">Or Paste Raw JSON:</label>
            <textarea
              rows={6}
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                setError(null);
              }}
              placeholder='{"subscriptions": [...], "freeTrials": [...]}'
              className="w-full bg-[#0B0F17] border border-[#2D3748] rounded-xl p-3 font-mono text-[11px] text-[#10B981] focus:border-[#10B981] outline-none resize-none"
            />
            {error && <p className="text-[11px] text-[#EF4444] mt-1">{error}</p>}
          </div>

          <div className="pt-2 border-t border-[#2D3748] flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-[#0B0F17] border border-[#2D3748] text-xs font-bold text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-[#10B981] text-black text-xs font-black shadow hover:bg-[#4EDEA3] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 active:scale-95"
            >
              {isSubmitting ? 'Importing...' : 'Validate & Import'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
