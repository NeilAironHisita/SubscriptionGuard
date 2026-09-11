import React, { useState } from 'react';
import { Subscription, UsageLog, CurrencyCode } from '../types';
import { DARK_PATTERN_GUIDES } from '../data/initialData';

interface SubscriptionDetailModalProps {
  subscription: Subscription;
  usageLog?: UsageLog;
  currency: CurrencyCode;
  onBack: () => void;
  onCancelSubscription: (subscriptionId: string, reason: string) => void;
  onOpenHelpForService: (serviceName: string) => void;
}

export const SubscriptionDetailModal: React.FC<SubscriptionDetailModalProps> = ({
  subscription,
  usageLog,
  currency,
  onBack,
  onCancelSubscription,
  onOpenHelpForService,
}) => {
  const [timeRange, setTimeRange] = useState<'4weeks' | '6months'>('4weeks');
  const [checklist, setChecklist] = useState<boolean[]>([true, false, false]);
  const [selectedReason, setSelectedReason] = useState<string>('Too Expensive');
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancellationFlow, setShowCancellationFlow] = useState(false);

  const currencySymbol = currency === 'PHP' ? '₱' : '$';

  // Find guide
  const guide = DARK_PATTERN_GUIDES.find((g) =>
    g.service_name.toLowerCase().includes(subscription.service_name.toLowerCase())
  ) || DARK_PATTERN_GUIDES[0];

  const weeklyHours = usageLog?.weekly_hours || [12.0, 6.0, 1.5, 0.75];
  const maxHours = Math.max(...weeklyHours, 14);

  const handleToggleStep = (index: number) => {
    const next = [...checklist];
    next[index] = !next[index];
    setChecklist(next);
  };

  const handleExecuteCancellation = () => {
    setIsCancelling(true);
    setTimeout(() => {
      onCancelSubscription(subscription.subscription_id, selectedReason);
      setIsCancelling(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-[#DFE2EE] pb-24 font-body-md selection:bg-[#10B981] selection:text-black">
      {/* Top App Bar matching Screenshot 3 */}
      <header className="fixed top-0 w-full bg-[#0B0F17]/95 backdrop-blur-md flex justify-between items-center px-4 md:px-8 h-16 w-full z-50 border-b border-[#1E2640]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity active:scale-95 text-[#10B981]"
          aria-label="Go back to Dashboard"
        >
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>

        <div className="flex items-center gap-2 font-bold text-lg md:text-xl text-[#10B981]">
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            security
          </span>
          <span className="text-white">Subscription<span className="text-[#10B981]">Guard</span></span>
        </div>

        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-[#1E2640] overflow-hidden border border-[#2D3748] flex items-center justify-center hover:opacity-80 transition-opacity"
        >
          <span className="material-symbols-outlined text-[#9CA3AF] text-sm">person</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="pt-24 px-4 md:px-8 max-w-4xl mx-auto space-y-6">
        {/* 1. Subscription Header Card matching Screenshot 3 */}
        <section className="bg-[#1E2640] rounded-2xl p-6 border border-[#2D3748] flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden shadow-lg">
          {/* Decorative blurred glow */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#10B981]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-xl bg-[#EF4444]/15 flex items-center justify-center flex-shrink-0 border border-[#EF4444]/30">
              <span className="material-symbols-outlined text-[#EF4444] text-3xl">
                {subscription.logo_icon || 'brush'}
              </span>
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 tracking-tight">
                {subscription.service_name}
              </h1>
              <div className="flex items-center gap-2 text-[#9CA3AF] text-xs md:text-sm font-medium">
                <span>
                  {currencySymbol}
                  {subscription.cost.toFixed(2)} / mo
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#2D3748]" />
                <span className="text-[#DFE2EE]">
                  Renews in {subscription.days_until_renewal || 12} days
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#2D3748]" />
                <span className={subscription.status === 'Cancelled' ? 'text-[#EF4444]' : 'text-[#10B981]'}>
                  {subscription.status}
                </span>
              </div>
            </div>
          </div>

          {/* Low Value Badge */}
          <div className="flex items-center gap-1.5 bg-[#EF4444]/20 border border-[#EF4444]/30 text-[#EF4444] px-3.5 py-1.5 rounded-full text-xs font-bold relative z-10 w-fit">
            <span className="material-symbols-outlined text-[14px]">trending_down</span>
            Low Value
          </div>
        </section>

        {/* 2. Usage Analytics Card matching Screenshot 3 */}
        <section className="bg-[#1E2640] rounded-2xl p-6 border border-[#2D3748] shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
              Usage Analytics
            </h2>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="bg-[#31353E] border border-[#2D3748] rounded-lg text-[#DFE2EE] text-xs font-semibold px-3 py-1.5 focus:border-[#10B981] outline-none cursor-pointer"
            >
              <option value="4weeks">Past 4 Weeks</option>
              <option value="6months">Past 6 Months</option>
            </select>
          </div>

          {/* Simple Bar Chart matching Screenshot 3 */}
          <div className="h-48 flex items-end justify-between gap-3 md:gap-6 pt-4 border-b border-[#2D3748]/40 pb-3 relative">
            {/* Grid lines */}
            <div className="absolute top-0 w-full border-t border-[#2D3748]/20" />
            <div className="absolute top-1/2 w-full border-t border-[#2D3748]/20" />

            {/* W1 Bar */}
            <div className="w-full flex flex-col items-center gap-2 group relative z-10">
              <div
                className="w-full bg-[#10B981]/25 rounded-t-md hover:bg-[#10B981]/40 transition-all cursor-pointer"
                style={{ height: `${(weeklyHours[0] / maxHours) * 100}%` }}
              />
              <span className="text-xs text-[#9CA3AF] font-medium">W1</span>
              <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-opacity bg-[#DFE2EE] text-[#0B0F17] text-[10px] font-bold px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap">
                {weeklyHours[0]} hrs
              </div>
            </div>

            {/* W2 Bar */}
            <div className="w-full flex flex-col items-center gap-2 group relative z-10">
              <div
                className="w-full bg-[#10B981]/25 rounded-t-md hover:bg-[#10B981]/40 transition-all cursor-pointer"
                style={{ height: `${(weeklyHours[1] / maxHours) * 100}%` }}
              />
              <span className="text-xs text-[#9CA3AF] font-medium">W2</span>
              <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-opacity bg-[#DFE2EE] text-[#0B0F17] text-[10px] font-bold px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap">
                {weeklyHours[1]} hrs
              </div>
            </div>

            {/* W3 Bar (Red drop) */}
            <div className="w-full flex flex-col items-center gap-2 group relative z-10">
              <div
                className="w-full bg-[#EF4444]/40 rounded-t-md hover:bg-[#EF4444]/60 transition-all cursor-pointer"
                style={{ height: `${(weeklyHours[2] / maxHours) * 100}%` }}
              />
              <span className="text-xs text-[#EF4444] font-bold">W3</span>
              <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-opacity bg-[#DFE2EE] text-[#0B0F17] text-[10px] font-bold px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap">
                {weeklyHours[2]} hrs
              </div>
            </div>

            {/* W4 Bar (Red critical drop) */}
            <div className="w-full flex flex-col items-center gap-2 group relative z-10">
              <div
                className="w-full bg-[#EF4444]/30 rounded-t-md hover:bg-[#EF4444]/50 transition-all cursor-pointer"
                style={{ height: `${(weeklyHours[3] / maxHours) * 100}%` }}
              />
              <span className="text-xs text-[#EF4444] font-bold">W4</span>
              <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-opacity bg-[#DFE2EE] text-[#0B0F17] text-[10px] font-bold px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap">
                45 mins (0.75h)
              </div>
            </div>
          </div>

          <p className="text-sm md:text-base text-[#9CA3AF] mt-4 leading-relaxed">
            Usage dropped by <strong className="text-[#EF4444] font-semibold">78%</strong> in the last two weeks compared to your historical average.
          </p>
        </section>

        {/* 2.5. Value Score Engine Card matching prompt specifications */}
        <section className="bg-[#1E2640] rounded-2xl p-6 border border-[#2D3748] shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#10B981] text-2xl">
                calculate
              </span>
              <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
                Value Score Engine
              </h2>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444]">
              Flagged for Review
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {/* Metric 1: Cost Per Active Hour */}
            <div className="bg-[#181C24] p-4 rounded-xl border border-[#2D3748]">
              <span className="text-xs text-[#9CA3AF] font-semibold uppercase tracking-wider block mb-1">
                Cost Per Active Hour
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl md:text-3xl font-black text-[#EF4444]">
                  {currencySymbol}13.75
                </span>
                <span className="text-xs text-[#9CA3AF]">/hr</span>
              </div>
              <span className="text-[11px] text-[#9CA3AF] mt-1 block">
                Target: &lt; {currencySymbol}3.50/hr
              </span>
            </div>

            {/* Metric 2: Utilization Score */}
            <div className="bg-[#181C24] p-4 rounded-xl border border-[#2D3748]">
              <span className="text-xs text-[#9CA3AF] font-semibold uppercase tracking-wider block mb-1">
                Value Score
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl md:text-3xl font-black text-[#EF4444]">
                  24
                </span>
                <span className="text-xs text-[#9CA3AF]">/ 100</span>
              </div>
              <span className="text-[11px] text-[#EF4444] font-semibold mt-1 block">
                Critical Underutilization
              </span>
            </div>

            {/* Metric 3: Potential Annual Savings */}
            <div className="bg-[#181C24] p-4 rounded-xl border border-[#2D3748]">
              <span className="text-xs text-[#9CA3AF] font-semibold uppercase tracking-wider block mb-1">
                Annual Reclamation
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl md:text-3xl font-black text-[#10B981]">
                  {currencySymbol}{(subscription.cost * 12).toFixed(2)}
                </span>
                <span className="text-xs text-[#9CA3AF]">/yr</span>
              </div>
              <span className="text-[11px] text-[#10B981] font-semibold mt-1 block">
                Immediate budget relief
              </span>
            </div>
          </div>

          <div className="bg-[#0B0F17] p-3 rounded-xl border border-[#2D3748] text-xs text-[#9CA3AF] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#10B981]">info</span>
              Engine formula: <code className="text-[#DFE2EE] font-mono">Monthly Cost / Recent Utilization Hours</code>
            </span>
            <span className="text-[#10B981] font-semibold">Recommendation: Terminate</span>
          </div>
        </section>

        {/* 3. Cancellation Action Area matching Screenshot 3 */}
        <section className="bg-[#1E2640]/70 rounded-2xl p-6 border border-[#EF4444]/30 backdrop-blur-md shadow-2xl">
          {subscription.status === 'Cancelled' ? (
            <div className="bg-[#10B981]/15 border border-[#10B981]/40 rounded-xl p-5 text-center mb-6">
              <span className="material-symbols-outlined text-[#10B981] text-3xl mb-1">
                check_circle
              </span>
              <h3 className="font-bold text-lg text-white">Subscription Successfully Cancelled</h3>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Database status updated. Saved {currencySymbol}{subscription.cost.toFixed(2)}/mo ({currencySymbol}{(subscription.cost * 12).toFixed(2)}/yr).
              </p>
            </div>
          ) : (
            <>
              {/* High-contrast Red Action Button */}
              <button
                onClick={() => setShowCancellationFlow(true)}
                disabled={isCancelling}
                className="w-full bg-[#EF4444] text-white font-bold text-base md:text-lg py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#DC2626] active:scale-[0.98] transition-all shadow-[0_0_25px_rgba(239,68,68,0.3)] mb-4 cursor-pointer"
              >
                <span className="material-symbols-outlined text-2xl">cancel</span>
                Start 1-Tap Cancellation Guide
              </button>

              {/* Cancellation Tips button */}
              <button
                onClick={() => onOpenHelpForService(subscription.service_name)}
                className="flex items-center gap-2 bg-[#31353E] border border-[#2D3748] text-[#DFE2EE] px-3.5 py-2 rounded-xl text-xs font-semibold mb-6 hover:bg-[#3E4661] transition-colors active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px] text-[#10B981]">help</span>
                <span>Cancellation Tips: How to bypass dark patterns</span>
              </button>

              {/* Cancellation Checklist Header */}
              <h3 className="text-xs font-bold text-[#9CA3AF] mb-4 uppercase tracking-wider">
                Cancellation Checklist
              </h3>

              {/* Step 1 */}
              <div
                onClick={() => handleToggleStep(0)}
                className="flex items-start gap-4 p-3.5 rounded-xl bg-[#181C24] hover:bg-[#262A33] transition-colors cursor-pointer border border-transparent hover:border-[#2D3748] mb-3"
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  checklist[0] ? 'border-[#10B981] bg-[#10B981]/20 text-[#10B981]' : 'border-[#86948A] text-[#86948A]'
                }`}>
                  {checklist[0] ? (
                    <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                  ) : (
                    <span className="text-xs">1</span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm md:text-base text-white">Confirm Identity</h4>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">
                    Authenticate with Adobe to begin the process.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div
                onClick={() => handleToggleStep(1)}
                className="flex items-start gap-4 p-3.5 rounded-xl bg-[#181C24] hover:bg-[#262A33] transition-colors cursor-pointer border border-transparent hover:border-[#2D3748] mb-3"
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  checklist[1] ? 'border-[#10B981] bg-[#10B981]/20 text-[#10B981]' : 'border-[#86948A] text-[#86948A]'
                }`}>
                  {checklist[1] ? (
                    <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                  ) : (
                    <span className="text-xs">2</span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm md:text-base text-white">Select Reason</h4>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">
                    Choose 'Too Expensive' to bypass retention offers.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div
                onClick={() => handleToggleStep(2)}
                className="flex items-start gap-4 p-3.5 rounded-xl bg-[#181C24] hover:bg-[#262A33] transition-colors cursor-pointer border border-transparent hover:border-[#2D3748] mb-4"
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  checklist[2] ? 'border-[#10B981] bg-[#10B981]/20 text-[#10B981]' : 'border-[#86948A] text-[#86948A]'
                }`}>
                  {checklist[2] ? (
                    <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                  ) : (
                    <span className="text-xs">3</span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm md:text-base text-white">Finalize Termination</h4>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">
                    Confirm cancellation and save confirmation email.
                  </p>
                </div>
              </div>

              {/* Complete Action Button */}
              <button
                onClick={handleExecuteCancellation}
                disabled={isCancelling}
                className="w-full py-3 bg-[#10B981] hover:bg-[#34D399] text-black font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] cursor-pointer"
              >
                {isCancelling ? 'Updating Database...' : 'Complete Cancellation in Database'}
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </>
          )}
        </section>
      </main>

      {/* Interactive 1-Tap Cancellation Modal if triggered */}
      {showCancellationFlow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#1E2640] border border-[#2D3748] rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-[#2D3748]">
              <div className="flex items-center gap-2 text-[#EF4444] font-bold">
                <span className="material-symbols-outlined">shield</span>
                <span>1-Tap Cancellation Defense Loop</span>
              </div>
              <button
                onClick={() => setShowCancellationFlow(false)}
                className="text-[#9CA3AF] hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs md:text-sm text-[#DFE2EE]">
              <div className="bg-[#EF4444]/15 border border-[#EF4444]/30 rounded-xl p-3.5 text-[#EF4444]">
                <strong className="block mb-1 font-bold">⚠️ Dark Pattern Warning: {guide.dark_pattern_type}</strong>
                {guide.overview}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#9CA3AF] mb-1">
                  Reason for Cancellation:
                </label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full bg-[#0B0F17] border border-[#2D3748] rounded-lg p-2.5 text-white font-medium outline-none focus:border-[#10B981]"
                >
                  <option value="Too Expensive">Too Expensive (Bypasses survey quiz)</option>
                  <option value="Low Utilization">Low Utilization / Not needed</option>
                  <option value="Switching Alternative">Switching to Free / Open Source Alternative</option>
                  <option value="Temporary Pause">Project Completed</option>
                </select>
              </div>

              <div className="bg-[#181C24] p-3.5 rounded-xl border border-[#2D3748]">
                <strong className="block text-[#10B981] font-semibold mb-1">Direct Cancellation URL:</strong>
                <a
                  href={subscription.cancellation_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#10B981] hover:underline break-all"
                >
                  {subscription.cancellation_url}
                </a>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-[#2D3748]">
              <button
                onClick={() => setShowCancellationFlow(false)}
                className="flex-1 py-2.5 bg-[#2D3748] hover:bg-[#3E4661] text-[#DFE2EE] font-semibold rounded-xl text-xs"
              >
                Cancel Flow
              </button>
              <button
                onClick={() => {
                  setShowCancellationFlow(false);
                  handleExecuteCancellation();
                }}
                className="flex-1 py-2.5 bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold rounded-xl text-xs shadow-lg"
              >
                Confirm Termination
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
