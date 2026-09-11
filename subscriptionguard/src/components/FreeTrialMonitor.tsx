import React from 'react';
import { FreeTrial, CurrencyCode } from '../types';

interface FreeTrialMonitorProps {
  freeTrials: FreeTrial[];
  currency: CurrencyCode;
  onToggleAlert: (trialId: string) => void;
  onCancelTrial: (trial: FreeTrial) => void;
  onOpenHelp: () => void;
  onOpenAddModal: () => void;
}

export const FreeTrialMonitor: React.FC<FreeTrialMonitorProps> = ({
  freeTrials,
  currency,
  onToggleAlert,
  onCancelTrial,
  onOpenHelp,
  onOpenAddModal,
}) => {
  const currencySymbol = currency === 'PHP' ? '₱' : '$';

  const calculateDaysRemaining = (expiryDate: string): number => {
    const refDate = new Date('2026-08-07T00:00:00Z');
    const expDate = new Date(`${expiryDate}T00:00:00Z`);
    const diffTime = expDate.getTime() - refDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return (
    <main className="px-4 md:px-8 max-w-6xl mx-auto mt-4 pb-28 md:pb-12 flex flex-col gap-6">
      {/* Header Section matching Screenshot 4 */}
      <section className="flex flex-col gap-2 pt-2">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Active Free Trials
        </h1>
        <p className="text-sm md:text-base text-[#9CA3AF]">
          Monitor and manage your upcoming trial expirations.
        </p>

        {/* How to track trials & alerts trigger button */}
        <button
          onClick={onOpenHelp}
          className="flex items-center gap-2 text-[#10B981] text-sm font-semibold hover:opacity-80 transition-opacity w-fit mt-1 group cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">help</span>
          <span className="group-hover:underline">How to track trials & alerts</span>
        </button>
      </section>

      {/* Trials Bento Grid matching Screenshot 4 */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {freeTrials.map((trial) => {
          const daysLeft = calculateDaysRemaining(trial.expiry_date);
          const isUrgent = daysLeft <= 3; // Disney+ has 2 days (Red), HelloFresh has 5 days (Emerald)

          // Progress calculation: assume typical 14-day or 7-day trial
          const totalDays = 7;
          const progressPercent = Math.min(100, Math.max(10, (daysLeft / totalDays) * 100));
          const circumference = 2 * Math.PI * 40; // r=40 -> 251.2
          const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

          return (
            <article
              key={trial.trial_id}
              className="glass-card rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden shadow-lg border border-[#2D3748] hover:border-[#10B981]/50 transition-all"
            >
              {/* Decorative subtle ambient glow */}
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"
                style={{
                  backgroundColor: isUrgent ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                }}
              />

              {/* Card Header: Logo, Service Name, & Progress Ring */}
              <div className="flex justify-between items-start z-10">
                <div className="flex items-center gap-3.5">
                  {/* Service Logo */}
                  <div className="w-12 h-12 rounded-xl bg-[#0B0F17] flex items-center justify-center border border-[#2D3748] overflow-hidden p-1.5 flex-shrink-0">
                    {trial.logo_img_url ? (
                      <img
                        src={trial.logo_img_url}
                        alt={`${trial.service_name} Logo`}
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-[#10B981] text-2xl">
                        {trial.logo_icon || 'timer'}
                      </span>
                    )}
                  </div>

                  {/* Name & Tier */}
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-white leading-snug">
                      {trial.service_name}
                    </h2>
                    <p className="text-xs md:text-sm text-[#9CA3AF]">
                      {trial.tier_name}
                    </p>
                    <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                      Billed at {currencySymbol}{trial.cost_after_trial.toFixed(2)}/mo after trial
                    </p>
                  </div>
                </div>

                {/* Progress Ring matching Screenshot 4 */}
                <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    {/* Background track (#2D3748) */}
                    <circle
                      className="text-[#2D3748] stroke-current"
                      cx="50"
                      cy="50"
                      fill="transparent"
                      r="40"
                      strokeWidth="8"
                    />
                    {/* Progress track (Urgent Red for 2 days, Emerald for 5 days) */}
                    <circle
                      className={`stroke-current progress-ring__circle ${
                        isUrgent ? 'text-[#EF4444]' : 'text-[#10B981]'
                      }`}
                      cx="50"
                      cy="50"
                      fill="transparent"
                      r="40"
                      strokeWidth="8"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span
                      className={`text-xl font-black leading-none ${
                        isUrgent ? 'text-[#EF4444]' : 'text-[#10B981]'
                      }`}
                    >
                      {daysLeft}
                    </span>
                    <span className="text-[9px] font-bold text-[#9CA3AF] leading-none uppercase mt-0.5 tracking-wider">
                      Days
                    </span>
                  </div>
                </div>
              </div>

              {/* Mid section: Expiration & Status */}
              <div className="my-4 pt-3 border-t border-[#2D3748]/50 flex items-center justify-between text-xs">
                <span className="text-[#9CA3AF]">
                  Auto-renews on: <strong className="text-white">{trial.expiry_date}</strong>
                </span>
                {trial.status === 'Cancelled' ? (
                  <span className="bg-[#EF4444]/20 text-[#EF4444] px-2 py-0.5 rounded font-bold">
                    Cancelled
                  </span>
                ) : (
                  <span className="bg-[#10B981]/20 text-[#10B981] px-2 py-0.5 rounded font-bold">
                    Active Trial
                  </span>
                )}
              </div>

              {/* Bottom Row: Alert Toggle & 1-Click Cancel Button */}
              <div className="flex items-center justify-between z-10 pt-3 border-t border-[#2D3748]/50 mt-auto">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#9CA3AF]">
                    notifications_active
                  </span>
                  <span className="text-xs font-semibold text-[#DFE2EE]">
                    {trial.alert_lead_time_hours}-Hour Alert
                  </span>
                </div>

                {/* Interactive UI Toggle mapped to alert_lead_time_hours */}
                <button
                  onClick={() => onToggleAlert(trial.trial_id)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                    trial.notification_enabled ? 'bg-[#10B981]' : 'bg-[#2D3748]'
                  }`}
                  title="Toggle push notification lead alert"
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                      trial.notification_enabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Action: 1-Tap Cancel Before Charge */}
              {trial.status === 'Active' && (
                <button
                  onClick={() => onCancelTrial(trial)}
                  className="w-full mt-3 py-2 px-3 bg-[#EF4444]/15 hover:bg-[#EF4444] text-[#EF4444] hover:text-white border border-[#EF4444]/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[14px]">cancel</span>
                  Cancel Trial Before Auto-Charge
                </button>
              )}
            </article>
          );
        })}
      </section>

      {/* Floating Action Button for adding trial */}
      <button
        onClick={onOpenAddModal}
        aria-label="Add new trial or subscription"
        className="fixed bottom-20 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-[#10B981] text-black rounded-full shadow-[0_8px_30px_rgb(16,185,129,0.4)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40"
      >
        <span className="material-symbols-outlined text-3xl font-bold">add</span>
      </button>
    </main>
  );
};
