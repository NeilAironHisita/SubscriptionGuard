import React from 'react';
import { CurrencyCode } from '../types';

interface CategorySpend {
  category: string;
  total: number;
  percentage: number;
  count: number;
}

interface SpendBreakdownBentoProps {
  categories: CategorySpend[];
  currency: CurrencyCode;
  onSelectCategory?: (category: string) => void;
}

export const SpendBreakdownBento: React.FC<SpendBreakdownBentoProps> = ({
  categories,
  currency,
  onSelectCategory,
}) => {
  const currencySymbol = currency === 'PHP' ? '₱' : '$';

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Entertainment':
        return 'movie';
      case 'Utilities':
        return 'build';
      case 'Creative':
        return 'brush';
      case 'Productivity':
        return 'psychology';
      case 'Health':
        return 'fitness_center';
      case 'Security':
        return 'shield';
      default:
        return 'category';
    }
  };

  return (
    <section className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          Spend Breakdown
        </h2>
        <span className="text-xs text-[#9CA3AF]">
          Category distribution
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.category}
            onClick={() => onSelectCategory?.(cat.category)}
            className="glass-card rounded-2xl p-4 flex flex-col justify-between h-36 hover:border-[#10B981]/50 transition-all hover:scale-[1.02] cursor-pointer shadow-sm"
          >
            {/* Top row: icon + name */}
            <div className="flex items-center gap-2 text-[#9CA3AF]">
              <span className="material-symbols-outlined text-base text-[#10B981]">
                {getCategoryIcon(cat.category)}
              </span>
              <span className="text-xs font-semibold text-[#DFE2EE] truncate">
                {cat.category}
              </span>
            </div>

            {/* Bottom info: amount + progress bar */}
            <div>
              <div className="flex items-baseline justify-between">
                <p className="text-lg md:text-xl font-bold text-white tracking-tight">
                  {currencySymbol}
                  {cat.total.toFixed(2)}
                </p>
                <span className="text-[11px] font-semibold text-[#9CA3AF]">
                  {cat.count} {cat.count === 1 ? 'sub' : 'subs'}
                </span>
              </div>

              {/* Progress Bar with Emerald Accent */}
              <div className="w-full bg-[#31353E] h-1.5 mt-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#10B981] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(10, cat.percentage))}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
