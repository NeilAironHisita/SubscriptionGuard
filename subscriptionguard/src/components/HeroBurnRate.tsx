import React, { useState } from 'react';
import { CurrencyCode } from '../types';

interface HeroBurnRateProps {
  totalMonthlySpend: number;
  currency: CurrencyCode;
  totalSaved: number;
  activeCount: number;
  budgetLimit: number;
  onOpenAddModal: () => void;
}

export const HeroBurnRate: React.FC<HeroBurnRateProps> = ({
  totalMonthlySpend,
  currency,
  totalSaved,
  activeCount,
  budgetLimit,
  onOpenAddModal,
}) => {
  const [viewMode, setViewMode] = useState<'monthly' | 'annual'>('monthly');
  const currencySymbol = currency === 'PHP' ? '₱' : '$';
  
  const displayAmount = viewMode === 'monthly' ? totalMonthlySpend : totalMonthlySpend * 12;
  const isNearBudget = totalMonthlySpend >= budgetLimit * 0.85;

  return (
    <section className="flex flex-col items-center justify-center py-4 md:py-6 relative">
      {/* Label and Mode Switcher */}
      <div className="flex items-center gap-2 mb-2">
        <p className="text-xs md:text-sm font-semibold tracking-widest text-[#9CA3AF] uppercase">
          {viewMode === 'monthly' ? 'Total Monthly Spend' : 'Projected Annual Burn'}
        </p>
        <button
          onClick={() => setViewMode(viewMode === 'monthly' ? 'annual' : 'monthly')}
          className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#1E2640] text-[#10B981] border border-[#2D3748] hover:border-[#10B981] transition-colors"
          title="Toggle Monthly / Annual View"
        >
          {viewMode === 'monthly' ? 'View Annual' : 'View Monthly'}
        </button>
      </div>

      {/* Hero Display Metric matching screenshot */}
      <div className="flex items-baseline justify-center gap-1.5 my-1">
        <span className="text-3xl md:text-5xl font-extrabold text-[#10B981] tracking-tight">
          {currencySymbol}
        </span>
        <span className="text-4xl md:text-6xl font-black text-white tracking-tight">
          {displayAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className="text-base md:text-xl font-medium text-[#9CA3AF]">
          {viewMode === 'monthly' ? '/mo' : '/yr'}
        </span>
      </div>

      {/* Sub-metrics: Active Subscriptions & Saved */}
      <div className="flex items-center gap-3 mt-3 text-xs text-[#9CA3AF]">
        <span className="flex items-center gap-1 bg-[#1E2640] px-2.5 py-1 rounded-full border border-[#2D3748]">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <strong className="text-white font-semibold">{activeCount}</strong> active billing cycles
        </span>

        {totalSaved > 0 && (
          <span className="flex items-center gap-1 bg-[#10B981]/15 text-[#10B981] px-2.5 py-1 rounded-full border border-[#10B981]/30 font-medium">
            <span className="material-symbols-outlined text-[14px]">savings</span>
            Saved {currencySymbol}{totalSaved.toFixed(2)}/mo
          </span>
        )}
      </div>

      {/* Budget Bar Warning if high */}
      {isNearBudget && (
        <div className="w-full max-w-sm mt-3 px-3 py-1.5 rounded-lg bg-[#EF4444]/15 border border-[#EF4444]/30 text-xs text-[#EF4444] flex items-center justify-between">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">warning</span>
            Spend is at {Math.round((totalMonthlySpend / budgetLimit) * 100)}% of monthly budget ({currencySymbol}{budgetLimit})
          </span>
        </div>
      )}
    </section>
  );
};
