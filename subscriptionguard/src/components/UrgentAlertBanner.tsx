import React from 'react';
import { Subscription } from '../types';

interface UrgentAlertBannerProps {
  urgentSubscriptions: Subscription[];
  onSelectSubscription: (sub: Subscription) => void;
  onViewAll?: () => void;
}

export const UrgentAlertBanner: React.FC<UrgentAlertBannerProps> = ({
  urgentSubscriptions,
  onSelectSubscription,
}) => {
  const count = urgentSubscriptions.length;
  if (count === 0) return null;

  return (
    <section className="mt-3 mb-6 w-full">
      <div 
        onClick={() => {
          if (urgentSubscriptions[0]) {
            onSelectSubscription(urgentSubscriptions[0]);
          }
        }}
        className="w-full bg-[#EF4444] text-white rounded-xl p-4 flex items-center justify-between shadow-[0_4px_20px_0_rgba(239,68,68,0.4)] cursor-pointer hover:bg-[#DC2626] active:scale-[0.99] transition-all"
        title="Click to inspect upcoming renewals and start 1-Tap Cancellation"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              warning
            </span>
          </div>
          <div>
            <p className="font-semibold text-sm md:text-base tracking-tight leading-tight">
              {count} {count === 1 ? 'renewal' : 'renewals'} in less than 3 days
            </p>
            <p className="text-xs text-white/80 font-normal">
              Tap to inspect usage or initiate 1-Tap cancellation defense
            </p>
          </div>
        </div>

        <span className="material-symbols-outlined text-white/90 text-lg">
          chevron_right
        </span>
      </div>
    </section>
  );
};
