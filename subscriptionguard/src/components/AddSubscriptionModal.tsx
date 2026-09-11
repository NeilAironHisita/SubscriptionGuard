import React, { useState } from 'react';

export interface NewSubscriptionPayload {
  name: string;
  category: 'Entertainment' | 'Creative' | 'Productivity' | 'Health' | 'Utilities';
  cost: number; // in PHP
  renewDays: number;
  billingCycle: 'Monthly' | 'Annual';
  paymentMethod: string;
}

interface AddSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: 'PHP' | 'USD';
  usdRate: number;
  onAdd: (sub: NewSubscriptionPayload) => void;
}

const PRESET_SUBSCRIPTIONS = [
  { name: 'Netflix', category: 'Entertainment', cost: 22.99, cycle: 'Monthly' as const },
  { name: 'Spotify', category: 'Entertainment', cost: 14.99, cycle: 'Monthly' as const },
  { name: 'ChatGPT Plus', category: 'Productivity', cost: 20.00, cycle: 'Monthly' as const },
  { name: 'YouTube Premium', category: 'Entertainment', cost: 13.99, cycle: 'Monthly' as const },
  { name: 'GitHub Copilot', category: 'Productivity', cost: 10.00, cycle: 'Monthly' as const },
  { name: 'iCloud Storage', category: 'Utilities', cost: 16.53, cycle: 'Monthly' as const },
  { name: 'Equinox Gym', category: 'Health', cost: 85.00, cycle: 'Monthly' as const },
  { name: 'Adobe Creative Cloud', category: 'Creative', cost: 54.99, cycle: 'Monthly' as const },
];

export const AddSubscriptionModal: React.FC<AddSubscriptionModalProps> = ({
  isOpen,
  onClose,
  currency,
  usdRate,
  onAdd,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Entertainment' | 'Creative' | 'Productivity' | 'Health' | 'Utilities'>('Entertainment');
  const [costInput, setCostInput] = useState('14.99');
  const [renewDays, setRenewDays] = useState('14');
  const [billingCycle, setBillingCycle] = useState<'Monthly' | 'Annual'>('Monthly');
  const [paymentMethod, setPaymentMethod] = useState('Chase Premier Checking (•••• 9012)');
  const [errors, setErrors] = useState<{ name?: string; cost?: string; days?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const symbol = currency === 'PHP' ? '₱' : '$';

  const selectPreset = (preset: typeof PRESET_SUBSCRIPTIONS[0]) => {
    setName(preset.name);
    setCategory(preset.category);
    const displayCost = currency === 'PHP' ? preset.cost : preset.cost / usdRate;
    setCostInput(displayCost.toFixed(2));
    setBillingCycle(preset.cycle);
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
      newErrors.cost = 'Please enter a valid monthly or annual cost greater than 0.';
    }
    const parsedDays = parseInt(renewDays, 10);
    if (isNaN(parsedDays) || parsedDays < 1 || parsedDays > 365) {
      newErrors.days = 'Days to renewal must be between 1 and 365.';
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
        category,
        cost: phpCost,
        renewDays: parsedDays,
        billingCycle,
        paymentMethod,
      });
      setIsSubmitting(false);
      onClose();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#1E2640] border border-[#2D3748] rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between pb-3 border-b border-[#2D3748]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-sm text-white leading-tight">Add Recurring Subscription</h3>
              <p className="text-[10px] text-gray-400">Track renewals, burn rate & utilization telemetry</p>
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
          <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1.5">Common Recurring Subscriptions</span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_SUBSCRIPTIONS.map((p) => (
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
              placeholder="e.g. Netflix, Adobe CC, ChatGPT Plus"
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
              <label className="block font-semibold text-gray-300 mb-1">Category:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#0B0F17] border border-[#2D3748] rounded-xl px-3 py-2 text-white outline-none focus:border-[#10B981]"
              >
                <option value="Entertainment">Entertainment</option>
                <option value="Creative">Creative</option>
                <option value="Productivity">Productivity</option>
                <option value="Health">Health</option>
                <option value="Utilities">Utilities</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-gray-300 mb-1">Billing Cycle:</label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as any)}
                className="w-full bg-[#0B0F17] border border-[#2D3748] rounded-xl px-3 py-2 text-white outline-none focus:border-[#10B981]"
              >
                <option value="Monthly">Monthly</option>
                <option value="Annual">Annual</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-300 mb-1">
                Cost ({currency}):
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

            <div>
              <label className="block font-semibold text-gray-300 mb-1">Days to Renewal:</label>
              <input
                type="number"
                min="1"
                max="365"
                value={renewDays}
                onChange={(e) => {
                  setRenewDays(e.target.value);
                  if (errors.days) setErrors({ ...errors, days: undefined });
                }}
                className="w-full bg-[#0B0F17] border border-[#2D3748] rounded-xl px-3 py-2 text-white font-mono focus:border-[#10B981] outline-none"
              />
              {errors.days && <p className="text-[11px] text-[#EF4444] mt-1">{errors.days}</p>}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-300 mb-1">Payment Method:</label>
            <input
              type="text"
              placeholder="e.g. Visa •••• 4821 or GCash"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-[#0B0F17] border border-[#2D3748] rounded-xl px-3 py-2 text-white font-medium focus:border-[#10B981] outline-none"
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
                <span>Add Subscription</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
