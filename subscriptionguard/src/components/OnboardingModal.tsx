import React, { useState } from 'react';
import { CurrencyCode, UserProfile } from '../types';

interface OnboardingModalProps {
  userProfile: UserProfile;
  onSaveProfile: (updates: Partial<UserProfile>) => void;
  onClose: () => void;
  onOpenHelp: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  userProfile,
  onSaveProfile,
  onClose,
  onOpenHelp,
}) => {
  const [selectedOption, setSelectedOption] = useState<'bank' | 'manual'>('bank');
  const [currency, setCurrency] = useState<CurrencyCode>(userProfile.currency || 'PHP');
  const [estimatedSpend, setEstimatedSpend] = useState<number>(userProfile.monthly_estimated_spend || 214.50);
  const [selectedBank, setSelectedBank] = useState<string>('Chase Premier Checking (•••• 9012)');
  const [isConnectingBank, setIsConnectingBank] = useState(false);
  const [showBankPicker, setShowBankPicker] = useState(false);

  const currencySymbol = currency === 'PHP' ? '₱' : '$';

  const BANKS = [
    'Chase Premier Checking (•••• 9012)',
    'Bank of America (•••• 4120)',
    'BDO Unibank (•••• 8821)',
    'BPI Express Online (•••• 3390)',
    'Wells Fargo Way2Save (•••• 7711)',
    'Revolut Vault (•••• 5529)',
  ];

  const handleContinue = () => {
    onSaveProfile({
      currency,
      monthly_estimated_spend: estimatedSpend,
      linked_bank_name: selectedOption === 'bank' ? selectedBank : undefined,
      bank_connected: selectedOption === 'bank',
      onboarding_completed: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0F17]/90 backdrop-blur-lg overflow-y-auto">
      <main className="w-full max-w-lg my-auto">
        {/* Setup Card matching Screenshot 1 */}
        <div className="bg-[#1E2640] rounded-2xl p-6 md:p-8 shadow-2xl border border-[#2D3748] flex flex-col gap-4 relative">
          {/* Help Button in top right */}
          <button
            onClick={onOpenHelp}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#262A33] border border-[#3C4A42] flex items-center justify-center text-[#10B981] hover:bg-[#10B981] hover:text-black transition-colors shadow-lg cursor-pointer"
            aria-label="Universal Help and Tutorial"
          >
            <span className="material-symbols-outlined text-lg">help</span>
          </button>

          {/* Header */}
          <header className="text-center mb-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#262A33] border border-[#3C4A42] mb-3">
              <span className="material-symbols-outlined text-[#10B981] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                security
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
              Secure Your Subscriptions
            </h1>
            <p className="text-sm md:text-base text-[#9CA3AF]">
              Link your accounts or estimate your monthly spend to get started.
            </p>
          </header>

          {/* Action Blocks */}
          <div className="flex flex-col gap-3 mt-2">
            {/* Option 1: Link Bank Account */}
            <button
              onClick={() => {
                setSelectedOption('bank');
                setShowBankPicker(true);
              }}
              className={`w-full flex items-center p-4 rounded-xl border transition-all text-left cursor-pointer ${
                selectedOption === 'bank'
                  ? 'bg-[#1C2028] border-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : 'bg-[#1C2028] border-[#3C4A42] hover:border-[#10B981]/60'
              }`}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#262A33] flex items-center justify-center mr-4 text-[#DFE2EE]">
                <span className="material-symbols-outlined text-xl">account_balance</span>
              </div>
              <div className="flex-grow">
                <h3 className="text-sm md:text-base font-semibold text-white">
                  Link Bank Account
                </h3>
                <p className="text-xs text-[#9CA3AF] mt-0.5">
                  Automatic tracking & insights (Recommended)
                </p>
                {selectedOption === 'bank' && selectedBank && (
                  <span className="inline-block text-[11px] text-[#10B981] font-semibold mt-1">
                    Connected: {selectedBank}
                  </span>
                )}
              </div>
              <span className="material-symbols-outlined text-[#9CA3AF]">
                chevron_right
              </span>
            </button>

            {/* Option 2: Input Estimated Spend */}
            <button
              onClick={() => {
                setSelectedOption('manual');
                setShowBankPicker(false);
              }}
              className={`w-full flex items-center p-4 rounded-xl border transition-all text-left cursor-pointer ${
                selectedOption === 'manual'
                  ? 'bg-[#1C2028] border-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : 'bg-[#1C2028] border-[#3C4A42] hover:border-[#10B981]/60'
              }`}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#262A33] flex items-center justify-center mr-4 text-[#DFE2EE]">
                <span className="material-symbols-outlined text-xl">edit_note</span>
              </div>
              <div className="flex-grow">
                <h3 className="text-sm md:text-base font-semibold text-white">
                  Input Estimated Spend
                </h3>
                <p className="text-xs text-[#9CA3AF] mt-0.5">
                  Manual entry for privacy control
                </p>
              </div>
              <span className="material-symbols-outlined text-[#9CA3AF]">
                chevron_right
              </span>
            </button>
          </div>

          {/* Conditional Sub-settings based on option */}
          {selectedOption === 'manual' && (
            <div className="p-4 bg-[#181C24] rounded-xl border border-[#2D3748] space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#9CA3AF] font-semibold">Select Currency:</span>
                <div className="flex gap-1 bg-[#1E2640] p-1 rounded-lg border border-[#2D3748]">
                  <button
                    onClick={() => setCurrency('PHP')}
                    className={`px-2 py-0.5 rounded text-xs font-bold ${
                      currency === 'PHP' ? 'bg-[#10B981] text-black' : 'text-[#9CA3AF]'
                    }`}
                  >
                    ₱ PHP
                  </button>
                  <button
                    onClick={() => setCurrency('USD')}
                    className={`px-2 py-0.5 rounded text-xs font-bold ${
                      currency === 'USD' ? 'bg-[#10B981] text-black' : 'text-[#9CA3AF]'
                    }`}
                  >
                    $ USD
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-semibold mb-1">
                  <span className="text-[#9CA3AF]">Estimated Monthly Burn:</span>
                  <span className="text-[#10B981] text-sm font-bold">
                    {currencySymbol}{estimatedSpend.toFixed(2)}/mo
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="600"
                  step="5"
                  value={estimatedSpend}
                  onChange={(e) => setEstimatedSpend(parseFloat(e.target.value))}
                  className="w-full accent-[#10B981] cursor-pointer"
                />
              </div>
            </div>
          )}

          {showBankPicker && selectedOption === 'bank' && (
            <div className="p-3.5 bg-[#181C24] rounded-xl border border-[#2D3748] space-y-2">
              <span className="text-xs font-bold text-[#9CA3AF] block">
                Select Simulated Open Banking Institution:
              </span>
              <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {BANKS.map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBank(b)}
                    className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      selectedBank === b
                        ? 'bg-[#10B981]/20 text-[#10B981] font-bold border border-[#10B981]/40'
                        : 'bg-[#1E2640] text-[#DFE2EE] hover:bg-[#262A33]'
                    }`}
                  >
                    <span>{b}</span>
                    {selectedBank === b && (
                      <span className="material-symbols-outlined text-xs">check</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Continue Button */}
          <div className="mt-4 pt-3 border-t border-[#3C4A42]">
            <button
              onClick={handleContinue}
              className="w-full py-3.5 bg-[#10B981] hover:bg-[#34D399] text-black font-bold text-sm md:text-base rounded-xl transition-all flex items-center justify-center shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] cursor-pointer active:scale-95"
            >
              Continue
              <span className="material-symbols-outlined ml-2 text-base">arrow_forward</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
