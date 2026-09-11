import React, { useState } from 'react';

interface EditBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBudget: number; // in PHP base
  currency: 'PHP' | 'USD';
  usdRate: number;
  onSave: (newBudgetPHP: number) => void;
}

export const EditBudgetModal: React.FC<EditBudgetModalProps> = ({
  isOpen,
  onClose,
  currentBudget,
  currency,
  usdRate,
  onSave,
}) => {
  const currentDisplayVal = currency === 'PHP' ? currentBudget : currentBudget / usdRate;
  const [budgetVal, setBudgetVal] = useState<string>(currentDisplayVal.toFixed(2));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const symbol = currency === 'PHP' ? '₱' : '$';

  const handleQuickAdd = (delta: number) => {
    const current = parseFloat(budgetVal) || 0;
    const next = Math.max(10, current + delta);
    setBudgetVal(next.toFixed(2));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(budgetVal);
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid positive budget ceiling greater than 0.');
      return;
    }
    if (num > 100000) {
      setError('Budget ceiling exceeds maximum allowed boundary (100,000).');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const phpVal = currency === 'PHP' ? num : num * usdRate;
      onSave(phpVal);
      setIsSubmitting(false);
      onClose();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#1E2640] border border-[#2D3748] rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#2D3748]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-sm text-white leading-tight">Adjust Monthly Budget</h3>
              <p className="text-[10px] text-gray-400">Set safety threshold for recurring charges</p>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Monthly Ceiling ({currency}):
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 font-mono font-bold text-[#10B981] text-base">{symbol}</span>
              <input
                type="number"
                step="0.01"
                min="1"
                value={budgetVal}
                onChange={(e) => {
                  setBudgetVal(e.target.value);
                  setError(null);
                }}
                className="w-full bg-[#0B0F17] border border-[#2D3748] rounded-xl pl-8 pr-3 py-2.5 text-white font-mono font-bold text-lg focus:outline-none focus:border-[#10B981]"
                autoFocus
              />
            </div>
            {error && <p className="text-[11px] text-[#EF4444] font-medium mt-1.5">{error}</p>}
          </div>

          {/* Quick Increment Pills */}
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1.5">Quick Adjust</span>
            <div className="flex gap-1.5">
              {(currency === 'PHP' ? [50, 100, 250, 500] : [5, 10, 20, 50]).map((delta) => (
                <button
                  key={delta}
                  type="button"
                  onClick={() => handleQuickAdd(delta)}
                  className="flex-1 py-1.5 rounded-xl bg-[#0B0F17] border border-[#2D3748] hover:border-[#10B981] text-[11px] font-mono font-semibold text-gray-300 hover:text-white transition-all active:scale-95"
                >
                  +{delta}
                </button>
              ))}
            </div>
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
              {isSubmitting ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="4" className="opacity-25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" className="opacity-75" />
                  </svg>
                  <span>Updating...</span>
                </>
              ) : (
                <span>Save Ceiling</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
