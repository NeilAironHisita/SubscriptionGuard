import React, { useState } from 'react';

export interface NewFreeTrialPayload {
  name: string;
  tier: string;
  costAfter: number; // in PHP
  daysLeft: number;
  alert48h: boolean;
}

interface AddFreeTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: 'PHP' | 'USD';
  usdRate: number;
  onAdd: (trial: NewFreeTrialPayload) => void;
}

const POPULAR_TRIALS = [
  { name: 'Disney+', tier: 'Ad-Free Premium', cost: 13.99 },
  { name: 'Paramount+', tier: 'Essential Pass', cost: 11.99 },
  { name: 'Audible', tier: '30-Day Audio', cost: 14.95 },
  { name: 'HelloFresh', tier: 'Classic Box', cost: 48.50 },
  { name: 'Apple TV+', tier: 'Standard Streaming', cost: 9.99 },
  { name: 'YouTube Premium', tier: 'Ad-Free Individual', cost: 13.99 },
];

export const AddFreeTrialModal: React.FC<AddFreeTrialModalProps> = ({
  isOpen,
  onClose,
  currency,
  usdRate,
  onAdd,
}) => {
  const [name, setName] = useState('');
  const [tier, setTier] = useState('Standard Trial');
  const [costInput, setCostInput] = useState('12.99');
  const [daysLeft, setDaysLeft] = useState('7');
  const [alert48h, setAlert48h] = useState(true);
  const [errors, setErrors] = useState<{ name?: string; cost?: string; days?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const symbol = currency === 'PHP' ? '₱' : '$';

  const selectPreset = (preset: { name: string; tier: string; cost: number }) => {
    setName(preset.name);
    setTier(preset.tier);
    const displayCost = currency === 'PHP' ? preset.cost : preset.cost / usdRate;
    setCostInput(displayCost.toFixed(2));
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; cost?: string; days?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Service name is required.';
    }
    const parsedCost = parseFloat(costInput);
    if (isNaN(parsedCost) || parsedCost <= 0) {
      newErrors.cost = 'Please enter a valid post-trial monthly cost.';
    }
    const parsedDays = parseInt(daysLeft, 10);
    if (isNaN(parsedDays) || parsedDays < 1 || parsedDays > 90) {
      newErrors.days = 'Days remaining must be between 1 and 90.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const phpCost = currency === 'PHP' ? parsedCost : parsedCost * usdRate;
      onAdd({
        name: name.trim(),
        tier: tier.trim() || 'Standard Trial',
        costAfter: phpCost,
        daysLeft: parsedDays,
        alert48h,
      });
      setIsSubmitting(false);
      onClose();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#1E2640] border border-[#2D3748] rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#2D3748]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-sm text-white leading-tight">Add Trial Intercept</h3>
              <p className="text-[10px] text-gray-400">Automate countdown defense & 48h push alerts</p>
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

        {/* Quick Presets */}
        <div>
          <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1.5">Common Trials</span>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_TRIALS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => selectPreset(p)}
                className="px-2.5 py-1 rounded-lg bg-[#0B0F17] border border-[#2D3748] hover:border-[#10B981] text-[11px] text-gray-300 hover:text-white transition-colors"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-gray-300 mb-1">Service Name:</label>
            <input
              type="text"
              placeholder="e.g. Paramount+, Audible, Peacock"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              className="w-full bg-[#0B0F17] border border-[#2D3748] rounded-xl px-3 py-2 text-white font-medium focus:border-[#10B981] outline-none"
              autoFocus
            />
            {errors.name && <p className="text-[11px] text-[#EF4444] mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-300 mb-1">Tier / Plan:</label>
              <input
                type="text"
                placeholder="e.g. 7-Day Pass"
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="w-full bg-[#0B0F17] border border-[#2D3748] rounded-xl px-3 py-2 text-white font-medium focus:border-[#10B981] outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-300 mb-1">
                Cost After Trial ({currency}):
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-2.5 font-mono text-gray-400">{symbol}</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={costInput}
                  onChange={(e) => {
                    setCostInput(e.target.value);
                    if (errors.cost) setErrors({ ...errors, cost: undefined });
                  }}
                  className="w-full bg-[#0B0F17] border border-[#2D3748] rounded-xl pl-7 pr-3 py-2 text-white font-mono focus:border-[#10B981] outline-none"
                />
              </div>
              {errors.cost && <p className="text-[11px] text-[#EF4444] mt-1">{errors.cost}</p>}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-300 mb-1">Days Left in Trial:</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="90"
                value={daysLeft}
                onChange={(e) => {
                  setDaysLeft(e.target.value);
                  if (errors.days) setErrors({ ...errors, days: undefined });
                }}
                className="w-24 bg-[#0B0F17] border border-[#2D3748] rounded-xl px-3 py-2 text-white font-mono focus:border-[#10B981] outline-none"
              />
              <div className="flex gap-1">
                {[2, 3, 7, 14, 30].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setDaysLeft(d.toString());
                      if (errors.days) setErrors({ ...errors, days: undefined });
                    }}
                    className={`px-2 py-1.5 rounded-lg text-[11px] font-mono border transition-all ${
                      daysLeft === d.toString()
                        ? 'bg-[#10B981] text-black border-[#10B981] font-bold'
                        : 'bg-[#0B0F17] border-[#2D3748] text-gray-400 hover:text-white'
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>
            {errors.days && <p className="text-[11px] text-[#EF4444] mt-1">{errors.days}</p>}
          </div>

          <div className="bg-[#0B0F17] p-3 rounded-xl border border-[#2D3748] flex items-center justify-between">
            <div>
              <span className="font-bold text-white block">48-Hour Push Interceptor</span>
              <span className="text-[10px] text-gray-400">Trigger notification 2 days before card debit</span>
            </div>
            <input
              type="checkbox"
              checked={alert48h}
              onChange={(e) => setAlert48h(e.target.checked)}
              className="w-4 h-4 accent-[#10B981] rounded cursor-pointer"
            />
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
                  <span>Saving...</span>
                </>
              ) : (
                <span>Activate Interceptor</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
