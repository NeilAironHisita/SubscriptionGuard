import React from 'react';
import { Subscription, CurrencyCode } from '../types';

interface UpcomingBillsStreamProps {
  subscriptions: Subscription[];
  currency: CurrencyCode;
  onSelectSubscription: (sub: Subscription) => void;
  onQuickCancel: (sub: Subscription, e: React.MouseEvent) => void;
  onViewAll: () => void;
}

export const UpcomingBillsStream: React.FC<UpcomingBillsStreamProps> = ({
  subscriptions,
  currency,
  onSelectSubscription,
  onQuickCancel,
  onViewAll,
}) => {
  const currencySymbol = currency === 'PHP' ? '₱' : '$';

  const formatBillingDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
        const monthIndex = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        return `${monthNames[monthIndex] || 'June'} ${day}`;
      }
    } catch {
      // fallback
    }
    return dateStr;
  };

  return (
    <section className="mb-8">
      {/* Section Header */}
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          Upcoming Bills
        </h2>
        <button
          onClick={onViewAll}
          className="text-xs md:text-sm font-semibold text-[#10B981] hover:text-[#34D399] transition-colors"
        >
          View All ({subscriptions.length})
        </button>
      </div>

      {/* Horizontal Scroll Feed */}
      <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar -mx-4 px-4 md:-mx-0 md:px-0 snap-x snap-mandatory">
        {subscriptions.map((sub) => {
          const isUrgent = sub.service_name === 'Netflix' || sub.service_name === 'Spotify' || sub.service_name === 'iCloud';

          return (
            <div
              key={sub.subscription_id}
              onClick={() => onSelectSubscription(sub)}
              className="glass-card rounded-2xl p-5 min-w-[210px] md:min-w-[230px] flex-shrink-0 snap-start relative group cursor-pointer hover:border-[#10B981]/60 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md flex flex-col justify-between h-44"
            >
              {/* Top Row: Service Logo + Date Tag */}
              <div className="flex justify-between items-start">
                {/* Logo Icon */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm"
                  style={{
                    backgroundColor: sub.accent_color || (sub.category === 'Entertainment' ? '#E50914' : '#10B981'),
                  }}
                >
                  {sub.logo_icon === 'N' || sub.logo_icon === 'S' ? (
                    sub.logo_icon
                  ) : (
                    <span className="material-symbols-outlined text-xl">
                      {sub.logo_icon || 'credit_card'}
                    </span>
                  )}
                </div>

                {/* Date Tag */}
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                    isUrgent
                      ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30'
                      : 'bg-[#2D3748] text-[#DFE2EE]'
                  }`}
                >
                  {formatBillingDate(sub.next_billing_date)}
                </span>
              </div>

              {/* Service Info */}
              <div className="mt-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base md:text-lg text-white group-hover:text-[#10B981] transition-colors truncate">
                    {sub.service_name}
                  </h3>
                  {sub.service_name === 'Adobe Creative Cloud' && (
                    <span className="text-[10px] bg-[#EF4444]/20 text-[#EF4444] px-1.5 py-0.5 rounded font-bold">
                      Low Value
                    </span>
                  )}
                </div>
                <p className="text-base font-semibold text-[#DFE2EE] mt-0.5">
                  {currencySymbol}
                  {sub.cost.toFixed(2)}
                  <span className="text-xs text-[#9CA3AF] font-normal"> /mo</span>
                </p>
              </div>

              {/* Action buttons footer */}
              <div className="flex items-center justify-between pt-2 border-t border-[#2D3748]/50 text-[11px] text-[#9CA3AF]">
                <span className="truncate max-w-[120px]">{sub.category}</span>
                <span className="text-[#10B981] font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  Matrix <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </span>
              </div>

              {/* Quick Cancel Shortcut Icon */}
              <button
                onClick={(e) => onQuickCancel(sub, e)}
                className="absolute top-2 right-2 p-1 text-[#9CA3AF] hover:text-[#EF4444] opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-white/10"
                title="Quick 1-Tap Cancel"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
