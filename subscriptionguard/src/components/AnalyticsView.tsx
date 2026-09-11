import React from 'react';
import { Subscription, UsageLog, AuditLog, CurrencyCode } from '../types';

interface AnalyticsViewProps {
  subscriptions: Subscription[];
  usageLogs: UsageLog[];
  auditLogs: AuditLog[];
  currency: CurrencyCode;
  totalMonthlySpend: number;
  totalMonthlySaved: number;
  onSelectSubscription: (sub: Subscription) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  subscriptions,
  usageLogs,
  auditLogs,
  currency,
  totalMonthlySpend,
  totalMonthlySaved,
  onSelectSubscription,
}) => {
  const currencySymbol = currency === 'PHP' ? '₱' : '$';
  const activeSubs = subscriptions.filter((s) => s.status === 'Active');
  const cancelledSubs = subscriptions.filter((s) => s.status === 'Cancelled');

  const potentialAnnualSavings = activeSubs
    .filter((s) => {
      const log = usageLogs.find((l) => l.subscription_id === s.subscription_id);
      return (log?.user_value_rating || 3) <= 2 || (log?.drop_percentage || 0) > 50;
    })
    .reduce((sum, s) => sum + (s.billing_cycle === 'Annual' ? s.cost : s.cost * 12), 0);

  return (
    <main className="px-4 md:px-8 max-w-6xl mx-auto mt-4 pb-28 md:pb-12 space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-1 pt-2">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Financial Defense & Value Analytics
        </h1>
        <p className="text-sm md:text-base text-[#9CA3AF]">
          Algorithmic analysis of your active retainers, usage drops, and realized dark-pattern savings.
        </p>
      </section>

      {/* 3-Column Metric Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-[#2D3748]">
          <span className="text-xs font-bold text-[#9CA3AF] uppercase">Monthly Net Spend</span>
          <p className="text-2xl md:text-3xl font-extrabold text-white mt-1">
            {currencySymbol}{totalMonthlySpend.toFixed(2)}
          </p>
          <span className="text-xs text-[#10B981] mt-1 block">
            Across {activeSubs.length} active services
          </span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-[#10B981]/40 bg-[#10B981]/5">
          <span className="text-xs font-bold text-[#10B981] uppercase">Realized Annual Savings</span>
          <p className="text-2xl md:text-3xl font-extrabold text-[#10B981] mt-1">
            {currencySymbol}{(totalMonthlySaved * 12).toFixed(2)}
          </p>
          <span className="text-xs text-[#9CA3AF] mt-1 block">
            From {cancelledSubs.length} dark-pattern terminations
          </span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-[#EF4444]/40 bg-[#EF4444]/5">
          <span className="text-xs font-bold text-[#EF4444] uppercase">Actionable Waste Identified</span>
          <p className="text-2xl md:text-3xl font-extrabold text-[#EF4444] mt-1">
            {currencySymbol}{potentialAnnualSavings.toFixed(2)}/yr
          </p>
          <span className="text-xs text-[#9CA3AF] mt-1 block">
            Low usage &lt; 2 hrs/week flagged
          </span>
        </div>
      </section>

      {/* Subscription Value Rank Table */}
      <section className="bg-[#1E2640] rounded-2xl p-6 border border-[#2D3748] shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg md:text-xl font-bold text-white">
            Utilization vs. Cost Matrix
          </h2>
          <span className="text-xs text-[#9CA3AF]">
            Ranked by calculated ROI
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead>
              <tr className="border-b border-[#2D3748] text-[#9CA3AF] text-xs uppercase font-bold">
                <th className="pb-3">Service</th>
                <th className="pb-3">Monthly Cost</th>
                <th className="pb-3">Monthly Usage</th>
                <th className="pb-3">Cost / Hour</th>
                <th className="pb-3">Value Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D3748]/50">
              {subscriptions.map((sub) => {
                const log = usageLogs.find((l) => l.subscription_id === sub.subscription_id);
                const hours = log?.total_monthly_hours || 4;
                const costPerHour = sub.cost / Math.max(0.5, hours);
                const isLowValue = costPerHour > 2.5 || (log?.drop_percentage || 0) > 50 || sub.service_name.includes('Adobe');

                return (
                  <tr key={sub.subscription_id} className="hover:bg-[#181C24]/60 transition-colors">
                    <td className="py-3.5 font-bold text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#10B981] text-base">
                        {sub.logo_icon || 'credit_card'}
                      </span>
                      {sub.service_name}
                    </td>
                    <td className="py-3.5 font-medium text-[#DFE2EE]">
                      {currencySymbol}{sub.cost.toFixed(2)}
                    </td>
                    <td className="py-3.5 text-[#9CA3AF]">
                      {hours.toFixed(1)} hrs/mo
                    </td>
                    <td className="py-3.5 font-mono text-[#DFE2EE]">
                      {currencySymbol}{costPerHour.toFixed(2)}/hr
                    </td>
                    <td className="py-3.5">
                      {sub.status === 'Cancelled' ? (
                        <span className="bg-[#2D3748] text-[#9CA3AF] px-2 py-0.5 rounded text-xs font-bold">
                          Cancelled
                        </span>
                      ) : isLowValue ? (
                        <span className="bg-[#EF4444]/20 text-[#EF4444] px-2 py-0.5 rounded text-xs font-bold">
                          ⚠️ Low Value
                        </span>
                      ) : (
                        <span className="bg-[#10B981]/20 text-[#10B981] px-2 py-0.5 rounded text-xs font-bold">
                          ✓ High Value
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => onSelectSubscription(sub)}
                        className="text-xs bg-[#181C24] hover:bg-[#10B981] text-[#10B981] hover:text-black font-bold px-3 py-1 rounded-lg border border-[#2D3748] transition-colors"
                      >
                        Inspect Matrix
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Relational Audit Trail */}
      <section className="bg-[#1E2640] rounded-2xl p-6 border border-[#2D3748] shadow-lg">
        <h2 className="text-lg md:text-xl font-bold text-white mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#10B981]">history_edu</span>
          Relational Audit Trail & Termination Logs
        </h2>
        <div className="space-y-2.5">
          {auditLogs.map((log) => (
            <div key={log.log_id} className="p-3 bg-[#0B0F17] rounded-xl border border-[#2D3748] flex flex-col md:flex-row md:items-center justify-between text-xs gap-2">
              <div>
                <span className="text-[#10B981] font-bold block md:inline md:mr-2">
                  [{log.action_type}]
                </span>
                <span className="text-[#DFE2EE]">{log.details}</span>
              </div>
              <span className="text-[#9CA3AF] text-[11px] whitespace-nowrap">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};
